import { apiGet } from "@/lib/api/client";
import AdminHomeClient from "@/components/AdminHomeClient";

export interface AdminUserRow {
  id: string;
  email: string;
  role: "ADMIN" | "USER" | "GUEST";
  createdAt: string;
}

export default async function AdminHomePage() {
  let users: AdminUserRow[] = [];
  let fetchError: string | null = null;

  try {
    users = await apiGet<AdminUserRow[]>("/api/users");
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load users";
  }

  return <AdminHomeClient users={users} fetchError={fetchError} />;
}
