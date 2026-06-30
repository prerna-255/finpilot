"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Bell, CreditCard, Moon, Sun, Monitor, Camera } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/authStore";
import { getInitials, cn } from "@/lib/utils";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
] as const;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]["id"]>("profile");
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const [notifPrefs, setNotifPrefs] = useState({
    budgetExceeded: true,
    billDue: true,
    highSpending: true,
    suspiciousTransaction: true,
    savingsMilestone: false,
    goalReminder: true,
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-8">Manage your account preferences</p>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        {/* Tabs */}
        <nav className="space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-brand-600 text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-lg font-semibold text-white">
                    {getInitials(user?.name)}
                  </div>
                  <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card hover:bg-accent">
                    <Camera className="h-3 w-3" />
                  </button>
                </div>
                <div>
                  <p className="font-medium">{user?.name || "Arjun Sharma"}</p>
                  <p className="text-sm text-muted-foreground">{user?.email || "arjun@example.com"}</p>
                  <span className="mt-1 inline-block rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-600 capitalize">
                    {user?.plan || "free"} plan
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Full name</label>
                  <input
                    defaultValue={user?.name}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email</label>
                  <input
                    defaultValue={user?.email}
                    disabled
                    className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Theme</label>
                <div className="flex gap-2">
                  {[
                    { value: "light", icon: Sun, label: "Light" },
                    { value: "dark", icon: Moon, label: "Dark" },
                    { value: "system", icon: Monitor, label: "System" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                        theme === opt.value
                          ? "border-brand-500 bg-brand-500/10 text-brand-600"
                          : "border-border text-muted-foreground hover:bg-accent"
                      )}
                    >
                      <opt.icon className="h-3.5 w-3.5" /> {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors">
                Save changes
              </button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-5">
              <h3 className="font-semibold">Change password</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <input type="password" placeholder="Current password" className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                <div />
                <input type="password" placeholder="New password" className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                <input type="password" placeholder="Confirm new password" className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
              </div>
              <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors">
                Update password
              </button>
              <div className="border-t border-border pt-5">
                <h3 className="font-semibold mb-1">Two-factor authentication</h3>
                <p className="text-xs text-muted-foreground mb-3">Add an extra layer of security to your account.</p>
                <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
                  Enable 2FA
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-1">
              {Object.entries(notifPrefs).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-lg px-2 py-3">
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  <button
                    onClick={() => setNotifPrefs((p) => ({ ...p, [key]: !value }))}
                    className={cn(
                      "h-5 w-9 rounded-full transition-colors relative",
                      value ? "bg-brand-600" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                        value ? "translate-x-[18px]" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
                <p className="text-sm font-medium">Free Plan</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upgrade to Pro for unlimited AI chat, advanced forecasting, and PDF reports.
                </p>
                <button className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white hover:bg-brand-700 transition-colors">
                  Upgrade to Pro — ₹499/mo
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
