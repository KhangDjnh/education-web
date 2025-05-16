import React, { useState } from "react";
import Avatar from "./Avatar";
import { MagnifyingGlassIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

// Logo path
const logoPath = "/images/logo/logo.png";

type NavbarProps = {
  isLoggedIn?: boolean;
  user?: {
    username: string;
    avatarUrl?: string;
  };
};

export const Navbar: React.FC<NavbarProps> = ({ isLoggedIn = false, user }) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for dropdowns
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  // Mock data for dropdowns
  const dropdownItems = {
    courses: ["Web Development", "Mobile Development", "Data Science", "AI & Machine Learning", "Cybersecurity"],
    sources: ["Official Documentation", "Community Resources", "Video Tutorials", "Interactive Courses"],
    platforms: ["Web", "Mobile", "Desktop", "Embedded Systems"]
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand name */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <img 
                src={logoPath} 
                alt="Education Logo" 
                className="h-8 w-auto" 
              />
              <span className="ml-2 text-xl font-bold text-gray-900">Education</span>
            </a>
          </div>

          {/* Search bar */}
          <div className="hidden sm:flex items-center flex-1 max-w-lg mx-8">
            <div className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses, resources..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 
                           focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Navigation items and auth buttons */}
          <div className="flex items-center space-x-4">
            {/* Dropdown for Courses */}
            <div className="relative">
              <button 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium 
                          flex items-center"
                onClick={() => toggleDropdown("courses")}
              >
                Courses
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </button>
              {activeDropdown === "courses" && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {dropdownItems.courses.map((item) => (
                      <a
                        key={item}
                        href={`/courses/${item.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown for Sources */}
            <div className="relative">
              <button 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium 
                          flex items-center"
                onClick={() => toggleDropdown("sources")}
              >
                Sources
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </button>
              {activeDropdown === "sources" && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {dropdownItems.sources.map((item) => (
                      <a
                        key={item}
                        href={`/sources/${item.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown for Platforms */}
            <div className="relative">
              <button 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium 
                          flex items-center"
                onClick={() => toggleDropdown("platforms")}
              >
                Platforms
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </button>
              {activeDropdown === "platforms" && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {dropdownItems.platforms.map((item) => (
                      <a
                        key={item}
                        href={`/platforms/${item.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User authentication */}
            {isLoggedIn && user ? (
              <div className="flex items-center">
                <Avatar 
                  username={user.username} 
                  imageUrl={user.avatarUrl}
                  size="md"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <a
                  href="/signin"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="sm:hidden px-2 pb-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 
                     focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 