import React, { useState, useEffect, useCallback } from "react"
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from "@mui/material"
import { ArrowBack, Save } from "@mui/icons-material"
import { useNavigate, useParams } from "react-router-dom"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

import { apiClient } from "../../services/api"
import {
  ScheduleInstanceWithPopulated,
  StudentWithAttendanceAndGrades,
  AttendanceStatus,
  GradeType,
  AttendanceData,
  GradeData,
} from "../../types"

const TeacherLessonPage: React.FC = () => {
  const navigate = useNavigate()
  const { lessonId } = useParams<{ lessonId: string }>()

  const [lesson, setLesson] = useState<ScheduleInstanceWithPopulated | null>(
    null
  )
  const [students, setStudents] = useState<StudentWithAttendanceAndGrades[]>([])
  const [attendance, setAttendance] = useState<{
    [studentId: string]: AttendanceData
  }>({})
  const [grades, setGrades] = useState<{
    [studentId: string]: GradeData
  }>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadLessonData = useCallback(async () => {
    if (!lessonId) return

    try {
      setLoading(true)
      const response = await apiClient.getLessonStudents(lessonId)

      setStudents(response.students || [])
      setLesson(response.scheduleInstance)

      // Инициализация данных посещаемости и оценок
      const initialAttendance: { [studentId: string]: AttendanceData } = {}
      const initialGrades: { [studentId: string]: GradeData } = {}

      response.students?.forEach(student => {
        // Если у студента уже есть attendance, используем существующие данные
        if (student.attendance) {
          initialAttendance[student._id] = {
            studentId: student._id,
            status: student.attendance.status,
            attendedHours: student.attendance.attendedHours,
            missedHours: student.attendance.missedHours,
            notes: student.attendance.notes,
          }
        } else {
          // Если нет данных посещаемости, инициализируем пустыми
          initialAttendance[student._id] = {
            studentId: student._id,
            status: "Отсутствует",
            attendedHours: 0,
            missedHours: 4,
            notes: "",
          }
        }

        // Если у студента есть оценки, используем последнюю
        if (student.grades && student.grades.length > 0) {
          const latestGrade = student.grades[student.grades.length - 1]
          initialGrades[student._id] = {
            studentId: student._id,
            value: latestGrade.value,
            gradeType: latestGrade.gradeType,
            notes: latestGrade.notes,
          }
        } else {
          // Если нет оценок, инициализируем пустыми
          initialGrades[student._id] = {
            studentId: student._id,
            gradeType: "Текущая",
            notes: "",
          }
        }
      })

      setAttendance(initialAttendance)
      setGrades(initialGrades)
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка загрузки данных")
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    if (lessonId) {
      loadLessonData()
    }
  }, [lessonId, loadLessonData])

  const updateAttendance = (
    studentId: string,
    updates: Partial<AttendanceData>
  ) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        ...updates,
      },
    }))
  }

  const updateGrade = (studentId: string, updates: Partial<GradeData>) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        ...updates,
      },
    }))
  }

  const handleQuickStatus = (studentId: string, status: AttendanceStatus) => {
    let attendedHours = 0
    let missedHours = 0

    switch (status) {
      case "Присутствует":
        attendedHours = 4
        missedHours = 0
        break
      case "Опоздал":
      case "Ушел раньше":
        attendedHours = 2
        missedHours = 2
        break
      case "Отсутствует":
        attendedHours = 0
        missedHours = 4
        break
    }

    updateAttendance(studentId, {
      status,
      attendedHours,
      missedHours,
    })
  }

  const handleSaveAll = async () => {
    if (!lessonId) return

    try {
      setSaving(true)
      setError(null)

      // Сохраняем посещаемость
      const attendanceData = Object.values(attendance)
      await apiClient.markAttendance(lessonId, attendanceData)

      // Сохраняем оценки (только те, где есть значение)
      const gradesData = Object.values(grades).filter(
        grade =>
          grade.value !== undefined && grade.value !== null && grade.value > 0
      )

      if (gradesData.length > 0) {
        await apiClient.submitGrades(lessonId, gradesData)
      }

      setSuccess("Данные успешно сохранены")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка сохранения данных")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
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

  if (!lesson) {
    return (
      <Box>
        <Alert severity="error">Занятие не найдено</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Назад
        </Button>
        <Typography variant="h4">
          Занятие: {lesson.subject?.name || "Неизвестный предмет"}
        </Typography>
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

      {/* Информация о занятии */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Предмет
              </Typography>
              <Typography variant="body1">
                {lesson.subject?.name || "Неизвестный предмет"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Тип занятия
              </Typography>
              <Chip label={lesson.lessonType} color="primary" size="small" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Время
              </Typography>
              <Typography variant="body1">
                {lesson.startTime} - {lesson.endTime}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Аудитория
              </Typography>
              <Typography variant="body1">{lesson.classroom}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Дата
              </Typography>
              <Typography variant="body1">
                {format(new Date(lesson.date), "dd MMMM yyyy", { locale: ru })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Статус
              </Typography>
              <Chip
                label={lesson.status}
                color={lesson.status === "Проведено" ? "success" : "default"}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Группы
              </Typography>
              <Typography variant="body1">
                {lesson.groups?.map(g => g.name).join(", ") || "Нет групп"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Студентов
              </Typography>
              <Typography variant="body1">{students.length}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Таблица студентов */}
      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6">Студенты</Typography>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveAll}
              disabled={saving}
            >
              {saving ? <CircularProgress size={20} /> : "Сохранить всё"}
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ФИО студента</TableCell>
                  <TableCell align="center">Посещаемость</TableCell>
                  <TableCell align="center">Оценка (1-10)</TableCell>
                  <TableCell align="center">Тип оценки</TableCell>
                  <TableCell>Примечания</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map(student => {
                  const studentAttendance = attendance[student._id]
                  const studentGrade = grades[student._id]
                  return (
                    <TableRow key={student._id}>
                      <TableCell>
                        <Typography variant="body2">{student.name}</Typography>
                      </TableCell>

                      <TableCell align="center">
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <Select
                            value={studentAttendance?.status || "Отсутствует"}
                            onChange={e =>
                              handleQuickStatus(
                                student._id,
                                e.target.value as AttendanceStatus
                              )
                            }
                          >
                            <MenuItem value="Присутствует">
                              Присутствует
                            </MenuItem>
                            <MenuItem value="Отсутствует">Отсутствует</MenuItem>
                            <MenuItem value="Опоздал">
                              Опоздал (2ч пропуска)
                            </MenuItem>
                            <MenuItem value="Ушел раньше">
                              Ушел раньше (2ч пропуска)
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>

                      <TableCell align="center">
                        <TextField
                          size="small"
                          type="number"
                          placeholder="1-10"
                          value={studentGrade?.value || ""}
                          onChange={e => {
                            const value = parseInt(e.target.value)
                            updateGrade(student._id, {
                              value:
                                value >= 1 && value <= 10 ? value : undefined,
                            })
                          }}
                          inputProps={{
                            min: 1,
                            max: 10,
                            style: { width: 60 },
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={studentGrade?.gradeType || "Текущая"}
                            onChange={e =>
                              updateGrade(student._id, {
                                gradeType: e.target.value as GradeType,
                              })
                            }
                          >
                            <MenuItem value="Текущая">Текущая</MenuItem>
                            <MenuItem value="Контрольная">Контрольная</MenuItem>
                            <MenuItem value="Лабораторная">
                              Лабораторная
                            </MenuItem>
                            <MenuItem value="Зачет">Зачет</MenuItem>
                            <MenuItem value="Экзамен">Экзамен</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>

                      <TableCell>
                        <TextField
                          size="small"
                          placeholder="Примечания..."
                          value={studentAttendance?.notes || ""}
                          onChange={e =>
                            updateAttendance(student._id, {
                              notes: e.target.value,
                            })
                          }
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

export default TeacherLessonPage
