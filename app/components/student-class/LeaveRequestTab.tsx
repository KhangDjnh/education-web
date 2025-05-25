import React, { useState, useEffect } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";

interface LeaveRequest {
  id: number;
  studentId: number;
  classId: number;
  reason: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface LeaveRequestTabProps {
  classId: number;
}

export default function LeaveRequestTab({ classId }: LeaveRequestTabProps) {
  const { getToken, user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newLeaveRequest, setNewLeaveRequest] = useState({
    reason: '',
    startDate: '',
    endDate: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
  }, [classId]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(
        `http://localhost:8080/education/api/leave-requests/student/${user?.id}/class/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.code === 1000) {
        setLeaveRequests(data.result);
      } else {
        setError(data.message || "Không thể tải yêu cầu nghỉ phép.");
      }
    } catch {
      setError("Không thể tải yêu cầu nghỉ phép.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newLeaveRequest.reason || !newLeaveRequest.startDate || !newLeaveRequest.endDate) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Authentication token not found");

      const res = await fetch("http://localhost:8080/education/api/leave-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classId,
          reason: newLeaveRequest.reason,
          startDate: newLeaveRequest.startDate,
          endDate: newLeaveRequest.endDate,
        }),
      });

      const data = await res.json();
      if (data.code === 1000) {
        setNewLeaveRequest({ reason: '', startDate: '', endDate: '' });
        fetchLeaveRequests(); // Refresh the list
      } else {
        throw new Error(data.message || "Failed to submit leave request");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* New Leave Request Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <CalendarIcon className="h-6 w-6 mr-2 text-blue-600" />
          Gửi yêu cầu nghỉ phép mới
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lý do</label>
            <textarea
              value={newLeaveRequest.reason}
              onChange={(e) => setNewLeaveRequest(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Nhập lý do nghỉ phép"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={newLeaveRequest.startDate}
                onChange={(e) => setNewLeaveRequest(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
              <input
                type="date"
                value={newLeaveRequest.endDate}
                onChange={(e) => setNewLeaveRequest(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Đang gửi...
              </>
            ) : (
              "Gửi yêu cầu"
            )}
          </button>
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Lịch sử yêu cầu nghỉ phép</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-gray-600">Đang tải...</span>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : leaveRequests.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Chưa có yêu cầu nghỉ phép nào.</div>
        ) : (
          <div className="space-y-4">
            {leaveRequests.map((request) => (
              <div key={request.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{request.reason}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    request.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status === 'APPROVED' ? 'Đã duyệt' :
                     request.status === 'REJECTED' ? 'Từ chối' :
                     'Đang chờ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 