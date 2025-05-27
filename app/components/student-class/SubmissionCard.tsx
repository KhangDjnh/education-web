import React, { useState } from 'react';
import { PaperClipIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon, ArrowDownTrayIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { classService } from '../../services/classService';

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

interface SubmissionCardProps {
  submission: Submission;
  opened: boolean;
  onClick: () => void;
  getToken: () => string | null;
  onGradeSubmitted: () => void;
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

export default function SubmissionCard({
  submission,
  opened,
  onClick,
  getToken,
  onGradeSubmitted,
}: SubmissionCardProps) {
  const { user } = useAuth(); // Assuming user includes role

  const [showGradeForm, setShowGradeForm] = useState(false);
  const [grade, setGrade] = useState<number | ''>('');
  const [feedback, setFeedback] = useState<string>('');
  const [submittingGrade, setSubmittingGrade] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (grade === '' || grade < 0 || grade > 10) {
      setGradeError("Điểm không hợp lệ (0-10).");
      return;
    }

    setSubmittingGrade(true);
    setGradeError(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Authentication token not found");

      const res = await classService.submitGrade(
        submission.id,
        grade as number,
        feedback,
        token
      );

      if (res.code === 1000) {
        alert("Chấm điểm thành công!");
        setShowGradeForm(false);
        setGrade('');
        setFeedback('');
        onGradeSubmitted(); // Refresh submissions list
      } else {
        throw new Error(res.message || "Failed to submit grade");
      }
    } catch (err) {
      setGradeError(err instanceof Error ? err.message : "Có lỗi xảy ra khi chấm điểm.");
    } finally {
      setSubmittingGrade(false);
    }
  };

  return (
    <div
      className={`rounded-xl shadow-md border transition-all cursor-pointer bg-white ${
        opened ? "ring-2 ring-blue-400" : "hover:shadow-lg"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <AcademicCapIcon className="h-8 w-8 text-green-500" />
          <div>
            <div className="font-bold text-lg text-gray-800">{submission.title}</div>
            {/* Assuming submission object has studentName or similar */}
            <div className="text-sm text-gray-600">Nộp bởi: Học sinh {submission.studentId}</div> 
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center text-xs text-gray-500">
                <ClockIcon className="h-4 w-4 mr-1" />
                {new Date(submission.submittedAt).toLocaleString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {opened ? (
            <ChevronUpIcon className="h-6 w-6 text-blue-400" />
          ) : (
            <ChevronDownIcon className="h-6 w-6 text-gray-400" />
          )}
        </div>
      </div>
      {opened && (
        <div className="px-6 pb-6 pt-2 border-t bg-blue-50 rounded-b-xl">
          <div className="mb-4">
            <span className="font-semibold text-gray-700">Nội dung bài nộp:</span>
            <div className="text-gray-800 mt-1">{submission.content}</div>
          </div>

          <div className="mb-4">
            <span className="font-semibold text-gray-700">File đính kèm:</span>
            {submission.files.length === 0 ? (
              <span className="ml-2 text-gray-400">Không có file</span>
            ) : (
              <ul className="mt-2 space-y-2">
                {submission.files.map((file, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <PaperClipIcon className="h-5 w-5 text-blue-400" />
                    <button
                      type="button"
                      className="text-blue-700 hover:underline font-medium flex items-center italic"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (file.downloadUrl) {
                          await downloadSubmissionFile(file, getToken());
                        } else {
                           alert("Download URL not available");
                        }
                      }}
                    >
                      {file.fileName}
                      <ArrowDownTrayIcon className="h-4 w-4 ml-1" />
                    </button>
                    <span className="text-xs text-gray-400 ml-2">
                      ({(file.fileSize / 1024).toFixed(1)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {submission.grade !== null && (
            <div className="mb-4">
              <span className="font-semibold text-gray-700">Điểm:</span>
              <span className={`ml-2 text-lg font-bold ${submission.grade >= 5 ? 'text-green-600' : 'text-red-600'}`}>
                {submission.grade.toFixed(2)}
              </span>
            </div>
          )}

          {submission.feedback && (
             <div className="mb-4">
               <span className="font-semibold text-gray-700">Nhận xét:</span>
               <div className="text-gray-800 mt-1">{submission.feedback}</div>
             </div>
          )}

          {showGradeForm && (
            <form onSubmit={handleGradeSubmit} className="mt-4 space-y-4 p-4 bg-white rounded-lg shadow">
              <h4 className="text-lg font-semibold text-gray-900">Nhập điểm và nhận xét</h4>
              {gradeError && (
                 <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                   {gradeError}
                 </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Điểm</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={grade}
                  onChange={(e) => setGrade(parseFloat(e.target.value))}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nhận xét (Tùy chọn)</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                 <button
                   type="button"
                   onClick={(e) => { e.stopPropagation(); setShowGradeForm(false); setGradeError(null); }}
                   className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                 >
                   Hủy
                 </button>
                 <button
                   type="submit"
                   disabled={submittingGrade}
                   className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                 >
                   {submittingGrade ? (
                     <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                   ) : (
                     'Lưu điểm'
                   )}
                 </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
} 