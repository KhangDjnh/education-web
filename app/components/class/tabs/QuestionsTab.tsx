import React, { useState, useEffect } from 'react';
import { QuestionMarkCircleIcon, PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { classService } from '../../../services/classService';
import type { Question } from '../../../types/class';

interface QuestionsTabProps {
  classId: string;
}

export const QuestionsTab: React.FC<QuestionsTabProps> = ({ classId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchQuestions();
  }, [classId, currentPage]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const data = await classService.getQuestions(classId, currentPage, token);
      setQuestions(data.questions);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching questions'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const data = await classService.searchQuestions(
        classId,
        {
          searchTerm,
          chapter: '',
          level: '',
        },
        token
      );
      setQuestions(data);
    } catch (err) {
      console.error('Error searching questions:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while searching questions'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Implement delete logic here
      console.log('Deleting question:', questionId);
      await fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while deleting question'
      );
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      EASY: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HARD: 'bg-red-100 text-red-800',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          colors[level as keyof typeof colors]
        }`}
      >
        {level}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-600">Loading questions...</p>
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
        <h3 className="text-xl font-bold text-gray-800">Question Bank</h3>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Search
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Question
          </button>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No questions yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding questions to your question bank.
          </p>
          <div className="mt-6">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center mx-auto">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add First Question
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <div
              key={question.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-medium text-gray-900">
                      {question.question}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {getLevelBadge(question.level)}
                      <span className="text-sm text-gray-500">
                        Chapter {question.chapter}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 mr-2">A:</span>
                      <span className="text-gray-600">{question.optionA}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 mr-2">B:</span>
                      <span className="text-gray-600">{question.optionB}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 mr-2">C:</span>
                      <span className="text-gray-600">{question.optionC}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 mr-2">D:</span>
                      <span className="text-gray-600">{question.optionD}</span>
                    </div>
                    <div className="flex items-center text-sm mt-2">
                      <span className="font-medium text-green-700 mr-2">
                        Answer:
                      </span>
                      <span className="text-green-600">{question.answer}</span>
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
                    onClick={() => handleDelete(question.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
    </>
  );
}; 