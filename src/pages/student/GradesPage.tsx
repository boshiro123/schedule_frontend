import React, { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material"
import {
  Grade as GradeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

import { apiClient } from "../../services/api"
import { Grade, GradeType, Semester } from "../../types"

const StudentGradesPage: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Загрузка данных
  const loadData = async () => {
    try {
      setLoading(true)
      const [gradesResponse, semestersResponse] = await Promise.all([
        apiClient.getStudentGrades({
          semesterId: selectedSemester || undefined,
          subjectId: selectedSubject || undefined,
        }),
        apiClient.getSemesters(),
      ])
      setGrades(gradesResponse.data || [])
      setSemesters(semestersResponse.semesters || [])
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка загрузки данных")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedSemester, selectedSubject])

  // Получение уникальных предметов
  const getUniqueSubjects = () => {
    const subjects = new Set(grades.map(grade => grade.subject))
    return Array.from(subjects)
  }

  // Группировка оценок по предметам
  const groupGradesBySubject = () => {
    const grouped = grades.reduce((acc, grade) => {
      if (!acc[grade.subject]) {
        acc[grade.subject] = []
      }
      acc[grade.subject].push(grade)
      return acc
    }, {} as Record<string, Grade[]>)

    // Сортируем оценки в каждом предмете по дате
    Object.keys(grouped).forEach(subject => {
      grouped[subject].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    })

    return grouped
  }

  // Вычисление статистики по предмету
  const getSubjectStats = (subjectGrades: Grade[]) => {
    if (subjectGrades.length === 0) return null

    const values = subjectGrades.map(g => g.value)
    const average = values.reduce((a, b) => a + b, 0) / values.length
    const highest = Math.max(...values)
    const lowest = Math.min(...values)

    // Группировка по типам оценок
    const byType = subjectGrades.reduce((acc, grade) => {
      if (!acc[grade.gradeType]) {
        acc[grade.gradeType] = []
      }
      acc[grade.gradeType].push(grade.value)
      return acc
    }, {} as Record<GradeType, number[]>)

    return {
      average: Number(average.toFixed(1)),
      highest,
      lowest,
      total: subjectGrades.length,
      byType,
    }
  }

  // Получение цвета оценки
  const getGradeColor = (value: number) => {
    if (value >= 9) return "success"
    if (value >= 7) return "warning"
    if (value >= 5) return "info"
    return "error"
  }

  // Получение цвета типа оценки
  const getGradeTypeColor = (type: GradeType) => {
    switch (type) {
      case "Экзамен":
        return "error"
      case "Зачет":
        return "warning"
      case "Контрольная":
        return "info"
      case "Лабораторная":
        return "secondary"
      default:
        return "default"
    }
  }

  // Получение иконки тренда
  const getTrendIcon = (average: number) => {
    if (average >= 8) return <TrendingUpIcon color="success" />
    if (average >= 6) return <TrendingUpIcon color="warning" />
    return <TrendingDownIcon color="error" />
  }

  const groupedGrades = groupGradesBySubject()
  const subjects = getUniqueSubjects()

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
        <Typography variant="h4">Мои оценки</Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={loadData}
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

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Фильтры
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Семестр</InputLabel>
                <Select
                  value={selectedSemester}
                  label="Семестр"
                  onChange={e => setSelectedSemester(e.target.value)}
                >
                  <MenuItem value="">Все семестры</MenuItem>
                  {semesters.map(semester => (
                    <MenuItem key={semester._id} value={semester._id}>
                      {semester.name} {semester.year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Предмет</InputLabel>
                <Select
                  value={selectedSubject}
                  label="Предмет"
                  onChange={e => setSelectedSubject(e.target.value)}
                >
                  <MenuItem value="">Все предметы</MenuItem>
                  {subjects.map(subject => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Общая статистика */}
      {grades.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Средний балл
                    </Typography>
                    <Typography variant="h4">
                      {(
                        grades.reduce((a, b) => a + b.value, 0) / grades.length
                      ).toFixed(1)}
                    </Typography>
                  </Box>
                  {getTrendIcon(
                    grades.reduce((a, b) => a + b.value, 0) / grades.length
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Всего оценок
                </Typography>
                <Typography variant="h4">{grades.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Лучшая оценка
                </Typography>
                <Typography variant="h4" color="success.main">
                  {Math.max(...grades.map(g => g.value))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Предметов
                </Typography>
                <Typography variant="h4">{subjects.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Оценки по предметам */}
      {Object.keys(groupedGrades).length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <GradeIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Оценки не найдены
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Пока что оценок по выбранным критериям не обнаружено
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedGrades).map(([subject, subjectGrades]) => {
          const stats = getSubjectStats(subjectGrades)

          return (
            <Accordion key={subject} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" width="100%">
                  <SchoolIcon sx={{ mr: 2 }} />
                  <Box flexGrow={1}>
                    <Typography variant="h6">{subject}</Typography>
                    <Box display="flex" gap={1} mt={1}>
                      <Chip
                        label={`Средний балл: ${stats?.average}`}
                        color={getGradeColor(stats?.average || 0)}
                        size="small"
                      />
                      <Chip
                        label={`Оценок: ${stats?.total}`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                {/* Статистика предмета */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Средний балл
                        </Typography>
                        <Typography variant="h6">{stats?.average}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(stats?.average || 0) * 10}
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Лучшая оценка
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {stats?.highest}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Худшая оценка
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          {stats?.lowest}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Всего оценок
                        </Typography>
                        <Typography variant="h6">{stats?.total}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Таблица оценок */}
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell align="center">Оценка</TableCell>
                        <TableCell>Тип</TableCell>
                        <TableCell>Описание</TableCell>
                        <TableCell>Комментарии</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subjectGrades.map(grade => (
                        <TableRow key={grade._id}>
                          <TableCell>
                            {format(new Date(grade.date), "d MMM yyyy", {
                              locale: ru,
                            })}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={grade.value}
                              color={getGradeColor(grade.value)}
                              icon={<AssessmentIcon />}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={grade.gradeType}
                              color={getGradeTypeColor(grade.gradeType)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {grade.description || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {grade.notes || "—"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          )
        })
      )}
    </Box>
  )
}

export default StudentGradesPage
