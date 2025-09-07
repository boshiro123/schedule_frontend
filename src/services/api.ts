import axios, { AxiosInstance, AxiosResponse } from "axios"
import {
  Admin,
  Teacher,
  Student,
  Department,
  Group,
  Subject,
  Semester,
  Schedule,
  ScheduleInstance,
  ScheduleInstanceWithPopulated,
  Attendance,
  Grade,
  LoginResponse,
  ApiResponse,
  DepartmentsResponse,
  TeachersResponse,
  GroupsResponse,
  SubjectsResponse,
  SemestersResponse,
  SchedulesResponse,
  ScheduleInstancesResponse,
  TeacherScheduleResponse,
  StudentScheduleResponse,
  StudentAttendanceResponse,
  LessonStudentsResponse,
  AdminLoginForm,
  TeacherLoginForm,
  StudentLoginForm,
  CreateDepartmentForm,
  CreateTeacherForm,
  CreateSubjectForm,
  CreateGroupForm,
  CreateSemesterForm,
  CreateScheduleForm,
  AttendanceData,
  GradeData,
  AttendanceStats,
  GradeStats,
} from "../types"

const BASE_URL = "http://localhost:3001"

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Добавляем токен авторизации к каждому запросу
    this.client.interceptors.request.use(
      config => {
        const token = localStorage.getItem("token")
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      error => {
        return Promise.reject(error)
      }
    )

    // Обработка ответов и ошибок
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // Токен истек или недействителен
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          window.location.href = "/login"
        }
        return Promise.reject(error)
      }
    )
  }

  // === ОБЩИЕ МЕТОДЫ ===
  async checkHealth(): Promise<ApiResponse<any>> {
    const response = await this.client.get("/health")
    return response.data
  }

  // === АВТОРИЗАЦИЯ ===
  async loginAdmin(credentials: AdminLoginForm): Promise<LoginResponse> {
    const response = await this.client.post("/auth/admin/login", credentials)
    return response.data
  }

  async loginTeacher(credentials: TeacherLoginForm): Promise<LoginResponse> {
    const response = await this.client.post("/auth/teacher/login", credentials)
    return response.data
  }

  async loginStudent(credentials: StudentLoginForm): Promise<LoginResponse> {
    console.log("Отправляем данные для авторизации студента:", credentials)
    const response = await this.client.post("/auth/student/login", credentials)
    return response.data
  }

  async verifyToken(): Promise<ApiResponse<any>> {
    const response = await this.client.get("/auth/verify")
    return response.data
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<any>> {
    const response = await this.client.post("/auth/change-password", {
      currentPassword,
      newPassword,
    })
    return response.data
  }

  async registerFirstAdmin(data: {
    name: string
    email: string
    password: string
  }): Promise<ApiResponse<any>> {
    const response = await this.client.post("/auth/register-first-admin", data)
    return response.data
  }

  // === АДМИНИСТРАТОР - КАФЕДРЫ ===
  async getDepartments(): Promise<DepartmentsResponse> {
    const response = await this.client.get("/admin/departments")
    console.log(response.data)
    return response.data
  }

  async createDepartment(
    data: CreateDepartmentForm
  ): Promise<ApiResponse<Department>> {
    const response = await this.client.post("/admin/departments", data)
    return response.data
  }

  async updateDepartment(
    id: string,
    data: Partial<CreateDepartmentForm>
  ): Promise<ApiResponse<Department>> {
    const response = await this.client.put(`/admin/departments/${id}`, data)
    return response.data
  }

  async deleteDepartment(id: string): Promise<ApiResponse<any>> {
    const response = await this.client.delete(`/admin/departments/${id}`)
    return response.data
  }

  // === АДМИНИСТРАТОР - ПРЕПОДАВАТЕЛИ ===
  async getTeachers(): Promise<TeachersResponse> {
    const response = await this.client.get("/admin/teachers")
    return response.data
  }

  async createTeacher(data: CreateTeacherForm): Promise<ApiResponse<Teacher>> {
    const response = await this.client.post("/admin/teachers", data)
    return response.data
  }

  async updateTeacher(
    id: string,
    data: Partial<CreateTeacherForm>
  ): Promise<ApiResponse<Teacher>> {
    const response = await this.client.put(`/admin/teachers/${id}`, data)
    return response.data
  }

  async deleteTeacher(id: string): Promise<ApiResponse<any>> {
    const response = await this.client.delete(`/admin/teachers/${id}`)
    return response.data
  }

  // === АДМИНИСТРАТОР - ПРЕДМЕТЫ ===
  async getSubjects(): Promise<SubjectsResponse> {
    const response = await this.client.get("/admin/subjects")
    return response.data
  }

  async createSubject(data: CreateSubjectForm): Promise<ApiResponse<Subject>> {
    const response = await this.client.post("/admin/subjects", data)
    return response.data
  }

  async updateSubject(
    id: string,
    data: Partial<CreateSubjectForm>
  ): Promise<ApiResponse<Subject>> {
    const response = await this.client.put(`/admin/subjects/${id}`, data)
    return response.data
  }

  async deleteSubject(id: string): Promise<ApiResponse<any>> {
    const response = await this.client.delete(`/admin/subjects/${id}`)
    return response.data
  }

  // === АДМИНИСТРАТОР - ГРУППЫ ===
  async getGroups(): Promise<GroupsResponse> {
    const response = await this.client.get("/admin/groups")
    return response.data
  }

  async createGroup(data: CreateGroupForm): Promise<ApiResponse<Group>> {
    const response = await this.client.post("/admin/groups", data)
    return response.data
  }

  async importStudents(groupId: string, file: File): Promise<ApiResponse<any>> {
    const formData = new FormData()
    formData.append("file", file)
    const response = await this.client.post(
      `/admin/groups/${groupId}/import-students`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data
  }

  // === АДМИНИСТРАТОР - СЕМЕСТРЫ ===
  async getSemesters(): Promise<SemestersResponse> {
    const response = await this.client.get("/admin/semesters")
    return response.data
  }

  async createSemester(
    data: CreateSemesterForm
  ): Promise<ApiResponse<Semester>> {
    const response = await this.client.post("/admin/semesters", data)
    return response.data
  }

  async activateSemester(id: string): Promise<ApiResponse<any>> {
    const response = await this.client.post(`/admin/semesters/${id}/activate`)
    return response.data
  }

  // === РАСПИСАНИЕ ===
  async getSchedules(params?: {
    semesterId?: string
    teacherId?: string
    groupId?: string
    subjectId?: string
  }): Promise<SchedulesResponse> {
    const response = await this.client.get("/schedules", { params })
    console.log(response.data)
    return response.data
  }

  async createSchedule(
    data: CreateScheduleForm
  ): Promise<ApiResponse<Schedule>> {
    const response = await this.client.post("/schedules", data)
    return response.data
  }

  async updateSchedule(
    id: string,
    data: Partial<CreateScheduleForm>
  ): Promise<ApiResponse<Schedule>> {
    const response = await this.client.put(`/schedules/${id}`, data)
    return response.data
  }

  async deleteSchedule(id: string): Promise<ApiResponse<any>> {
    const response = await this.client.delete(`/schedules/${id}`)
    return response.data
  }

  // === ЗАНЯТИЯ ===
  async getScheduleInstances(params?: {
    semesterId?: string
    teacherId?: string
    groupId?: string
    date?: string
    startDate?: string
    endDate?: string
  }): Promise<ScheduleInstancesResponse> {
    const response = await this.client.get("/schedule-instances", { params })
    console.log(response.data)
    return response.data
  }

  async updateScheduleInstance(
    id: string,
    data: Partial<ScheduleInstance>
  ): Promise<ApiResponse<ScheduleInstance>> {
    const response = await this.client.put(`/schedule-instances/${id}`, data)
    return response.data
  }

  async cancelScheduleInstance(
    id: string,
    cancelReason?: string
  ): Promise<ApiResponse<any>> {
    const response = await this.client.post(
      `/schedule-instances/${id}/cancel`,
      {
        cancelReason,
      }
    )
    return response.data
  }

  // === ПРЕПОДАВАТЕЛЬ ===
  async getTeacherSchedule(params?: {
    date?: string
    startDate?: string
    endDate?: string
  }): Promise<TeacherScheduleResponse> {
    const response = await this.client.get("/teacher/schedule", { params })
    console.log(response.data)
    return response.data
  }

  async getTeacherScheduleToday(): Promise<TeacherScheduleResponse> {
    const response = await this.client.get("/teacher/schedule/today")
    return response.data
  }

  async getLessonStudents(
    scheduleInstanceId: string
  ): Promise<LessonStudentsResponse> {
    const response = await this.client.get(
      `/teacher/lessons/${scheduleInstanceId}/students`
    )
    return response.data
  }

  async markAttendance(
    scheduleInstanceId: string,
    attendanceData: AttendanceData[]
  ): Promise<ApiResponse<any>> {
    const response = await this.client.post(
      `/teacher/lessons/${scheduleInstanceId}/attendance`,
      {
        attendanceData,
      }
    )
    return response.data
  }

  async submitGrades(
    scheduleInstanceId: string,
    gradesData: GradeData[]
  ): Promise<ApiResponse<any>> {
    const response = await this.client.post(
      `/teacher/lessons/${scheduleInstanceId}/grades`,
      {
        gradesData,
      }
    )
    return response.data
  }

  async getTeacherStats(params?: {
    semesterId?: string
  }): Promise<ApiResponse<any>> {
    const response = await this.client.get("/teacher/stats", { params })
    return response.data
  }

  // === СТУДЕНТ ===
  async getStudentSchedule(params?: {
    date?: string
    startDate?: string
    endDate?: string
  }): Promise<StudentScheduleResponse> {
    const response = await this.client.get("/student/schedule", { params })
    return response.data
  }

  async getStudentScheduleToday(): Promise<StudentScheduleResponse> {
    const response = await this.client.get("/student/schedule/today")
    return response.data
  }

  async getStudentAttendance(params?: {
    semesterId?: string
    subjectId?: string
  }): Promise<StudentAttendanceResponse> {
    const response = await this.client.get("/student/attendance", { params })
    console.log("response", response.data)
    return response.data
  }

  async getStudentGrades(params?: {
    semesterId?: string
    subjectId?: string
  }): Promise<ApiResponse<Grade[]>> {
    const response = await this.client.get("/student/grades", { params })
    return response.data
  }

  async getStudentStats(semesterId?: string): Promise<ApiResponse<any>> {
    const response = await this.client.get("/student/stats", {
      params: { semesterId },
    })
    return response.data
  }

  // === ОТЧЕТЫ ===
  async downloadAttendanceReport(params: {
    groupId: string
    subjectId: string
    semesterId: string
    lessonType?: string
  }): Promise<Blob> {
    const response = await this.client.get("/reports/attendance/excel", {
      params,
      responseType: "blob",
    })
    return response.data
  }

  async downloadGradesReport(params: {
    groupId: string
    subjectId: string
    semesterId: string
    gradeType?: string
  }): Promise<Blob> {
    const response = await this.client.get("/reports/grades/excel", {
      params,
      responseType: "blob",
    })
    return response.data
  }

  async getGroupAttendanceStats(params: {
    groupId: string
    semesterId?: string
    subjectId?: string
  }): Promise<ApiResponse<AttendanceStats>> {
    const response = await this.client.get("/reports/group/attendance", {
      params,
    })
    return response.data
  }

  async getGroupGradesStats(params: {
    groupId: string
    semesterId?: string
    subjectId?: string
  }): Promise<ApiResponse<GradeStats>> {
    const response = await this.client.get("/reports/group/grades", { params })
    return response.data
  }

  async getStudentAnalytics(
    studentId: string,
    semesterId?: string
  ): Promise<ApiResponse<any>> {
    const response = await this.client.get(
      `/reports/student/${studentId}/analytics`,
      {
        params: { semesterId },
      }
    )
    return response.data
  }

  async getSemesterAnalytics(semesterId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(
      `/reports/semester/${semesterId}/analytics`
    )
    return response.data
  }
}

// Создаем и экспортируем экземпляр API клиента
export const apiClient = new ApiClient()
