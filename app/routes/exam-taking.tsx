import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import ExamQuestionCard from '../components/student-class/ExamQuestionCard';

interface Question {
  questionId: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface ExamSubmission {
  submissionId: number;
  examTitle: string;
  startTime: string;
  endTime: string;
}

interface ExamResult {
  // Add result interface when needed
}

export default function ExamTakingPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10); // Số câu hỏi mỗi trang
  const [submission, setSubmission] = useState<ExamSubmission | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (examId) {
      startExam();
    }
  }, [examId]);

  useEffect(() => {
    if (submission) {
      const timer = setInterval(updateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [submission]);

  const updateTimeLeft = () => {
    if (!submission) return;

    const now = new Date();
    const endTime = new Date(submission.endTime);
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeLeft('Hết thời gian');
      handleSubmitExam();
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const startExam = async () => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8080/education/api/exams/${examId}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.code === 1000) {
        setSubmission(data.result);
        await fetchQuestions();
      }
    } catch (err) {
      setError('Failed to start exam');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `http://localhost:8080/education/api/exams/${examId}/questions?page=${currentPage}&size=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.code === 1000) {
        setQuestions(data.result.content);
        setTotalPages(data.result.totalPages);
      }
    } catch (err) {
      setError('Failed to fetch questions');
    }
  };

  // Thêm useEffect để tải câu hỏi khi chuyển trang
  useEffect(() => {
    if (submission) {
      fetchQuestions();
    }
  }, [currentPage, submission]);

  const handleSubmitAnswer = async (questionId: number, answerOption: string) => {
    if (!submission) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8080/education/api/exam-submissions/${submission.submissionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: questionId.toString(),
          answerOption
        })
      });
      const data = await response.json();
      if (data.code === 1000) {
        // Update UI to show answer submitted
      }
    } catch (err) {
      setError('Failed to submit answer');
    }
  };

  const handleSubmitExam = async () => {
    if (!submission) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8080/education/api/exams/${submission.submissionId}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.code === 1000) {
        navigate(`/exam-result/${submission.submissionId}`);
      }
    } catch (err) {
      setError('Failed to submit exam');
    }
    setShowSubmitModal(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang chuẩn bị bài thi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{submission?.examTitle}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-600">
                <ClockIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">{timeLeft}</span>
              </div>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {questions.map((question, index) => (
            <ExamQuestionCard
              key={question.questionId}
              question={question}
              questionNumber={currentPage * pageSize + index + 1}
              onSubmitAnswer={handleSubmitAnswer}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={`px-3 py-1 rounded ${
                  currentPage === i
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Xác nhận nộp bài</h3>
            <p className="mb-6">Bạn có chắc chắn muốn nộp bài thi này?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitExam}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 