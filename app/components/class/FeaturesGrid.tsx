import React from 'react';
import {
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import type { TeacherFeature } from '../../types/class';

interface FeaturesGridProps {
  onFeatureClick: (featureId: string) => void;
}

export const FeaturesGrid: React.FC<FeaturesGridProps> = ({ onFeatureClick }) => {
  const teacherFeatures: TeacherFeature[] = [
    {
      id: 'students',
      name: 'Manage Students',
      icon: <UserGroupIcon className="w-6 h-6" />,
      description: 'View and manage students enrolled in this class',
      color: 'bg-blue-500',
    },
    {
      id: 'documents',
      name: 'Manage Documents',
      icon: <DocumentTextIcon className="w-6 h-6" />,
      description: 'Upload and organize class materials and resources',
      color: 'bg-green-500',
    },
    {
      id: 'attendance',
      name: 'Attendance',
      icon: <ClipboardDocumentCheckIcon className="w-6 h-6" />,
      description: 'Track and manage student attendance',
      color: 'bg-purple-500',
    },
    {
      id: 'absence',
      name: 'Absence Requests',
      icon: <ExclamationTriangleIcon className="w-6 h-6" />,
      description: 'Review and approve student absence requests',
      color: 'bg-yellow-500',
    },
    {
      id: 'assignments',
      name: 'Assignments',
      icon: <DocumentTextIcon className="w-6 h-6" />,
      description: 'Create, assign and review class assignments',
      color: 'bg-pink-500',
    },
    {
      id: 'questions',
      name: 'Question Bank',
      icon: <QuestionMarkCircleIcon className="w-6 h-6" />,
      description: 'Create and manage questions for exams and quizzes',
      color: 'bg-red-500',
    },
    {
      id: 'exams',
      name: 'Exam Management',
      icon: <DocumentDuplicateIcon className="w-6 h-6" />,
      description: 'Create and manage exams and assessments',
      color: 'bg-indigo-500',
    },
    {
      id: 'grades',
      name: 'Grades Management',
      icon: <ChartBarIcon className="w-6 h-6" />,
      description: 'View and manage students\' exam grades',
      color: 'bg-teal-500',
    },
  ];

  return (
    <>
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Class Management
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teacherFeatures.map((feature) => (
          <div
            key={feature.id}
            onClick={() => onFeatureClick(feature.id)}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-all hover:shadow-lg"
          >
            <div
              className={`${feature.color} p-4 flex items-center text-white`}
            >
              <div className="bg-white/20 rounded-full p-2">
                {feature.icon}
              </div>
              <h3 className="ml-3 text-lg font-semibold">
                {feature.name}
              </h3>
            </div>
            <div className="p-4">
              <p className="text-gray-600">{feature.description}</p>
              <button className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800">
                Open {feature.name} →
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}; 