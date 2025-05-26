import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  BookOpenIcon,
  PencilSquareIcon,
  TrophyIcon,
  Squares2X2Icon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  UserGroupIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import ClassInfo from "../components/student-class/ClassInfo";
import ClassFeatures from "../components/student-class/ClassFeatures";
import DocumentsTab from "../components/student-class/DocumentsTab";
import LeaveRequestTab from "../components/student-class/LeaveRequestTab";
import AssignmentsTab from "../components/student-class/AssignmentsTab";
import ExamsTab from "../components/student-class/ExamsTab";

interface ClassDetail {
  id: number;
  name: string;
  code: string;
  description: string;
  semester: string;
  teacherId: number;
  teacherName: string;
  createdAt: string;
}

interface DocumentItem {
  id: number;
  title: string;
  filePath: string;
  uploadedAt: string;
}

interface LeaveRequest {
  id: number;
  studentId: number;
  classId: number;
  reason: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

type TabType = 'overview' | 'documents' | 'leave-requests' | 'assignments' | 'exams';

export default function StudentClassPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, getToken, user } = useAuth();

  console.log("StudentClassPage - classId from params:", classId);
  console.log("StudentClassPage - classId type:", typeof classId);

  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  const [showLeaveRequestModal, setShowLeaveRequestModal] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loadingLeaveRequests, setLoadingLeaveRequests] = useState(false);
  const [leaveRequestError, setLeaveRequestError] = useState<string | null>(null);
  const [newLeaveRequest, setNewLeaveRequest] = useState({
    reason: '',
    startDate: '',
    endDate: ''
  });
  const [submittingLeaveRequest, setSubmittingLeaveRequest] = useState(false);

  // Validate class ID
  useEffect(() => {
    console.log("Validating class ID:", classId);
    if (!classId || classId === 'undefined' || classId === 'null') {
      console.log("Invalid class ID detected");
      setError("Invalid class ID. Please make sure you're accessing the correct URL.");
      setLoading(false);
      return;
    }
  }, [classId]);

  useEffect(() => {
    const fetchClassDetail = async () => {
      if (!classId || classId === 'undefined' || classId === 'null') {
        console.log("Skipping fetchClassDetail due to invalid ID");
        return;
      }

      console.log("Fetching class detail for ID:", classId);
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        if (!token) throw new Error("Authentication token not found");
        const res = await fetch(`http://localhost:8080/education/api/classes/${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch class detail");
        const data = await res.json();
        console.log("Class detail response:", data);
        if (data.code === 1000) {
          setClassDetail(data.result);
        } else {
          throw new Error(data.message || "Failed to fetch class detail");
        }
      } catch (err) {
        console.error("Error fetching class detail:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchClassDetail();
  }, [classId, getToken]);

  const handleOpenDocuments = async () => {
    setShowDocumentsModal(true);
    setLoadingDocuments(true);
    setDocumentsError(null);
    try {
      const token = getToken();
      const res = await fetch(
        `http://localhost:8080/education/api/documents/class/${classDetail?.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.code === 1000) {
        setDocuments(data.result);
      } else {
        setDocumentsError(data.message || "Không thể tải tài liệu.");
      }
    } catch {
      setDocumentsError("Không thể tải tài liệu.");
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleOpenLeaveRequests = async () => {
    setShowLeaveRequestModal(true);
    setLoadingLeaveRequests(true);
    setLeaveRequestError(null);
    try {
      const token = getToken();
      const res = await fetch(
        `http://localhost:8080/education/api/leave-requests/student/${user?.id}/class/${classDetail?.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.code === 1000) {
        setLeaveRequests(data.result);
      } else {
        setLeaveRequestError(data.message || "Không thể tải yêu cầu nghỉ phép.");
      }
    } catch {
      setLeaveRequestError("Không thể tải yêu cầu nghỉ phép.");
    } finally {
      setLoadingLeaveRequests(false);
    }
  };

  const handleSubmitLeaveRequest = async () => {
    if (!newLeaveRequest.reason || !newLeaveRequest.startDate || !newLeaveRequest.endDate) {
      setLeaveRequestError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setSubmittingLeaveRequest(true);
    setLeaveRequestError(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Authentication token not found");

      const res = await fetch("http://localhost:8080/education/api/leave-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classId: classDetail?.id,
          reason: newLeaveRequest.reason,
          startDate: newLeaveRequest.startDate,
          endDate: newLeaveRequest.endDate,
        }),
      });

      const data = await res.json();
      if (data.code === 1000) {
        setNewLeaveRequest({ reason: '', startDate: '', endDate: '' });
        handleOpenLeaveRequests(); // Refresh the list
      } else {
        throw new Error(data.message || "Failed to submit leave request");
      }
    } catch (err) {
      setLeaveRequestError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmittingLeaveRequest(false);
    }
  };

  // Navbar user info
  const navbarUser = user
    ? {
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: "STUDENT",
      }
    : undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={isLoggedIn} user={navbarUser} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin lớp học...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !classDetail) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={isLoggedIn} user={navbarUser} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Lỗi</h2>
            <p className="text-gray-600">{error || "Không tìm thấy lớp học."}</p>
            <button
              className="mt-6 px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate(-1)}
            >
              <ChevronLeftIcon className="w-5 h-5 inline mr-1" />
              Quay lại
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={isLoggedIn} user={navbarUser} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Class Info */}
        <ClassInfo classDetail={classDetail} />

        {/* Tab Navigation */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`${
                  activeTab === 'documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Tài liệu
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`${
                  activeTab === 'assignments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Bài tập
              </button>
              <button
                onClick={() => setActiveTab('leave-requests')}
                className={`${
                  activeTab === 'leave-requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Nghỉ phép
              </button>
              <button
                onClick={() => setActiveTab('exams')}
                className={`${
                  activeTab === 'exams'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Bài thi
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'overview' && (
            <ClassFeatures
              onOpenDocuments={() => setActiveTab('documents')}
              onOpenLeaveRequests={() => setActiveTab('leave-requests')}
              onOpenAssignments={() => setActiveTab('assignments')}
            />
          )}
          {activeTab === 'documents' && <DocumentsTab classId={classDetail.id} />}
          {activeTab === 'assignments' && <AssignmentsTab classId={classDetail.id} />}
          {activeTab === 'leave-requests' && <LeaveRequestTab classId={classDetail.id} />}
          {activeTab === 'exams' && <ExamsTab classId={classDetail.id} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}