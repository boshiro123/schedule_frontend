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
  GradeData,
  GradeType,
} from "../../types"

const GradesPage: React.FC = () => {
  const [todayLessons, setTodayLessons] = useState<
    ScheduleInstanceWithPopulated[]
  >([])
  const [selectedLesson, setSelectedLesson] =
    useState<ScheduleInstanceWithPopulated | null>(null)
  const [students, setStudents] = useState<StudentWithAttendanceAndGrades[]>([])
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
      const students = response.students || []
      setStudents(students)

      // Инициализируем данные оценок
      const initialGrades: { [studentId: string]: GradeData } = {}

      students.forEach(student => {
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

  // Сохранение оценок
  const handleSaveGrades = async () => {
    if (!selectedLesson) return

    try {
      setSaving(true)
      setError(null)

      // Сохраняем оценки (только те, где есть значение)
      const gradesData = Object.values(grades).filter(
        grade =>
          grade.value !== undefined && grade.value !== null && grade.value > 0
      )

      if (gradesData.length === 0) {
        setError("Выставите хотя бы одну оценку")
        return
      }

      await apiClient.submitGrades(selectedLesson._id, gradesData)

      setSuccess("Оценки успешно сохранены")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка сохранения оценок")
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
        <Typography variant="h4">Выставление оценок</Typography>
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
                        label={lesson.lessonType}
                        color="primary"
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

      {/* Выставление оценок */}
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
                Выставить оценки: {selectedLesson.subject?.name}
              </Typography>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveGrades}
                disabled={saving}
              >
                {saving ? <CircularProgress size={20} /> : "Сохранить оценки"}
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ФИО студента</TableCell>
                    <TableCell align="center">Оценка (1-10)</TableCell>
                    <TableCell align="center">Тип оценки</TableCell>
                    <TableCell>Примечания</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map(student => {
                    const studentGrade = grades[student._id]
                    return (
                      <TableRow key={student._id}>
                        <TableCell>
                          <Typography variant="body2">
                            {student.name}
                          </Typography>
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
                              <MenuItem value="Контрольная">
                                Контрольная
                              </MenuItem>
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
                            value={studentGrade?.notes || ""}
                            onChange={e =>
                              updateGrade(student._id, {
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

export default GradesPage
