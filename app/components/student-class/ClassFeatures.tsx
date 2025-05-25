import React from "react";
import {
  BookOpenIcon,
  PencilSquareIcon,
  TrophyIcon,
  Squares2X2Icon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

interface ClassFeaturesProps {
  onOpenDocuments: () => void;
  onOpenLeaveRequests: () => void;
  onOpenAssignments: () => void;
}

export default function ClassFeatures({ onOpenDocuments, onOpenLeaveRequests, onOpenAssignments }: ClassFeaturesProps) {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Class Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-500 rounded-xl shadow p-5 flex flex-col">
          <div className="flex items-center mb-2">
            <BookOpenIcon className="h-7 w-7 text-white mr-2" />
            <span className="text-lg font-bold text-white">Tài liệu</span>
          </div>
          <div className="text-white text-sm mb-3">Xem và tải các tài liệu học tập của lớp.</div>
          <button
            className="text-white underline text-sm mt-auto hover:text-blue-200"
            onClick={onOpenDocuments}
          >
            Open Documents →
          </button>
        </div>
        <div className="bg-purple-500 rounded-xl shadow p-5 flex flex-col">
          <div className="flex items-center mb-2">
            <PencilSquareIcon className="h-7 w-7 text-white mr-2" />
            <span className="text-lg font-bold text-white">Bài tập</span>
          </div>
          <div className="text-white text-sm mb-3">Làm và nộp bài tập, xem kết quả bài tập.</div>
          <button
            className="text-white underline text-sm mt-auto hover:text-purple-200"
            onClick={onOpenAssignments}
          >
            Open Assignments →
          </button>
        </div>
        <div className="bg-pink-500 rounded-xl shadow p-5 flex flex-col">
          <div className="flex items-center mb-2">
            <TrophyIcon className="h-7 w-7 text-white mr-2" />
            <span className="text-lg font-bold text-white">Thi cử</span>
          </div>
          <div className="text-white text-sm mb-3">Tham gia các kỳ thi, kiểm tra trực tuyến.</div>
          <button
            className="text-white underline text-sm mt-auto hover:text-pink-200"
            onClick={() => alert("Tính năng thi cử sẽ sớm có!")}
          >
            Open Exams →
          </button>
        </div>
        <div className="bg-green-500 rounded-xl shadow p-5 flex flex-col">
          <div className="flex items-center mb-2">
            <Squares2X2Icon className="h-7 w-7 text-white mr-2" />
            <span className="text-lg font-bold text-white">Xem điểm</span>
          </div>
          <div className="text-white text-sm mb-3">Xem điểm số, kết quả học tập của bạn.</div>
          <button
            className="text-white underline text-sm mt-auto hover:text-green-200"
            onClick={() => alert("Tính năng xem điểm sẽ sớm có!")}
          >
            View Grades →
          </button>
        </div>
        <div className="bg-yellow-500 rounded-xl shadow p-5 flex flex-col">
          <div className="flex items-center mb-2">
            <CalendarIcon className="h-7 w-7 text-white mr-2" />
            <span className="text-lg font-bold text-white">Điểm danh</span>
          </div>
          <div className="text-white text-sm mb-3">Xem lịch sử điểm danh và xin nghỉ phép.</div>
          <button
            className="text-white underline text-sm mt-auto hover:text-yellow-200"
            onClick={onOpenLeaveRequests}
          >
            Manage Leave Requests →
          </button>
        </div>
      </div>
    </>
  );
} 