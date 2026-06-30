"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Bell, CheckCircle } from "lucide-react";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.notifications.list(),
  });

  const notifications = (data as any)?.data || [];

  const markRead = useMutation({
  mutationFn: (id: string) => api.notifications.markRead(id),

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["notifications"],
    });

    queryClient.invalidateQueries({
      queryKey: ["notifications"],
      exact: false,
    });
  },
});

  const markAll = useMutation({
  mutationFn: () => api.notifications.markAllRead(),

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["notifications"],
    });

    queryClient.invalidateQueries({
      queryKey: ["notifications"],
      exact: false,
    });
  },
});
  if (isLoading) {
    return (
      <div className="p-6">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-indigo-500" />
          <h1 className="text-2xl font-bold">
            Notifications
          </h1>
        </div>

        <button
          onClick={() => markAll.mutate()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
        >
          Mark All Read
        </button>

      </div>

      <div className="space-y-4">

        {notifications.length === 0 && (
          <div className="rounded-xl border p-6 text-center text-gray-500">
            No notifications
          </div>
        )}

        {notifications.map((n: any) => (

          <div
            key={n.id}
            className={`rounded-xl border p-4 ${
              n.is_read ? "opacity-60" : ""
            }`}
          >

            <div className="flex items-start justify-between">

              <div>
                <h3 className="font-semibold">
                  {n.title}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {n.message}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(n.created_at).toLocaleString()}
                </p>

              </div>

              {!n.is_read && (
                <button
                  onClick={() => markRead.mutate(n.id)}
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </button>
              )}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}