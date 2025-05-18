import React from "react";
import { CalendarDaysIcon, ClockIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export interface Exam {
  id: number;
  title: string;
  description: string;
  classId: number;
  startTime: string;
  endTime: string;
  createdAt: string;
}

interface ExamCardProps {
  exam: Exam;
  onClick?: () => void;
  selected?: boolean;
}

const formatDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const ExamCard: React.FC<ExamCardProps> = ({ exam, onClick, selected }) => (
  <div
    className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 ${
      selected ? "border-blue-500" : "border-transparent"
    } p-5 flex flex-col cursor-pointer`}
    onClick={onClick}
  >
    <div className="flex items-center mb-2">
      <DocumentTextIcon className="h-7 w-7 text-purple-500 mr-2" />
      <span className="text-lg font-bold text-gray-800 truncate">{exam.title}</span>
    </div>
    <div className="text-sm text-gray-600 mb-2 line-clamp-2">{exam.description}</div>
    <div className="flex items-center text-xs text-gray-500 mb-1">
      <CalendarDaysIcon className="h-4 w-4 mr-1" />
      <span>
        {formatDateTime(exam.startTime)} - {formatDateTime(exam.endTime)}
      </span>
    </div>
    <div className="flex items-center text-xs text-gray-400">
      <ClockIcon className="h-4 w-4 mr-1" />
      <span>Created: {formatDateTime(exam.createdAt)}</span>
    </div>
  </div>
);

export default ExamCard;