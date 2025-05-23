import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { useClassData } from '../hooks/useClassData';
import { ClassHeader } from '../components/class/ClassHeader';
import { FeaturesGrid } from '../components/class/FeaturesGrid';
import { StudentsTab } from '../components/class/tabs/StudentsTab';
import { DocumentsTab } from '../components/class/tabs/DocumentsTab';
import { AttendanceTab } from '../components/class/tabs/AttendanceTab';
import { AbsenceRequestsTab } from '../components/class/tabs/AbsenceRequestsTab';
import { AssignmentsTab } from '../components/class/tabs/AssignmentsTab';
import { QuestionsTab } from '../components/class/tabs/QuestionsTab';
import { ExamsTab } from '../components/class/tabs/ExamsTab';
import { GradesTab } from '../components/class/tabs/GradesTab';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ClassPage() {
  const { classId } = useParams<{ classId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { classData, loading, error } = useClassData();
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    console.log('Current URL:', location.pathname);
    console.log('Class ID from params:', classId);
  }, [location.pathname, classId]);

  // Validate classId
  if (!classId || classId === 'undefined' || classId === 'null') {
    console.error('Invalid classId:', classId);
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Class ID</h2>
          <p className="text-gray-600 mb-4">
            The class ID is missing or invalid. Please make sure you're accessing the correct URL.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-600">Loading class data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Class Not Found</h2>
          <p className="text-gray-600 mb-4">
            The requested class could not be found. It may have been removed or you may not have access to it.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Map featureId to tab index
  const handleFeatureClick = (featureId: string) => {
    const tabIndex = tabs.findIndex(tab => tab.name.toLowerCase() === featureId.toLowerCase());
    if (tabIndex !== -1) {
      setSelectedTab(tabIndex);
    }
  };

  const tabs = [
    { name: 'Overview', component: <FeaturesGrid onFeatureClick={handleFeatureClick} /> },
    { name: 'Students', component: <StudentsTab classId={classId} /> },
    { name: 'Documents', component: <DocumentsTab classId={classId} /> },
    { name: 'Attendance', component: <AttendanceTab classId={classId} /> },
    { name: 'Absence Requests', component: <AbsenceRequestsTab classId={classId} /> },
    { name: 'Assignments', component: <AssignmentsTab classId={classId} /> },
    { name: 'Questions', component: <QuestionsTab classId={classId} /> },
    { name: 'Exams', component: <ExamsTab classId={classId} /> },
    { name: 'Grades', component: <GradesTab classId={classId} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ClassHeader classData={classData} />

        <div className="mt-8">
          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
            <Tab.List className="flex space-x-1 rounded-xl bg-white p-1 shadow">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    )
                  }
                >
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-4">
              {tabs.map((tab, idx) => (
                <Tab.Panel
                  key={idx}
                  className={classNames(
                    'rounded-xl bg-white p-6',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                  )}
                >
                  {tab.component}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
}