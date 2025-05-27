import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { classService } from '../services/classService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import SubmissionCard from '../components/student-class/SubmissionCard';

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

export default function AssignmentGradingPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<number | null>(null);

  useEffect(() => {
    if (assignmentId) {
      fetchSubmissions();
    }
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) throw new Error("Authentication token not found");

      const data = await classService.getAssignmentSubmissions(assignmentId!, token);
      if (data.code === 1000) {
        setSubmissions(data.result);
      } else {
        setError(data.message || "Failed to fetch submissions");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching submissions");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">{error}</div>
        <button
          onClick={fetchSubmissions}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Quay lại
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bài nộp ({submissions.length})</h1>
      
      {submissions.length === 0 ? (
        <div className="text-center py-8 bg-gray-100 rounded-lg">
          <p className="text-gray-600">Chưa có bài nộp nào cho bài tập này.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              opened={expandedSubmissionId === submission.id}
              onClick={() => setExpandedSubmissionId(
                expandedSubmissionId === submission.id ? null : submission.id
              )}
              getToken={getToken}
              onGradeSubmitted={fetchSubmissions} // Refresh submissions after grading
            />
          ))}
        </div>
      )}
    </div>
  );
} 