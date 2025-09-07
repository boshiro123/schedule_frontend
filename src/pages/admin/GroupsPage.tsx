import React, { useState, useEffect, useCallback } from "react"
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
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  Upload as UploadIcon,
  People as PeopleIcon,
} from "@mui/icons-material"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useDropzone } from "react-dropzone"

import { apiClient } from "../../services/api"
import { GroupWithStudents, CreateGroupForm } from "../../types"

// Схема валидации для формы группы
const groupSchema = z.object({
  name: z.string().min(1, "Название группы обязательно"),
  specialty: z.string().min(1, "Специальность обязательна"),
  course: z
    .number()
    .min(1, "Курс должен быть от 1 до 6")
    .max(6, "Курс должен быть от 1 до 6"),
})

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<GroupWithStudents[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<GroupWithStudents | null>(
    null
  )
  const [editingGroup, setEditingGroup] = useState<GroupWithStudents | null>(
    null
  )
  const [viewingGroup, setViewingGroup] = useState<GroupWithStudents | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const form = useForm<CreateGroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      specialty: "",
      course: 1,
    },
  })

  // Загрузка групп
  const loadGroups = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getGroups()
      setGroups(response.groups || [])
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка загрузки групп")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGroups()
  }, [])

  // Открытие диалога создания
  const handleCreateClick = () => {
    setEditingGroup(null)
    form.reset({ name: "", specialty: "", course: 1 })
    setDialogOpen(true)
  }

  // Открытие диалога редактирования
  const handleEditClick = (group: GroupWithStudents) => {
    setEditingGroup(group)
    form.reset({
      name: group.name,
      specialty: group.specialty,
      course: group.course,
    })
    setDialogOpen(true)
  }

  // Открытие диалога просмотра студентов
  const handleViewStudents = (group: GroupWithStudents) => {
    setViewingGroup(group)
    setStudentsDialogOpen(true)
  }

  // Сохранение группы
  const handleSave = async (data: CreateGroupForm) => {
    try {
      setError(null)

      if (editingGroup) {
        // Редактирование (пока не реализовано в API)
        setError("Редактирование групп пока не поддерживается")
        return
      } else {
        // Создание
        await apiClient.createGroup(data)
        setSuccess("Группа успешно создана")
      }

      setDialogOpen(false)
      loadGroups()

      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка сохранения группы")
    }
  }

  // Открытие диалога импорта
  const handleImportClick = (group: GroupWithStudents) => {
    setSelectedGroup(group)
    setImportDialogOpen(true)
  }

  // Drag & Drop для файлов
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!selectedGroup || acceptedFiles.length === 0) return

      const file = acceptedFiles[0]

      // Проверяем тип файла
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        setError("Пожалуйста, выберите Excel файл (.xlsx или .xls)")
        return
      }

      try {
        setUploading(true)
        setError(null)

        await apiClient.importStudents(selectedGroup._id, file)
        setSuccess(
          `Студенты успешно импортированы в группу ${selectedGroup.name}`
        )
        setImportDialogOpen(false)
        loadGroups()

        setTimeout(() => setSuccess(null), 3000)
      } catch (error: any) {
        setError(error.response?.data?.message || "Ошибка импорта студентов")
      } finally {
        setUploading(false)
      }
    },
    [selectedGroup]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  })

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingGroup(null)
    form.reset()
  }

  const handleCloseImportDialog = () => {
    setImportDialogOpen(false)
    setSelectedGroup(null)
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
        <Typography variant="h4">Управление группами</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Создать группу
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
        {groups.map(group => (
          <Grid item xs={12} md={6} lg={4} key={group._id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <GroupIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {group.name}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  <strong>Специальность:</strong> {group.specialty}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  <strong>Курс:</strong> {group.course}
                </Typography>

                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                  <Chip
                    label={group.isActive ? "Активна" : "Неактивна"}
                    color={group.isActive ? "success" : "default"}
                    size="small"
                  />
                  <Chip
                    label={`Студентов: ${group.students?.length || 0}`}
                    variant="outlined"
                    size="small"
                    icon={<PeopleIcon />}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Создана:{" "}
                  {new Date(group.createdAt).toLocaleDateString("ru-RU")}
                </Typography>
              </CardContent>

              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleViewStudents(group)}
                  color="success"
                  title="Просмотр студентов"
                >
                  <PeopleIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleEditClick(group)}
                  color="primary"
                  title="Редактировать"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleImportClick(group)}
                  color="info"
                  title="Импорт студентов"
                >
                  <UploadIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {groups.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <GroupIcon
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Группы не найдены
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Создайте первую группу для начала работы
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateClick}
                  >
                    Создать группу
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Диалог создания/редактирования группы */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={form.handleSubmit(handleSave)}>
          <DialogTitle>
            {editingGroup ? "Редактировать группу" : "Создать группу"}
          </DialogTitle>

          <DialogContent>
            <TextField
              {...form.register("name")}
              label="Название группы"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.name}
              helperText={form.formState.errors.name?.message}
              placeholder="Например: 121701"
              required
            />

            <TextField
              {...form.register("specialty")}
              label="Специальность"
              fullWidth
              margin="normal"
              error={!!form.formState.errors.specialty}
              helperText={form.formState.errors.specialty?.message}
              placeholder="Например: Программное обеспечение информационных технологий"
              required
            />

            <TextField
              {...form.register("course", { valueAsNumber: true })}
              label="Курс"
              type="number"
              fullWidth
              margin="normal"
              inputProps={{ min: 1, max: 6 }}
              error={!!form.formState.errors.course}
              helperText={form.formState.errors.course?.message}
              required
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
              ) : editingGroup ? (
                "Сохранить"
              ) : (
                "Создать"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Диалог импорта студентов */}
      <Dialog
        open={importDialogOpen}
        onClose={handleCloseImportDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Импорт студентов в группу {selectedGroup?.name}
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Загрузите Excel файл со студентами. Файл должен содержать две
            колонки:
          </Typography>

          <List dense>
            <ListItem>
              <ListItemText
                primary="Колонка A: ФИО студента"
                secondary="Например: Иванов Иван Иванович"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Колонка B: Пароль для входа"
                secondary="Например: student123"
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <Paper
            {...getRootProps()}
            sx={{
              p: 4,
              textAlign: "center",
              border: "2px dashed",
              borderColor: isDragActive ? "primary.main" : "grey.300",
              bgcolor: isDragActive ? "action.hover" : "background.paper",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            <input {...getInputProps()} />
            <UploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />

            {uploading ? (
              <Box>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography>Загрузка файла...</Typography>
              </Box>
            ) : isDragActive ? (
              <Typography>Отпустите файл здесь...</Typography>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Перетащите Excel файл сюда
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  или нажмите для выбора файла
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  Поддерживаются форматы: .xlsx, .xls
                </Typography>
              </Box>
            )}
          </Paper>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseImportDialog}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог просмотра студентов */}
      <Dialog
        open={studentsDialogOpen}
        onClose={() => setStudentsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <PeopleIcon sx={{ mr: 1 }} />
            {viewingGroup ? `Студенты группы ${viewingGroup.name}` : "Студенты"}
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewingGroup && (
            <Box>
              <Box display="flex" alignItems="center" mb={3}>
                <Box flex={1}>
                  <Typography variant="h6" gutterBottom>
                    {viewingGroup.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Специальность: {viewingGroup.specialty}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Курс: {viewingGroup.course}
                  </Typography>
                </Box>
                <Chip
                  label={`${viewingGroup.students.length} студентов`}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {viewingGroup.students.length > 0 ? (
                <List>
                  {viewingGroup.students.map((student, index) => (
                    <React.Fragment key={student._id}>
                      <ListItem>
                        <ListItemText
                          primary={student.name}
                          secondary={`ID: ${student._id}`}
                        />
                      </ListItem>
                      {index < viewingGroup.students.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <PeopleIcon
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    В группе пока нет студентов
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Используйте кнопку "Импорт студентов" для добавления
                    студентов
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStudentsDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default GroupsPage
