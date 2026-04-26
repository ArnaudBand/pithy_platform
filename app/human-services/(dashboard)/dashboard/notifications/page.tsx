import { Metadata } from "next";
import NotificationsList from "@/components/NotificationsList";

export const metadata: Metadata = {
  title: "Notifications | Pithy Means",
};

export default function NotificationsPage() {
  return <NotificationsList />;
}
