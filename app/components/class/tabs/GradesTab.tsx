import React, { useState, useEffect } from 'react';
import { ChartBarIcon, ArrowDownTrayIcon, FunnelIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { classService } from '../../../services/classService';

interface GradesTabProps {
  classId: string;
}

interface Exam {
  examId: number;
  name: string;
}

interface StudentScore {
  studentId: number;
  fullName: string;
  dob: string;
  scores: Record<string, number>;
  averageScore: number;
}

interface ScoreSummary {
  classId: number;
  exams: Exam[];
  students: StudentScore[];
}

interface ExamScore {
  studentId: number;
  classId: number;
  score: number;
  examId: number;
}

export const GradesTab: React.FC<GradesTabProps> = ({ classId }) => {
  const [scoreSummary, setScoreSummary] = useState<ScoreSummary | null>(null);
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [examScores, setExamScores] = useState<ExamScore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchScoreSummary();
  }, [classId]);

  useEffect(() => {
    if (selectedExam) {
      fetchExamScores(selectedExam);
    }
  }, [selectedExam]);

  const fetchScoreSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const data = await classService.getScoreSummary(classId, token);
      setScoreSummary(data);
    } catch (err) {
      console.error('Error fetching score summary:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching score summary'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchExamScores = async (examId: number) => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const data = await classService.getClassExamScores(classId, examId, token);
      setExamScores(data);
    } catch (err) {
      console.error('Error fetching exam scores:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching exam scores'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const blob = await classService.exportClassScores(classId, token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `class-${classId}-scores.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting scores:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while exporting scores'
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 8) return 'text-blue-600';
    if (score >= 7) return 'text-yellow-600';
    if (score >= 6) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-white rounded-xl shadow-sm">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading grades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-1 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!scoreSummary || scoreSummary.students.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
          <AcademicCapIcon className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Grades Available</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Grades will appear here once students complete their exams. Check back later for updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Class Grades</h2>
            <p className="mt-1 text-sm text-gray-500">
              View and manage student grades across all exams
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setSelectedExam(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors duration-200 ${
                selectedExam === null
                  ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              All Exams
            </button>
            <button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm transition-colors duration-200"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export Grades
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {scoreSummary.exams.map((exam) => (
              <button
                key={exam.examId}
                onClick={() => setSelectedExam(exam.examId)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  selectedExam === exam.examId
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {exam.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10"
                  >
                    Student
                  </th>
                  {selectedExam === null ? (
                    <>
                      {scoreSummary.exams.map((exam) => (
                        <th
                          key={exam.examId}
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        >
                          {exam.name}
                        </th>
                      ))}
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Average
                      </th>
                    </>
                  ) : (
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      Score
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scoreSummary.students.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-800 font-medium text-sm">
                            {student.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(student.dob)}
                          </div>
                        </div>
                      </div>
                    </td>
                    {selectedExam === null ? (
                      <>
                        {scoreSummary.exams.map((exam) => (
                          <td key={exam.examId} className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`text-sm font-medium ${getScoreColor(
                                student.scores[exam.examId] || 0
                              )}`}
                            >
                              {student.scores[exam.examId]?.toFixed(2) || '-'}
                            </div>
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm font-medium ${getScoreColor(
                              student.averageScore
                            )}`}
                          >
                            {student.averageScore.toFixed(2)}
                          </div>
                        </td>
                      </>
                    ) : (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-medium ${getScoreColor(
                            student.scores[selectedExam] || 0
                          )}`}
                        >
                          {student.scores[selectedExam]?.toFixed(2) || '-'}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}; 