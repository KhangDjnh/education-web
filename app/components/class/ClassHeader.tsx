import React from 'react';
import { AcademicCapIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router';
import type { ClassData } from '../../types/class';

interface ClassHeaderProps {
  classData: ClassData;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const ClassHeader: React.FC<ClassHeaderProps> = ({ classData }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <ChevronLeftIcon className="w-5 h-5 mr-1" />
        Back
      </button>

      {/* Class header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{classData.name}</h1>
              <div className="flex items-center mt-1">
                <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
                  Class Code: {classData.code}
                </div>
                <div className="ml-3 bg-white/20 rounded-full px-3 py-1 text-sm">
                  Semester: {classData.semester}
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center bg-white/10 rounded-lg p-3">
              <AcademicCapIcon className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Description
            </h2>
            <p className="text-gray-600">{classData.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-gray-500">Class ID</span>
              <p className="font-medium text-gray-800">{classData.id}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-gray-500">Created On</span>
              <p className="font-medium text-gray-800">
                {formatDate(classData.createdAt)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-gray-500">Teacher ID</span>
              <p className="font-medium text-gray-800">{classData.teacherId}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-gray-500">Status</span>
              <p className="font-medium text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 