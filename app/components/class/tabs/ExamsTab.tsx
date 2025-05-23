import React, { useState, useEffect } from 'react';
import { AcademicCapIcon, PlusIcon, PencilSquareIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { classService } from '../../../services/classService';
import type { Exam } from '../../../types/class';

interface ExamsTabProps {
  classId: string;
}

export const ExamsTab: React.FC<ExamsTabProps> = ({ classId }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchExams();
  }, [classId]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const data = await classService.getExams(classId, token);
      setExams(data);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching exams'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Implement delete logic here
      console.log('Deleting exam:', examId);
      await fetchExams();
    } catch (err) {
      console.error('Error deleting exam:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while deleting exam'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (now < startTime) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <ClockIcon className="mr-1 h-4 w-4" />
          Upcoming
        </span>
      );
    } else if (now >= startTime && now <= endTime) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <ClockIcon className="mr-1 h-4 w-4" />
          In Progress
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <ClockIcon className="mr-1 h-4 w-4" />
          Completed
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-600">Loading exams...</p>
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
        <h3 className="text-xl font-bold text-gray-800">Exams</h3>
        <div className="flex space-x-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Exam
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Random Exam
          </button>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No exams yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating an exam for your class.
          </p>
          <div className="mt-6">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center mx-auto">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create First Exam
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-medium text-gray-900">
                      {exam.title}
                    </h4>
                    {getExamStatus(exam)}
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    {exam.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span>Start: {formatDate(exam.startTime)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span>End: {formatDate(exam.endTime)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span>Created: {formatDate(exam.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}; 