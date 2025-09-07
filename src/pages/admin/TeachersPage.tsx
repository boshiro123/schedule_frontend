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
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
} from "@mui/icons-material"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { apiClient } from "../../services/api"
import {
  TeacherWithDepartment,
  Department,
  CreateTeacherForm,
} from "../../types"

// Схема валидации для формы преподавателя
const teacherSchema = z.object({
  name: z.string().min(1, "ФИО преподавателя обязательно"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  department: z.string().min(1, "Выберите кафедру"),
})

const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherWithDepartment[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] =
    useState<TeacherWithDepartment | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<CreateTeacherForm>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      department: "",
    },
  })

  // Загрузка данных
  const loadData = async () => {
    try {
      setLoading(true)
      const [teachersResponse, departmentsResponse] = await Promise.all([
        apiClient.getTeachers(),
        apiClient.getDepartments(),
      ])
      setTeachers(teachersResponse.teachers || [])
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
    setEditingTeacher(null)
    form.reset({ name: "", email: "", password: "", department: "" })
    setDialogOpen(true)
  }

  // Открытие диалога редактирования
  const handleEditClick = (teacher: TeacherWithDepartment) => {
    setEditingTeacher(teacher)
    form.reset({
      name: teacher.name,
      email: teacher.email,
      password: "", // Не показываем старый пароль
      department:
        typeof teacher.department === "string"
          ? teacher.department
          : teacher.department._id,
    })
    setDialogOpen(true)
  }

  // Сохранение преподавателя
  const handleSave = async (data: CreateTeacherForm) => {
    try {
      setError(null)

      if (editingTeacher) {
        // При редактировании не отправляем пароль если он пустой
        const updateData = data.password
          ? data
          : { ...data, password: undefined }
        await apiClient.updateTeacher(editingTeacher._id, updateData)
        setSuccess("Преподаватель успешно обновлен")
      } else {
        // Создание
        await apiClient.createTeacher(data)
        setSuccess("Преподаватель успешно создан")
      }

      setDialogOpen(false)
      loadData()

      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Ошибка сохранения преподавателя"
      )
    }
  }

  // Удаление преподавателя
  const handleDelete = async (teacherId: string) => {
    if (
      !window.confirm("Вы уверены, что хотите удалить этого преподавателя?")
    ) {
      return
    }

    try {
      await apiClient.deleteTeacher(teacherId)
      setSuccess("Преподаватель успешно удален")
      loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка удаления преподавателя")
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingTeacher(null)
    form.reset()
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
        <Typography variant="h4">Управление преподавателями</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Добавить преподавателя
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
        {teachers.map(teacher => (
          <Grid item xs={12} md={6} lg={4} key={teacher._id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {teacher.name}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={1}>
                  <EmailIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {teacher.email}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <BusinessIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {getDepartmentName(teacher.department)}
                  </Typography>
                </Box>

                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                  <Chip
                    label={teacher.isActive ? "Активен" : "Неактивен"}
                    color={teacher.isActive ? "success" : "default"}
                    size="small"
                  />
                  <Chip
                    label={`Предметов: ${teacher.subjects?.length || 0}`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </CardContent>

              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleEditClick(teacher)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(teacher._id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {teachers.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <PersonIcon
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Преподаватели не найдены
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Добавьте первого преподавателя для начала работы
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateClick}
                  >
                    Добавить преподавателя
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Диалог создания/редактирования преподавателя */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={form.handleSubmit(handleSave)}>
          <DialogTitle>
            {editingTeacher
              ? "Редактировать преподавателя"
              : "Добавить преподавателя"}
          </DialogTitle>

          <DialogContent>
            <TextField
              {...form.register("name")}
              label="ФИО преподавателя"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.name}
              helperText={form.formState.errors.name?.message}
              required
            />

            <TextField
              {...form.register("email")}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.email}
              helperText={form.formState.errors.email?.message}
              required
            />

            <TextField
              {...form.register("password")}
              label={
                editingTeacher
                  ? "Новый пароль (оставьте пустым для сохранения текущего)"
                  : "Пароль"
              }
              type="password"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.password}
              helperText={form.formState.errors.password?.message}
              required={!editingTeacher}
            />

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
              ) : editingTeacher ? (
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

export default TeachersPage
