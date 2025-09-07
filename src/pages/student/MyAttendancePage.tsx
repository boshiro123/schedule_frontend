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
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Schedule as LateIcon,
  ExitToApp as LeftEarlyIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

import { apiClient } from "../../services/api"
import { Attendance, Semester, StudentAttendanceBySubject } from "../../types"

const MyAttendancePage: React.FC = () => {
  const [attendanceBySubject, setAttendanceBySubject] = useState<
    StudentAttendanceBySubject[]
  >([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Общая статистика
  const [totalStats, setTotalStats] = useState({
    totalLessons: 0,
    attendedLessons: 0,
    missedLessons: 0,
    attendancePercentage: 0,
    totalHours: 0,
    attendedHours: 0,
  })

  useEffect(() => {
    loadSemesters()
  }, [])

  useEffect(() => {
    if (selectedSemester) {
      loadAttendance()
    }
  }, [selectedSemester, selectedSubject])

  const loadSemesters = async () => {
    try {
      const semestersResponse = await apiClient.getSemesters()
      setSemesters(semestersResponse.semesters || [])

      console.log("semestersResponse", semestersResponse)
      // Выбираем активный семестр по умолчанию
      const activeSemester = semestersResponse.semesters?.find(s => s.isActive)
      if (activeSemester) {
        setSelectedSemester(activeSemester._id)
      } else if (
        semestersResponse.semesters &&
        semestersResponse.semesters.length > 0
      ) {
        setSelectedSemester(semestersResponse.semesters[0]._id)
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка загрузки семестров")
    }
  }

  const loadAttendance = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: { semesterId?: string; subjectId?: string } = {}
      if (selectedSemester) params.semesterId = selectedSemester
      if (selectedSubject) params.subjectId = selectedSubject

      const response = await apiClient.getStudentAttendance(params)
      const attendanceData = response.attendanceBySubject || []
      setAttendanceBySubject(attendanceData)

      console.log("attendanceData", attendanceData)

      // Вычисляем общую статистику
      calculateTotalStats(attendanceData)
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Ошибка загрузки данных о посещаемости"
      )
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalStats = (
    attendanceBySubject: StudentAttendanceBySubject[]
  ) => {
    const totalStats = attendanceBySubject.reduce(
      (acc, subjectData) => {
        acc.totalLessons += subjectData.stats.totalLessons
        acc.attendedLessons += subjectData.stats.presentCount
        acc.totalHours +=
          subjectData.stats.totalAttendedHours +
          subjectData.stats.totalMissedHours
        acc.attendedHours += subjectData.stats.totalAttendedHours
        return acc
      },
      {
        totalLessons: 0,
        attendedLessons: 0,
        missedLessons: 0,
        attendancePercentage: 0,
        totalHours: 0,
        attendedHours: 0,
      }
    )

    totalStats.missedLessons =
      totalStats.totalLessons - totalStats.attendedLessons
    totalStats.attendancePercentage =
      totalStats.totalLessons > 0
        ? (totalStats.attendedLessons / totalStats.totalLessons) * 100
        : 0

    setTotalStats(totalStats)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Присутствует":
        return "success"
      case "Отсутствует":
        return "error"
      case "Опоздал":
        return "warning"
      case "Ушел раньше":
        return "info"
      default:
        return "default"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Присутствует":
        return <PresentIcon fontSize="small" />
      case "Отсутствует":
        return <AbsentIcon fontSize="small" />
      case "Опоздал":
        return <LateIcon fontSize="small" />
      case "Ушел раньше":
        return <LeftEarlyIcon fontSize="small" />
      default:
        return <AbsentIcon fontSize="small" />
    }
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Моя посещаемость</Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={loadAttendance}
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
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Семестр</InputLabel>
                <Select
                  value={selectedSemester}
                  onChange={e => setSelectedSemester(e.target.value)}
                  label="Семестр"
                >
                  {semesters.map(semester => (
                    <MenuItem key={semester._id} value={semester._id}>
                      {semester.name} {semester.year}
                      {semester.isActive && (
                        <Chip label="Активный" size="small" sx={{ ml: 1 }} />
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Предмет</InputLabel>
                <Select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  label="Предмет"
                >
                  <MenuItem value="">
                    <em>Все предметы</em>
                  </MenuItem>
                  {attendanceBySubject.map(subjectData => (
                    <MenuItem
                      key={subjectData.subject._id}
                      value={subjectData.subject.name}
                    >
                      {subjectData.subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={loadAttendance}
                disabled={loading}
                fullWidth
              >
                Применить фильтр
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Общая статистика */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <SchoolIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Всего занятий</Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {totalStats.totalLessons}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PresentIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">Посещено</Typography>
                  </Box>
                  <Typography variant="h4" color="success.main">
                    {totalStats.attendedLessons}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <AbsentIcon color="error" sx={{ mr: 1 }} />
                    <Typography variant="h6">Пропущено</Typography>
                  </Box>
                  <Typography variant="h4" color="error.main">
                    {totalStats.missedLessons}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <AssessmentIcon color="info" sx={{ mr: 1 }} />
                    <Typography variant="h6">Процент посещаемости</Typography>
                  </Box>
                  <Typography variant="h4" color="info.main">
                    {totalStats.attendancePercentage.toFixed(1)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={totalStats.attendancePercentage}
                    sx={{ mt: 1 }}
                    color={
                      totalStats.attendancePercentage >= 80
                        ? "success"
                        : "error"
                    }
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {attendanceBySubject.length === 0 ? (
            <Card>
              <CardContent>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  align="center"
                >
                  Нет данных о посещаемости за выбранный период
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Группировка по предметам */}
              <Typography variant="h5" sx={{ mb: 2 }}>
                Посещаемость по предметам
              </Typography>

              {attendanceBySubject.map(subjectData => (
                <Accordion key={subjectData.subject._id} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" width="100%">
                      <SchoolIcon sx={{ mr: 2 }} />
                      <Box flexGrow={1}>
                        <Typography variant="h6">
                          {subjectData.subject.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {subjectData.stats.presentCount}/
                          {subjectData.stats.totalLessons} занятий посещено
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Chip
                          label={`${subjectData.stats.attendancePercentage.toFixed(
                            1
                          )}%`}
                          color={
                            subjectData.stats.attendancePercentage >= 80
                              ? "success"
                              : "error"
                          }
                          sx={{ mr: 2 }}
                        />
                        {subjectData.stats.attendancePercentage >= 80 ? (
                          <TrendingUpIcon color="success" />
                        ) : (
                          <TrendingDownIcon color="error" />
                        )}
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Дата</TableCell>
                            <TableCell>Тип занятия</TableCell>
                            <TableCell align="center">Статус</TableCell>
                            <TableCell align="center">Часы</TableCell>
                            <TableCell>Примечания</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {subjectData.records
                            .sort(
                              (a, b) =>
                                new Date(b.date).getTime() -
                                new Date(a.date).getTime()
                            )
                            .map(record => (
                              <TableRow key={record._id}>
                                <TableCell>
                                  {format(new Date(record.date), "dd.MM.yyyy", {
                                    locale: ru,
                                  })}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={record.lessonType}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    icon={getStatusIcon(record.status)}
                                    label={record.status}
                                    color={getStatusColor(record.status) as any}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="body2">
                                    {record.attendedHours}/
                                    {record.attendedHours + record.missedHours}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {record.notes || "-"}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))}
            </>
          )}
        </>
      )}
    </Box>
  )
}

export default MyAttendancePage
