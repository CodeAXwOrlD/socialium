"use client";

import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { listNotifications, markAsRead, markAllAsRead } from "@/services/notifications";
import type { Notification } from "@/types";
import { formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await listNotifications();
        setNotifications(data);
      } catch {
        // No notifications yet
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Notifications</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:opacity-80"
            style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)", background: "var(--bg-card)" }}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border py-16 text-center" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <Bell className="mx-auto h-12 w-12" style={{ color: "var(--text-muted)" }} />
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="flex items-start gap-4 rounded-xl border px-5 py-4"
              style={{
                background: notif.is_read ? "var(--bg-card)" : "rgba(99, 102, 241, 0.05)",
                borderColor: notif.is_read ? "var(--border-color)" : "rgba(99, 102, 241, 0.3)"
              }}
            >
              <div className="mt-0.5 rounded-full p-1.5" style={{ background: notif.is_read ? "var(--bg-hover)" : "rgba(99, 102, 241, 0.1)" }}>
                <Bell className="h-4 w-4" style={{ color: notif.is_read ? "var(--text-muted)" : "#6366f1" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>{notif.title}</p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{notif.message}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{formatDateTime(notif.created_at)}</p>
              </div>
              {!notif.is_read && (
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="rounded-lg p-1.5 hover:opacity-80"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
