import React from "react"
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from "@mui/material"
import {
  People,
  School,
  Group,
  Assignment,
  TrendingUp,
  Business,
} from "@mui/icons-material"

const AdminDashboard: React.FC = () => {
  // Здесь будут реальные данные из API
  const stats = {
    teachers: 142,
    students: 2847,
    groups: 65,
    departments: 12,
    activeSchedules: 156,
    todayLessons: 48,
  }

  const recentActivity = [
    {
      id: 1,
      action: "Создана новая группа 121702",
      time: "2 часа назад",
      icon: <Group />,
    },
    {
      id: 2,
      action: "Добавлен преподаватель Иванов И.И.",
      time: "5 часов назад",
      icon: <People />,
    },
    {
      id: 3,
      action: "Обновлено расписание для группы 121701",
      time: "1 день назад",
      icon: <Assignment />,
    },
    {
      id: 4,
      action: "Создан новый семестр Весенний 2024",
      time: "2 дня назад",
      icon: <School />,
    },
  ]

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Дашборд администратора
      </Typography>

      {/* Статистические карточки */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Преподаватели"
            value={stats.teachers}
            icon={<People fontSize="large" />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Студенты"
            value={stats.students}
            icon={<School fontSize="large" />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Группы"
            value={stats.groups}
            icon={<Group fontSize="large" />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Кафедры"
            value={stats.departments}
            icon={<Business fontSize="large" />}
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Активных расписаний"
            value={stats.activeSchedules}
            icon={<Assignment fontSize="large" />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Занятий сегодня"
            value={stats.todayLessons}
            icon={<TrendingUp fontSize="large" />}
            color="#0288d1"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Последняя активность */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Последняя активность
            </Typography>
            <List>
              {recentActivity.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "primary.light" }}>
                        {item.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={item.action} secondary={item.time} />
                  </ListItem>
                  {index < recentActivity.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Быстрые действия */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Быстрые действия
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <QuickActionCard
                title="Создать группу"
                description="Добавить новую учебную группу"
                action={() => console.log("Create group")}
              />
              <QuickActionCard
                title="Добавить преподавателя"
                description="Зарегистрировать нового преподавателя"
                action={() => console.log("Add teacher")}
              />
              <QuickActionCard
                title="Создать расписание"
                description="Настроить расписание занятий"
                action={() => console.log("Create schedule")}
              />
              <QuickActionCard
                title="Импорт студентов"
                description="Загрузить список студентов из Excel"
                action={() => console.log("Import students")}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactElement
  color: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4">{value.toLocaleString()}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
      </Box>
    </CardContent>
  </Card>
)

interface QuickActionCardProps {
  title: string
  description: string
  action: () => void
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  action,
}) => (
  <Card
    sx={{
      cursor: "pointer",
      "&:hover": {
        bgcolor: "action.hover",
      },
    }}
    onClick={action}
  >
    <CardContent sx={{ py: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
)

export default AdminDashboard
