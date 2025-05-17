import React, { useState, useEffect } from "react";
import ClassCard from "../components/ClassCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";

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
  result: ClassData[];
}

export default function StudentPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const { isLoggedIn, getToken, roles, user, validateSession, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      // Only proceed if auth has been initialized
      if (!isInitialized) {
        console.log("Auth not initialized yet for student page, waiting...");
        return;
      }
      
      console.log("Checking auth for Student page...");
      try {
        // First check local state - faster user experience
        if (isLoggedIn && roles.includes("STUDENT")) {
          console.log("Already logged in as student from local state");
          setAuthChecked(true);
          fetchClasses();
          return;
        }
        
        // Then validate with backend if needed
        console.log("Validating session with backend for student...");
        const isSessionValid = await validateSession();
        
        if (!isSessionValid) {
          console.log("Session invalid, redirecting to signin");
          navigate("/signin");
          return;
        }
        
        // Check student role
        if (!roles.includes("STUDENT")) {
          console.log("User is not a student, redirecting to home");
          navigate("/");
          return;
        }
        
        console.log("Auth check successful for student page");
        setAuthChecked(true);
        fetchClasses();
      } catch (error) {
        console.error("Auth check error for student:", error);
        setError("Authentication error. Please try logging in again.");
        navigate("/signin");
      }
    };
    
    checkAuth();
  }, [isInitialized, isLoggedIn, roles]);

  const fetchClasses = async () => {
    console.log("Fetching classes for student...");
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Using user.id to get the student's classes
      console.log("Making API request to fetch student classes...");
      const response = await fetch(`http://localhost:8080/education/api/class-students/classes/${user?.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Unauthorized response from student classes API");
          navigate("/signin");
          return;
        }
        throw new Error(`Error: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.code === 1000) {
        console.log("Student classes fetched successfully:", data.result.length);
        setClasses(data.result);
      } else {
        throw new Error(data.message || "Failed to fetch classes");
      }
    } catch (err) {
      console.error("Error fetching student classes:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Format user data for the navbar
  const navbarUser = user ? {
    username: user.username,
    avatarUrl: user.avatarUrl,
    role: "STUDENT"
  } : undefined;

  // Show loading state when initializing
  if (!authChecked || (loading && classes.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={isLoggedIn} user={navbarUser} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading student dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} user={navbarUser} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Classes</h1>
          <p className="text-gray-600 mt-2">Enrolled courses and learning materials</p>
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-700">No classes found</h3>
            <p className="mt-2 text-gray-500">You are not enrolled in any classes yet.</p>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
              Browse Classes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <ClassCard
                key={classItem.id}
                id={classItem.id}
                name={classItem.name}
                code={classItem.code}
                description={classItem.description}
                semester={classItem.semester}
                createdAt={classItem.createdAt}
              />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 