import React, { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  DateRange as DateRangeIcon,
} from "@mui/icons-material"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format, addWeeks, startOfWeek } from "date-fns"
import { ru } from "date-fns/locale"

import { apiClient } from "../../services/api"
import {
  Schedule,
  ScheduleInstance,
  ScheduleWithPopulated,
  Subject,
  SubjectWithDepartment,
  Teacher,
  TeacherWithDepartment,
  GroupWithStudents,
  Semester,
  CreateScheduleForm,
} from "../../types"

// Схема валидации для формы расписания
const scheduleSchema = z.object({
  subject: z.string().min(1, "Выберите предмет"),
  teacher: z.string().min(1, "Выберите преподавателя"),
  groups: z.array(z.string()).min(1, "Выберите хотя бы одну группу"),
  dayOfWeek: z.number().min(1).max(7, "Выберите день недели"),
  weeksOfMonth: z.array(z.number()).min(1, "Выберите недели месяца"),
  startTime: z.string().min(1, "Введите время начала"),
  endTime: z.string().min(1, "Введите время окончания"),
  classroom: z.string().min(1, "Введите аудиторию"),
  lessonType: z.enum([
    "Лекция",
    "Практическое занятие",
    "Лабораторная работа",
    "Зачет",
    "Экзамен",
    "Кураторский час",
  ]),
  semester: z.string().min(1, "Выберите семестр"),
  duration: z.number().optional(),
  isRecurring: z.boolean().optional(),
})

const DAYS_OF_WEEK = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
]

const WEEKS_OF_MONTH = [
  { value: 1, label: "1-я неделя" },
  { value: 2, label: "2-я неделя" },
  { value: 3, label: "3-я неделя" },
  { value: 4, label: "4-я неделя" },
]

const LESSON_TYPES = [
  "Лекция",
  "Практическое занятие",
  "Лабораторная работа",
  "Зачет",
  "Экзамен",
  "Кураторский час",
]

const ScheduleManagementPage: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleWithPopulated[]>([])
  const [subjects, setSubjects] = useState<SubjectWithDepartment[]>([])
  const [teachers, setTeachers] = useState<TeacherWithDepartment[]>([])
  const [groups, setGroups] = useState<GroupWithStudents[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] =
    useState<ScheduleWithPopulated | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<CreateScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      subject: "",
      teacher: "",
      groups: [],
      dayOfWeek: 1,
      weeksOfMonth: [1, 2, 3, 4],
      startTime: "09:00",
      endTime: "10:20",
      classroom: "",
      lessonType: "Лекция",
      semester: "",
      duration: 80,
      isRecurring: true,
    },
  })

  // Загрузка данных
  const loadData = async () => {
    try {
      setLoading(true)
      const [
        schedulesResponse,
        subjectsResponse,
        teachersResponse,
        groupsResponse,
        semestersResponse,
      ] = await Promise.all([
        apiClient.getSchedules(),
        apiClient.getSubjects(),
        apiClient.getTeachers(),
        apiClient.getGroups(),
        apiClient.getSemesters(),
      ])

      setSchedules(schedulesResponse.schedules || [])
      setSubjects(subjectsResponse.subjects || [])
      setTeachers(teachersResponse.teachers || [])
      setGroups(groupsResponse.groups || [])
      setSemesters(semestersResponse.semesters || [])
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка загрузки данных")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Получение названия предмета
  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s._id === subjectId)
    return subject?.name || "Неизвестный предмет"
  }

  // Получение имени преподавателя
  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t._id === teacherId)
    return teacher?.name || "Неизвестный преподаватель"
  }

  // Получение названий групп
  const getGroupNames = (groupIds: string[]) => {
    return groupIds
      .map(id => {
        const group = groups.find(g => g._id === id)
        return group?.name || "Неизвестная группа"
      })
      .join(", ")
  }

  // Получение названия семестра
  const getSemesterName = (semesterId: string) => {
    const semester = semesters.find(s => s._id === semesterId)
    return semester
      ? `${semester.name} ${semester.year}`
      : "Неизвестный семестр"
  }

  // Helper функции для отображения populated данных
  const getPopulatedSubjectName = (schedule: ScheduleWithPopulated) => {
    return schedule.subject?.name || "Неизвестный предмет"
  }

  const getPopulatedTeacherName = (schedule: ScheduleWithPopulated) => {
    return schedule.teacher?.name || "Неизвестный преподаватель"
  }

  const getPopulatedGroupNames = (schedule: ScheduleWithPopulated) => {
    return schedule.groups?.map(g => g.name).join(", ") || "Нет групп"
  }

  const getPopulatedSemesterName = (schedule: ScheduleWithPopulated) => {
    return schedule.semester
      ? `${schedule.semester.name} ${schedule.semester.year}`
      : "Неизвестный семестр"
  }

  // Открытие диалога создания
  const handleCreateClick = () => {
    setEditingSchedule(null)
    const activeSemester = semesters.find(s => s.isActive)
    form.reset({
      subject: "",
      teacher: "",
      groups: [],
      dayOfWeek: 1,
      weeksOfMonth: [1, 2, 3, 4],
      startTime: "09:00",
      endTime: "10:20",
      classroom: "",
      lessonType: "Лекция",
      semester: activeSemester?._id || "",
      duration: 80,
      isRecurring: true,
    })
    setDialogOpen(true)
  }

  // Открытие диалога редактирования
  const handleEditClick = (schedule: ScheduleWithPopulated) => {
    setEditingSchedule(schedule)
    form.reset({
      subject: schedule.subject?._id || "",
      teacher: schedule.teacher?._id || "",
      groups: schedule.groups?.map(g => g._id) || [],
      dayOfWeek: schedule.dayOfWeek,
      weeksOfMonth: schedule.weeksOfMonth,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      classroom: schedule.classroom,
      lessonType: schedule.lessonType,
      semester: schedule.semester?._id || "",
      duration: schedule.duration,
      isRecurring: schedule.isRecurring,
    })
    setDialogOpen(true)
  }

  // Сохранение расписания
  const handleSave = async (data: CreateScheduleForm) => {
    try {
      setError(null)

      if (editingSchedule) {
        // Редактирование
        await apiClient.updateSchedule(editingSchedule._id, data)
        setSuccess("Расписание успешно обновлено")
      } else {
        // Создание
        await apiClient.createSchedule(data)
        setSuccess("Расписание успешно создано")
      }

      setDialogOpen(false)
      setEditingSchedule(null)
      form.reset()
      loadData()

      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка сохранения расписания")
    }
  }

  // Удаление расписания
  const handleDelete = async (scheduleId: string) => {
    if (!window.confirm("Вы уверены, что хотите удалить это расписание?")) {
      return
    }

    try {
      await apiClient.deleteSchedule(scheduleId)
      setSuccess("Расписание успешно удалено")
      loadData()

      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка удаления расписания")
    }
  }

  // Закрытие диалога
  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingSchedule(null)
    form.reset()
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Управление расписанием
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Создать занятие
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {schedules.map(schedule => (
          <Grid item xs={12} md={6} lg={4} key={schedule._id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {getPopulatedSubjectName(schedule)}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={1}>
                  <PersonIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {getPopulatedTeacherName(schedule)}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={1}>
                  <GroupIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {getPopulatedGroupNames(schedule)}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={1}>
                  <DateRangeIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {DAYS_OF_WEEK[schedule.dayOfWeek - 1]} (
                    {schedule.weeksOfMonth
                      .map(week => `${week}-я неделя`)
                      .join(", ")}
                    )
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={1}>
                  <TimeIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {schedule.startTime} - {schedule.endTime}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <SchoolIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Ауд. {schedule.classroom}
                  </Typography>
                </Box>

                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                  <Chip
                    label={schedule.lessonType}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={getPopulatedSemesterName(schedule)}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </CardContent>

              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleEditClick(schedule)}
                  color="primary"
                  title="Редактировать"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(schedule._id)}
                  color="error"
                  title="Удалить"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {schedules.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <ScheduleIcon
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Расписание не создано
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Нажмите "Создать занятие" для добавления первого занятия
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Диалог создания/редактирования */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingSchedule ? "Редактировать занятие" : "Создать занятие"}
        </DialogTitle>
        <form onSubmit={form.handleSubmit(handleSave)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="subject"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Предмет</InputLabel>
                      <Select {...field} label="Предмет">
                        {subjects.map(subject => (
                          <MenuItem key={subject._id} value={subject._id}>
                            {subject.name} ({subject.code})
                          </MenuItem>
                        ))}
                      </Select>
                      {error && (
                        <Typography variant="caption" color="error">
                          {error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="teacher"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Преподаватель</InputLabel>
                      <Select {...field} label="Преподаватель">
                        {teachers.map(teacher => (
                          <MenuItem key={teacher._id} value={teacher._id}>
                            {teacher.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {error && (
                        <Typography variant="caption" color="error">
                          {error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="groups"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Группы</InputLabel>
                      <Select
                        {...field}
                        multiple
                        label="Группы"
                        renderValue={selected => (
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {(selected as string[]).map(value => (
                              <Chip
                                key={value}
                                label={groups.find(g => g._id === value)?.name}
                                size="small"
                              />
                            ))}
                          </Box>
                        )}
                      >
                        {groups.map(group => (
                          <MenuItem key={group._id} value={group._id}>
                            {group.name} ({group.specialty}, {group.course}{" "}
                            курс)
                          </MenuItem>
                        ))}
                      </Select>
                      {error && (
                        <Typography variant="caption" color="error">
                          {error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="dayOfWeek"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>День недели</InputLabel>
                      <Select {...field} label="День недели">
                        {DAYS_OF_WEEK.map((day, index) => (
                          <MenuItem key={index} value={index + 1}>
                            {day}
                          </MenuItem>
                        ))}
                      </Select>
                      {error && (
                        <Typography variant="caption" color="error">
                          {error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="weeksOfMonth"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Недели месяца</InputLabel>
                      <Select
                        {...field}
                        multiple
                        label="Недели месяца"
                        renderValue={selected => (
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {(selected as number[]).map(value => (
                              <Chip
                                key={value}
                                label={`${value}-я неделя`}
                                size="small"
                              />
                            ))}
                          </Box>
                        )}
                      >
                        {WEEKS_OF_MONTH.map(week => (
                          <MenuItem key={week.value} value={week.value}>
                            {week.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {error && (
                        <Typography variant="caption" color="error">
                          {error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="startTime"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      type="time"
                      label="Время начала"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="endTime"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      type="time"
                      label="Время окончания"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="classroom"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Аудитория"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="lessonType"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Тип занятия</InputLabel>
                      <Select {...field} label="Тип занятия">
                        {LESSON_TYPES.map(type => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                      {error && (
                        <Typography variant="caption" color="error">
                          {error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="semester"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Семестр</InputLabel>
                      <Select {...field} label="Семестр">
                        {semesters.map(semester => (
                          <MenuItem key={semester._id} value={semester._id}>
                            {semester.name} {semester.year}
                            {semester.isActive && " (Активный)"}
                          </MenuItem>
                        ))}
                      </Select>
                      {error && (
                        <Typography variant="caption" color="error">
                          {error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button type="submit" variant="contained">
              {editingSchedule ? "Сохранить" : "Создать"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default ScheduleManagementPage
