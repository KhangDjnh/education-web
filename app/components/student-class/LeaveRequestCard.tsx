import React from 'react';
import { CalendarIcon, UserIcon } from '@heroicons/react/24/outline';

interface LeaveRequestCardProps {
  id: number;
  studentName: string;
  leaveDate: string;
  reason: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
}

export default function LeaveRequestCard({
  studentName,
  leaveDate,
  reason,
  status
}: LeaveRequestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return 'Đang chờ';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <UserIcon className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-900">{studentName}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
          {getStatusText(status)}
        </span>
      </div>
      
      <div className="flex items-center text-gray-600 mb-3">
        <CalendarIcon className="h-5 w-5 mr-2" />
        <span>{new Date(leaveDate).toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</span>
      </div>
      
      <p className="text-gray-700 line-clamp-3">{reason}</p>
    </div>
  );
} 