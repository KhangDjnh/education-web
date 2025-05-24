import type { ApiResponse } from "../types/class";
import type { ClassData } from "../types/class";
import type {
  Student,
  Document,
  AttendanceRecord,
  AbsenceRequest,
  Question,
  Exam,
  Assignment,
} from "../types/class";

const API_BASE_URL = "http://localhost:8080/education/api";

// Helper function to validate classId
const validateClassId = (classId: string | undefined | null): string => {
  if (!classId || classId === 'undefined' || classId === 'null') {
    throw new Error('Class ID is required and must be a valid number');
  }
  return classId;
};

export const classService = {
  // Class data
  getClassData: async (classId: string | undefined | null, token: string): Promise<ClassData> => {
    const validClassId = validateClassId(classId);
    const response = await fetch(`${API_BASE_URL}/classes/${validClassId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data: ApiResponse<ClassData> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to fetch class data");
  },

  // Students
  // getStudents: async (classId: string, token: string): Promise<Student[]> => {
  //   const response = await fetch(`${API_BASE_URL}/class-students/students/${classId}`, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //       'Content-Type': 'application/json',
  //     },
  //   });
  //   const data: ApiResponse<Student[]> = await response.json();
  //   if (data.code === 1000) return data.result;
  //   throw new Error(data.message || 'Failed to fetch students');
  // },
  getStudents: async (classId: string | undefined | null, token: string): Promise<Student[]> => {
    const validClassId = validateClassId(classId);
    const response = await fetch(`${API_BASE_URL}/class-students/students/${validClassId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data: ApiResponse<Student[]> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to fetch students");
  },

  // Documents
  getDocuments: async (classId: string | undefined | null, token: string): Promise<Document[]> => {
    const validClassId = validateClassId(classId);
    const response = await fetch(`${API_BASE_URL}/documents/class/${validClassId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data: ApiResponse<Document[]> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to fetch documents");
  },

  // Attendance
  submitAttendance: async (
    classId: string | undefined | null,
    attendanceDate: string,
    attendances: AttendanceRecord[],
    token: string
  ): Promise<void> => {
    const validClassId = validateClassId(classId);
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        classId: validClassId,
        attendanceDate,
        attendances,
      }),
    });
    const data = await response.json();
    if (data.code !== 1000) {
      throw new Error(data.message || "Failed to submit attendance");
    }
  },

  // Absence Requests
  getAbsenceRequests: async (
    classId: string | undefined | null,
    token: string
  ): Promise<AbsenceRequest[]> => {
    const validClassId = validateClassId(classId);
    const response = await fetch(
      `${API_BASE_URL}/leave-request/class/${validClassId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data: ApiResponse<AbsenceRequest[]> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to fetch absence requests");
  },

  updateAbsenceRequest: async (
    requestId: number,
    action: "APPROVED" | "REJECTED",
    token: string
  ): Promise<void> => {
    const actionPath = action === "APPROVED" ? "approve" : "reject";
    const response = await fetch(
      `${API_BASE_URL}/leave-request/${requestId}/${actionPath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    if (data.code !== 1000) {
      throw new Error(data.message || "Failed to update absence request");
    }
  },

  // Questions
  getQuestions: async (
    classId: string | undefined | null,
    page: number,
    token: string
  ): Promise<{ content: Question[]; number: number; totalPages: number }> => {
    const validClassId = validateClassId(classId);
    const response = await fetch(
      `${API_BASE_URL}/questions?classId=${validClassId}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data: ApiResponse<{
      content: Question[];
      number: number;
      totalPages: number;
    }> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to fetch questions");
  },

  searchQuestions: async (
    classId: string | undefined | null,
    searchParams: {
      keyword?: string;
      chapter?: number;
      level?: string;
    },
    token: string
  ): Promise<{ content: Question[]; number: number; totalPages: number }> => {
    const validClassId = validateClassId(classId);
    const response = await fetch(`${API_BASE_URL}/questions/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        classId: validClassId,
        ...searchParams,
      }),
    });
    const data: ApiResponse<{
      content: Question[];
      number: number;
      totalPages: number;
    }> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to search questions");
  },

  // Exams
  getExams: async (classId: string | undefined | null, token: string): Promise<Exam[]> => {
    const validClassId = validateClassId(classId);
    const response = await fetch(`${API_BASE_URL}/exams/${validClassId}/class`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data: ApiResponse<Exam[]> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to fetch exams");
  },

  createExam: async (
    examData: {
      classId: string | undefined | null;
      title: string;
      description: string;
      questionIds: number[];
      startTime: string;
      endTime: string;
    },
    token: string
  ): Promise<Exam> => {
    const validClassId = validateClassId(examData.classId);
    const response = await fetch(`${API_BASE_URL}/exams/choose`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...examData,
        classId: validClassId,
      }),
    });
    const data: ApiResponse<Exam> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to create exam");
  },

  createRandomExam: async (
    examData: {
      classId: string | undefined | null;
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
    const validClassId = validateClassId(examData.classId);
    const response = await fetch(`${API_BASE_URL}/exams/random`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...examData,
        classId: validClassId,
      }),
    });
    const data: ApiResponse<Exam> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to create random exam");
  },

  // Assignments
  getAssignments: async (
    classId: string | undefined | null,
    token: string
  ): Promise<Assignment[]> => {
    const validClassId = validateClassId(classId);
    const response = await fetch(
      `${API_BASE_URL}/assignments/${validClassId}/class`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );
    const data: ApiResponse<Assignment[]> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to fetch assignments");
  },

  createAssignment: async (
    assignmentData: FormData,
    token: string
  ): Promise<Assignment> => {
    const response = await fetch(`${API_BASE_URL}/assignments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: assignmentData,
    });
    const data: ApiResponse<Assignment> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to create assignment");
  },

  updateAssignment: async (
    assignmentId: number,
    assignmentData: FormData,
    token: string
  ): Promise<Assignment> => {
    const response = await fetch(
      `${API_BASE_URL}/assignments/${assignmentId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: assignmentData,
      }
    );
    const data: ApiResponse<Assignment> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to update assignment");
  },

  deleteAssignment: async (
    assignmentId: number,
    token: string
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/assignments/${assignmentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );
    const data = await response.json();
    if (data.code !== 1000) {
      throw new Error(data.message || "Failed to delete assignment");
    }
  },

  // Add student to class
  addStudent: async (
    classId: string | undefined | null,
    studentId: string,
    token: string
  ): Promise<{ classId: number; studentId: number }> => {
    const validClassId = validateClassId(classId);
    const response = await fetch(`${API_BASE_URL}/class-students`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        classId: validClassId,
        studentId: studentId,
      }),
    });
    const data = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to add student to class");
  },

  // Delete student from class
  deleteStudent: async (
    classId: string | undefined | null,
    studentId: string,
    token: string
  ): Promise<void> => {
    const validClassId = validateClassId(classId);
    const response = await fetch(
      `${API_BASE_URL}/class-students?classId=${validClassId}&studentId=${studentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    if (data.code !== 1000) {
      throw new Error(data.message || "Failed to delete student from class");
    }
  },

  // Document operations
  uploadDocument: async (
    documentData: {
      classId: string;
      title: string;
      filePath: string;
    },
    token: string
  ): Promise<Document> => {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(documentData),
    });
    const data = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to upload document");
  },

  updateDocument: async (
    documentId: number,
    documentData: {
      title: string;
      filePath: string;
    },
    token: string
  ): Promise<Document> => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(documentData),
    });
    const data = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to update document");
  },

  deleteDocument: async (
    documentId: number,
    token: string
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (data.code !== 1000) {
      throw new Error(data.message || "Failed to delete document");
    }
  },
};
