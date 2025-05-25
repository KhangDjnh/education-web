import React, { useState, useEffect } from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { classService } from '../../../services/classService';
import type { AbsenceRequest } from '../../../types/class';

interface AbsenceRequestsTabProps {
  classId: string;
}

export const AbsenceRequestsTab: React.FC<AbsenceRequestsTabProps> = ({ classId }) => {
  const [requests, setRequests] = useState<AbsenceRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchAbsenceRequests();
  }, [classId]);

  const fetchAbsenceRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const data = await classService.getAbsenceRequests(classId, token);
      setRequests(data);
    } catch (err) {
      console.error('Error fetching absence requests:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching absence requests'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await classService.updateAbsenceRequest(requestId, action, token);
      // Refresh the requests list after updating
      await fetchAbsenceRequests();
    } catch (err) {
      console.error('Error updating absence request:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while updating absence request'
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
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="mr-1 h-4 w-4" />
            Pending
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="mr-1 h-4 w-4" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="mr-1 h-4 w-4" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const toggleExpand = (requestId: string) => {
    setExpandedRequestId(expandedRequestId === requestId ? null : requestId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-600">Loading absence requests...</p>
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
        <h3 className="text-xl font-bold text-gray-800">Absence Requests</h3>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No absence requests
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no pending absence requests at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow overflow-hidden border border-gray-200"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(request.id.toString())}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-800 font-medium text-sm">
                          {request.studentName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {request.studentName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Leave Date: {formatDate(request.leaveDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(request.status)}
                    {expandedRequestId === request.id.toString() ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {expandedRequestId === request.id.toString() && (
                <div className="px-4 pb-4 border-t border-gray-200">
                  <div className="mt-4 space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">Reason for Absence</h5>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                        {request.reason}
                      </p>
                    </div>
                    
                    {request.status === 'PENDING' && (
                      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleRequestAction(request.id.toString(), 'APPROVED')}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRequestAction(request.id.toString(), 'REJECTED')}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}; 