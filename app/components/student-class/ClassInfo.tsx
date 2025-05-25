import React from "react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

interface ClassDetail {
  id: number;
  name: string;
  code: string;
  description: string;
  semester: string;
  teacherId: number;
  teacherName: string;
  createdAt: string;
}

interface ClassInfoProps {
  classDetail: ClassDetail;
}

export default function ClassInfo({ classDetail }: ClassInfoProps) {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{classDetail.name}</h1>
          <div className="flex gap-3 mt-2">
            <span className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-xs font-semibold">
              Class Code: {classDetail.code}
            </span>
            <span className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-xs font-semibold">
              Semester: {classDetail.semester}
            </span>
          </div>
        </div>
        <div>
          <AcademicCapIcon className="h-12 w-12 text-white opacity-80" />
        </div>
      </div>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Description</h2>
        <p className="text-gray-700 mb-6">{classDetail.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">Class ID</div>
            <div className="font-bold text-lg text-gray-700">{classDetail.id}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">Created On</div>
            <div className="font-bold text-lg text-gray-700">
              {new Date(classDetail.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">Teacher</div>
            <div className="font-bold text-lg text-gray-700">{classDetail.teacherName}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">Status</div>
            <div className="font-bold text-lg text-green-600">Active</div>
          </div>
        </div>
      </div>
    </div>
  );
} 