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
  AcademicCapIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  LinkIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon
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

interface Student {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
}

interface Document {
  id: number;
  title: string;
  filePath: string;
  uploadedAt: string;
}

interface ApiResponse {
  message: string;
  code: number;
  result: ClassData;
}

interface StudentApiResponse {
  message: string;
  code: number;
  result: Student[];
}

interface DocumentApiResponse {
  message: string;
  code: number;
  result: Document[];
}

export default function ClassPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, getToken, user, roles, validateSession } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Document states
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState<boolean>(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [documentSearchTerm, setDocumentSearchTerm] = useState<string>("");
  const [showAddDocument, setShowAddDocument] = useState<boolean>(false);
  const [newDocument, setNewDocument] = useState<{title: string, filePath: string}>({
    title: "",
    filePath: ""
  });

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

  useEffect(() => {
    // Load students data when the active tab is set to "students"
    if (activeTab === "students" && classData) {
      fetchStudents();
    }
    
    // Load documents data when the active tab is set to "documents"
    if (activeTab === "documents" && classData) {
      fetchDocuments();
    }
  }, [activeTab, classData]);
  
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

  // Fetch students for the class
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      setStudentError(null);
      
      const token = getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      const response = await fetch(`http://localhost:8080/education/api/class-students/students/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.status}`);
      }
      
      const data: StudentApiResponse = await response.json();
      
      if (data.code === 1000) {
        setStudents(data.result);
      } else {
        throw new Error(data.message || "Failed to fetch students data");
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setStudentError(err instanceof Error ? err.message : "An error occurred while fetching students");
    } finally {
      setLoadingStudents(false);
    }
  };
  
  // Fetch documents for the class
  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);
      setDocumentError(null);
      
      const token = getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      const response = await fetch(`http://localhost:8080/education/api/documents/class/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status}`);
      }
      
      const data: DocumentApiResponse = await response.json();
      
      if (data.code === 1000) {
        setDocuments(data.result);
      } else {
        throw new Error(data.message || "Failed to fetch documents data");
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setDocumentError(err instanceof Error ? err.message : "An error occurred while fetching documents");
    } finally {
      setLoadingDocuments(false);
    }
  };
  
  const handleAddDocument = () => {
    // This would be connected to an actual API in production
    setShowAddDocument(false);
    // Mock document creation with a temporary ID
    const mockDocument = {
      id: documents.length + 1,
      title: newDocument.title,
      filePath: newDocument.filePath,
      uploadedAt: new Date().toISOString()
    };
    setDocuments([...documents, mockDocument]);
    // Reset the form
    setNewDocument({ title: "", filePath: "" });
  };

  // Format the date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.username.toLowerCase().includes(searchLower)
    );
  });
  
  // Filter documents based on search term
  const filteredDocuments = documents.filter(document => {
    return document.title.toLowerCase().includes(documentSearchTerm.toLowerCase());
  });

  // Format date of birth
  const formatDOB = (dobString: string) => {
    return new Date(dobString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get document type icon based on file path
  const getDocumentTypeIcon = (filePath: string) => {
    if (filePath.includes('drive.google.com')) {
      return <LinkIcon className="h-6 w-6 text-blue-500" />;
    }
    return <DocumentTextIcon className="h-6 w-6 text-blue-500" />;
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

  // Render the students management tab
  const renderStudentsTab = () => {
    if (loadingStudents) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        </div>
      );
    }

    if (studentError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{studentError}</span>
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Students in this class</h3>
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Add Student
            </button>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No students yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding students to this class.</p>
            <div className="mt-6">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Add First Student
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-800 font-medium text-sm">
                            {student.firstName[0]}{student.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDOB(student.dob)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  };
  
  // Render the documents management tab
  const renderDocumentsTab = () => {
    if (loadingDocuments) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-2"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      );
    }

    if (documentError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{documentError}</span>
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Class Documents</h3>
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search documents..."
                value={documentSearchTerm}
                onChange={(e) => setDocumentSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
              onClick={() => setShowAddDocument(true)}
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Add Document
            </button>
          </div>
        </div>
        
        {/* Add Document Form */}
        {showAddDocument && (
          <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
            <h4 className="font-medium text-green-800 mb-4">Add New Document</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Document Title</label>
                <input 
                  type="text"
                  id="title"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="Enter document title"
                />
              </div>
              <div>
                <label htmlFor="filePath" className="block text-sm font-medium text-gray-700">File Link</label>
                <input 
                  type="text"
                  id="filePath"
                  value={newDocument.filePath}
                  onChange={(e) => setNewDocument({...newDocument, filePath: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="Enter file URL (e.g., Google Drive link)"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddDocument(false)}
                  className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddDocument}
                  className="rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none"
                >
                  Add Document
                </button>
              </div>
            </div>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No documents yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding documents to this class.</p>
            <div className="mt-6">
              <button 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                onClick={() => setShowAddDocument(true)}
              >
                Add First Document
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map(document => (
              <div key={document.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-4 flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    {getDocumentTypeIcon(document.filePath)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{document.title}</h3>
                    <p className="text-sm text-gray-500">
                      Uploaded on {formatDate(document.uploadedAt)} at {formatTime(document.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-between">
                  <div className="flex space-x-2">
                    <button 
                      className="text-green-600 hover:text-green-800"
                      title="Edit document"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-800"
                      title="Delete document"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <a 
                    href={document.filePath} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    Open
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
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

            {/* Show features grid only if active tab is overview */}
            {activeTab === "overview" && (
              <>
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
              </>
            )}

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
                    Back to Overview
                  </button>
                </div>
                
                {/* Render content based on active tab */}
                {activeTab === "students" && renderStudentsTab()}
                {activeTab === "documents" && renderDocumentsTab()}
                {!["students", "documents"].includes(activeTab) && (
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
                )}
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