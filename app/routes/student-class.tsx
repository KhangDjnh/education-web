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
} from "@heroicons/react/24/outline";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

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

export default function StudentClassPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, getToken, user } = useAuth();

  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        if (!token) throw new Error("Authentication token not found");
        const res = await fetch(`http://localhost:8080/education/api/classes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch class detail");
        const data = await res.json();
        if (data.code === 1000) {
          setClassDetail(data.result);
        } else {
          throw new Error(data.message || "Failed to fetch class detail");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchClassDetail();
    // eslint-disable-next-line
  }, [id]);

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
        {/* Nếu đang xem tài liệu thì chỉ ẩn các chức năng, vẫn hiển thị info lớp và tài liệu */}
        {showDocumentsModal ? (
          <>
            {/* Class Info Card */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">{classDetail.name}</h1>
                  <div className="flex gap-3 mt-2">
                    <span className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-xs font-semibold">
                      Class Code: {classDetail.code}
                    </span>
                    <span className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-xs font-semibold">
                      Semester: {classDetail.semester}
                    </span>
                  </div>
                </div>
                <div>
                  <AcademicCapIcon className="h-12 w-12 text-white opacity-80" />
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-2 text-gray-800">Description</h2>
                <p className="text-gray-700 mb-6">{classDetail.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-500 mb-1">Class ID</div>
                    <div className="font-bold text-lg text-gray-700">{classDetail.id}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-500 mb-1">Created On</div>
                    <div className="font-bold text-lg text-gray-700">
                      {new Date(classDetail.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-500 mb-1">Teacher</div>
                    <div className="font-bold text-lg text-gray-700">{classDetail.teacherName}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <div className="font-bold text-lg text-green-600">Active</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Documents List */}
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 relative">
                <button
                  className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
                  onClick={() => setShowDocumentsModal(false)}
                  aria-label="Đóng"
                >
                  <XMarkIcon className="h-7 w-7" />
                </button>
                <h2 className="text-2xl font-bold text-blue-700 mb-1 flex items-center">
                  <BookOpenIcon className="h-7 w-7 mr-2" />
                  Tài liệu lớp học
                </h2>
                <p className="mb-6 text-gray-500">Danh sách tài liệu được chia sẻ trong lớp.</p>
                {loadingDocuments ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                    <span className="text-gray-600">Đang tải tài liệu...</span>
                  </div>
                ) : documentsError ? (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2">
                    {documentsError}
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">Chưa có tài liệu nào.</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {documents.map((doc) => (
                      <li key={doc.id} className="py-4 flex items-center justify-between group">
                        <div>
                          <div className="font-semibold text-gray-800 group-hover:text-blue-700 transition text-base">
                            {doc.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            Uploaded: {new Date(doc.uploadedAt).toLocaleTimeString("vi-VN")}{" "}
                            {new Date(doc.uploadedAt).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                        <a
                          href={doc.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 flex items-center bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                          <ArrowTopRightOnSquareIcon className="h-5 w-5 mr-1" />
                          Xem
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Class Info Card */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">{classDetail.name}</h1>
                  <div className="flex gap-3 mt-2">
                    <span className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-xs font-semibold">
                      Class Code: {classDetail.code}
                    </span>
                    <span className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-xs font-semibold">
                      Semester: {classDetail.semester}
                    </span>
                  </div>
                </div>
                <div>
                  <AcademicCapIcon className="h-12 w-12 text-white opacity-80" />
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-2 text-gray-800">Description</h2>
                <p className="text-gray-700 mb-6">{classDetail.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-500 mb-1">Class ID</div>
                    <div className="font-bold text-lg text-gray-700">{classDetail.id}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-500 mb-1">Created On</div>
                    <div className="font-bold text-lg text-gray-700">
                      {new Date(classDetail.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-500 mb-1">Teacher</div>
                    <div className="font-bold text-lg text-gray-700">{classDetail.teacherName}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <div className="font-bold text-lg text-green-600">Active</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Class Features */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Class Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-500 rounded-xl shadow p-5 flex flex-col">
                <div className="flex items-center mb-2">
                  <BookOpenIcon className="h-7 w-7 text-white mr-2" />
                  <span className="text-lg font-bold text-white">Tài liệu</span>
                </div>
                <div className="text-white text-sm mb-3">Xem và tải các tài liệu học tập của lớp.</div>
                <button
                  className="text-white underline text-sm mt-auto hover:text-blue-200"
                  onClick={handleOpenDocuments}
                >
                  Open Documents →
                </button>
              </div>
              <div className="bg-purple-500 rounded-xl shadow p-5 flex flex-col">
                <div className="flex items-center mb-2">
                  <PencilSquareIcon className="h-7 w-7 text-white mr-2" />
                  <span className="text-lg font-bold text-white">Bài tập</span>
                </div>
                <div className="text-white text-sm mb-3">Làm và nộp bài tập, xem kết quả bài tập.</div>
                <button
                  className="text-white underline text-sm mt-auto hover:text-purple-200"
                  onClick={() => alert("Tính năng bài tập sẽ sớm có!")}
                >
                  Open Assignments →
                </button>
              </div>
              <div className="bg-pink-500 rounded-xl shadow p-5 flex flex-col">
                <div className="flex items-center mb-2">
                  <TrophyIcon className="h-7 w-7 text-white mr-2" />
                  <span className="text-lg font-bold text-white">Thi cử</span>
                </div>
                <div className="text-white text-sm mb-3">Tham gia các kỳ thi, kiểm tra trực tuyến.</div>
                <button
                  className="text-white underline text-sm mt-auto hover:text-pink-200"
                  onClick={() => alert("Tính năng thi cử sẽ sớm có!")}
                >
                  Open Exams →
                </button>
              </div>
              <div className="bg-green-500 rounded-xl shadow p-5 flex flex-col">
                <div className="flex items-center mb-2">
                  <Squares2X2Icon className="h-7 w-7 text-white mr-2" />
                  <span className="text-lg font-bold text-white">Xem điểm</span>
                </div>
                <div className="text-white text-sm mb-3">Xem điểm số, kết quả học tập của bạn.</div>
                <button
                  className="text-white underline text-sm mt-auto hover:text-green-200"
                  onClick={() => alert("Tính năng xem điểm sẽ sớm có!")}
                >
                  View Grades →
                </button>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}