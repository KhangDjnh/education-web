import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface ExamResultProps {
  submissionId: string;
}

export default function ExamResultPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (submissionId) {
      fetchResult();
    }
  }, [submissionId]);

  const fetchResult = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `http://localhost:8080/education/api/exams/submission/${submissionId}/result`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.code === 1000) {
        setScore(data.result);
      } else {
        setError(data.message || 'Failed to fetch result');
      }
    } catch (err) {
      setError('Failed to fetch result');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải kết quả...</p>
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
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Chúc mừng bạn đã hoàn thành bài thi!
        </h1>
        <div className="mb-8">
          <p className="text-gray-600 mb-2">Điểm số của bạn:</p>
          <p className="text-4xl font-bold text-blue-600">{score?.toFixed(2)}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
} 