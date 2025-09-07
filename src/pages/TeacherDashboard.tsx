import React, { useState, useEffect } from "react"
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material"
import {
  Schedule,
  Group,
  Assignment,
  CheckCircle,
  AccessTime,
  Room,
  PlayArrow,
  School,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { format, isToday } from "date-fns"
import { ru } from "date-fns/locale"

import { apiClient } from "../services/api"
import {
  ScheduleInstance,
  ScheduleInstanceWithPopulated,
  TeacherStats,
} from "../types"

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [todaySchedule, setTodaySchedule] = useState<
    ScheduleInstanceWithPopulated[]
  >([])
  const [stats, setStats] = useState<TeacherStats | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Загружаем расписание на сегодня и общую статистику
      const [todayResponse, statsResponse] = await Promise.all([
        apiClient.getTeacherScheduleToday(),
        apiClient.getTeacherStats(),
      ])

      setTodaySchedule(todayResponse.schedule || [])
      setStats(statsResponse.data)
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка загрузки данных")
    } finally {
      setLoading(false)
    }
  }

  const handleStartLesson = (lesson: ScheduleInstanceWithPopulated) => {
    // Переход к странице отметки посещаемости
    navigate(`/teacher/lesson/${lesson._id}`)
  }

  const handleViewLesson = (lesson: ScheduleInstanceWithPopulated) => {
    // Переход к просмотру занятия
    navigate(`/teacher/lesson/${lesson._id}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "success"
      case "upcoming":
        return "info"
      case "completed":
        return "default"
      default:
        return "default"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "current":
        return "Текущее"
      case "upcoming":
        return "Предстоящее"
      case "completed":
        return "Завершено"
      default:
        return ""
    }
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Дашборд преподавателя
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Статистические карточки */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Занятий сегодня"
            value={todaySchedule.length}
            icon={<Schedule fontSize="large" />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Завершено занятий"
            value={stats?.completedLessons || 0}
            icon={<CheckCircle fontSize="large" />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Всего занятий"
            value={stats?.totalLessons || 0}
            icon={<Assignment fontSize="large" />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ср. посещаемость"
            value={Math.round(stats?.avgAttendance || 0)}
            icon={<Group fontSize="large" />}
            color="#9c27b0"
            suffix="%"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Расписание на сегодня */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Расписание на сегодня
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {todaySchedule.length === 0 ? (
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <School
                      sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      На сегодня занятий не запланировано
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                todaySchedule.map(lesson => {
                  const now = new Date()
                  const lessonDate = new Date(lesson.date)
                  const startTime = lesson.startTime.split(":")
                  const endTime = lesson.endTime.split(":")

                  const lessonStart = new Date(lessonDate)
                  lessonStart.setHours(
                    parseInt(startTime[0]),
                    parseInt(startTime[1])
                  )

                  const lessonEnd = new Date(lessonDate)
                  lessonEnd.setHours(parseInt(endTime[0]), parseInt(endTime[1]))

                  let status = "upcoming"
                  if (now >= lessonStart && now <= lessonEnd) {
                    status = "current"
                  } else if (now > lessonEnd) {
                    status = "completed"
                  }

                  return (
                    <Card key={lesson._id} variant="outlined">
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                              {lesson.subject?.name || "Предмет"}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              <AccessTime fontSize="small" color="action" />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {lesson.startTime} - {lesson.endTime}
                              </Typography>
                              <Room
                                fontSize="small"
                                color="action"
                                sx={{ ml: 2 }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {lesson.classroom}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label={getStatusText(status)}
                            color={getStatusColor(status) as any}
                            size="small"
                          />
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              {lesson.lessonType} •{" "}
                              {lesson.groups?.map(g => g.name).join(", ") ||
                                "Группы не указаны"}
                            </Typography>
                          </Box>
                          {status === "current" && (
                            <Button
                              variant="contained"
                              startIcon={<PlayArrow />}
                              size="small"
                              onClick={() => handleStartLesson(lesson)}
                            >
                              Начать занятие
                            </Button>
                          )}
                          {status === "upcoming" && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleViewLesson(lesson)}
                            >
                              Просмотр
                            </Button>
                          )}
                          {status === "completed" &&
                            !lesson.attendanceMarked && (
                              <Button
                                variant="outlined"
                                color="warning"
                                size="small"
                                onClick={() => handleViewLesson(lesson)}
                              >
                                Отметить посещ.
                              </Button>
                            )}
                        </Box>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Быстрые действия и статистика */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Быстрые действия
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <QuickActionCard
                title="Посмотреть расписание"
                description="Полное расписание на неделю"
                action={() => navigate("/schedule")}
              />
              <QuickActionCard
                title="Отметить посещаемость"
                description="Управление посещаемостью"
                action={() => navigate("/teacher/attendance")}
              />
              <QuickActionCard
                title="Выставить оценки"
                description="Оценить работу студентов"
                action={() => navigate("/teacher/grades")}
              />
            </Box>
          </Paper>

          {/* Статистика по предметам */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Статистика по предметам
            </Typography>
            {stats?.subjectStats && stats.subjectStats.length > 0 ? (
              <List dense>
                {stats.subjectStats.slice(0, 3).map((subject, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={subject.subjectName}
                      secondary={`Занятий: ${
                        subject.totalLessons
                      } • Посещаемость: ${Math.round(
                        subject.avgAttendance
                      )}% • Студентов: ${subject.totalStudents}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Статистика не доступна
              </Typography>
            )}
          </Paper>

          {/* Недавняя активность */}
          {stats?.recentActivity && stats.recentActivity.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Недавняя активность
              </Typography>
              <List dense>
                {stats.recentActivity.slice(0, 4).map((activity, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={activity.subject}
                      secondary={`${format(new Date(activity.date), "dd MMM", {
                        locale: ru,
                      })} • ${activity.groups.join(", ")} ${
                        activity.attendanceMarked ? "✓" : "⏳"
                      }`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactElement
  color: string
  suffix?: string
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  suffix = "",
}) => (
  <Card>
    <CardContent>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4">
            {value}
            {suffix}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
      </Box>
    </CardContent>
  </Card>
)

interface QuickActionCardProps {
  title: string
  description: string
  action: () => void
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  action,
}) => (
  <Card
    sx={{
      cursor: "pointer",
      "&:hover": {
        bgcolor: "action.hover",
      },
    }}
    onClick={action}
  >
    <CardContent sx={{ py: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
)

export default TeacherDashboard
