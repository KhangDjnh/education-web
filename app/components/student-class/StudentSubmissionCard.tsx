import React from "react";
import {
  DocumentTextIcon,
  PaperClipIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  AcademicCapIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface SubmissionFile {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  downloadUrl: string;
  fileSize: number;
  uploadedAt: string;
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

interface StudentSubmissionCardProps {
  submission: Submission;
  getToken: () => string | null;
  onDelete: (submissionId: number) => void;
}

const downloadSubmissionFile = async (
  file: SubmissionFile,
  token: string | null
) => {
  if (!token) {
    alert("Authentication token not found");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:8080/education${file.downloadUrl}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error("Không thể tải file");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      a.remove();
    }, 100);
  } catch (err) {
    alert("Không thể tải file đính kèm");
  }
};

const StudentSubmissionCard: React.FC<StudentSubmissionCardProps> = ({
  submission,
  getToken,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow mt-4">
      {/* Header with title and delete button */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <DocumentTextIcon className="h-8 w-8 text-blue-500" />
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{submission.title}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <ClockIcon className="h-4 w-4 mr-1" />
              Nộp lúc: {new Date(submission.submittedAt).toLocaleString("vi-VN")}
            </div>
          </div>
        </div>
        <button
          onClick={() => onDelete(submission.id)}
          className="text-red-600 hover:text-red-800 p-1"
          title="Xóa bài nộp"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Grade and Feedback Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Grade Card */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
              <h4 className="font-semibold text-blue-700">Điểm số</h4>
            </div>
            {submission.grade !== null ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-blue-800">{submission.grade}</span>
                <span className="text-sm text-blue-600">/ 10</span>
              </div>
            ) : (
              <div className="text-gray-500 italic">Chưa có điểm</div>
            )}
          </div>

          {/* Feedback Card */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <ChatBubbleLeftIcon className="h-6 w-6 text-green-600" />
              <h4 className="font-semibold text-green-700">Nhận xét từ giáo viên</h4>
            </div>
            {submission.feedback ? (
              <div className="text-gray-800 whitespace-pre-wrap">{submission.feedback}</div>
            ) : (
              <div className="text-gray-500 italic">Chưa có nhận xét</div>
            )}
          </div>
        </div>

        {/* Submitted Files Section */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <PaperClipIcon className="h-6 w-6 text-gray-600" />
            <h4 className="font-semibold text-gray-700">File đã nộp</h4>
          </div>
          {submission.files.length > 0 ? (
            <ul className="space-y-3">
              {submission.files.map((file) => (
                <li key={file.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <PaperClipIcon className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="font-medium text-gray-800">{file.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {(file.fileSize / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadSubmissionFile(file, getToken())}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Tải xuống</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500 py-4">
              Không có file đính kèm
            </div>
          )}
        </div>

        {/* Submission Content */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircleIcon className="h-5 w-5 text-gray-600" />
            <h4 className="font-semibold text-gray-700">Nội dung bài nộp</h4>
          </div>
          <div className="text-gray-800 whitespace-pre-wrap bg-white p-4 rounded-lg border border-gray-100">
            {submission.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSubmissionCard; 