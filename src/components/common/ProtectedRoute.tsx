import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import { UserRole } from "../../types"
import { CircularProgress, Box } from "@mui/material"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requireAuth?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Показываем загрузку пока проверяется авторизация
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  // Если требуется авторизация, но пользователь не авторизован
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Если указаны разрешенные роли и роль пользователя не входит в список
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Перенаправляем на соответствующий дашборд в зависимости от роли
    switch (user.role) {
      case "Admin":
        return <Navigate to="/admin" replace />
      case "Teacher":
        return <Navigate to="/teacher" replace />
      case "Student":
        return <Navigate to="/student" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
