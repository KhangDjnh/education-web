import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, PlusIcon, PencilSquareIcon, TrashIcon, CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { classService } from '../../../services/classService';
import type { Assignment, AssignmentFile } from '../../../types/class';
import AssignmentCard from '../../../components/AssignmentCard';

interface AssignmentsTabProps {
  classId: string;
}

interface AssignmentFormData {
  title: string;
  content: string;
  startAt: string;
  endAt: string;
  files: FileList | null;
}

export const AssignmentsTab: React.FC<AssignmentsTabProps> = ({ classId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    content: '',
    startAt: '',
    endAt: '',
    files: null,
  });
  const { getToken } = useAuth();

  useEffect(() => {
    fetchAssignments();
  }, [classId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const data = await classService.getAssignments(classId, token);
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching assignments'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId: number) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await classService.deleteAssignment(assignmentId, token);
      await fetchAssignments();
    } catch (err) {
      console.error('Error deleting assignment:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while deleting assignment'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      content: assignment.content,
      startAt: assignment.startAt,
      endAt: assignment.endAt,
      files: null,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!window.confirm('Are you sure you want to submit this assignment?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('classId', classId);
      formDataToSend.append('startAt', formData.startAt);
      formDataToSend.append('endAt', formData.endAt);
      
      if (formData.files) {
        Array.from(formData.files).forEach(file => {
          formDataToSend.append('files', file);
        });
      }

      if (editingAssignment) {
        await classService.updateAssignment(editingAssignment.id, formDataToSend, token);
      } else {
        await classService.createAssignment(formDataToSend, token);
      }

      setShowForm(false);
      setEditingAssignment(null);
      setFormData({
        title: '',
        content: '',
        startAt: '',
        endAt: '',
        files: null,
      });
      await fetchAssignments();
    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while submitting assignment'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      files: e.target.files
    }));
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-600">Loading assignments...</p>
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
        <h3 className="text-xl font-bold text-gray-800">Assignments</h3>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Assignment
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAssignment(null);
                  setFormData({
                    title: '',
                    content: '',
                    startAt: '',
                    endAt: '',
                    files: null,
                  });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="datetime-local"
                  name="startAt"
                  value={formData.startAt}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="datetime-local"
                  name="endAt"
                  value={formData.endAt}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Files</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="mt-1 block w-full"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAssignment(null);
                    setFormData({
                      title: '',
                      content: '',
                      startAt: '',
                      endAt: '',
                      files: null,
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  {editingAssignment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No assignments yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating an assignment for your class.
          </p>
          <div className="mt-6">
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center mx-auto"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create First Assignment
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              opened={expandedAssignmentId === assignment.id}
              onClick={() => setExpandedAssignmentId(
                expandedAssignmentId === assignment.id ? null : assignment.id
              )}
              getToken={getToken}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </>
  );
}; 