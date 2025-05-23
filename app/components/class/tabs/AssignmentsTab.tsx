import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, PlusIcon, PencilSquareIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { classService } from '../../../services/classService';
import type { Assignment } from '../../../types/class';

interface AssignmentsTabProps {
  classId: string;
}

interface FileObject {
  fileName: string;
  fileType: string;
  filePath: string;
  downloadUrl: string;
  fileSize: number;
  uploadedAt: string;
}

export const AssignmentsTab: React.FC<AssignmentsTabProps> = ({ classId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await classService.deleteAssignment(assignmentId, token);
      // Refresh the assignments list after deleting
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
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Assignment
        </button>
      </div>

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
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center mx-auto">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create First Assignment
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {assignment.title}
                  </h4>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {assignment.content}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>Start: {formatDate(assignment.startAt)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>Due: {formatDate(assignment.endAt)}</span>
                    </div>
                  </div>
                  {assignment.files && assignment.files.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Attached files:</p>
                      <div className="flex flex-wrap gap-2">
                        {assignment.files.map((file, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {typeof file === 'string' ? file : (file as FileObject).fileName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(assignment.id)}
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