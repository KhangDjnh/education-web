import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AcademicCapIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface Exam {
  examId: number;
  name: string;
}

interface StudentScore {
  studentId: number;
  fullName: string;
  dob: string;
  scores: { [key: string]: number };
  averageScore: number;
}

interface ScoreSummary {
  classId: number;
  exams: Exam[];
  students: StudentScore[];
}

interface GradeTabProps {
  classId: number;
}

export default function GradeTab({ classId }: GradeTabProps) {
  const { getToken } = useAuth();
  const [scoreSummary, setScoreSummary] = useState<ScoreSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScoreSummary();
  }, [classId]);

  const fetchScoreSummary = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `http://localhost:8080/education/api/scores/summary?classId=${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.code === 1000) {
        setScoreSummary(data.result);
      } else {
        setError(data.message || 'Failed to fetch score summary');
      }
    } catch (err) {
      setError('Failed to fetch score summary');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600 font-medium';
    if (score >= 6.5) return 'text-blue-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">{error}</div>
        <button
          onClick={fetchScoreSummary}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!scoreSummary) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AcademicCapIcon className="h-8 w-8 text-white" />
            <h2 className="text-xl font-bold text-white">Bảng điểm lớp học</h2>
          </div>
          <div className="flex items-center space-x-2 text-white">
            <ChartBarIcon className="h-5 w-5" />
            <span className="text-sm">Tổng số bài kiểm tra: {scoreSummary.exams.length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                Học sinh
              </th>
              {scoreSummary.exams.map((exam) => (
                <th
                  key={exam.examId}
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {exam.name}
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                Điểm trung bình
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scoreSummary.students.map((student) => (
              <tr key={student.studentId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(student.dob).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </td>
                {scoreSummary.exams.map((exam) => (
                  <td key={exam.examId} className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`text-sm ${getScoreColor(student.scores[exam.examId] || 0)}`}>
                      {student.scores[exam.examId]?.toFixed(2) || '-'}
                    </span>
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-center bg-blue-50">
                  <span className={`text-sm font-medium ${getScoreColor(student.averageScore)}`}>
                    {student.averageScore.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-green-600"></span>
            <span>Giỏi (≥ 8.5)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            <span>Khá (≥ 6.5)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-yellow-600"></span>
            <span>Trung bình (≥ 5.0)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-600"></span>
            <span>Yếu (&lt; 5.0)</span>
          </div>
        </div>s
      </div>
    </div>
  );
} 