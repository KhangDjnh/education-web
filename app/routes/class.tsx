import React, { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
} from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import {
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  DocumentDuplicateIcon,
  ChevronLeftIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline";

interface ClassData {
  id: number;
  name: string;
  code: string;
  description: string;
  semester: string;
  teacherId: number;
  createdAt: string;
}

interface ApiResponse {
  message: string;
  code: number;
  result: ClassData;
}

export default function ClassPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, getToken, user, roles, validateSession } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    const checkAuthAndLoadClass = async () => {
      try {
        setLoading(true);
        console.log("Class page mounted, checking auth for class ID:", id);
        
        // Check if the session is valid
        const isSessionValid = await validateSession();
        console.log("Session valid:", isSessionValid);
        
        if (!isSessionValid) {
          console.log("Session invalid, storing redirect path and navigating to signin");
          // Store current path for redirect after login
          sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
          navigate("/signin");
          return;
        }
        
        // If we have a valid session, fetch the class data
        await fetchClassData();
      } catch (err) {
        console.error("Error in checkAuthAndLoadClass:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthAndLoadClass();
  }, [id, validateSession, navigate]);
  
  const fetchClassData = async () => {
    try {
      console.log("Fetching class data for ID:", id);
      const token = getToken();
      
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      console.log("Making API request to fetch class details");
      const response = await fetch(`http://localhost:8080/education/api/classes/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log("401 Unauthorized response, token may be invalid");
          // Store the current URL to redirect back after login
          sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
          navigate("/signin");
          return;
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      console.log("API response data:", data);
      
      if (data.code === 1000) {
        setClassData(data.result);
      } else {
        throw new Error(data.message || "Failed to fetch class data");
      }
    } catch (err) {
      console.error("Error fetching class data:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  // Format user data for the navbar
  const navbarUser = user ? {
    username: user.username,
    avatarUrl: user.avatarUrl,
    role: roles.includes("TEACHER") ? "TEACHER" : roles.includes("STUDENT") ? "STUDENT" : "USER"
  } : undefined;

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  // Features available for teachers
  const teacherFeatures = [
    {
      id: "students",
      name: "Manage Students",
      icon: <UserGroupIcon className="w-6 h-6" />,
      description: "View and manage students enrolled in this class",
      color: "bg-blue-500"
    },
    {
      id: "documents",
      name: "Manage Documents",
      icon: <DocumentTextIcon className="w-6 h-6" />,
      description: "Upload and organize class materials and resources",
      color: "bg-green-500"
    },
    {
      id: "attendance",
      name: "Attendance",
      icon: <ClipboardDocumentCheckIcon className="w-6 h-6" />,
      description: "Track and manage student attendance",
      color: "bg-purple-500"
    },
    {
      id: "absence",
      name: "Absence Requests",
      icon: <ExclamationTriangleIcon className="w-6 h-6" />,
      description: "Review and approve student absence requests",
      color: "bg-yellow-500"
    },
    {
      id: "questions",
      name: "Question Bank",
      icon: <QuestionMarkCircleIcon className="w-6 h-6" />,
      description: "Create and manage questions for exams and quizzes",
      color: "bg-red-500"
    },
    {
      id: "exams",
      name: "Exam Management",
      icon: <DocumentDuplicateIcon className="w-6 h-6" />,
      description: "Create and manage exams and assessments",
      color: "bg-indigo-500"
    }
  ];

  // Format the date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={isLoggedIn} user={navbarUser} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading class details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={isLoggedIn} user={navbarUser} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : classData ? (
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
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
                  <p className="text-gray-600">{classData.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="text-gray-500">Class ID</span>
                    <p className="font-medium text-gray-800">{classData.id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="text-gray-500">Created On</span>
                    <p className="font-medium text-gray-800">{formatDate(classData.createdAt)}</p>
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

            {/* Features grid */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">Class Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacherFeatures.map((feature) => (
                <div 
                  key={feature.id}
                  onClick={() => handleTabClick(feature.id)}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-all hover:shadow-lg"
                >
                  <div className={`${feature.color} p-4 flex items-center text-white`}>
                    <div className="bg-white/20 rounded-full p-2">
                      {feature.icon}
                    </div>
                    <h3 className="ml-3 text-lg font-semibold">{feature.name}</h3>
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

            {/* Tab content */}
            {activeTab !== "overview" && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    {teacherFeatures.find(f => f.id === activeTab)?.name}
                  </h3>
                  <button 
                    onClick={() => setActiveTab("overview")} 
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-12 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl text-gray-300 flex justify-center">
                      {teacherFeatures.find(f => f.id === activeTab)?.icon}
                    </div>
                    <p className="mt-4 text-gray-600">
                      This feature is currently under development. Check back soon!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">No class found! </strong>
            <span className="block sm:inline">Could not find the requested class.</span>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 