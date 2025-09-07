import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"
import {
  User,
  UserRole,
  AdminLoginForm,
  TeacherLoginForm,
  StudentLoginForm,
  LoginResponse,
} from "../types"
import { apiClient } from "../services/api"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  isTeacher: boolean
  isStudent: boolean
  login: (
    credentials: AdminLoginForm | TeacherLoginForm | StudentLoginForm,
    role: UserRole
  ) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user
  const isAdmin = user?.role === "Admin"
  const isTeacher = user?.role === "Teacher"
  const isStudent = user?.role === "Student"

  // Проверка авторизации при загрузке приложения
  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (
    credentials: AdminLoginForm | TeacherLoginForm | StudentLoginForm,
    role: UserRole
  ): Promise<void> => {
    try {
      setIsLoading(true)
      let response: LoginResponse

      switch (role) {
        case "Admin":
          response = await apiClient.loginAdmin(credentials as AdminLoginForm)
          break
        case "Teacher":
          response = await apiClient.loginTeacher(
            credentials as TeacherLoginForm
          )
          break
        case "Student":
          response = await apiClient.loginStudent(
            credentials as StudentLoginForm
          )
          break
        default:
          throw new Error("Неизвестная роль пользователя")
      }

      // Сохраняем токен и данные пользователя
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
      setUser(response.user)
    } catch (error: any) {
      console.error("Ошибка авторизации:", error)
      console.error("Детали ошибки:", error.response?.data)
      console.error("Статус ошибки:", error.response?.status)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = (): void => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
  }

  const checkAuth = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")

      if (!token || !userData) {
        setIsLoading(false)
        return
      }

      // Проверяем валидность токена
      await apiClient.verifyToken()

      // Если токен валиден, восстанавливаем пользователя
      setUser(JSON.parse(userData))
    } catch (error) {
      console.error("Ошибка проверки авторизации:", error)
      // Если токен невалиден, очищаем данные
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData } as User
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isTeacher,
    isStudent,
    login,
    logout,
    checkAuth,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Хук для получения роли пользователя
export const useUserRole = (): UserRole | null => {
  const { user } = useAuth()
  return user?.role || null
}

// Хук для проверки разрешений
export const usePermissions = () => {
  const { user } = useAuth()

  const isAdmin = user?.role === "Admin"
  const isTeacher = user?.role === "Teacher"
  const isStudent = user?.role === "Student"

  const canManageUsers = isAdmin
  const canManageSchedule = isAdmin
  const canMarkAttendance = isAdmin || isTeacher
  const canViewReports = isAdmin || isTeacher
  const canViewOwnSchedule = isAdmin || isTeacher || isStudent

  return {
    isAdmin,
    isTeacher,
    isStudent,
    canManageUsers,
    canManageSchedule,
    canMarkAttendance,
    canViewReports,
    canViewOwnSchedule,
  }
}

export default AuthContext
