import React from 'react';
import { CalendarIcon, UserIcon } from '@heroicons/react/24/outline';

interface AttendanceCardProps {
  id: number;
  studentName: string;
  attendanceDate: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
}

export default function AttendanceCard({
  studentName,
  attendanceDate,
  status
}: AttendanceCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ABSENT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'Có mặt';
      case 'LATE':
        return 'Đi muộn';
      case 'ABSENT':
        return 'Vắng mặt';
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-2">
          <UserIcon className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-900">{studentName}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
          {getStatusText(status)}
        </span>
      </div>
      
      <div className="flex items-center text-gray-600 mt-3">
        <CalendarIcon className="h-5 w-5 mr-2" />
        <span>{new Date(attendanceDate).toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</span>
      </div>
    </div>
  );
} 