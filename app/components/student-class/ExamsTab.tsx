import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import ExamQuestionCard from './ExamQuestionCard';

interface Exam {
  id: number;
  title: string;
  description: string;
  classId: number;
  startTime: string;
  endTime: string;
  createdAt: string;
}

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

interface ExamsTabProps {
  classId: number;
}

export default function ExamsTab({ classId }: ExamsTabProps) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedExam, setExpandedExam] = useState<number | null>(null);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [submission, setSubmission] = useState<ExamSubmission | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  useEffect(() => {
    fetchExams();
  }, [classId]);

  const fetchExams = async () => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8080/education/api/exams/class/${classId}/student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.code === 1000) {
        setExams(data.result);
      } else {
        setError(data.message || 'Failed to fetch exams');
      }
    } catch (err) {
      setError('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (exam: Exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (now < startTime) {
      alert('Kỳ thi chưa bắt đầu');
      return;
    }
    if (now > endTime) {
      alert('Kỳ thi đã kết thúc');
      return;
    }

    setSelectedExam(exam);
    setShowConfirmModal(true);
  };

  const confirmStartExam = () => {
    if (selectedExam) {
      navigate(`/exam/${selectedExam.id}`);
    }
    setShowConfirmModal(false);
  };

  const fetchQuestions = async (examId: number) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8080/education/api/exams/${examId}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.code === 1000) {
        setQuestions(data.result.content);
        setTotalPages(data.result.totalPages);
      }
    } catch (err) {
      setError('Failed to fetch questions');
    }
  };

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
        await fetchExamResult();
      }
    } catch (err) {
      setError('Failed to submit exam');
    }
    setShowSubmitModal(false);
  };

  const fetchExamResult = async () => {
    if (!submission) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8080/education/api/exams/${submission.submissionId}/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.code === 1000) {
        setExamResult(data.result);
      }
    } catch (err) {
      setError('Failed to fetch exam results');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  if (submission && questions.length > 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">{submission.examTitle}</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-600">Thời gian bắt đầu:</p>
              <p className="font-medium">{new Date(submission.startTime).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Thời gian kết thúc:</p>
              <p className="font-medium">{new Date(submission.endTime).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <ExamQuestionCard
              key={question.questionId}
              question={question}
              questionNumber={index + 1}
              onSubmitAnswer={handleSubmitAnswer}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
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
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Nộp bài
          </button>
        </div>

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-4">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-2">{exam.title}</h3>
                  <p className="text-gray-600 mb-4">{exam.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Thời gian bắt đầu:</p>
                      <p className="font-medium">{new Date(exam.startTime).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Thời gian kết thúc:</p>
                      <p className="font-medium">{new Date(exam.endTime).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedExam(expandedExam === exam.id ? null : exam.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedExam === exam.id ? (
                    <ChevronUpIcon className="h-6 w-6" />
                  ) : (
                    <ChevronDownIcon className="h-6 w-6" />
                  )}
                </button>
              </div>

              {expandedExam === exam.id && (
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleStartExam(exam)}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Bắt đầu làm bài
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Start Exam Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Xác nhận bắt đầu thi</h3>
            <p className="mb-6">Bạn có chắc chắn muốn bắt đầu làm bài thi này?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={confirmStartExam}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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