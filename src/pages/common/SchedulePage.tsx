import React, { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import {
  Today as TodayIcon,
  ViewWeek as WeekIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
  Room as RoomIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
} from "@mui/icons-material"
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
} from "date-fns"
import { ru } from "date-fns/locale"

import { apiClient } from "../../services/api"
import { useAuth } from "../../hooks/useAuth"
import { ScheduleInstance, ScheduleInstanceWithPopulated } from "../../types"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

const SchedulePage: React.FC = () => {
  const { user, isAdmin, isTeacher, isStudent } = useAuth()
  const [currentTab, setCurrentTab] = useState(0)
  const [scheduleInstances, setScheduleInstances] = useState<
    ScheduleInstanceWithPopulated[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentWeek, setCurrentWeek] = useState(new Date())

  // Загрузка расписания на день
  const loadDaySchedule = async (date: Date) => {
    try {
      setLoading(true)
      let response

      const dateStr = format(date, "yyyy-MM-dd")

      if (isTeacher) {
        const teacherResponse = await apiClient.getTeacherSchedule({
          date: dateStr,
        })
        console.log(teacherResponse.schedule)
        setScheduleInstances(teacherResponse.schedule || [])
      } else if (isStudent) {
        const studentResponse = await apiClient.getStudentSchedule({
          date: dateStr,
        })
        console.log(studentResponse.schedule)
        setScheduleInstances(studentResponse.schedule || [])
      } else if (isAdmin) {
        const adminResponse = await apiClient.getScheduleInstances({
          date: dateStr,
        })
        setScheduleInstances(adminResponse.instances || [])
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка загрузки расписания")
    } finally {
      setLoading(false)
    }
  }

  // Загрузка расписания на неделю
  const loadWeekSchedule = async (weekStart: Date) => {
    try {
      setLoading(true)
      let response

      const startDate = format(weekStart, "yyyy-MM-dd")
      const endDate = format(endOfWeek(weekStart, { locale: ru }), "yyyy-MM-dd")

      if (isTeacher) {
        const teacherResponse = await apiClient.getTeacherSchedule({
          startDate,
          endDate,
        })
        setScheduleInstances(teacherResponse.schedule || [])
      } else if (isStudent) {
        const studentResponse = await apiClient.getStudentSchedule({
          startDate,
          endDate,
        })
        setScheduleInstances(studentResponse.schedule || [])
      } else if (isAdmin) {
        const adminResponse = await apiClient.getScheduleInstances({
          startDate,
          endDate,
        })
        setScheduleInstances(adminResponse.instances || [])
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка загрузки расписания")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentTab === 0) {
      loadDaySchedule(selectedDate)
    } else {
      loadWeekSchedule(currentWeek)
    }
  }, [currentTab, selectedDate, currentWeek, user])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  const handleDateChange = (direction: "prev" | "next") => {
    if (currentTab === 0) {
      // День
      const newDate = addDays(selectedDate, direction === "next" ? 1 : -1)
      setSelectedDate(newDate)
    } else {
      // Неделя
      const newWeek =
        direction === "next"
          ? addWeeks(currentWeek, 1)
          : subWeeks(currentWeek, 1)
      setCurrentWeek(newWeek)
    }
  }

  const goToToday = () => {
    const today = new Date()
    setSelectedDate(today)
    setCurrentWeek(startOfWeek(today, { locale: ru }))
  }

  // Группировка занятий по дням недели (для недельного вида)
  const groupByWeekday = (instances: ScheduleInstanceWithPopulated[]) => {
    const weekdays = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(startOfWeek(currentWeek, { locale: ru }), i)
      return {
        date,
        dayName: format(date, "EEEE", { locale: ru }),
        dayNumber: format(date, "d"),
        lessons: instances
          .filter(
            instance =>
              format(new Date(instance.date), "yyyy-MM-dd") ===
              format(date, "yyyy-MM-dd")
          )
          .sort((a, b) => a.startTime.localeCompare(b.startTime)),
      }
    })

    return weekdays
  }

  // Получение статуса занятия
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Проведено":
        return "success"
      case "Запланировано":
        return "info"
      case "Отменено":
        return "error"
      case "Перенесено":
        return "warning"
      default:
        return "default"
    }
  }

  // Карточка занятия
  const LessonCard: React.FC<{ lesson: ScheduleInstanceWithPopulated }> = ({
    lesson,
  }) => (
    <Card sx={{ mb: 2 }} variant="outlined">
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Typography variant="h6" component="div">
            {lesson.subject?.name || "Предмет"}
          </Typography>
          <Chip
            label={lesson.status}
            color={getStatusColor(lesson.status)}
            size="small"
          />
        </Box>

        <Box display="flex" alignItems="center" mb={1}>
          <TimeIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            {lesson.startTime} - {lesson.endTime}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={1}>
          <RoomIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            {lesson.classroom}
          </Typography>
        </Box>

        {isAdmin && (
          <Box display="flex" alignItems="center" mb={1}>
            <PersonIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              Преподаватель:{" "}
              {typeof lesson.teacher === "object"
                ? lesson.teacher?.name
                : "ID: " + lesson.teacher || "Не указан"}
            </Typography>
          </Box>
        )}

        {(isAdmin || isTeacher) && (
          <Box display="flex" alignItems="center" mb={1}>
            <GroupIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              Группы:{" "}
              {lesson.groups?.map(g => g.name).join(", ") || "Не указаны"}
            </Typography>
          </Box>
        )}

        <Box display="flex" flex-wrap="wrap" gap={1} mt={2}>
          <Chip label={lesson.lessonType} variant="outlined" size="small" />
          {lesson.attendanceMarked && (
            <Chip
              label="Посещаемость отмечена"
              color="success"
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {lesson.notes && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            <strong>Примечания:</strong> {lesson.notes}
          </Typography>
        )}
      </CardContent>
    </Card>
  )

  if (loading && scheduleInstances.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Расписание</Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<TodayIcon />}
            onClick={goToToday}
          >
            Сегодня
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            onClick={() =>
              currentTab === 0
                ? loadDaySchedule(selectedDate)
                : loadWeekSchedule(currentWeek)
            }
            disabled={loading}
          >
            Обновить
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Навигация по датам */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <IconButton onClick={() => handleDateChange("prev")}>
              <PrevIcon />
            </IconButton>

            <Typography variant="h6" textAlign="center">
              {currentTab === 0
                ? format(selectedDate, "d MMMM yyyy, EEEE", { locale: ru })
                : `${format(startOfWeek(currentWeek, { locale: ru }), "d MMM", {
                    locale: ru,
                  })} - ${format(
                    endOfWeek(currentWeek, { locale: ru }),
                    "d MMM yyyy",
                    { locale: ru }
                  )}`}
            </Typography>

            <IconButton onClick={() => handleDateChange("next")}>
              <NextIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Вкладки */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab icon={<TodayIcon />} label="День" iconPosition="start" />
          <Tab icon={<WeekIcon />} label="Неделя" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Дневной вид */}
      <TabPanel value={currentTab} index={0}>
        {scheduleInstances.length === 0 ? (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <ScheduleIcon
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Занятий не запланировано
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  На выбранный день расписание отсутствует
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {scheduleInstances.map(lesson => (
              <Grid item xs={12} md={6} lg={4} key={lesson._id}>
                <LessonCard lesson={lesson} />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Недельный вид */}
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={2}>
          {groupByWeekday(scheduleInstances).map((day, index) => (
            <Grid item xs={12} md={6} lg={4} xl={3} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom textAlign="center">
                    {day.dayName}
                  </Typography>
                  <Typography
                    variant="h4"
                    textAlign="center"
                    color="primary"
                    sx={{ mb: 2 }}
                  >
                    {day.dayNumber}
                  </Typography>

                  {day.lessons.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                      sx={{ py: 2 }}
                    >
                      Занятий нет
                    </Typography>
                  ) : (
                    <Box>
                      {day.lessons.map(lesson => (
                        <Box key={lesson._id} sx={{ mb: 2, last: { mb: 0 } }}>
                          <Typography variant="subtitle2" gutterBottom>
                            {lesson.subject?.name || "Предмет"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {lesson.startTime} - {lesson.endTime}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {lesson.classroom}
                          </Typography>
                          <Chip
                            label={lesson.lessonType}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Box>
  )
}

export default SchedulePage
