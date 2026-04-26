"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GoHome } from "react-icons/go";
import { IoPersonOutline } from "react-icons/io5";
import { IoMdHelpCircleOutline } from "react-icons/io";
import {
  Bell,
  BriefcaseBusiness,
  CirclePlus,
  ClipboardList,
  GraduationCap,
  HandCoins,
  LogOut,
  School,
  BookOpenCheck,
  ChevronsLeft,
  ChevronsRight,
  Brain,
  Layers,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import CreatePost from "./createPosts";
import Modal from "./Modal";
import ProfileContainer from "./ProfileContainer";
import { getCurrentUser, logout, AuthUser } from "@/lib/actions/auth.actions";
import { PostDTO } from "@/lib/actions/post.actions";
import { getUnreadCount } from "@/lib/actions/notification.actions";
import { checkAssessmentEligibility } from "@/lib/actions/assessment.actions";

interface OverViewProps {
  children?: React.ReactNode;
  className?: string;
}

const SIDEBAR_EXPANDED_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 80;
const TRANSITION_DURATION = 250; // ms

const OverView: React.FC<OverViewProps> = ({ children }) => {
  const [, setUser] = useState<AuthUser | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [assessmentEligible, setAssessmentEligible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  const [jobsOpen, setJobsOpen] = useState(false);
  const [scholarshipsOpen, setScholarshipsOpen] = useState(false);
  const [fundingsOpen, setFundingsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();

  // Load current user on mount
  useEffect(() => {
    getCurrentUser().then((u) => setUser(u));
  }, []);

  // Check assessment eligibility once on mount (user completed all course lessons)
  useEffect(() => {
    checkAssessmentEligibility().then(setAssessmentEligible);
  }, []);

  // Poll unread notification count every 60 seconds
  useEffect(() => {
    const fetchCount = () =>
      getUnreadCount().then((r) => {
        if (r.success) setUnreadCount(r.count);
      });
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Restore sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("isSidebarCollapsed");
    if (savedState !== null) {
      const isCollapsed = JSON.parse(savedState);
      setIsSidebarCollapsed(isCollapsed);
      setTextVisible(!isCollapsed);
    }
  }, []);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem("isSidebarCollapsed", JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Auto-open the dropdown whose section the user is currently in
  useEffect(() => {
    if (pathname.startsWith("/human-services/dashboard/jobs")) setJobsOpen(true);
    if (pathname.startsWith("/human-services/dashboard/scholarships")) setScholarshipsOpen(true);
    if (pathname.startsWith("/human-services/dashboard/fundings")) setFundingsOpen(true);
  }, [pathname]);

  // Toggle sidebar collapse with animation sequence
  const toggleSidebarCollapse = useCallback(() => {
    if (!isSidebarCollapsed) {
      setTextVisible(false);
      setTimeout(() => setIsSidebarCollapsed(true), TRANSITION_DURATION / 2);
    } else {
      setIsSidebarCollapsed(false);
      setTimeout(() => setTextVisible(true), TRANSITION_DURATION / 2);
    }
  }, [isSidebarCollapsed]);

  // Escape key collapses sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSidebarCollapsed) {
        toggleSidebarCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarCollapsed, toggleSidebarCollapse]);

  // Modal controls
  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const addNewPost = (newPost: PostDTO) => {
    setPosts((prev) => [newPost, ...prev]);
    closeModal();
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const getLinkClassName = (href: string) =>
    `${pathname === href ? "text-green-500 font-bold" : ""} text-lg cursor-pointer transition-colors duration-200`;

  const getTextClassName = (baseClasses = "") => `
    ${baseClasses}
    transform
    transition-all
    duration-${TRANSITION_DURATION}
    ${textVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 absolute"}
  `;

  const createNavigationItem = (
    href: string,
    icon: React.ElementType,
    label: string,
  ) => (
    <Link
      href={href}
      className="flex flex-row gap-3 items-center hover:text-[#37BB65] group relative w-full py-2"
      aria-label={label}
    >
      <div className="min-w-6 flex justify-center">
        {React.createElement(icon, {
          className: getLinkClassName(href),
          size: 24,
          "aria-hidden": "true",
        })}
      </div>
      <p className={getTextClassName(getLinkClassName(href))}>{label}</p>

      {/* Tooltip when collapsed */}
      {!textVisible && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
          {label}
        </div>
      )}
    </Link>
  );

  // Collapsible dropdown group — parent button + indented child links
  const createDropdownGroup = (
    groupLabel: string,
    groupIcon: React.ElementType,
    groupHref: string,
    isOpen: boolean,
    onToggle: () => void,
    children: { href: string; icon: React.ElementType; label: string }[],
  ) => {
    const isGroupActive = pathname.startsWith(groupHref);
    return (
      <div className="w-full">
        {/* Parent trigger */}
        <button
          onClick={onToggle}
          className={`flex flex-row gap-3 items-center w-full py-2 hover:text-[#37BB65] group relative text-left transition-colors duration-200 ${
            isGroupActive ? "text-green-500 font-bold" : ""
          }`}
          aria-expanded={isOpen}
          aria-label={groupLabel}
        >
          <div className="min-w-6 flex justify-center">
            {React.createElement(groupIcon, {
              size: 24,
              "aria-hidden": "true",
              className: isGroupActive ? "text-green-500" : "",
            })}
          </div>
          <p className={getTextClassName(`text-lg ${isGroupActive ? "text-green-500 font-bold" : ""}`)}>
            {groupLabel}
          </p>
          {/* Chevron — only visible when sidebar is expanded */}
          {textVisible && (
            <span className="ml-auto">
              {isOpen
                ? <ChevronDown size={16} className="opacity-60" />
                : <ChevronRight size={16} className="opacity-60" />}
            </span>
          )}
          {/* Tooltip when collapsed */}
          {!textVisible && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
              {groupLabel}
            </div>
          )}
        </button>

        {/* Sub-items */}
        {isOpen && !isSidebarCollapsed && (
          <div className="flex flex-col pl-8 border-l border-slate-200 ml-3">
            {children.map(({ href, icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex flex-row gap-3 items-center py-1.5 hover:text-[#37BB65] transition-colors duration-200 ${
                  pathname === href ? "text-green-500 font-bold" : "text-gray-600"
                }`}
                aria-label={label}
              >
                <div className="min-w-5 flex justify-center">
                  {React.createElement(icon, {
                    size: 18,
                    "aria-hidden": "true",
                  })}
                </div>
                <span className="text-sm">{label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  const sidebarStyle = {
    width: isSidebarCollapsed
      ? `${SIDEBAR_COLLAPSED_WIDTH}px`
      : `${SIDEBAR_EXPANDED_WIDTH}px`,
    transition: `width ${TRANSITION_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
  };

  return (
    <div className="flex space-x-4 relative w-full">
      {/* Fixed Sidebar */}
      <div
        ref={sidebarRef}
        style={sidebarStyle}
        className={`
          hidden
          md:flex
          h-screen
          sticky
          top-0
          flex-col
          justify-between
          bg-white
          text-black
          py-20
          items-center
          px-4
          rounded-tr-xl
          rounded-br-xl
          my-6
          shadow-lg
          shadow-black/10
          border-r
          border-slate-200
          border-t
          border-b
          overflow-hidden
          will-change-[width]
        `}
        aria-expanded={!isSidebarCollapsed}
      >
        {/* Collapse / Expand Button */}
        <button
          onClick={toggleSidebarCollapse}
          className="absolute top-4 right-4 z-10 hover:bg-green-400 p-2 rounded-full border border-slate-200
                     shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2
                     focus:ring-green-400 focus:ring-opacity-50"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronsRight
              size={20}
              className="text-black hover:text-white transition-colors duration-200"
              aria-hidden="true"
            />
          ) : (
            <ChevronsLeft
              size={20}
              className="text-black hover:text-white transition-colors duration-200"
              aria-hidden="true"
            />
          )}
        </button>

        <div className="flex flex-col justify-between h-full w-full">
          {/* Nav links */}
          <div className="flex flex-col space-y-1 mb-10">
            <p
              className={getTextClassName(
                "text-sm font-medium text-black/50 uppercase tracking-wider px-2 mb-2",
              )}
            >
              Overview
            </p>

            <div className="flex flex-col space-y-1">
              {createNavigationItem("/human-services/dashboard", GoHome, "Home")}
              {createNavigationItem(
                "/human-services/dashboard/courses",
                GraduationCap,
                "Courses",
              )}
              {createDropdownGroup(
                "Jobs",
                BriefcaseBusiness,
                "/human-services/dashboard/jobs",
                jobsOpen,
                () => setJobsOpen((o) => !o),
                [
                  { href: "/human-services/dashboard/jobs", icon: BriefcaseBusiness, label: "All Jobs" },
                  { href: "/human-services/dashboard/jobs/applications", icon: ClipboardList, label: "My Applications" },
                ],
              )}
              {createDropdownGroup(
                "Scholarships",
                School,
                "/human-services/dashboard/scholarships",
                scholarshipsOpen,
                () => setScholarshipsOpen((o) => !o),
                [
                  { href: "/human-services/dashboard/scholarships", icon: School, label: "All Scholarships" },
                  { href: "/human-services/dashboard/scholarships/applications", icon: BookOpenCheck, label: "My Scholarships" },
                ],
              )}
              {createDropdownGroup(
                "Fundings",
                HandCoins,
                "/human-services/dashboard/fundings",
                fundingsOpen,
                () => setFundingsOpen((o) => !o),
                [
                  { href: "/human-services/dashboard/fundings", icon: HandCoins, label: "All Fundings" },
                  { href: "/human-services/dashboard/fundings/applications", icon: ClipboardList, label: "My Fundings" },
                ],
              )}
              {assessmentEligible && createNavigationItem(
                "/human-services/dashboard/assessment",
                Brain,
                "Assessment",
              )}
              {createNavigationItem(
                "/human-services/dashboard/scenario-assessment",
                Layers,
                "Scenario Test",
              )}

              {/* Add Post Button */}
              <button
                onClick={openModal}
                className="flex flex-row gap-3 items-center cursor-pointer hover:text-[#37BB65] group relative w-full py-2 text-left"
                aria-label="Add Post"
              >
                <div className="min-w-6 flex justify-center">
                  <CirclePlus
                    className={getLinkClassName("/human-services/dashboard/posts")}
                    size={24}
                    aria-hidden="true"
                  />
                </div>
                <p className={getTextClassName("text-lg")}>Add Post</p>

                {!textVisible && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                    Add Post
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Account Section */}
          <div className="flex flex-col space-y-1">
            <p
              className={getTextClassName(
                "text-sm font-medium text-black/50 uppercase tracking-wider px-2 mb-2",
              )}
            >
              Account
            </p>

            {/* Profile Button */}
            <button
              onClick={openProfileModal}
              className="flex flex-row gap-3 items-center group relative w-full py-2 text-left hover:text-[#37BB65]"
              aria-label="Profile"
            >
              <div className="min-w-6 flex justify-center">
                <IoPersonOutline
                  className={getLinkClassName("/profile")}
                  size={24}
                  aria-hidden="true"
                />
              </div>
              <p className={getTextClassName(getLinkClassName("/profile"))}>
                Profile
              </p>

              {!textVisible && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                  Profile
                </div>
              )}
            </button>

            {/* Notifications */}
            <Link
              href="/human-services/dashboard/notifications"
              className="flex flex-row gap-3 items-center group relative w-full py-2 hover:text-[#37BB65]"
              aria-label="Notifications"
            >
              <div className="min-w-6 flex justify-center relative">
                <Bell
                  className={getLinkClassName(
                    "/human-services/dashboard/notifications",
                  )}
                  size={24}
                  aria-hidden="true"
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-0.5 leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <p
                className={getTextClassName(
                  getLinkClassName("/human-services/dashboard/notifications"),
                )}
              >
                Notifications
                {unreadCount > 0 && textVisible && (
                  <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </p>

              {!textVisible && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                  Notifications{unreadCount > 0 ? ` (${unreadCount})` : ""}
                </div>
              )}
            </Link>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col space-y-1 mt-auto pt-8 border-t border-slate-100">
            {/* Help */}
            <Link
              href="/human-services/dashboard/help"
              className="flex flex-row gap-3 items-center group relative w-full py-2 hover:text-[#37BB65]"
              aria-label="Help & support"
            >
              <div className="min-w-6 flex justify-center">
                <IoMdHelpCircleOutline
                  className={getLinkClassName("/human-services/dashboard/help")}
                  size={24}
                  aria-hidden="true"
                />
              </div>
              <p
                className={getTextClassName(
                  getLinkClassName("/human-services/dashboard/help"),
                )}
              >
                Help & support
              </p>

              {!textVisible && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                  Help & support
                </div>
              )}
            </Link>

            {/* Logout */}
            <div
              onClick={handleLogout}
              className="flex flex-row gap-3 items-center text-[#F26900] hover:text-green-600 cursor-pointer group relative w-full py-2"
              role="button"
              aria-label="Logout"
              tabIndex={0}
            >
              <div className="min-w-6 flex justify-center">
                <LogOut size={24} aria-hidden="true" />
              </div>
              <p className={getTextClassName("text-lg")}>Logout</p>

              {!textVisible && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                  Logout
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">{children}</div>

      {/* Create Post Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <CreatePost onPostCreated={addNewPost} />
        </Modal>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <Modal isOpen={isProfileModalOpen} onClose={closeProfileModal}>
          <ProfileContainer />
        </Modal>
      )}
    </div>
  );
};

export default OverView;
