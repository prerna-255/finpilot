"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, Treemap, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from "recharts";
import { Calendar, TrendingUp, Flame, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

const PERIODS = ["7D", "30D", "3M", "6M", "1Y", "All"] as const;

const MOCK_WEEKLY = [
  { week: "W1", spend: 12400 }, { week: "W2", spend: 15800 },
  { week: "W3", spend: 9200 }, { week: "W4", spend: 20600 },
];

const MOCK_MERCHANTS = [
  { name: "Amazon", value: 14200, count: 12 },
  { name: "Zepto", value: 8600, count: 24 },
  { name: "Netflix", value: 649, count: 1 },
  { name: "Ola/Uber", value: 5400, count: 18 },
  { name: "Swiggy", value: 7200, count: 15 },
  { name: "Big Bazaar", value: 6100, count: 6 },
];

const MOCK_HEATMAP = Array.from({ length: 35 }, (_, i) => ({
  day: i,
  level: Math.floor(Math.random() * 5) as 0 | 1 | 2 | 3 | 4,
}));

const HEATMAP_COLORS = ["bg-muted", "bg-brand-200", "bg-brand-400", "bg-brand-600", "bg-brand-800"];

const MOCK_RECURRING = [
  { name: "Rent", amount: 18000, frequency: "Monthly", nextDate: "1st Feb" },
  { name: "Netflix", amount: 649, frequency: "Monthly", nextDate: "14th Feb" },
  { name: "Gym Membership", amount: 1500, frequency: "Monthly", nextDate: "5th Feb" },
  { name: "Adobe Creative Cloud", amount: 1675, frequency: "Monthly", nextDate: "20th Feb" },
];
 


export default function AnalyticsPage() {
  const [period, setPeriod] = useState<typeof PERIODS[number]>("30D");
  const { data: trendsData, isLoading } = useQuery({
  queryKey: ["analytics-trends"],
  queryFn: () => api.analytics.trends(6),
});

const weeklyData = (trendsData as any)?.data ?? [];
const { data: merchantsData } = useQuery({
  queryKey: ["analytics-merchants"],
  queryFn: () => api.analytics.topMerchants(10),
});

const merchants = (merchantsData as any)?.data ?? [];
const { data: subscriptionsData } = useQuery({
  queryKey: ["subscriptions"],
  queryFn: () => api.ml.subscriptions(),
});

const subscriptions = (subscriptionsData as any)?.data ?? [];
const { data: heatmapData } = useQuery({
  queryKey: ["analytics-heatmap"],
  queryFn: () => api.analytics.heatmap(),
});

const heatmap = (heatmapData as any)?.data ?? [];
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Deep insights into your spending behavior</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                period === p ? "bg-brand-600 text-white" : "text-muted-foreground hover:bg-accent"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly spend + recurring */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-600" />
            <h3 className="font-semibold">Weekly Spending</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
            data={weeklyData.map((item: any) => ({
            week: item.month,
            spend: item.expense,
             }))}
>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Spend"]} />
              <Bar dataKey="spend" radius={[8, 8, 0, 0]} fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Repeat className="h-4 w-4 text-brand-600" />
            <h3 className="font-semibold">Recurring Expenses</h3>
          </div>
          <div className="space-y-3">
            {subscriptions.map((r: any) => (
              <div key={r.name} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{r.merchant}</p>
                  <p className="text-xs text-muted-foreground">
                     ₹{r.amountPerMonth}/month • Last used {r.lastUsedDaysAgo} days ago
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums">₹{r.amountPerMonth.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Merchant treemap */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-6 font-semibold">Top Merchants (Treemap)</h3>
        <ResponsiveContainer width="100%" height={260}>
        <Treemap
  data={merchants.map((m: any) => ({
    name: m.merchant,
    value: m.amount,
  }))}
  dataKey="value"
  stroke="hsl(var(--card))"
  fill="#4f46e5"
/>
        </ResponsiveContainer>
      </div>

      {/* Heatmap */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Flame className="h-4 w-4 text-brand-600" />
          <h3 className="font-semibold">Spending Heatmap</h3>
          <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Last 5 weeks
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {heatmap.map((cell: any, index: number) => (
            <motion.div
              key={cell.day}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                  "h-7 w-full rounded-md",
                  HEATMAP_COLORS[Math.min(cell.count, 4)]
                  )}
              title={`${cell.date} • ${cell.count} transaction(s)`}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
          Less
          {HEATMAP_COLORS.map((c) => (
            <span key={c} className={cn("h-3 w-3 rounded-sm", c)} />
          ))}
          More
        </div>
      </div>
    </div>
  );
}
