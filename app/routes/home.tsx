import type { Route } from "./+types/home";
import { useAuth } from "../contexts/AuthContext";
import ImageSlider from "../components/ImageSlider";
import FeatureSection from "../components/FeatureSection";
import AboutSection from "../components/AboutSection";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Education Platform" },
    { name: "description", content: "Your learning journey starts here" },
  ];
}

export default function Home() {
  const { isLoggedIn, user, logout, roles, validateSession, isInitialized } = useAuth();
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    // Validate the session silently without redirecting
    const validateAuthState = async () => {
      if (!isInitialized) {
        console.log("Auth not initialized yet for home page");
        return;
      }
      
      console.log("Validating auth state silently on home page");
      try {
        await validateSession();
      } catch (error) {
        console.error("Error validating session on home:", error);
      } finally {
        setAuthChecking(false);
      }
    };
    
    validateAuthState();
  }, [isInitialized, validateSession]);

  // Format user data for the navbar
  const navbarUser = user ? {
    username: user.username,
    avatarUrl: user.avatarUrl,
    role: roles.includes("TEACHER") ? "TEACHER" : roles.includes("STUDENT") ? "STUDENT" : "USER"
  } : undefined;
  
  // Simple loading state during initialization
  if (authChecking && !isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} user={navbarUser} />
      
      <main className="flex-grow">
        <div className="px-4 pt-8 pb-12 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Welcome to</span>
              <span className="block text-blue-600">Education Platform</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Discover courses, resources, and learning materials to enhance your skills
            </p>
            
            {isLoggedIn && user && (
              <div className="mt-8">
                <div className="rounded-md shadow bg-white p-6">
                  <h2 className="text-2xl font-bold">
                    Welcome back, {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}!
                  </h2>
                  <p className="mt-2 text-gray-600">
                    {roles.includes("TEACHER") ? "You are logged in as a Teacher" : 
                     roles.includes("STUDENT") ? "You are logged in as a Student" : 
                     "You are currently logged in"}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    {roles.includes("TEACHER") && (
                      <a
                        href="/teacher"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Go to Teacher Dashboard
                      </a>
                    )}

                    {roles.includes("STUDENT") && (
                      <a
                        href="/student"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        Go to Student Dashboard
                      </a>
                    )}
                    
                    <button
                      onClick={logout}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {!isLoggedIn && (
              <div className="mt-8 flex justify-center gap-4">
                <a
                  href="/signin"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Image Slider Section */}
        <div className="mb-12">
          <ImageSlider className="px-4 sm:px-6 lg:px-8" />
        </div>

        {/* Feature Section with Icons */}
        <FeatureSection />

        {/* About Section with Detailed Text */}
        <AboutSection />
      </main>
      
      <Footer />
    </div>
  );
}
