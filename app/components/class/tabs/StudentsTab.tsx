import React, { useState, useEffect } from 'react';
import { UserGroupIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { classService } from '../../../services/classService';
import type { Student } from '../../../types/class';

interface StudentsTabProps {
  classId: string;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({ classId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showConfirmAddModal, setShowConfirmAddModal] = useState<boolean>(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState<boolean>(false);
  const [newStudentId, setNewStudentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      setStudentError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const data = await classService.getStudents(classId, token);
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudentError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching students'
      );
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAddStudent = async () => {
    try {
      setIsSubmitting(true);
      setStudentError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await classService.addStudent(classId, newStudentId, token);
      setShowConfirmAddModal(false);
      setShowAddModal(false);
      setNewStudentId('');
      await fetchStudents(); // Refresh the student list
    } catch (err) {
      console.error('Error adding student:', err);
      setStudentError(
        err instanceof Error
          ? err.message
          : 'An error occurred while adding student'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      setLoadingStudents(true);
      setStudentError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await classService.deleteStudent(classId, studentToDelete.id.toString(), token);
      setShowConfirmDeleteModal(false);
      setStudentToDelete(null);
      await fetchStudents(); // Refresh the student list
    } catch (err) {
      console.error('Error deleting student:', err);
      setStudentError(
        err instanceof Error
          ? err.message
          : 'An error occurred while deleting student'
      );
    } finally {
      setLoadingStudents(false);
    }
  };

  // Format date of birth
  const formatDOB = (dobString: string) => {
    return new Date(dobString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter students based on search term
  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.username.toLowerCase().includes(searchLower)
    );
  });

  if (loadingStudents) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  if (studentError) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{studentError}</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          Students in this class
        </h3>
        <div className="flex space-x-2">
          <div className="relative text-black">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Add Student
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No students yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding students to this class.
          </p>
          <div className="mt-6">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Add First Student
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Student Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Username
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date of Birth
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-800 font-medium text-sm">
                          {student.firstName[0]}
                          {student.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDOB(student.dob)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => {
                          setStudentToDelete(student);
                          setShowConfirmDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Student to Class</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                Student ID
              </label>
              <input
                type="text"
                id="studentId"
                value={newStudentId}
                onChange={(e) => setNewStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter student ID"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowConfirmAddModal(true);
                }}
                disabled={isSubmitting || !newStudentId}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Add Student Modal */}
      {showConfirmAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Add Student</h3>
              <button
                onClick={() => setShowConfirmAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to add student with ID {newStudentId} to this class?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Confirm Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Student Modal */}
      {showConfirmDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Delete Student</h3>
              <button
                onClick={() => {
                  setShowConfirmDeleteModal(false);
                  setStudentToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove {studentToDelete.firstName} {studentToDelete.lastName} from this class?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmDeleteModal(false);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                disabled={loadingStudents}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingStudents ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 