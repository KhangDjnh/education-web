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
  const { isLoggedIn, getToken, roles, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and has Student role
    if (!isLoggedIn || !roles.includes("STUDENT")) {
      navigate("/signin");
      return;
    }

    const fetchClasses = async () => {
      try {
        setLoading(true);
        const token = getToken();
        
        if (!token) {
          throw new Error("Authentication token not found");
        }

        // Using user.id to get the student's classes
        const response = await fetch(`http://localhost:8080/education/api/class-students/classes/${user?.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        
        if (data.code === 1000) {
          setClasses(data.result);
        } else {
          throw new Error(data.message || "Failed to fetch classes");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [isLoggedIn, roles, navigate, getToken, user?.id]);

  // Format user data for the navbar
  const navbarUser = user ? {
    username: user.username,
    avatarUrl: user.avatarUrl,
    role: "STUDENT"
  } : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} user={navbarUser} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Classes</h1>
          <p className="text-gray-600 mt-2">View all classes you are enrolled in</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-700">No classes found</h3>
            <p className="mt-2 text-gray-500">You are not enrolled in any classes yet.</p>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
              Browse Available Classes
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