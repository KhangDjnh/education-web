import React, { useState, useEffect } from "react";
import { PencilSquareIcon, ArrowUpTrayIcon, TrashIcon, XMarkIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import StudentAssignmentCard from "../../components/StudentAssignmentCard";
import StudentSubmissionCard from "./StudentSubmissionCard";

interface Assignment {
  id: number;
  title: string;
  content: string;
  classId: number;
  files: {
    fileName: string;
    fileType: string;
    filePath: string;
    downloadUrl: string;
    fileSize: number;
    uploadedAt: string;
  }[];
  status: string;
  startAt: string;
  endAt: string;
  createdAt: string;
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
  files: {
    id: number;
    fileName: string;
    filePath: string;
    fileType: string;
    downloadUrl: string;
    fileSize: number;
    uploadedAt: string;
  }[];
}

interface AssignmentsTabProps {
  classId: number;
}

export default function AssignmentsTab({ classId }: AssignmentsTabProps) {
  const { getToken, user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<number, Submission>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [openedAssignment, setOpenedAssignment] = useState<number | null>(null);
  const [submissionForm, setSubmissionForm] = useState({
    title: "",
    content: "",
  });
  const [submissionSuccess, setSubmissionSuccess] = useState<{ message: string; submission: Submission } | null>(null);

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, [classId]);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(
        `http://localhost:8080/education/api/assignments/${classId}/class`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.code === 1000) {
        setAssignments(data.result);
      } else {
        setError(data.message || "Không thể tải danh sách bài tập.");
      }
    } catch {
      setError("Không thể tải danh sách bài tập.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!user?.id) return;
    
    try {
      const token = getToken();
      const res = await fetch(
        `http://localhost:8080/education/api/submissions/class/${classId}/student/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.code === 1000) {
        const submissionsMap: Record<number, Submission> = {};
        data.result.forEach((submission: Submission) => {
          submissionsMap[submission.assignmentId] = submission;
        });
        setSubmissions(submissionsMap);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (assignmentId: number) => {
    if (!selectedFile || !submissionForm.title || !submissionForm.content) {
      setError("Vui lòng điền đầy đủ thông tin và chọn file để nộp bài.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Authentication token not found");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("assignmentId", assignmentId.toString());
      formData.append("studentId", user?.id?.toString() || "");
      formData.append("title", submissionForm.title);
      formData.append("content", submissionForm.content);

      const res = await fetch("http://localhost:8080/education/api/submissions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.code === 1000) {
        setSelectedFile(null);
        setSelectedAssignment(null);
        setSubmissionForm({ title: "", content: "" });
        setSubmissionSuccess({
          message: "Nộp bài thành công!",
          submission: data.result
        });
        // Refresh submissions
        fetchSubmissions();
        // Hide success message after 3 seconds
        setTimeout(() => setSubmissionSuccess(null), 3000);
      } else {
        throw new Error(data.message || "Failed to submit assignment");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmission = async (submissionId: number, assignmentId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài nộp này?")) {
      return;
    }

    try {
      const token = getToken();
      if (!token) throw new Error("Authentication token not found");

      const res = await fetch(`http://localhost:8080/education/api/submissions/${submissionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.code === 1000) {
        // Remove submission from state
        setSubmissions(prev => {
          const newSubmissions = { ...prev };
          delete newSubmissions[assignmentId];
          return newSubmissions;
        });
      } else {
        throw new Error(data.message || "Failed to delete submission");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleAssignmentClick = (assignmentId: number) => {
    setOpenedAssignment(openedAssignment === assignmentId ? null : assignmentId);
    setSelectedAssignment(null); // Reset submission form when closing assignment
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Notification */}
      {submissionSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">{submissionSuccess.message}</p>
              <p className="text-sm mt-1">Tiêu đề: {submissionSuccess.submission.title}</p>
              <p className="text-sm">Thời gian nộp: {new Date(submissionSuccess.submission.submittedAt).toLocaleString("vi-VN")}</p>
            </div>
            <button
              onClick={() => setSubmissionSuccess(null)}
              className="ml-4 text-green-700 hover:text-green-900"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <PencilSquareIcon className="h-7 w-7 mr-2 text-blue-600" />
          Bài tập
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-gray-600">Đang tải bài tập...</span>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Chưa có bài tập nào.</div>
        ) : (
          <div className="space-y-6">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-gray-50 rounded-lg p-6">
                <StudentAssignmentCard
                  assignment={assignment}
                  opened={openedAssignment === assignment.id}
                  onClick={() => handleAssignmentClick(assignment.id)}
                  getToken={getToken}
                  onSubmissionClick={() => setSelectedAssignment(assignment.id)}
                  hasSubmission={!!submissions[assignment.id]}
                  onViewSubmission={() => setSelectedAssignment(assignment.id)}
                />
                
                {/* Assignment Content and Submission Section */}
                {openedAssignment === assignment.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* Show submission if exists */}
                    {submissions[assignment.id] ? (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <EyeIcon className="h-5 w-5 mr-2 text-blue-500" />
                            Bài nộp của bạn
                          </h3>
                        </div>
                        <StudentSubmissionCard
                          submission={submissions[assignment.id]}
                          getToken={getToken}
                          onDelete={(submissionId) => handleDeleteSubmission(submissionId, assignment.id)}
                        />
                      </div>
                    ) : (
                      /* Show submission form if no submission exists */
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Nộp bài</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tiêu đề bài nộp
                            </label>
                            <input
                              type="text"
                              value={submissionForm.title}
                              onChange={(e) => setSubmissionForm(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Nhập tiêu đề bài nộp"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nội dung bài nộp
                            </label>
                            <textarea
                              value={submissionForm.content}
                              onChange={(e) => setSubmissionForm(prev => ({ ...prev, content: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              rows={4}
                              placeholder="Nhập nội dung bài nộp"
                            />
                          </div>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              onChange={handleFileSelect}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            <button
                              onClick={() => handleSubmit(assignment.id)}
                              disabled={!selectedFile || submitting || !submissionForm.title || !submissionForm.content}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                            >
                              {submitting ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                  Đang nộp...
                                </>
                              ) : (
                                <>
                                  <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                                  Nộp bài
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAssignment(null);
                                setSelectedFile(null);
                                setSubmissionForm({ title: "", content: "" });
                              }}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                              Hủy
                            </button>
                          </div>
                          {selectedFile && (
                            <p className="text-sm text-gray-600">
                              Đã chọn: {selectedFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 