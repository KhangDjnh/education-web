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
  StudentAttendance,
  AttendanceHistory,
} from "../types/class";

const API_BASE_URL = "http://localhost:8080/education/api";

// Helper function to validate classId
const validateClassId = (classId: string | undefined | null): string => {
  if (!classId || classId === 'undefined' || classId === 'null') {
    throw new Error('Class ID is required and must be a valid number');
  }
  return classId;
};

interface ScoreSummary {
  classId: number;
  exams: Array<{
    examId: number;
    name: string;
  }>;
  students: Array<{
    studentId: number;
    fullName: string;
    dob: string;
    scores: Record<string, number>;
    averageScore: number;
  }>;
}

interface Score {
  studentId: number;
  classId: number;
  score: number;
  examId: number;
}

interface CreateClassData {
  name: string;
  semester: string;
  code: string;
  description: string;
}

interface Submission {
  id: number;
  title: string;
  content: string;
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
  assignmentId: number;
  studentId: number;
  files: SubmissionFile[];
}

interface SubmissionFile {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  downloadUrl: string;
  fileSize: number;
  uploadedAt: string;
}

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

  getExamById: async (examId: number, token: string): Promise<Exam> => {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data: ApiResponse<Exam> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to fetch exam");
  },

  getExamQuestions: async (examId: number, token: string): Promise<{
    content: Array<{
      questionId: number;
      question: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
    }>;
    totalPages: number;
    number: number;
  }> => {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}/questions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data: ApiResponse<{
      content: Array<{
        questionId: number;
        question: string;
        optionA: string;
        optionB: string;
        optionC: string;
        optionD: string;
      }>;
      totalPages: number;
      number: number;
    }> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to fetch exam questions");
  },

  startExam: async (examId: number, token: string): Promise<Exam> => {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}/start`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data: ApiResponse<Exam> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to start exam");
  },

  updateExam: async (
    examId: number,
    examData: {
      classId: string;
      title: string;
      description: string;
      startTime: string;
      endTime: string;
    },
    token: string
  ): Promise<Exam> => {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(examData),
    });
    const data: ApiResponse<Exam> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to update exam");
  },

  deleteExam: async (examId: number, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (data.code !== 1000) {
      throw new Error(data.message || "Failed to delete exam");
    }
  },

  createExam: async (
    examData: {
      classId: string;
      title: string;
      description: string;
      startTime: string;
      endTime: string;
    },
    token: string
  ): Promise<Exam> => {
    const response = await fetch(`${API_BASE_URL}/exams`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(examData),
    });
    const data: ApiResponse<Exam> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to create exam");
  },

  createRandomExam: async (
    examData: {
      classId: string;
      title: string;
      description: string;
      startTime: string;
      endTime: string;
      numberOfEasyQuestions: string;
      numberOfMediumQuestions: string;
      numberOfHardQuestions: string;
      numberOfVeryHardQuestions: string;
    },
    token: string
  ): Promise<Exam> => {
    const response = await fetch(`${API_BASE_URL}/exams/random`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(examData),
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

  // Get student attendance summary
  getStudentAttendance: async (classId: string | undefined | null, token: string): Promise<StudentAttendance[]> => {
    const validClassId = validateClassId(classId);
    const response = await fetch(`${API_BASE_URL}/class-students/students/attendance/${validClassId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data: ApiResponse<StudentAttendance[]> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to fetch student attendance");
  },

  // Get attendance history for a specific date
  getAttendanceHistory: async (
    classId: string | undefined | null,
    attendanceDate: string,
    token: string
  ): Promise<AttendanceHistory[]> => {
    const validClassId = validateClassId(classId);
    const response = await fetch(
      `${API_BASE_URL}/attendance/class?classId=${validClassId}&attendanceDate=${attendanceDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data: ApiResponse<AttendanceHistory[]> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to fetch attendance history");
  },

  // Score APIs
  getScoreSummary: async (classId: string | undefined | null, token: string): Promise<ScoreSummary> => {
    const validClassId = validateClassId(classId);
    const response = await fetch(`${API_BASE_URL}/scores/summary?classId=${validClassId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data: ApiResponse<ScoreSummary> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to fetch score summary");
  },

  getExamScores: async (examId: number, token: string): Promise<Score[]> => {
    const response = await fetch(`${API_BASE_URL}/scores/${examId}/exams`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data: ApiResponse<Score[]> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to fetch exam scores");
  },

  getClassExamScores: async (classId: string | undefined | null, examId: number, token: string): Promise<Score[]> => {
    const validClassId = validateClassId(classId);
    const response = await fetch(`${API_BASE_URL}/scores/classes?classId=${validClassId}&examId=${examId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data: ApiResponse<Score[]> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || "Failed to fetch class exam scores");
  },

  exportClassScores: async (classId: string | undefined | null, token: string): Promise<Blob> => {
    const validClassId = validateClassId(classId);
    const response = await fetch(`${API_BASE_URL}/scores/classes/${validClassId}/scores/export`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to export scores");
    }
    return response.blob();
  },

  createClass: async (classData: CreateClassData, token: string): Promise<ClassData> => {
    const response = await fetch(`${API_BASE_URL}/classes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(classData),
    });
    const data: ApiResponse<ClassData> = await response.json();
    if (data.code === 1000) return data.result;
    throw new Error(data.message || 'Failed to create class');
  },

  async getAssignmentSubmissions(assignmentId: string, token: string): Promise<{ code: number; message: string; result: Submission[] }> {
    const response = await fetch(`${API_BASE_URL}/submissions/assignment/${assignmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    return data;
  },

  async submitGrade(submissionId: number, grade: number, feedback: string | null, token: string): Promise<{ code: number; message: string; result: Submission }> {
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/grade`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ grade: grade.toFixed(2), feedback }),
    });
    const data = await response.json();
    return data;
  },
};
