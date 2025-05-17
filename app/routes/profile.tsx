import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import { CameraIcon } from "@heroicons/react/24/solid";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
}

interface ApiResponse {
  message: string;
  code: number;
  result: UserProfile | string;
}

export default function ProfilePage() {
  const { isLoggedIn, getToken, user: authUser, roles, validateSession, isInitialized } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuthAndLoadProfile = async () => {
      // Only proceed if auth has been initialized
      if (!isInitialized) {
        console.log("Auth not initialized yet for profile page, waiting...");
        return;
      }
      
      console.log("Checking auth for Profile page...");
      try {
        setLoading(true);
        
        // First check local state - faster user experience
        if (isLoggedIn) {
          console.log("Already logged in from local state, loading profile");
          setAuthChecked(true);
          await fetchUserInfo();
          return;
        }
        
        // Then validate with backend if needed
        console.log("Validating session with backend for profile...");
        const isSessionValid = await validateSession();
        
        if (!isSessionValid) {
          console.log("Session invalid for profile, redirecting to signin");
          navigate("/signin");
          return;
        }
        
        console.log("Auth check successful for profile page");
        setAuthChecked(true);
        await fetchUserInfo();
      } catch (err) {
        console.error("Error loading profile:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthAndLoadProfile();
  }, [isInitialized, isLoggedIn]);
  
  const fetchUserInfo = async (providedToken?: string) => {
    console.log("Fetching user profile...");
    try {
      setLoading(true);
      setError(null);
      
      // Use provided token or get it from context
      const token = providedToken || getToken();
      
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      console.log("Making API request to fetch user info...");
      const response = await fetch("http://localhost:8080/education/api/users/getUserInfo", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log("Unauthorized request from profile API");
          navigate("/signin");
          return;
        }
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.code === 1000 && typeof data.result !== "string") {
        console.log("Profile data fetched successfully");
        setUserProfile(data.result);
        // Save user ID to localStorage for future API calls
        localStorage.setItem('userId', data.result.id.toString());
        
        // Initialize edit form with current data
        setEditedProfile({
          firstName: data.result.firstName,
          lastName: data.result.lastName,
          dob: data.result.dob,
        });
      } else {
        throw new Error(typeof data.result === "string" ? data.result : "Failed to fetch user data");
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedProfile({
      ...editedProfile,
      [e.target.name]: e.target.value,
    });
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        throw new Error("Authentication information not found");
      }
      
      const response = await fetch(`http://localhost:8080/education/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedProfile),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          navigate("/signin");
          return;
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.code === 1000 && typeof data.result !== "string") {
        setUserProfile(data.result);
        setIsEditing(false);
      } else {
        throw new Error(typeof data.result === "string" ? data.result : "Failed to update user data");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while updating profile");
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirmation do not match");
      return;
    }
    
    try {
      setLoading(true);
      const token = getToken();
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        throw new Error("Authentication information not found");
      }
      
      const response = await fetch(`http://localhost:8080/education/api/users/${userId}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          navigate("/signin");
          return;
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.code === 1000) {
        setPasswordSuccess("Password changed successfully");
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setIsChangingPassword(false);
      } else {
        throw new Error(typeof data.result === "string" ? data.result : "Failed to change password");
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setPasswordError(err instanceof Error ? err.message : "An unknown error occurred while changing password");
    } finally {
      setLoading(false);
    }
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, you would upload the avatar to the server here
    if (e.target.files && e.target.files.length > 0) {
      console.log("Selected file:", e.target.files[0]);
      // TODO: Implement avatar upload functionality
    }
  };
  
  // Format user data for the navbar
  const navbarUser = userProfile ? {
    username: userProfile.username,
    avatarUrl: undefined, // replace with actual avatar if available
    role: roles.includes("TEACHER") ? "TEACHER" : roles.includes("STUDENT") ? "STUDENT" : "USER"
  } : undefined;

  // If we're still loading and have no profile yet, show a full-page loader
  if (loading && !userProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={isLoggedIn} user={navbarUser} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {loading && !isEditing && !isChangingPassword ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <>
              {/* User Profile Header */}
              <div className="bg-blue-600 text-white p-6 flex flex-col md:flex-row items-center justify-between">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center border-4 border-white">
                      {/* If user has avatar, show it, otherwise show initials */}
                      {userProfile?.firstName && userProfile?.lastName ? (
                        <span className="text-4xl font-semibold">
                          {userProfile.firstName.charAt(0)}
                          {userProfile.lastName.charAt(0)}
                        </span>
                      ) : (
                        <span className="text-4xl font-semibold">
                          {userProfile?.username?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={handleAvatarClick}
                      className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                    >
                      <CameraIcon className="h-5 w-5 text-blue-600" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                    <h1 className="text-2xl font-bold">
                      {userProfile?.firstName} {userProfile?.lastName}
                    </h1>
                    <p className="text-blue-200">@{userProfile?.username}</p>
                  </div>
                </div>
                <div className="mt-6 md:mt-0 flex gap-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50"
                  >
                    Edit Information
                  </button>
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="bg-blue-700 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-800"
                  >
                    Change Password
                  </button>
                </div>
              </div>
              
              {/* User Profile Content */}
              {!isEditing && !isChangingPassword && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold border-b pb-2">Personal Information</h2>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Full Name</label>
                        <p className="mt-1 text-gray-900">{userProfile?.firstName} {userProfile?.lastName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Username</label>
                        <p className="mt-1 text-gray-900">{userProfile?.username}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                        <p className="mt-1 text-gray-900">
                          {userProfile?.dob ? new Date(userProfile.dob).toLocaleDateString() : "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold border-b pb-2">Contact Information</h2>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Email Address</label>
                        <p className="mt-1 text-gray-900">{userProfile?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Edit Profile Form */}
              {isEditing && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
                  <form onSubmit={handleEditSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={editedProfile.firstName || ""}
                          onChange={handleEditChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          value={editedProfile.lastName || ""}
                          onChange={handleEditChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dob"
                          id="dob"
                          value={editedProfile.dob?.split('T')[0] || ""}
                          onChange={handleEditChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Change Password Form */}
              {isChangingPassword && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                  
                  {passwordError && (
                    <div className="mb-4 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {passwordError}
                    </div>
                  )}
                  
                  {passwordSuccess && (
                    <div className="mb-4 bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded">
                      {passwordSuccess}
                    </div>
                  )}
                  
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="oldPassword"
                          id="oldPassword"
                          value={passwordData.oldPassword}
                          onChange={handlePasswordChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          id="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsChangingPassword(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                      >
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 