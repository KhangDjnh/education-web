import React, { useState } from "react";
import Avatar from "./Avatar";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  BellIcon,
  EnvelopeOpenIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";

// Logo path
const logoPath = "/images/logo/logo.png";

type NavbarProps = {
  isLoggedIn?: boolean;
  user?: {
    username: string;
    avatarUrl?: string;
    role?: string;
  };
};

const noticeTypeIcon = (type: string, opened: boolean) => {
  switch (type) {
    case "LEAVE_REQUEST":
      return opened ? (
        <EnvelopeOpenIcon className="h-6 w-6 text-blue-500" />
      ) : (
        <EnvelopeIcon className="h-6 w-6 text-blue-400" />
      );
    case "WARNING":
      return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
    case "EXAM":
      return <AcademicCapIcon className="h-6 w-6 text-purple-500" />;
    default:
      return <BellIcon className="h-6 w-6 text-gray-400" />;
  }
};

export const Navbar: React.FC<NavbarProps> = ({ isLoggedIn = false, user }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { notices, unreadCount, markAsRead } = useNotification();

  // State for dropdowns
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [openedNoticeId, setOpenedNoticeId] = useState<null | number>(null);

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  // Mock data for dropdowns
  const dropdownItems = {
    courses: [
      "Web Development",
      "Mobile Development",
      "Data Science",
      "AI & Machine Learning",
      "Cybersecurity",
    ],
    sources: [
      "Official Documentation",
      "Community Resources",
      "Video Tutorials",
      "Interactive Courses",
    ],
    platforms: ["Web", "Mobile", "Desktop", "Embedded Systems"],
  };

  // User profile dropdown items based on role
  const getUserMenuItems = () => {
    const baseItems = [
      { label: "Profile", href: "/profile", action: null },
      { label: "Settings", href: "/settings", action: null },
      { label: "Sign Out", href: "#", action: handleSignOut },
    ];

    if (user?.role === "TEACHER") {
      return [{ label: "Teacher Dashboard", href: "/teacher", action: null }, ...baseItems];
    } else if (user?.role === "STUDENT") {
      return [{ label: "Student Dashboard", href: "/student", action: null }, ...baseItems];
    }
    return baseItems;
  };

  const userDropdownItems = getUserMenuItems();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand name */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <img src={logoPath} alt="Education Logo" className="h-8 w-auto" />
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
            {/* ...existing dropdowns... */}

            {/* Notification bell */}
            {isLoggedIn && (
              <div className="relative mr-4">
                <button
                  className="relative"
                  onClick={() => setShowDropdown((v) => !v)}
                  aria-label="Thông báo"
                >
                  <BellIcon className="h-7 w-7 text-blue-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showDropdown && (
                  <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}>
                    {/* Overlay for closing */}
                  </div>
                )}
                {showDropdown && (
                  <div className="fixed top-20 right-8 z-50 w-[420px] max-w-full">
                    <div className="bg-white rounded-2xl shadow-2xl border border-blue-100">
                      <div className="flex items-center justify-between px-6 py-4 border-b">
                        <span className="font-bold text-lg text-blue-700 flex items-center">
                          <BellIcon className="h-6 w-6 mr-2" />
                          Thông báo
                        </span>
                        <button
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => setShowDropdown(false)}
                        >
                          ×
                        </button>
                      </div>
                      <ul className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100">
                        {notices.length === 0 && (
                          <li className="p-6 text-gray-400 text-center">
                            <BellIcon className="mx-auto h-8 w-8 mb-2" />
                            Không có thông báo nào
                          </li>
                        )}
                        {notices.map((notice) => {
                          const opened = openedNoticeId === notice.id;
                          return (
                            <li
                              key={notice.id}
                              className={`flex items-start gap-3 px-6 py-5 cursor-pointer transition group ${
                                opened
                                  ? "bg-blue-50 border-l-4 border-blue-500"
                                  : !notice.read
                                  ? "bg-blue-100/40"
                                  : "bg-white"
                              }`}
                              onClick={() => {
                                setOpenedNoticeId(opened ? null : notice.id);
                                if (!notice.read) markAsRead(notice.id);
                              }}
                            >
                              <div className="mt-1">{noticeTypeIcon(notice.type, opened)}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-800">
                                    {notice.type === "LEAVE_REQUEST"
                                      ? "Yêu cầu nghỉ học"
                                      : notice.type === "WARNING"
                                      ? "Cảnh báo"
                                      : notice.type === "EXAM"
                                      ? "Thông báo thi"
                                      : "Thông báo"}
                                  </span>
                                  {!notice.read && (
                                    <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                                      Mới
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mb-1">
                                  {new Date(notice.createAt).toLocaleString("vi-VN")}
                                </div>
                                {/* Chỉ hiện nội dung khi mở */}
                                {opened && (
                                  <div className="mt-2 text-gray-700 text-sm leading-relaxed">
                                    {notice.content}
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User authentication */}
            {isLoggedIn && user ? (
              <div className="relative">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => toggleDropdown("user")}
                >
                  <Avatar username={user.username} imageUrl={user.avatarUrl} size="md" />
                </div>
                {activeDropdown === "user" && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {userDropdownItems.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          onClick={item.action ? (e) => item.action(e) : undefined}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
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