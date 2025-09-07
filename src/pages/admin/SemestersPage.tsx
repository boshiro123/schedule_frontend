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
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  PlayArrow as ActivateIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as ActiveIcon,
} from "@mui/icons-material"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

import { apiClient } from "../../services/api"
import { Semester, CreateSemesterForm } from "../../types"

// Схема валидации для формы семестра
const semesterSchema = z.object({
  name: z.enum(["Осенний", "Весенний"]),
  year: z
    .number()
    .min(2020, "Год должен быть не менее 2020")
    .max(2030, "Год должен быть не более 2030"),
  startDate: z.string().min(1, "Дата начала обязательна"),
  endDate: z.string().min(1, "Дата окончания обязательна"),
  examStartDate: z.string().optional(),
  examEndDate: z.string().optional(),
})

const SemestersPage: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<CreateSemesterForm>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      name: "Осенний",
      year: new Date().getFullYear(),
      startDate: "",
      endDate: "",
      examStartDate: "",
      examEndDate: "",
    },
  })

  // Загрузка семестров
  const loadSemesters = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getSemesters()
      setSemesters(response.semesters || [])
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка загрузки семестров")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSemesters()
  }, [])

  // Открытие диалога создания
  const handleCreateClick = () => {
    setEditingSemester(null)
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()
    const isAutumn = currentMonth >= 8 // Сентябрь и позже

    form.reset({
      name: isAutumn ? "Осенний" : "Весенний",
      year: currentYear,
      startDate: "",
      endDate: "",
      examStartDate: "",
      examEndDate: "",
    })
    setDialogOpen(true)
  }

  // Открытие диалога редактирования
  const handleEditClick = (semester: Semester) => {
    setEditingSemester(semester)
    form.reset({
      name: semester.name,
      year: semester.year,
      startDate: format(new Date(semester.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(semester.endDate), "yyyy-MM-dd"),
      examStartDate: semester.examStartDate
        ? format(new Date(semester.examStartDate), "yyyy-MM-dd")
        : "",
      examEndDate: semester.examEndDate
        ? format(new Date(semester.examEndDate), "yyyy-MM-dd")
        : "",
    })
    setDialogOpen(true)
  }

  // Сохранение семестра
  const handleSave = async (data: CreateSemesterForm) => {
    try {
      setError(null)

      if (editingSemester) {
        // Редактирование пока не реализовано в API
        setError("Редактирование семестров пока не поддерживается")
        return
      } else {
        // Создание
        await apiClient.createSemester(data)
        setSuccess("Семестр успешно создан")
      }

      setDialogOpen(false)
      loadSemesters()

      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка сохранения семестра")
    }
  }

  // Активация семестра
  const handleActivate = async (semesterId: string) => {
    if (
      !window.confirm(
        "Вы уверены, что хотите активировать этот семестр? Текущий активный семестр будет деактивирован."
      )
    ) {
      return
    }

    try {
      await apiClient.activateSemester(semesterId)
      setSuccess("Семестр успешно активирован")
      loadSemesters()
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка активации семестра")
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingSemester(null)
    form.reset()
  }

  // Получение цвета статуса семестра
  const getSemesterStatus = (semester: Semester) => {
    const now = new Date()
    const start = new Date(semester.startDate)
    const end = new Date(semester.endDate)

    if (semester.isActive) {
      return { color: "success", text: "Активный" }
    } else if (now < start) {
      return { color: "info", text: "Предстоящий" }
    } else if (now > end) {
      return { color: "default", text: "Завершенный" }
    } else {
      return { color: "warning", text: "Текущий" }
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
        <Typography variant="h4">Управление семестрами</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Создать семестр
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
        {semesters.map(semester => {
          const status = getSemesterStatus(semester)

          return (
            <Grid item xs={12} md={6} lg={4} key={semester._id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <CalendarIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {semester.name} {semester.year}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    <strong>Период обучения:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {format(new Date(semester.startDate), "d MMMM yyyy", {
                      locale: ru,
                    })}{" "}
                    —{" "}
                    {format(new Date(semester.endDate), "d MMMM yyyy", {
                      locale: ru,
                    })}
                  </Typography>

                  {semester.examStartDate && semester.examEndDate && (
                    <>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        <strong>Экзаменационная сессия:</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {format(new Date(semester.examStartDate), "d MMMM", {
                          locale: ru,
                        })}{" "}
                        —{" "}
                        {format(new Date(semester.examEndDate), "d MMMM yyyy", {
                          locale: ru,
                        })}
                      </Typography>
                    </>
                  )}

                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    <Chip
                      label={status.text}
                      color={status.color as any}
                      size="small"
                      icon={semester.isActive ? <ActiveIcon /> : undefined}
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Создан:{" "}
                    {format(new Date(semester.createdAt), "d MMMM yyyy", {
                      locale: ru,
                    })}
                  </Typography>
                </CardContent>

                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleEditClick(semester)}
                    color="primary"
                    title="Редактировать"
                  >
                    <EditIcon />
                  </IconButton>
                  {!semester.isActive && (
                    <IconButton
                      size="small"
                      onClick={() => handleActivate(semester._id)}
                      color="success"
                      title="Активировать семестр"
                    >
                      <ActivateIcon />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Grid>
          )
        })}

        {semesters.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <CalendarIcon
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Семестры не найдены
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Создайте первый семестр для начала работы
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateClick}
                  >
                    Создать семестр
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Диалог создания/редактирования семестра */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={form.handleSubmit(handleSave)}>
          <DialogTitle>
            {editingSemester ? "Редактировать семестр" : "Создать семестр"}
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Название семестра</InputLabel>
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Название семестра"
                        error={!!form.formState.errors.name}
                      >
                        <MenuItem value="Осенний">Осенний</MenuItem>
                        <MenuItem value="Весенний">Весенний</MenuItem>
                      </Select>
                    )}
                  />
                  {form.formState.errors.name && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 1, ml: 2 }}
                    >
                      {form.formState.errors.name.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...form.register("year", { valueAsNumber: true })}
                  label="Год"
                  type="number"
                  fullWidth
                  margin="normal"
                  inputProps={{ min: 2020, max: 2030 }}
                  error={!!form.formState.errors.year}
                  helperText={form.formState.errors.year?.message}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...form.register("startDate")}
                  label="Дата начала"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!form.formState.errors.startDate}
                  helperText={form.formState.errors.startDate?.message}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...form.register("endDate")}
                  label="Дата окончания"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!form.formState.errors.endDate}
                  helperText={form.formState.errors.endDate?.message}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Экзаменационная сессия (необязательно)
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...form.register("examStartDate")}
                  label="Начало сессии"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!form.formState.errors.examStartDate}
                  helperText={form.formState.errors.examStartDate?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...form.register("examEndDate")}
                  label="Окончание сессии"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!form.formState.errors.examEndDate}
                  helperText={form.formState.errors.examEndDate?.message}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <CircularProgress size={20} />
              ) : editingSemester ? (
                "Сохранить"
              ) : (
                "Создать"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default SemestersPage
