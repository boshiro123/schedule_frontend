// Базовые типы пользователей
export type UserRole = "Admin" | "Teacher" | "Student"

// Администратор
export interface Admin {
  _id: string
  name: string
  email: string
  password: string
  role: "Admin"
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

// Преподаватель
export interface Teacher {
  _id: string
  name: string
  email: string
  password: string
  department: string
  subjects: string[]
  role: "Teacher"
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

// Преподаватель с популированной кафедрой
export interface TeacherWithDepartment {
  _id: string
  name: string
  email: string
  password: string
  department: {
    _id: string
    name: string
  }
  subjects: string[]
  role: "Teacher"
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

// Студент
export interface Student {
  _id: string
  name: string
  group:
    | string
    | {
        _id: string
        name: string
      }
  studentNumber?: string
  role: "Student"
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

// Кафедра
export interface Department {
  _id: string
  name: string
  description?: string
  head?: string
  teachers: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Группа
export interface Group {
  _id: string
  name: string
  specialty: string
  course: number
  students: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Группа с популированными студентами
export interface GroupWithStudents {
  _id: string
  name: string
  specialty: string
  course: number
  students: {
    _id: string
    name: string
  }[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Предмет
export interface Subject {
  _id: string
  name: string
  code?: string
  description?: string
  department: string
  totalHours?: {
    lectureHours?: number
    practicalHours?: number
    labHours?: number
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Предмет с популированной кафедрой
export interface SubjectWithDepartment {
  _id: string
  name: string
  code?: string
  description?: string
  department: {
    _id: string
    name: string
  }
  totalHours?: {
    lectureHours?: number
    practicalHours?: number
    labHours?: number
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Семестр
export interface Semester {
  _id: string
  name: "Осенний" | "Весенний"
  year: number
  startDate: Date
  endDate: Date
  isActive: boolean
  examStartDate?: Date
  examEndDate?: Date
  createdAt: Date
  updatedAt: Date
}

// Тип занятия
export type LessonType =
  | "Лекция"
  | "Практическое занятие"
  | "Лабораторная работа"
  | "Кураторский час"
  | "Зачет"
  | "Экзамен"

// Шаблон расписания
export interface Schedule {
  _id: string
  subject: string
  teacher: string
  groups: string[]
  semester: string
  dayOfWeek: number // 1-7 (Пн-Вс)
  weeksOfMonth: number[] // [1, 2, 3, 4]
  startTime: string // HH:MM
  endTime: string // HH:MM
  lessonType: LessonType
  classroom: string
  duration: number // минуты
  isRecurring: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Конкретное занятие
export interface ScheduleInstance {
  _id: string
  schedule: string
  subject: string
  teacher: string
  groups: string[]
  semester: string
  date: Date
  startTime: string
  endTime: string
  classroom: string
  lessonType: LessonType
  status: "Запланировано" | "Проведено" | "Отменено" | "Перенесено"
  attendanceMarked: boolean
  notes?: string
  cancelReason?: string
  createdAt: Date
  updatedAt: Date
}

// Статус посещаемости
export type AttendanceStatus =
  | "Присутствует"
  | "Отсутствует"
  | "Опоздал"
  | "Ушел раньше"

// Посещаемость
export interface Attendance {
  _id: string
  scheduleInstance: string
  student: string
  teacher: string
  subject: string
  group: string
  semester: string
  date: Date
  lessonType: LessonType
  status: AttendanceStatus
  attendedHours: number // 0-4
  missedHours: number // 0-4
  notes?: string
  markedBy: string
  markedAt: Date
  createdAt: Date
  updatedAt: Date
}

// Тип оценки
export type GradeType =
  | "Текущая"
  | "Контрольная"
  | "Лабораторная"
  | "Зачет"
  | "Экзамен"

// Оценка
export interface Grade {
  _id: string
  student: string
  subject: string
  teacher: string
  group: string
  semester: string
  scheduleInstance?: string
  gradeType: GradeType
  value: number // 1-10
  date: Date
  description?: string
  notes?: string
  markedBy: string
  createdAt: Date
  updatedAt: Date
}

// Пользователь (объединенный тип)
export type User = Admin | Teacher | Student

// Ответы API
export interface ApiResponse<T> {
  message: string
  data?: T
}

// Специфичные ответы для разных эндпоинтов
export interface DepartmentsResponse {
  message: string
  departments: Department[]
}

export interface TeachersResponse {
  message: string
  teachers: TeacherWithDepartment[]
}

export interface GroupsResponse {
  message: string
  groups: GroupWithStudents[]
}

export interface SubjectsResponse {
  message: string
  subjects: SubjectWithDepartment[]
}

export interface SemestersResponse {
  message: string
  semesters: Semester[]
}

export interface LoginResponse {
  message: string
  token: string
  user: User
}

export interface ErrorResponse {
  message: string
  error?: string
}

// Формы
export interface AdminLoginForm {
  email: string
  password: string
}

export interface TeacherLoginForm {
  email: string
  password: string
}

export interface StudentLoginForm {
  name: string
  groupName: string
  password: string
}

export interface CreateDepartmentForm {
  name: string
  description?: string
  head?: string
}

export interface CreateTeacherForm {
  name: string
  email: string
  password: string
  department: string
}

export interface CreateSubjectForm {
  name: string
  code?: string
  description?: string
  department: string
  totalHours?: {
    lectureHours?: number
    practicalHours?: number
    labHours?: number
  }
}

export interface CreateGroupForm {
  name: string
  specialty: string
  course: number
}

export interface CreateSemesterForm {
  name: "Осенний" | "Весенний"
  year: number
  startDate: string
  endDate: string
  examStartDate?: string
  examEndDate?: string
}

export interface CreateScheduleForm {
  subject: string
  teacher: string
  groups: string[]
  semester: string
  dayOfWeek: number
  weeksOfMonth: number[]
  startTime: string
  endTime: string
  lessonType: LessonType
  classroom: string
  duration?: number
  isRecurring?: boolean
}

// Schedule with populated fields (как приходит с сервера)
export interface ScheduleWithPopulated {
  _id: string
  subject: {
    _id: string
    name: string
  }
  teacher: {
    _id: string
    name: string
  }
  groups: {
    _id: string
    name: string
  }[]
  semester: {
    _id: string
    name: string
    year: number
  }
  dayOfWeek: number
  weeksOfMonth: number[]
  startTime: string
  endTime: string
  lessonType: LessonType
  classroom: string
  duration: number
  isRecurring: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SchedulesResponse {
  message: string
  schedules: ScheduleWithPopulated[]
}

// Ответ от /schedule-instances
export interface ScheduleInstancesResponse {
  message: string
  instances: ScheduleInstanceWithPopulated[]
}

// Ответ от /teacher/schedule
export interface TeacherScheduleResponse {
  message: string
  schedule: ScheduleInstanceWithPopulated[]
}

// Ответ от /student/schedule
export interface StudentScheduleResponse {
  message: string
  schedule: ScheduleInstanceWithPopulated[]
}

// Студент с данными посещаемости и оценок для конкретного занятия
export interface StudentWithAttendanceAndGrades extends Student {
  attendance?: {
    _id: string
    scheduleInstance: string
    student: string
    teacher: string
    subject: string
    group: string
    semester: string
    date: string
    lessonType: LessonType
    status: AttendanceStatus
    attendedHours: number
    missedHours: number
    notes: string
    markedBy: string
    markedAt: string
    createdAt: string
    updatedAt: string
  }
  grades?: {
    _id: string
    student: string
    subject: string
    teacher: string
    group: string
    semester: string
    scheduleInstance: string
    gradeType: GradeType
    value: number
    notes: string
    markedBy: string
    date: string
    createdAt: string
    updatedAt: string
  }[]
}

export interface LessonStudentsResponse {
  message: string
  scheduleInstance: ScheduleInstanceWithPopulated
  students: StudentWithAttendanceAndGrades[]
  isAttendanceMarked: boolean
  isGradesMarked: boolean
  totalStudents: number
  attendanceCount: number
  gradesCount: number
}

// Ответ от /student/attendance с новой структурой
export interface StudentAttendanceBySubject {
  subject: {
    _id: string
    name: string
  }
  records: {
    _id: string
    scheduleInstance: {
      _id: string
      date: string
      startTime: string
      endTime: string
      classroom: string
    }
    student: string
    teacher: {
      _id: string
      name: string
    }
    subject: {
      _id: string
      name: string
    }
    group: string
    semester: string
    date: string
    lessonType: LessonType
    status: AttendanceStatus
    attendedHours: number
    missedHours: number
    notes: string
    markedBy: string
    markedAt: string
    createdAt: string
    updatedAt: string
  }[]
  stats: {
    totalLessons: number
    presentCount: number
    absentCount: number
    totalAttendedHours: number
    totalMissedHours: number
    attendancePercentage: number
  }
}

export interface StudentAttendanceResponse {
  message: string
  attendanceBySubject: StudentAttendanceBySubject[]
  totalRecords: number
}

// Данные для отметки посещаемости
export interface AttendanceData {
  studentId: string
  status: AttendanceStatus
  attendedHours: number
  missedHours: number
  notes?: string
}

// Данные для выставления оценок
export interface GradeData {
  studentId: string
  value?: number
  gradeType: GradeType
  description?: string
  notes?: string
}

// Статистика
export interface AttendanceStats {
  totalLessons: number
  attendedLessons: number
  attendancePercentage: number
  bySubject: {
    [subjectId: string]: {
      total: number
      attended: number
      percentage: number
    }
  }
}

export interface GradeStats {
  averageGrade: number
  gradeCount: number
  bySubject: {
    [subjectId: string]: {
      average: number
      count: number
      grades: Grade[]
    }
  }
}

// Расширенные данные для таблицы посещаемости
export interface AttendanceTableData {
  studentId: string
  studentName: string
  attendance: { [date: string]: { status: AttendanceStatus; notes?: string } }
  grades: {
    [date: string]: { value?: number; gradeType?: GradeType; notes?: string }
  }
}

// Данные для занятий преподавателя
export interface TeacherLessonData {
  scheduleInstance: ScheduleInstance
  students: Student[]
  attendanceData: AttendanceTableData[]
}

// ScheduleInstance с populated полями (как приходит с сервера)
export interface ScheduleInstanceWithPopulated {
  _id: string
  schedule: string // ObjectId
  subject: {
    _id: string
    name: string
    code?: string
  }
  teacher:
    | {
        _id: string
        name: string
      }
    | string // Может приходить как объект или строка ID
  groups: {
    _id: string
    name: string
  }[]
  semester: {
    _id: string
    name: string
    year: number
  }
  date: string
  startTime: string
  endTime: string
  classroom: string
  lessonType: LessonType
  status: "Запланировано" | "Проведено" | "Отменено" | "Перенесено"
  attendanceMarked: boolean
  notes?: string
  cancelReason?: string
  createdAt: Date
  updatedAt: Date
}

// Статистика преподавателя
export interface TeacherStats {
  totalLessons: number
  completedLessons: number
  avgAttendance: number
  subjectStats: Array<{
    subjectName: string
    totalLessons: number
    avgAttendance: number
    totalStudents: number
  }>
  recentActivity: Array<{
    date: string
    subject: string
    groups: string[]
    attendanceMarked: boolean
  }>
}
