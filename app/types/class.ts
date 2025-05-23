export interface ClassData {
  id: number;
  name: string;
  code: string;
  description: string;
  semester: string;
  teacherId: number;
  createdAt: string;
}

export interface Student {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
}

export interface Document {
  id: number;
  title: string;
  filePath: string;
  uploadedAt: string;
}

export interface ApiResponse<T> {
  message: string;
  code: number;
  result: T;
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export interface AttendanceRecord {
  studentId: number;
  status: AttendanceStatus;
}

export interface AbsenceRequest {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  leaveDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface Question {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  chapter: number;
  level: string;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface Assignment {
  id: number;
  title: string;
  content: string;
  startAt: string;
  endAt: string;
  createdAt: string;
  files: string[];
}

export interface TeacherFeature {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
} 