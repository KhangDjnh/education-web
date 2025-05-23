import React, { useState, useEffect } from 'react';
import { ChartBarIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { classService } from '../../../services/classService';
import type { Student } from '../../../types/class';

interface GradesTabProps {
  classId: string;
}

interface Grade {
  studentId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  score: number;
  maxScore: number;
  submittedAt: string;
}

export const GradesTab: React.FC<GradesTabProps> = ({ classId }) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  useEffect(() => {
    if (students.length > 0) {
      fetchGrades();
    }
  }, [students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const data = await classService.getStudents(classId, token);
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching students'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Implement fetch grades logic here
      // For now, we'll create dummy data
      const dummyGrades: Grade[] = students.map((student) => ({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        examId: '1',
        examTitle: 'Midterm Exam',
        score: Math.floor(Math.random() * 100),
        maxScore: 100,
        submittedAt: new Date().toISOString(),
      }));
      setGrades(dummyGrades);
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching grades'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Implement export logic here
    console.log('Exporting grades...');
  };

  const handleImport = () => {
    // Implement import logic here
    console.log('Importing grades...');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-600">Loading grades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Grades</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export Grades
          </button>
          <button
            onClick={handleImport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
          >
            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
            Import Grades
          </button>
        </div>
      </div>

      {grades.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No grades yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Grades will appear here after students complete their exams.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Student
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Exam
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Score
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grades.map((grade) => (
                <tr key={`${grade.studentId}-${grade.examId}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-800 font-medium text-sm">
                          {grade.studentName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {grade.studentName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{grade.examTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-medium ${getGradeColor(
                        grade.score,
                        grade.maxScore
                      )}`}
                    >
                      {grade.score} / {grade.maxScore}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(grade.submittedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}; 