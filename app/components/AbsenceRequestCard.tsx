import React from "react";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  UserCircleIcon, 
  CalendarDaysIcon, 
  ChatBubbleLeftRightIcon 
} from "@heroicons/react/24/solid";

export interface AbsenceRequest {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  leaveDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface AbsenceRequestCardProps {
  request: AbsenceRequest;
  onClick: () => void;
  selected: boolean;
}

const AbsenceRequestCard: React.FC<AbsenceRequestCardProps> = ({ request, onClick, selected }) => {
  let statusIcon, statusColor, statusText;
  if (request.status === "APPROVED") {
    statusIcon = <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    statusColor = "bg-green-100 text-green-700";
    statusText = "Approved";
  } else if (request.status === "REJECTED") {
    statusIcon = <XCircleIcon className="h-6 w-6 text-red-500" />;
    statusColor = "bg-red-100 text-red-700";
    statusText = "Rejected";
  } else {
    statusIcon = <ClockIcon className="h-6 w-6 text-yellow-500" />;
    statusColor = "bg-yellow-100 text-yellow-700";
    statusText = "Pending";
  }

  return (
    <div
      className={`cursor-pointer rounded-xl shadow-md bg-white hover:shadow-lg transition-all border-2 ${selected ? "border-blue-500" : "border-transparent"} p-4 flex items-center space-x-4`}
      onClick={onClick}
    >
      <UserCircleIcon className="h-12 w-12 text-blue-400" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 text-black">
          <span className="font-semibold text-gray-800">{request.studentName}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor} flex items-center space-x-1`}>
            {statusIcon}
            <span>{statusText}</span>
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
          <span className="flex items-center !text-black">
            <CalendarDaysIcon className="h-4 w-4 mr-1" />
            {new Date(request.leaveDate).toLocaleDateString()}
          </span>
          <span className="flex items-center">
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
            {request.reason.length > 25 ? request.reason.slice(0, 25) + "..." : request.reason}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AbsenceRequestCard;