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
  Chip,
  LinearProgress,
  Divider,
} from "@mui/material"
import {
  Schedule,
  Assignment,
  CheckCircle,
  Grade,
  AccessTime,
  Room,
  TrendingUp,
} from "@mui/icons-material"

const StudentDashboard: React.FC = () => {
  // Здесь будут реальные данные из API
  const stats = {
    todayLessons: 3,
    weekLessons: 12,
    attendancePercentage: 87,
    averageGrade: 7.8,
  }

  const todaySchedule = [
    {
      id: 1,
      time: "09:00 - 10:20",
      subject: "Основы программирования",
      type: "Лекция",
      teacher: "Иванов И.И.",
      room: "А-205",
      status: "upcoming",
    },
    {
      id: 2,
      time: "10:40 - 12:00",
      subject: "Алгоритмы и структуры данных",
      type: "Практическое занятие",
      teacher: "Петров П.П.",
      room: "Б-314",
      status: "current",
    },
    {
      id: 3,
      time: "13:00 - 14:20",
      subject: "Веб-технологии",
      type: "Лабораторная работа",
      teacher: "Сидоров С.С.",
      room: "В-102",
      status: "upcoming",
    },
  ]

  const recentGrades = [
    {
      id: 1,
      subject: "Основы программирования",
      grade: 8,
      type: "Контрольная",
      date: "Вчера",
    },
    {
      id: 2,
      subject: "Алгоритмы и структуры данных",
      grade: 9,
      type: "Лабораторная",
      date: "2 дня назад",
    },
    {
      id: 3,
      subject: "Веб-технологии",
      grade: 7,
      type: "Текущая",
      date: "3 дня назад",
    },
    {
      id: 4,
      subject: "Математика",
      grade: 8,
      type: "Контрольная",
      date: "1 неделю назад",
    },
  ]

  const subjectStats = [
    { name: "Основы программирования", attendance: 92, avgGrade: 8.2 },
    { name: "Алгоритмы и структуры данных", attendance: 88, avgGrade: 7.8 },
    { name: "Веб-технологии", attendance: 85, avgGrade: 8.0 },
    { name: "Математика", attendance: 90, avgGrade: 7.5 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "success"
      case "upcoming":
        return "info"
      case "completed":
        return "default"
      default:
        return "default"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "current":
        return "Сейчас"
      case "upcoming":
        return "Предстоящее"
      case "completed":
        return "Завершено"
      default:
        return ""
    }
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return "success"
    if (grade >= 7) return "warning"
    if (grade >= 5) return "info"
    return "error"
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Мой дашборд
      </Typography>

      {/* Статистические карточки */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Занятий сегодня"
            value={stats.todayLessons}
            icon={<Schedule fontSize="large" />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Занятий на неделе"
            value={stats.weekLessons}
            icon={<Assignment fontSize="large" />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ProgressCard
            title="Посещаемость"
            value={stats.attendancePercentage}
            icon={<CheckCircle fontSize="large" />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Средний балл"
            value={stats.averageGrade}
            icon={<Grade fontSize="large" />}
            color="#9c27b0"
            isDecimal
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Расписание на сегодня */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Расписание на сегодня
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {todaySchedule.map(lesson => (
                <Card key={lesson.id} variant="outlined">
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {lesson.subject}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {lesson.teacher}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {lesson.time}
                          </Typography>
                          <Room
                            fontSize="small"
                            color="action"
                            sx={{ ml: 2 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {lesson.room}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={getStatusText(lesson.status)}
                        color={getStatusColor(lesson.status) as any}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      {lesson.type}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>

          {/* Статистика по предметам */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Статистика по предметам
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {subjectStats.map((subject, index) => (
                <Box key={index}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {subject.name}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Посещаемость: {subject.attendance}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={subject.attendance}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Средний балл: {subject.avgGrade}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(subject.avgGrade / 10) * 100}
                        color="secondary"
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Grid>
                  </Grid>
                  {index < subjectStats.length - 1 && (
                    <Divider sx={{ mt: 2 }} />
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Последние оценки */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Последние оценки
            </Typography>
            <List>
              {recentGrades.map((grade, index) => (
                <React.Fragment key={grade.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body1">
                            {grade.subject}
                          </Typography>
                          <Chip
                            label={grade.grade}
                            color={getGradeColor(grade.grade) as any}
                            size="small"
                            sx={{ minWidth: 40 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mt: 0.5,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {grade.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {grade.date}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentGrades.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
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
  isDecimal?: boolean
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  isDecimal = false,
}) => (
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
          <Typography variant="h4">
            {isDecimal ? value.toFixed(1) : value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
      </Box>
    </CardContent>
  </Card>
)

interface ProgressCardProps {
  title: string
  value: number
  icon: React.ReactElement
  color: string
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  icon,
  color,
}) => (
  <Card>
    <CardContent>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4">{value}%</Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
      </Box>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{ height: 8, borderRadius: 1 }}
      />
    </CardContent>
  </Card>
)

export default StudentDashboard
