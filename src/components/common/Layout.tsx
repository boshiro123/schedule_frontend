import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Dashboard,
  Business,
  People,
  Subject,
  Group,
  CalendarMonth,
  Schedule,
  Assignment,
  Assessment,
  Settings,
  ExitToApp,
  Person,
  CheckCircle,
  GradeOutlined,
} from "@mui/icons-material"

import { useAuth, usePermissions } from "../../hooks/useAuth"

const drawerWidth = 240

interface NavigationItem {
  text: string
  icon: React.ReactElement
  path: string
  roles: ("Admin" | "Teacher" | "Student")[]
}

const navigationItems: NavigationItem[] = [
  {
    text: "Дашборд",
    icon: <Dashboard />,
    path: "",
    roles: ["Admin"],
  },
  // Админ
  {
    text: "Кафедры",
    icon: <Business />,
    path: "/departments",
    roles: ["Admin"],
  },
  {
    text: "Преподаватели",
    icon: <People />,
    path: "/teachers",
    roles: ["Admin"],
  },
  {
    text: "Предметы",
    icon: <Subject />,
    path: "/subjects",
    roles: ["Admin"],
  },
  {
    text: "Группы",
    icon: <Group />,
    path: "/groups",
    roles: ["Admin"],
  },
  {
    text: "Семестры",
    icon: <CalendarMonth />,
    path: "/semesters",
    roles: ["Admin"],
  },
  {
    text: "Управление расписанием",
    icon: <Schedule />,
    path: "/schedule-management",
    roles: ["Admin"],
  },
  {
    text: "Расписание",
    icon: <Schedule />,
    path: "/schedule",
    roles: ["Admin", "Teacher", "Student"],
  },
  {
    text: "Аналитика",
    icon: <Assessment />,
    path: "/analytics",
    roles: ["Admin"],
  },
  // Преподаватель
  {
    text: "Посещаемость",
    icon: <CheckCircle />,
    path: "/attendance",
    roles: ["Teacher"],
  },
  // Студент
  {
    text: "Мои оценки",
    icon: <Assignment />,
    path: "/my-grades",
    roles: ["Student"],
  },
  {
    text: "Моя посещаемость",
    icon: <CheckCircle />,
    path: "/my-attendance",
    roles: ["Student"],
  },
]

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const { user, logout } = useAuth()
  const { isAdmin, isTeacher, isStudent } = usePermissions()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
    handleProfileClose()
  }

  const getBasePath = () => {
    if (isAdmin) return "/admin"
    if (isTeacher) return "/teacher"
    if (isStudent) return "/student"
    return ""
  }

  const getCurrentRole = () => {
    if (isAdmin) return "admin"
    if (isTeacher) return "teacher"
    if (isStudent) return "student"
    return ""
  }

  // Фильтруем элементы навигации по роли пользователя
  const filteredNavigationItems = navigationItems.filter(item =>
    item.roles.includes(user?.role as any)
  )

  const getItemPath = (item: NavigationItem) => {
    const basePath = getBasePath()
    return item.path === "" ? basePath : `${basePath}${item.path}`
  }

  const isItemActive = (item: NavigationItem) => {
    const itemPath = getItemPath(item)
    return location.pathname === itemPath
  }

  const drawer = (
    <div>
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ color: "#2563eb" }}
        >
          БГУИР Журнал
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredNavigationItems.map(item => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={isItemActive(item)}
              onClick={() => {
                navigate(getItemPath(item))
                if (isMobile) {
                  setMobileOpen(false)
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate(`/${getCurrentRole()}/settings`)}
          >
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Настройки" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  )

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getRoleTitle(user?.role)}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body2"
              sx={{ mr: 2, display: { xs: "none", sm: "block" } }}
            >
              {user?.name}
            </Typography>
            <IconButton onClick={handleProfileClick} sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: "secondary.main" }}>
                <Person />
              </Avatar>
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleProfileClose}>
              <Person sx={{ mr: 1 }} />
              Профиль
            </MenuItem>
            <MenuItem onClick={handleProfileClose}>
              <Settings sx={{ mr: 1 }} />
              Настройки
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Выйти
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Боковая панель */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Основной контент */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

const getRoleTitle = (role?: string) => {
  switch (role) {
    case "Admin":
      return "Панель администратора"
    case "Teacher":
      return "Панель преподавателя"
    case "Student":
      return "Панель студента"
    default:
      return "Электронный журнал"
  }
}

export default Layout
