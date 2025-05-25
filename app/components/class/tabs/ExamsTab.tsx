import React, { useState, useEffect } from 'react';
import { AcademicCapIcon, PlusIcon, PencilSquareIcon, TrashIcon, ClockIcon, PlayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { classService } from '../../../services/classService';
import type { Exam } from '../../../types/class';
import ExamCard from '../../ExamCard';
import { ExamForm } from '../ExamForm';
import { ExamQuestions } from '../ExamQuestions';

interface ExamsTabProps {
  classId: string;
}

export const ExamsTab: React.FC<ExamsTabProps> = ({ classId }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRandomForm, setShowRandomForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
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

  const handleCreateExam = async (data: {
    classId: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await classService.createExam(data, token);
      setShowCreateForm(false);
      await fetchExams();
    } catch (err) {
      console.error('Error creating exam:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while creating exam'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRandomExam = async (data: {
    classId: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    numberOfEasyQuestions: string;
    numberOfMediumQuestions: string;
    numberOfHardQuestions: string;
    numberOfVeryHardQuestions: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await classService.createRandomExam(data, token);
      setShowRandomForm(false);
      await fetchExams();
    } catch (err) {
      console.error('Error creating random exam:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while creating random exam'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExam = async (data: {
    classId: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
  }) => {
    if (!selectedExam) return;

    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await classService.updateExam(selectedExam.id, data, token);
      setShowEditForm(false);
      await fetchExams();
    } catch (err) {
      console.error('Error updating exam:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while updating exam'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId: number) => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await classService.startExam(examId, token);
      await fetchExams();
    } catch (err) {
      console.error('Error starting exam:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while starting exam'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId: number) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await classService.deleteExam(examId, token);
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
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Exam
          </button>
          <button
            onClick={() => setShowRandomForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
          >
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
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center mx-auto"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create First Exam
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div key={exam.id} className="relative">
              <ExamCard
                exam={exam}
                selected={selectedExam?.id === exam.id}
                onClick={() => setSelectedExam(exam)}
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedExam(exam);
                    setShowQuestions(true);
                  }}
                  className="text-purple-600 hover:text-purple-900 bg-white rounded-full p-1 shadow-sm"
                  title="View Questions"
                >
                  <DocumentTextIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleStartExam(exam.id)}
                  className="text-green-600 hover:text-green-900 bg-white rounded-full p-1 shadow-sm"
                  title="Start Exam"
                >
                  <PlayIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedExam(exam);
                    setShowEditForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-900 bg-white rounded-full p-1 shadow-sm"
                  title="Edit"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(exam.id)}
                  className="text-red-600 hover:text-red-900 bg-white rounded-full p-1 shadow-sm"
                  title="Delete"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateForm && (
        <ExamForm
          onSubmit={handleCreateExam}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {showRandomForm && (
        <ExamForm
          onSubmit={handleCreateRandomExam}
          onClose={() => setShowRandomForm(false)}
          isRandom
        />
      )}

      {showEditForm && selectedExam && (
        <ExamForm
          exam={selectedExam}
          onSubmit={handleUpdateExam}
          onClose={() => setShowEditForm(false)}
        />
      )}

      {showQuestions && selectedExam && (
        <ExamQuestions
          examId={selectedExam.id}
          onClose={() => setShowQuestions(false)}
        />
      )}
    </>
  );
}; 