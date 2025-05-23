import React, { useState, useEffect } from 'react';
import { CalendarIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { classService } from '../../../services/classService';
import type { Student, AttendanceRecord, AttendanceStatus } from '../../../types/class';

interface AttendanceTabProps {
  classId: string;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ classId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  useEffect(() => {
    if (students.length > 0) {
      fetchAttendanceRecords();
    }
  }, [selectedDate, students]);

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

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Implement fetch attendance records logic here
      // For now, we'll create empty records for each student
      const records: AttendanceRecord[] = students.map(student => ({
        studentId: student.id,
        status: 'PRESENT' as AttendanceStatus
      }));
      setAttendanceRecords(records);
    } catch (err) {
      console.error('Error fetching attendance records:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching attendance records'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.studentId === studentId ? { ...record, status } : record
      )
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await classService.submitAttendance(classId, selectedDate, attendanceRecords, token);
      // Show success message or handle response
    } catch (err) {
      console.error('Error submitting attendance:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while submitting attendance'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'ABSENT':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'LATE':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-600">Loading attendance data...</p>
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
        <h3 className="text-xl font-bold text-gray-800">Attendance Management</h3>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Submit Attendance
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => {
              const record = attendanceRecords.find(
                (r) => r.studentId === student.id
              );
              const status = record?.status || 'PRESENT';

              return (
                <tr key={student.id} className="hover:bg-gray-50">
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
                        <div className="text-sm text-gray-500">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(status)}
                      <span className="ml-2 text-sm text-gray-900">
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(student.id, 'PRESENT')}
                        className={`px-3 py-1 rounded ${
                          status === 'PRESENT'
                            ? 'bg-green-100 text-green-800'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'ABSENT')}
                        className={`px-3 py-1 rounded ${
                          status === 'ABSENT'
                            ? 'bg-red-100 text-red-800'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'LATE')}
                        className={`px-3 py-1 rounded ${
                          status === 'LATE'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'text-yellow-600 hover:bg-yellow-50'
                        }`}
                      >
                        Late
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}; 