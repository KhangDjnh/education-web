import { ApiResponse, ClassData, Student, Document, AttendanceRecord, AbsenceRequest, Question, Exam, Assignment } from '../types/class';

const API_BASE_URL = 'http://localhost:8080/education/api';

export const classService = {
  // Class data
  getClassData: async (classId: string, token: string): Promise<ClassData> => {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    const data: ApiResponse<ClassData> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || 'Failed to fetch class data');
  },

  // Students
  getStudents: async (classId: string, token: string): Promise<Student[]> => {
    const response = await fetch(`${API_BASE_URL}/class-students/students/${classId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data: ApiResponse<Student[]> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || 'Failed to fetch students');
  },

  // Documents
  getDocuments: async (classId: string, token: string): Promise<Document[]> => {
    const response = await fetch(`${API_BASE_URL}/documents/class/${classId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data: ApiResponse<Document[]> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || 'Failed to fetch documents');
  },

  // Attendance
  submitAttendance: async (
    classId: number,
    attendanceDate: string,
    attendances: AttendanceRecord[],
    token: string
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        classId,
        attendanceDate,
        attendances,
      }),
    });
    const data = await response.json();
    if (data.code !== 1000) {
      throw new Error(data.message || 'Failed to submit attendance');
    }
  },

  // Absence Requests
  getAbsenceRequests: async (classId: string, token: string): Promise<AbsenceRequest[]> => {
    const response = await fetch(`${API_BASE_URL}/leave-request/class/${classId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data: ApiResponse<AbsenceRequest[]> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || 'Failed to fetch absence requests');
  },

  updateAbsenceRequest: async (
    requestId: number,
    action: 'APPROVED' | 'REJECTED',
    token: string
  ): Promise<void> => {
    const actionPath = action === 'APPROVED' ? 'approve' : 'reject';
    const response = await fetch(
      `${API_BASE_URL}/leave-request/${requestId}/${actionPath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    if (data.code !== 1000) {
      throw new Error(data.message || 'Failed to update absence request');
    }
  },

  // Questions
  getQuestions: async (
    classId: string,
    page: number,
    token: string
  ): Promise<{ content: Question[]; number: number; totalPages: number }> => {
    const response = await fetch(
      `${API_BASE_URL}/questions?classId=${classId}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data: ApiResponse<{ content: Question[]; number: number; totalPages: number }> =
      await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || 'Failed to fetch questions');
  },

  searchQuestions: async (
    classId: string,
    searchParams: {
      keyword?: string;
      chapter?: number;
      level?: string;
    },
    token: string
  ): Promise<{ content: Question[]; number: number; totalPages: number }> => {
    const response = await fetch(`${API_BASE_URL}/questions/search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        classId,
        ...searchParams,
      }),
    });
    const data: ApiResponse<{ content: Question[]; number: number; totalPages: number }> =
      await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || 'Failed to search questions');
  },

  // Exams
  getExams: async (classId: string, token: string): Promise<Exam[]> => {
    const response = await fetch(`${API_BASE_URL}/exams/${classId}/class`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data: ApiResponse<Exam[]> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || 'Failed to fetch exams');
  },

  createExam: async (
    examData: {
      classId: string;
      title: string;
      description: string;
      questionIds: number[];
      startTime: string;
      endTime: string;
    },
    token: string
  ): Promise<Exam> => {
    const response = await fetch(`${API_BASE_URL}/exams/choose`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(examData),
    });
    const data: ApiResponse<Exam> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || 'Failed to create exam');
  },

  createRandomExam: async (
    examData: {
      classId: string;
      title: string;
      description: string;
      numberOfEasyQuestions: string;
      numberOfMediumQuestions: string;
      numberOfHardQuestions: string;
      numberOfVeryHardQuestions: string;
      startTime: string;
      endTime: string;
    },
    token: string
  ): Promise<Exam> => {
    const response = await fetch(`${API_BASE_URL}/exams/random`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(examData),
    });
    const data: ApiResponse<Exam> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || 'Failed to create random exam');
  },

  // Assignments
  getAssignments: async (classId: string, token: string): Promise<Assignment[]> => {
    const response = await fetch(`${API_BASE_URL}/assignments/${classId}/class`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    const data: ApiResponse<Assignment[]> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || 'Failed to fetch assignments');
  },

  createAssignment: async (
    assignmentData: FormData,
    token: string
  ): Promise<Assignment> => {
    const response = await fetch(`${API_BASE_URL}/assignments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: assignmentData,
    });
    const data: ApiResponse<Assignment> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || 'Failed to create assignment');
  },

  updateAssignment: async (
    assignmentId: number,
    assignmentData: FormData,
    token: string
  ): Promise<Assignment> => {
    const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: assignmentData,
    });
    const data: ApiResponse<Assignment> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || 'Failed to update assignment');
  },

  deleteAssignment: async (assignmentId: number, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    const data = await response.json();
    if (data.code !== 1000) {
      throw new Error(data.message || 'Failed to delete assignment');
    }
  },
}; 