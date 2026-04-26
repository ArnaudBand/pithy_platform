"use server";

import { apiGet, apiPut } from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType = "COURSE" | "JOB" | "SCHOLARSHIP" | "FUNDING";

export interface NotificationDTO {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/** GET /api/notifications/my — all notifications for the current user */
export async function getMyNotifications(): Promise<
  | { success: true; notifications: NotificationDTO[] }
  | { success: false; message: string }
> {
  try {
    const notifications = await apiGet<NotificationDTO[]>("/api/notifications/my");
    return { success: true, notifications };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch notifications";
    return { success: false, message };
  }
}

/** GET /api/notifications/unread-count */
export async function getUnreadCount(): Promise<
  | { success: true; count: number }
  | { success: false; message: string }
> {
  try {
    const count = await apiGet<number>("/api/notifications/unread-count");
    return { success: true, count };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch unread count";
    return { success: false, message };
  }
}

/** PUT /api/notifications/{id}/read — mark one notification as read */
export async function markNotificationAsRead(id: string): Promise<
  | { success: true }
  | { success: false; message: string }
> {
  try {
    await apiPut(`/api/notifications/${id}/read`, {});
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to mark notification as read";
    return { success: false, message };
  }
}

/** PUT /api/notifications/read-all — mark all as read */
export async function markAllNotificationsAsRead(): Promise<
  | { success: true }
  | { success: false; message: string }
> {
  try {
    await apiPut("/api/notifications/read-all", {});
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to mark all notifications as read";
    return { success: false, message };
  }
}
