"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  BriefcaseBusiness,
  GraduationCap,
  HandCoins,
  School,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import {
  NotificationDTO,
  NotificationType,
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/actions/notification.actions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  NotificationType,
  { label: string; Icon: React.ElementType; color: string; bg: string }
> = {
  COURSE: {
    label: "Course",
    Icon: GraduationCap,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  JOB: {
    label: "Job",
    Icon: BriefcaseBusiness,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  SCHOLARSHIP: {
    label: "Scholarship",
    Icon: School,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  FUNDING: {
    label: "Funding",
    Icon: HandCoins,
    color: "text-green-600",
    bg: "bg-green-100",
  },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getMyNotifications();
    if (result.success) {
      setNotifications(result.notifications);
      setError(null);
    } else {
      setError(result.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkOne = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMarkingAll(false);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <Bell size={48} className="text-slate-300" />
        <p className="text-slate-500">{error}</p>
        <button
          onClick={load}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <Bell size={56} className="text-slate-200" />
        <h2 className="text-xl font-semibold text-slate-600">
          No notifications yet
        </h2>
        <p className="text-slate-400 max-w-sm">
          When new courses, jobs, scholarships, or funding opportunities are
          posted, you&apos;ll see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-500 mt-0.5">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={markingAll}
            className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 border border-green-200 rounded-lg
                       hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            <CheckCheck size={16} />
            {markingAll ? "Marking…" : "Mark all as read"}
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {notifications.map((n) => {
          const cfg = TYPE_CONFIG[n.type];
          const Icon = cfg.Icon;
          return (
            <div
              key={n.id}
              className={`relative flex gap-4 p-4 rounded-xl border transition-colors
                ${n.isRead
                  ? "bg-white border-slate-100"
                  : "bg-green-50 border-green-100"
                }`}
            >
              {/* Unread dot */}
              {!n.isRead && (
                <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-green-500" />
              )}

              {/* Icon */}
              <div
                className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${cfg.bg}`}
              >
                <Icon size={20} className={cfg.color} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">
                      {n.title}
                    </p>
                    <p className="text-slate-500 text-sm mt-0.5 leading-snug">
                      {n.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-slate-400">
                    {timeAgo(n.createdAt)}
                  </span>
                  {n.linkUrl && (
                    <Link
                      href={n.linkUrl}
                      className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                      onClick={() => !n.isRead && handleMarkOne(n.id)}
                    >
                      View <ExternalLink size={11} />
                    </Link>
                  )}
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkOne(n.id)}
                      className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
