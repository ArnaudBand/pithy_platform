/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaHome,
  FaBook,
  FaBriefcase,
  FaMoneyCheckAlt,
  FaGraduationCap,
  FaUsers,
  FaQuestionCircle,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import { Brain, Gem, Joystick, Layers, LogOut, ClipboardList, BarChart2 } from "lucide-react";
import { logout } from "@/lib/actions/auth.actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SimpleLink {
  kind: "link";
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface DropdownGroup {
  kind: "group";
  name: string;
  icon: React.ReactNode;
  children: { name: string; path: string; icon: React.ReactNode }[];
}

type NavItem = SimpleLink | DropdownGroup;

// ─── Nav structure ────────────────────────────────────────────────────────────

const navItems: NavItem[] = [
  { kind: "link", name: "Home",            path: "/human-services/admin",            icon: <FaHome /> },
  { kind: "link", name: "Dashboard",       path: "/human-services/dashboard",         icon: <Joystick size={16} /> },
  { kind: "link", name: "Manage Users",    path: "/human-services/admin/users",       icon: <FaUsers /> },
  { kind: "link", name: "Manage Courses",  path: "/human-services/admin/courses",     icon: <FaBook /> },
  { kind: "link", name: "Manage Jobs",     path: "/human-services/admin/jobs",        icon: <FaBriefcase /> },
  { kind: "link", name: "Manage Fundings", path: "/human-services/admin/fundings",    icon: <FaMoneyCheckAlt /> },
  {
    kind: "link",
    name: "Manage Scholarships",
    path: "/human-services/admin/scholarships",
    icon: <FaGraduationCap />,
  },
  { kind: "link", name: "Manage Payments", path: "/human-services/admin/payments",   icon: <Gem size={16} /> },

  // ── Assessment dropdown ───────────────────────────────────────────────────
  {
    kind: "group",
    name: "Manage Assessment",
    icon: <Brain size={16} />,
    children: [
      {
        name: "Assessment Questions",
        path: "/human-services/admin/questions",
        icon: <FaQuestionCircle />,
      },
      {
        name: "Assessment Results",
        path: "/human-services/admin/assessments",
        icon: <BarChart2 size={14} />,
      },
    ],
  },

  // ── Scenario Assessment dropdown ──────────────────────────────────────────
  {
    kind: "group",
    name: "Manage Scenario Assessment",
    icon: <Layers size={16} />,
    children: [
      {
        name: "Scenario Questions",
        path: "/human-services/admin/scenario-questions",
        icon: <FaQuestionCircle />,
      },
      {
        name: "Scenario Results",
        path: "/human-services/admin/scenario-assessments",
        icon: <BarChart2 size={14} />,
      },
    ],
  },

  { kind: "link", name: "View Reports", path: "/human-services/admin/reports", icon: <ClipboardList size={16} /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface AdminSidebarProps {
  children?: React.ReactNode;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Track which dropdown groups are open (by group name)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // Auto-open the group that contains the current path
    const initial: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.kind === "group") {
        const active = item.children.some((c) => pathname === c.path || pathname.startsWith(c.path));
        if (active) initial[item.name] = true;
      }
    });
    return initial;
  });

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/human-services/signIn");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const linkClass = (path: string) =>
    `flex items-center px-4 py-3 hover:bg-green-500 hover:text-white/90 transition-colors ${
      pathname === path ? "bg-green-500 text-white/90" : ""
    }`;

  return (
    <div className="flex space-x-4 w-full">
      {/* Fixed Sidebar */}
      <aside
        className={`h-screen sticky top-0 rounded-tr-md bg-white text-black/60 flex flex-col transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Header */}
        <div className="p-4 text-lg font-bold border-b border-green-500 grid justify-items-end">
          <button
            onClick={() => setIsCollapsed((v) => !v)}
            className="p-2 hover:bg-green-500 rounded-lg"
          >
            {isCollapsed ? "«" : "»"}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col overflow-y-auto">
          {navItems.map((item) => {
            if (item.kind === "link") {
              return (
                <Link key={item.path} href={item.path as any} className={linkClass(item.path)}>
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
                </Link>
              );
            }

            // Dropdown group
            const isOpen = !!openGroups[item.name];
            const hasActiveChild = item.children.some(
              (c) => pathname === c.path || pathname.startsWith(c.path)
            );

            return (
              <div key={item.name}>
                {/* Group header button */}
                <button
                  onClick={() => !isCollapsed && toggleGroup(item.name)}
                  className={`w-full flex items-center px-4 py-3 hover:bg-green-500 hover:text-white/90 transition-colors text-left ${
                    hasActiveChild ? "bg-green-50 text-green-700 font-medium" : ""
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 flex-1 truncate text-sm">{item.name}</span>
                      <span className="ml-1 flex-shrink-0">
                        {isOpen ? (
                          <FaChevronDown size={11} />
                        ) : (
                          <FaChevronRight size={11} />
                        )}
                      </span>
                    </>
                  )}
                </button>

                {/* Children — shown when open and not collapsed */}
                {isOpen && !isCollapsed && (
                  <div className="bg-slate-50 border-l-2 border-green-400 ml-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        href={child.path as any}
                        className={`flex items-center px-4 py-2.5 hover:bg-green-500 hover:text-white/90 transition-colors text-sm ${
                          pathname === child.path ? "bg-green-500 text-white/90" : "text-slate-600"
                        }`}
                      >
                        <span className="text-base flex-shrink-0">{child.icon}</span>
                        <span className="ml-3 truncate">{child.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-green-500">
          <button
            onClick={handleLogout}
            className="flex items-center hover:bg-orange-300 text-black hover:text-white rounded-lg px-4 py-2"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </button>
          {!isCollapsed && (
            <p className="text-sm text-green-500 mt-2">© 2025 Pithy Means</p>
          )}
        </div>
      </aside>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto w-full">{children}</div>
    </div>
  );
};

export default AdminSidebar;
