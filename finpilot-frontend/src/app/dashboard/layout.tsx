"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CreditCard, BarChart3, Target, Bot, Upload,
  Bell, Settings, LogOut, TrendingUp, Wallet, Lightbulb, Menu, X, ChevronRight
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/transactions", icon: CreditCard, label: "Transactions" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/budgets", icon: Wallet, label: "Budgets" },
  { href: "/dashboard/goals", icon: Target, label: "Goals" },
  { href: "/dashboard/insights", icon: Lightbulb, label: "AI Insights" },
  { href: "/dashboard/chat", icon: Bot, label: "AI Copilot" },
  { href: "/dashboard/upload", icon: Upload, label: "Import Data" },
  { href: "/dashboard/reports", icon: TrendingUp, label: "Reports" },
  { href: "/dashboard/notifications", icon: Bell, label: "Notifications" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: notificationsData } = useQuery({
  queryKey: ["notifications"],
  queryFn: () => api.notifications.list(),
  refetchInterval: 30000,
});

const notifications = (notificationsData as any)?.data || [];

const unreadCount = notifications.filter(
  (n: any) => !n.is_read
).length;
  useEffect(() => {
    if (!isAuthenticated) router.replace("/auth/login");
  }, [isAuthenticated, router]);

  const handleLogout = () => { logout(); router.replace("/auth/login"); };

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={()=>setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-20 lg:hidden"/>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:relative inset-y-0 left-0 z-30 w-64 flex flex-col bg-[#0d0d14] border-r border-white/[0.06] transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen?'translate-x-0':'-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">FP</span>
          </div>
          <div>
            <span className="text-white font-semibold">FinPilot</span>
            <span className="text-indigo-400 font-semibold"> AI</span>
          </div>
          <button onClick={()=>setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} onClick={()=>setSidebarOpen(false)}>
                <motion.div whileHover={{x:2}} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${active?"bg-indigo-600/20 text-indigo-300":"text-gray-400 hover:bg-white/[0.04] hover:text-white"}`}>
                  <Icon className="w-4 h-4 flex-shrink-0"/>
                  <span className="text-sm font-medium">{label}</span>
                  {active && <ChevronRight className="w-3 h-3 ml-auto"/>}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
          <Link href="/dashboard/settings">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-white/[0.04] hover:text-white transition-colors">
              <Settings className="w-4 h-4"/><span className="text-sm font-medium">Settings</span>
            </div>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4"/><span className="text-sm font-medium">Sign out</span>
          </button>
          {user && (
            <div className="flex items-center gap-3 px-3 py-3 mt-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">{user.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                <p className="text-gray-500 text-xs truncate">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0d0d14]/50 backdrop-blur">
          <button onClick={()=>setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
            <Menu className="w-5 h-5"/>
          </button>
          <div className="hidden lg:block">
            <p className="text-gray-400 text-sm">Welcome back, <span className="text-white font-medium">{user?.name?.split(" ")[0]}</span> 👋</p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => router.push("/dashboard/notifications")}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
                >
              <Bell className="w-5 h-5" />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
              )}
            </button>
            <Link href="/dashboard/settings">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center cursor-pointer">
                <span className="text-white text-xs font-semibold">{user?.name?.charAt(0)?.toUpperCase()}</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
