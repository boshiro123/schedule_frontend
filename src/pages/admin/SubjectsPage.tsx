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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Subject as SubjectIcon,
  Business as BusinessIcon,
  ExpandMore as ExpandMoreIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { apiClient } from "../../services/api"
import {
  SubjectWithDepartment,
  Department,
  CreateSubjectForm,
} from "../../types"

// Схема валидации для формы предмета
const subjectSchema = z.object({
  name: z.string().min(1, "Название предмета обязательно"),
  code: z.string().optional(),
  description: z.string().optional(),
  department: z.string().min(1, "Выберите кафедру"),
  totalHours: z
    .object({
      lectureHours: z.number().min(0).optional(),
      practicalHours: z.number().min(0).optional(),
      labHours: z.number().min(0).optional(),
    })
    .optional(),
})

const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectWithDepartment[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] =
    useState<SubjectWithDepartment | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<CreateSubjectForm>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      department: "",
      totalHours: {
        lectureHours: 0,
        practicalHours: 0,
        labHours: 0,
      },
    },
  })

  // Загрузка данных
  const loadData = async () => {
    try {
      setLoading(true)
      const [subjectsResponse, departmentsResponse] = await Promise.all([
        apiClient.getSubjects(),
        apiClient.getDepartments(),
      ])
      setSubjects(subjectsResponse.subjects || [])
      setDepartments(departmentsResponse.departments || [])
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка загрузки данных")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Получение названия кафедры
  const getDepartmentName = (
    department: string | { _id: string; name: string }
  ) => {
    if (typeof department === "string") {
      const dept = departments.find(d => d._id === department)
      return dept?.name || "Неизвестная кафедра"
    }
    return department?.name || "Неизвестная кафедра"
  }

  // Открытие диалога создания
  const handleCreateClick = () => {
    setEditingSubject(null)
    form.reset({
      name: "",
      code: "",
      description: "",
      department: "",
      totalHours: {
        lectureHours: 0,
        practicalHours: 0,
        labHours: 0,
      },
    })
    setDialogOpen(true)
  }

  // Открытие диалога редактирования
  const handleEditClick = (subject: SubjectWithDepartment) => {
    setEditingSubject(subject)
    form.reset({
      name: subject.name,
      code: subject.code || "",
      description: subject.description || "",
      department:
        typeof subject.department === "string"
          ? subject.department
          : subject.department._id,
      totalHours: subject.totalHours || {
        lectureHours: 0,
        practicalHours: 0,
        labHours: 0,
      },
    })
    setDialogOpen(true)
  }

  // Сохранение предмета
  const handleSave = async (data: CreateSubjectForm) => {
    try {
      setError(null)

      if (editingSubject) {
        // Редактирование
        await apiClient.updateSubject(editingSubject._id, data)
        setSuccess("Предмет успешно обновлен")
      } else {
        // Создание
        await apiClient.createSubject(data)
        setSuccess("Предмет успешно создан")
      }

      setDialogOpen(false)
      loadData()

      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка сохранения предмета")
    }
  }

  // Удаление предмета
  const handleDelete = async (subjectId: string) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот предмет?")) {
      return
    }

    try {
      await apiClient.deleteSubject(subjectId)
      setSuccess("Предмет успешно удален")
      loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка удаления предмета")
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingSubject(null)
    form.reset()
  }

  // Подсчет общих часов
  const getTotalHours = (subject: SubjectWithDepartment) => {
    const hours = subject.totalHours
    if (!hours) return 0
    return (
      (hours.lectureHours || 0) +
      (hours.practicalHours || 0) +
      (hours.labHours || 0)
    )
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
        <Typography variant="h4">Управление предметами</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Создать предмет
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
        {subjects.map(subject => (
          <Grid item xs={12} md={6} lg={4} key={subject._id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <SubjectIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {subject.name}
                  </Typography>
                </Box>

                {subject.code && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    <strong>Код:</strong> {subject.code}
                  </Typography>
                )}

                {subject.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {subject.description}
                  </Typography>
                )}

                <Box display="flex" alignItems="center" mb={2}>
                  <BusinessIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {getDepartmentName(subject.department)}
                  </Typography>
                </Box>

                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                  <Chip
                    label={subject.isActive ? "Активен" : "Неактивен"}
                    color={subject.isActive ? "success" : "default"}
                    size="small"
                  />
                  <Chip
                    label={`Всего часов: ${getTotalHours(subject)}`}
                    variant="outlined"
                    size="small"
                    icon={<TimeIcon />}
                  />
                </Box>

                {subject.totalHours && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Распределение часов:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                      {subject.totalHours.lectureHours ? (
                        <Chip
                          label={`Лекции: ${subject.totalHours.lectureHours}`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ) : null}
                      {subject.totalHours.practicalHours ? (
                        <Chip
                          label={`Практика: ${subject.totalHours.practicalHours}`}
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                      ) : null}
                      {subject.totalHours.labHours ? (
                        <Chip
                          label={`Лабы: ${subject.totalHours.labHours}`}
                          size="small"
                          variant="outlined"
                          color="info"
                        />
                      ) : null}
                    </Box>
                  </Box>
                )}

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 2, display: "block" }}
                >
                  Создан:{" "}
                  {new Date(subject.createdAt).toLocaleDateString("ru-RU")}
                </Typography>
              </CardContent>

              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleEditClick(subject)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(subject._id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {subjects.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <SubjectIcon
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Предметы не найдены
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Создайте первый предмет для начала работы
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateClick}
                  >
                    Создать предмет
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Диалог создания/редактирования предмета */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={form.handleSubmit(handleSave)}>
          <DialogTitle>
            {editingSubject ? "Редактировать предмет" : "Создать предмет"}
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  {...form.register("name")}
                  label="Название предмета"
                  fullWidth
                  margin="normal"
                  error={!!form.formState.errors.name}
                  helperText={form.formState.errors.name?.message}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  {...form.register("code")}
                  label="Код предмета"
                  fullWidth
                  margin="normal"
                  placeholder="Например: ПОИТ-101"
                  error={!!form.formState.errors.code}
                  helperText={form.formState.errors.code?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...form.register("description")}
                  label="Описание"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  error={!!form.formState.errors.description}
                  helperText={form.formState.errors.description?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Кафедра</InputLabel>
                  <Controller
                    name="department"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Кафедра"
                        error={!!form.formState.errors.department}
                      >
                        {departments.map(department => (
                          <MenuItem key={department._id} value={department._id}>
                            {department.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {form.formState.errors.department && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 1, ml: 2 }}
                    >
                      {form.formState.errors.department.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Распределение часов (необязательно)</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          {...form.register("totalHours.lectureHours", {
                            valueAsNumber: true,
                          })}
                          label="Лекционные часы"
                          type="number"
                          fullWidth
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          {...form.register("totalHours.practicalHours", {
                            valueAsNumber: true,
                          })}
                          label="Практические часы"
                          type="number"
                          fullWidth
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          {...form.register("totalHours.labHours", {
                            valueAsNumber: true,
                          })}
                          label="Лабораторные часы"
                          type="number"
                          fullWidth
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
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
              ) : editingSubject ? (
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

export default SubjectsPage
