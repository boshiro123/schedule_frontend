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
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from "@mui/icons-material"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { apiClient } from "../../services/api"
import { Department, CreateDepartmentForm } from "../../types"

// Схема валидации для формы кафедры
const departmentSchema = z.object({
  name: z.string().min(1, "Название кафедры обязательно"),
  description: z.string().optional(),
})

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<CreateDepartmentForm>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  // Загрузка кафедр
  const loadDepartments = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getDepartments()
      setDepartments(response.departments || [])
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка загрузки кафедр")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  // Открытие диалога создания
  const handleCreateClick = () => {
    setEditingDepartment(null)
    form.reset({ name: "", description: "" })
    setDialogOpen(true)
  }

  // Открытие диалога редактирования
  const handleEditClick = (department: Department) => {
    setEditingDepartment(department)
    form.reset({
      name: department.name,
      description: department.description || "",
    })
    setDialogOpen(true)
  }

  // Сохранение кафедры
  const handleSave = async (data: CreateDepartmentForm) => {
    try {
      setError(null)

      if (editingDepartment) {
        // Редактирование
        await apiClient.updateDepartment(editingDepartment._id, data)
        setSuccess("Кафедра успешно обновлена")
      } else {
        // Создание
        await apiClient.createDepartment(data)
        setSuccess("Кафедра успешно создана")
      }

      setDialogOpen(false)
      loadDepartments()

      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка сохранения кафедры")
    }
  }

  // Удаление кафедры
  const handleDelete = async (departmentId: string) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту кафедру?")) {
      return
    }

    try {
      await apiClient.deleteDepartment(departmentId)
      setSuccess("Кафедра успешно удалена")
      loadDepartments()
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка удаления кафедры")
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingDepartment(null)
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
        <Typography variant="h4">Управление кафедрами</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Создать кафедру
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
        {departments.map(department => (
          <Grid item xs={12} md={6} lg={4} key={department._id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <BusinessIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {department.name}
                  </Typography>
                </Box>

                {department.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {department.description}
                  </Typography>
                )}

                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                  <Chip
                    label={department.isActive ? "Активна" : "Неактивна"}
                    color={department.isActive ? "success" : "default"}
                    size="small"
                  />
                  <Chip
                    label={`Преподавателей: ${
                      department.teachers?.length || 0
                    }`}
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Создана:{" "}
                  {new Date(department.createdAt).toLocaleDateString("ru-RU")}
                </Typography>
              </CardContent>

              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleEditClick(department)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(department._id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {departments.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <BusinessIcon
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Кафедры не найдены
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Создайте первую кафедру для начала работы
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateClick}
                  >
                    Создать кафедру
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Диалог создания/редактирования кафедры */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={form.handleSubmit(handleSave)}>
          <DialogTitle>
            {editingDepartment ? "Редактировать кафедру" : "Создать кафедру"}
          </DialogTitle>

          <DialogContent>
            <TextField
              {...form.register("name")}
              label="Название кафедры"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.name}
              helperText={form.formState.errors.name?.message}
              required
            />

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
              ) : editingDepartment ? (
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

export default DepartmentsPage
