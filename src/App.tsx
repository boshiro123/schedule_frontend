import React from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { AuthProvider } from "./hooks/useAuth"
import ProtectedRoute from "./components/common/ProtectedRoute"
import Layout from "./components/common/Layout"
import LoginPage from "./pages/LoginPage"
import AdminDashboard from "./pages/AdminDashboard"
import TeacherDashboard from "./pages/TeacherDashboard"
import StudentDashboard from "./pages/StudentDashboard"
import DepartmentsPage from "./pages/admin/DepartmentsPage"
import TeachersPage from "./pages/admin/TeachersPage"
import SubjectsPage from "./pages/admin/SubjectsPage"
import GroupsPage from "./pages/admin/GroupsPage"
import SemestersPage from "./pages/admin/SemestersPage"
import ScheduleManagementPage from "./pages/admin/ScheduleManagementPage"
import AttendancePage from "./pages/teacher/AttendancePage"
import TeacherGradesPage from "./pages/teacher/GradesPage"
import TeacherLessonPage from "./pages/teacher/TeacherLessonPage"
import SchedulePage from "./pages/common/SchedulePage"
import StudentGradesPage from "./pages/student/GradesPage"
import MyAttendancePage from "./pages/student/MyAttendancePage"

import "./App.css"

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Create theme with BSUIR colors
const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb",
    },
    secondary: {
      main: "#64748b",
    },
    success: {
      main: "#16a34a",
    },
    warning: {
      main: "#eab308",
    },
    error: {
      main: "#dc2626",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
})

// Admin Routes Component
const AdminRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/semesters" element={<SemestersPage />} />
        <Route
          path="/schedule-management"
          element={<ScheduleManagementPage />}
        />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route
          path="/analytics"
          element={<div>Аналитика (В разработке)</div>}
        />
        <Route path="/settings" element={<div>Настройки (В разработке)</div>} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Layout>
  )
}

// Teacher Routes Component
const TeacherRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TeacherDashboard />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/grades" element={<TeacherGradesPage />} />
        <Route path="/lesson/:lessonId" element={<TeacherLessonPage />} />
        <Route path="/stats" element={<div>Статистика (В разработке)</div>} />
        <Route path="/settings" element={<div>Настройки (В разработке)</div>} />
        <Route path="*" element={<Navigate to="/teacher" replace />} />
      </Routes>
    </Layout>
  )
}

// Student Routes Component
const StudentRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<StudentDashboard />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/my-grades" element={<StudentGradesPage />} />
        <Route path="/my-attendance" element={<MyAttendancePage />} />
        <Route path="/settings" element={<div>Настройки (В разработке)</div>} />
        <Route path="*" element={<Navigate to="/student" replace />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/login" element={<LoginPage />} />

              {/* Защищенные маршруты для администратора */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={["Admin"]}>
                    <AdminRoutes />
                  </ProtectedRoute>
                }
              />

              {/* Защищенные маршруты для преподавателя */}
              <Route
                path="/teacher/*"
                element={
                  <ProtectedRoute allowedRoles={["Teacher"]}>
                    <TeacherRoutes />
                  </ProtectedRoute>
                }
              />

              {/* Защищенные маршруты для студента */}
              <Route
                path="/student/*"
                element={
                  <ProtectedRoute allowedRoles={["Student"]}>
                    <StudentRoutes />
                  </ProtectedRoute>
                }
              />

              {/* Корневой маршрут - перенаправление на логин */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* 404 - перенаправление на логин */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
