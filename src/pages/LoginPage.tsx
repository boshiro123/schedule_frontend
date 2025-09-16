import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Container,
} from "@mui/material"
import { AdminPanelSettings, School, Person } from "@mui/icons-material"

import { useAuth } from "../hooks/useAuth"
import {
  UserRole,
  AdminLoginForm,
  TeacherLoginForm,
  StudentLoginForm,
} from "../types"

// Схемы валидации
const adminLoginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
})

const teacherLoginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
})

const studentLoginSchema = z.object({
  name: z.string().min(2, "Введите корректное ФИО"),
  groupName: z.string().min(1, "Выберите группу"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
})

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

const LoginPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || "/"

  // Формы для разных ролей
  const adminForm = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
  })

  const teacherForm = useForm<TeacherLoginForm>({
    resolver: zodResolver(teacherLoginSchema),
  })

  const studentForm = useForm<StudentLoginForm>({
    resolver: zodResolver(studentLoginSchema),
  })

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
    setError(null)
    // Очищаем формы при смене вкладки
    adminForm.reset()
    teacherForm.reset()
    studentForm.reset()
  }

  const handleLogin = async (
    credentials: AdminLoginForm | TeacherLoginForm | StudentLoginForm,
    role: UserRole
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      await login(credentials, role)

      // Перенаправляем на нужную страницу
      if (from !== "/") {
        navigate(from, { replace: true })
      } else {
        // Перенаправляем на дашборд в зависимости от роли
        switch (role) {
          case "Admin":
            navigate("/admin", { replace: true })
            break
          case "Teacher":
            navigate("/teacher", { replace: true })
            break
          case "Student":
            navigate("/student", { replace: true })
            break
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Ошибка авторизации")
    } finally {
      setIsLoading(false)
    }
  }

  const onAdminSubmit = (data: AdminLoginForm) => {
    handleLogin(data, "Admin")
  }

  const onTeacherSubmit = (data: TeacherLoginForm) => {
    handleLogin(data, "Teacher")
  }

  const onStudentSubmit = (data: StudentLoginForm) => {
    handleLogin(data, "Student")
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          component="h1"
          variant="h4"
          sx={{ mb: 4, color: "#2563eb" }}
        >
          Электронный журнал БГУИР
        </Typography>

        <Card sx={{ width: "100%", maxWidth: 500 }}>
          <CardContent>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                variant="fullWidth"
              >
                <Tab
                  icon={<AdminPanelSettings />}
                  label="Администратор"
                  iconPosition="start"
                />
                <Tab
                  icon={<School />}
                  label="Преподаватель"
                  iconPosition="start"
                />
                <Tab icon={<Person />} label="Студент" iconPosition="start" />
              </Tabs>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {/* Форма администратора */}
            <TabPanel value={currentTab} index={0}>
              <form onSubmit={adminForm.handleSubmit(onAdminSubmit)}>
                <TextField
                  {...adminForm.register("email")}
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  error={!!adminForm.formState.errors.email}
                  helperText={adminForm.formState.errors.email?.message}
                  disabled={isLoading}
                />
                <TextField
                  {...adminForm.register("password")}
                  label="Пароль"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={!!adminForm.formState.errors.password}
                  helperText={adminForm.formState.errors.password?.message}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isLoading}
                  startIcon={isLoading && <CircularProgress size={20} />}
                >
                  {isLoading ? "Вход..." : "Войти как администратор"}
                </Button>
              </form>
            </TabPanel>

            {/* Форма преподавателя */}
            <TabPanel value={currentTab} index={1}>
              <form onSubmit={teacherForm.handleSubmit(onTeacherSubmit)}>
                <TextField
                  {...teacherForm.register("email")}
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  error={!!teacherForm.formState.errors.email}
                  helperText={teacherForm.formState.errors.email?.message}
                  disabled={isLoading}
                />
                <TextField
                  {...teacherForm.register("password")}
                  label="Пароль"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={!!teacherForm.formState.errors.password}
                  helperText={teacherForm.formState.errors.password?.message}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isLoading}
                  startIcon={isLoading && <CircularProgress size={20} />}
                >
                  {isLoading ? "Вход..." : "Войти как преподаватель"}
                </Button>
              </form>
            </TabPanel>

            {/* Форма студента */}
            <TabPanel value={currentTab} index={2}>
              <form onSubmit={studentForm.handleSubmit(onStudentSubmit)}>
                <TextField
                  {...studentForm.register("name")}
                  label="ФИО"
                  fullWidth
                  margin="normal"
                  error={!!studentForm.formState.errors.name}
                  helperText={studentForm.formState.errors.name?.message}
                  disabled={isLoading}
                />
                <TextField
                  {...studentForm.register("groupName")}
                  label="Группа"
                  fullWidth
                  margin="normal"
                  error={!!studentForm.formState.errors.groupName}
                  helperText={studentForm.formState.errors.groupName?.message}
                  disabled={isLoading}
                  placeholder="Например: 121701"
                />
                <TextField
                  {...studentForm.register("password")}
                  label="Пароль"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={!!studentForm.formState.errors.password}
                  helperText={studentForm.formState.errors.password?.message}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isLoading}
                  startIcon={isLoading && <CircularProgress size={20} />}
                >
                  {isLoading ? "Вход..." : "Войти как студент"}
                </Button>
              </form>
            </TabPanel>
          </CardContent>
        </Card>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          © 2025 БГУИР. Электронный журнал посещаемости
        </Typography>
      </Box>
    </Container>
  )
}

export default LoginPage
