import React, { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material"
import { Save as SaveIcon, Refresh as RefreshIcon } from "@mui/icons-material"

import { apiClient } from "../../services/api"
import {
  ScheduleInstanceWithPopulated,
  StudentWithAttendanceAndGrades,
  AttendanceData,
  AttendanceStatus,
  GradeData,
} from "../../types"

const AttendancePage: React.FC = () => {
  const [todayLessons, setTodayLessons] = useState<
    ScheduleInstanceWithPopulated[]
  >([])
  const [selectedLesson, setSelectedLesson] =
    useState<ScheduleInstanceWithPopulated | null>(null)
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

  // Загрузка занятий на сегодня
  const loadTodayLessons = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getTeacherScheduleToday()
      console.log("response", response)
      setTodayLessons(response.schedule || [])
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка загрузки расписания")
    } finally {
      setLoading(false)
    }
  }

  // Загрузка студентов занятия
  const loadLessonStudents = async (lessonId: string) => {
    try {
      const response = await apiClient.getLessonStudents(lessonId)
      console.log("response", response)
      const students = response.students || []
      setStudents(students)

      console.log("students", students)

      // Инициализируем данные посещаемости и оценок
      const initialAttendance: { [studentId: string]: AttendanceData } = {}
      const initialGrades: { [studentId: string]: GradeData } = {}

      students.forEach(student => {
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

        // Если у студента есть оценки, используем первую (последнюю по дате)
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
      setError(error.response?.data?.message || "Ошибка загрузки студентов")
    }
  }

  useEffect(() => {
    loadTodayLessons()
  }, [])

  // Выбор занятия
  const handleLessonSelect = async (lesson: ScheduleInstanceWithPopulated) => {
    setSelectedLesson(lesson)
    await loadLessonStudents(lesson._id)
  }

  // Обновление статуса посещаемости студента
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

  // Обновление оценки студента
  const updateGrade = (studentId: string, updates: Partial<GradeData>) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        ...updates,
      },
    }))
  }

  // Быстрая отметка статуса
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

  // Массовые действия
  const handleMarkAllPresent = () => {
    const updates: { [studentId: string]: AttendanceData } = {}
    students.forEach(student => {
      updates[student._id] = {
        ...attendance[student._id],
        status: "Присутствует",
        attendedHours: 4,
        missedHours: 0,
      }
    })
    setAttendance(prev => ({ ...prev, ...updates }))
  }

  const handleMarkAllAbsent = () => {
    const updates: { [studentId: string]: AttendanceData } = {}
    students.forEach(student => {
      updates[student._id] = {
        ...attendance[student._id],
        status: "Отсутствует",
        attendedHours: 0,
        missedHours: 4,
      }
    })
    setAttendance(prev => ({ ...prev, ...updates }))
  }

  // Сохранение посещаемости и оценок
  const handleSaveAll = async () => {
    if (!selectedLesson) return

    try {
      setSaving(true)
      setError(null)

      // Сохраняем посещаемость
      const attendanceData = Object.values(attendance)
      await apiClient.markAttendance(selectedLesson._id, attendanceData)

      // Сохраняем оценки (только те, где есть значение)
      const gradesData = Object.values(grades).filter(
        grade =>
          grade.value !== undefined && grade.value !== null && grade.value > 0
      )

      if (gradesData.length > 0) {
        await apiClient.submitGrades(selectedLesson._id, gradesData)
      }

      setSuccess("Посещаемость и оценки успешно сохранены")
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

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Отметка посещаемости и оценок</Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={loadTodayLessons}
          disabled={loading}
        >
          Обновить
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

      {/* Выбор занятия */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Занятия на сегодня
          </Typography>

          {todayLessons.length === 0 ? (
            <Typography color="text.secondary">
              На сегодня занятий не запланировано
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {todayLessons.map(lesson => (
                <Grid item xs={12} md={6} key={lesson._id}>
                  <Card
                    variant={
                      selectedLesson?._id === lesson._id
                        ? "outlined"
                        : "elevation"
                    }
                    sx={{
                      cursor: "pointer",
                      border: selectedLesson?._id === lesson._id ? 2 : 1,
                      borderColor:
                        selectedLesson?._id === lesson._id
                          ? "primary.main"
                          : "grey.300",
                    }}
                    onClick={() => handleLessonSelect(lesson)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {lesson.subject?.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {lesson.lessonType} • {lesson.startTime} -{" "}
                        {lesson.endTime}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Аудитория: {lesson.classroom}
                      </Typography>
                      <Chip
                        label={
                          lesson.attendanceMarked
                            ? "Посещаемость отмечена"
                            : "Ожидает отметки"
                        }
                        color={lesson.attendanceMarked ? "success" : "warning"}
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Отметка посещаемости */}
      {selectedLesson && (
        <Card>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6">
                Студенты на занятии: {selectedLesson.subject?.name}
              </Typography>
              <Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleMarkAllPresent}
                  sx={{ mr: 1 }}
                >
                  Все присутствуют
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleMarkAllAbsent}
                  color="error"
                  sx={{ mr: 2 }}
                >
                  Все отсутствуют
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveAll}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={20} /> : "Сохранить всё"}
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ФИО студента</TableCell>
                    <TableCell align="center">Посещаемость</TableCell>
                    <TableCell align="center">Оценка (1-10)</TableCell>
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
                          <Typography variant="body2">
                            {student.name}
                          </Typography>
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
                              <MenuItem value="Отсутствует">
                                Отсутствует
                              </MenuItem>
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
      )}
    </Box>
  )
}

export default AttendancePage
