import React, { useState, useEffect } from "react";
import { CalendarIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import LeaveRequestCard from "./LeaveRequestCard";
import AttendanceCard from "./AttendanceCard";

interface LeaveRequest {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  leaveDate: string;
  reason: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
}

interface Attendance {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  attendanceDate: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
}

interface LeaveRequestTabProps {
  classId: number;
}

export default function LeaveRequestTab({ classId }: LeaveRequestTabProps) {
  const { getToken, user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newLeaveRequest, setNewLeaveRequest] = useState({
    reason: '',
    leaveDate: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
    fetchAttendances();
  }, [classId]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(
        `http://localhost:8080/education/api/leave-request/student?studentId=${user?.id}&classId=${classId}`,
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

  const fetchAttendances = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `http://localhost:8080/education/api/attendance/student?studentId=${user?.id}&classId=${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.code === 1000) {
        setAttendances(data.result);
      }
    } catch (error) {
      console.error("Failed to fetch attendances:", error);
    }
  };

  const handleSubmit = async () => {
    if (!newLeaveRequest.reason || !newLeaveRequest.leaveDate) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Authentication token not found");

      const res = await fetch("http://localhost:8080/education/api/leave-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classId,
          reason: newLeaveRequest.reason,
          leaveDate: newLeaveRequest.leaveDate,
        }),
      });

      const data = await res.json();
      if (data.code === 1000) {
        setSuccessMessage("Gửi đơn xin nghỉ phép thành công!");
        setNewLeaveRequest({ reason: '', leaveDate: '' });
        fetchLeaveRequests();
      } else {
        throw new Error(data.message || "Failed to submit leave request");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Leave Request Form and History */}
        <div className="space-y-8">
          {/* New Leave Request Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="h-6 w-6 mr-2 text-blue-600" />
              Gửi yêu cầu nghỉ phép mới
            </h3>
            <div className="space-y-4">
              {successMessage && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  {successMessage}
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày nghỉ</label>
                <input
                  type="date"
                  value={newLeaveRequest.leaveDate}
                  onChange={(e) => setNewLeaveRequest(prev => ({ ...prev, leaveDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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

          {/* Leave Requests History */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Lịch sử đơn xin nghỉ</h3>
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
              <div className="text-center text-gray-500 py-8">Chưa có đơn xin nghỉ nào.</div>
            ) : (
              <div className="space-y-4">
                {leaveRequests.map((request) => (
                  <LeaveRequestCard
                    key={request.id}
                    id={request.id}
                    studentName={request.studentName}
                    leaveDate={request.leaveDate}
                    reason={request.reason}
                    status={request.status}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Attendance History */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <ClipboardDocumentListIcon className="h-6 w-6 mr-2 text-blue-600" />
            Lịch sử điểm danh
          </h3>
          {attendances.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Chưa có lịch sử điểm danh.</div>
          ) : (
            <div className="space-y-4">
              {attendances.map((attendance) => (
                <AttendanceCard
                  key={attendance.id}
                  id={attendance.id}
                  studentName={attendance.studentName}
                  attendanceDate={attendance.attendanceDate}
                  status={attendance.status}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 