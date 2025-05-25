import React, { useState, useEffect } from 'react';
import { QuestionMarkCircleIcon, PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { classService } from '../../../services/classService';
import type { Question, QuestionFormData } from '../../../types/class';
import QuestionCard from '../../../components/QuestionCard';

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
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [checkedQuestions, setCheckedQuestions] = useState<Set<number>>(new Set());
  const [showExamForm, setShowExamForm] = useState<boolean>(false);
  const [examFormData, setExamFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    numberOfEasyQuestions: '0',
    numberOfMediumQuestions: '0',
    numberOfHardQuestions: '0',
    numberOfVeryHardQuestions: '0',
  });
  const { getToken } = useAuth();
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

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
      setQuestions(data.content || []);
      setTotalPages(data.totalPages || 1);
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

  const fetchQuestionDetails = async (questionId: number) => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`http://localhost:8080/education/api/questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.code === 1000) {
        setSelectedQuestion(data.result);
      } else {
        throw new Error(data.message || 'Failed to fetch question details');
      }
    } catch (err) {
      console.error('Error fetching question details:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching question details'
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
          keyword: searchTerm,
          chapter: undefined,
          level: undefined,
        },
        token
      );
      setQuestions(data.content || []);
      setTotalPages(data.totalPages || 1);
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

  const handleDelete = async (questionId: number) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`http://localhost:8080/education/api/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.code !== 1000) {
        throw new Error(data.message || 'Failed to delete question');
      }
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

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!window.confirm('Are you sure you want to update this question?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`http://localhost:8080/education/api/questions/${editingQuestion?.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          question: editingQuestion?.question,
          optionA: editingQuestion?.optionA,
          optionB: editingQuestion?.optionB,
          optionC: editingQuestion?.optionC,
          optionD: editingQuestion?.optionD,
          answer: editingQuestion?.answer,
          level: editingQuestion?.level,
        }),
      });
      const data = await response.json();
      if (data.code !== 1000) {
        throw new Error(data.message || 'Failed to update question');
      }
      setShowForm(false);
      setEditingQuestion(null);
      await fetchQuestions();
    } catch (err) {
      console.error('Error updating question:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while updating question'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async () => {
    if (!window.confirm('Are you sure you want to create an exam with the selected questions?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('http://localhost:8080/education/api/exams/choose', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          title: examFormData.title,
          description: examFormData.description,
          questionIds: Array.from(checkedQuestions),
          startTime: examFormData.startTime,
          endTime: examFormData.endTime,
        }),
      });
      const data = await response.json();
      if (data.code !== 1000) {
        throw new Error(data.message || 'Failed to create exam');
      }
      setShowExamForm(false);
      setCheckedQuestions(new Set());
      setExamFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        numberOfEasyQuestions: '0',
        numberOfMediumQuestions: '0',
        numberOfHardQuestions: '0',
        numberOfVeryHardQuestions: '0',
      });
      setShowSuccess('Exam created successfully!');
      setTimeout(() => setShowSuccess(null), 3000);
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

  const handleCreateRandomExam = async () => {
    if (!window.confirm('Are you sure you want to create a random exam?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('http://localhost:8080/education/api/exams/random', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          title: examFormData.title,
          description: examFormData.description,
          numberOfEasyQuestions: examFormData.numberOfEasyQuestions,
          numberOfMediumQuestions: examFormData.numberOfMediumQuestions,
          numberOfHardQuestions: examFormData.numberOfHardQuestions,
          numberOfVeryHardQuestions: examFormData.numberOfVeryHardQuestions,
          startTime: examFormData.startTime,
          endTime: examFormData.endTime,
        }),
      });
      const data = await response.json();
      if (data.code !== 1000) {
        throw new Error(data.message || 'Failed to create random exam');
      }
      setShowExamForm(false);
      setExamFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        numberOfEasyQuestions: '0',
        numberOfMediumQuestions: '0',
        numberOfHardQuestions: '0',
        numberOfVeryHardQuestions: '0',
      });
      setShowSuccess('Random exam created successfully!');
      setTimeout(() => setShowSuccess(null), 3000);
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

  const handleCheckQuestion = (questionId: number, checked: boolean) => {
    const newCheckedQuestions = new Set(checkedQuestions);
    if (checked) {
      newCheckedQuestions.add(questionId);
    } else {
      newCheckedQuestions.delete(questionId);
    }
    setCheckedQuestions(newCheckedQuestions);
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
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <span>{showSuccess}</span>
        </div>
      )}
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
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
          >
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
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center mx-auto"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add First Question
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              checked={checkedQuestions.has(question.id)}
              onCheck={(checked) => handleCheckQuestion(question.id, checked)}
              onClick={() => fetchQuestionDetails(question.id)}
              selected={selectedQuestion?.id === question.id}
            />
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

          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => setShowExamForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium"
            >
              Create Exam
            </button>
            <button
              onClick={() => setShowExamForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-sm font-medium"
            >
              Create Random Exam
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingQuestion ? 'Edit Question' : 'Add Question'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingQuestion(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Question</label>
                <textarea
                  value={editingQuestion?.question || ''}
                  onChange={(e) => setEditingQuestion(prev => prev ? {...prev, question: e.target.value} : null)}
                  required
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Option A</label>
                <input
                  type="text"
                  value={editingQuestion?.optionA || ''}
                  onChange={(e) => setEditingQuestion(prev => prev ? {...prev, optionA: e.target.value} : null)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Option B</label>
                <input
                  type="text"
                  value={editingQuestion?.optionB || ''}
                  onChange={(e) => setEditingQuestion(prev => prev ? {...prev, optionB: e.target.value} : null)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Option C</label>
                <input
                  type="text"
                  value={editingQuestion?.optionC || ''}
                  onChange={(e) => setEditingQuestion(prev => prev ? {...prev, optionC: e.target.value} : null)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Option D</label>
                <input
                  type="text"
                  value={editingQuestion?.optionD || ''}
                  onChange={(e) => setEditingQuestion(prev => prev ? {...prev, optionD: e.target.value} : null)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Answer</label>
                <select
                  value={editingQuestion?.answer || ''}
                  onChange={(e) => setEditingQuestion(prev => prev ? {...prev, answer: e.target.value} : null)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select answer</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Level</label>
                <select
                  value={editingQuestion?.level || ''}
                  onChange={(e) => setEditingQuestion(prev => prev ? {...prev, level: e.target.value as Question['level']} : null)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select level</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                  <option value="VERY_HARD">Very Hard</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingQuestion(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  {editingQuestion ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExamForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Create Exam
              </h3>
              <button
                onClick={() => {
                  setShowExamForm(false);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={examFormData.title}
                  onChange={(e) => setExamFormData(prev => ({...prev, title: e.target.value}))}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={examFormData.description}
                  onChange={(e) => setExamFormData(prev => ({...prev, description: e.target.value}))}
                  required
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="datetime-local"
                  value={examFormData.startTime}
                  onChange={(e) => setExamFormData(prev => ({...prev, startTime: e.target.value}))}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="datetime-local"
                  value={examFormData.endTime}
                  onChange={(e) => setExamFormData(prev => ({...prev, endTime: e.target.value}))}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowExamForm(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateExam}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Create Exam
                </button>
                <button
                  type="button"
                  onClick={handleCreateRandomExam}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Create Random Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}; 