"use client";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Shield,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
// Mock data — replace with React Query calls in production




const StatCard = ({ title, value, change, icon: Icon, color, prefix = "₹" }: {
  title: string; value: number; change?: number; icon: React.ElementType; color: string; prefix?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-border bg-card p-6 card-hover"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-bold tabular-nums">
          {prefix}{value.toLocaleString("en-IN")}
        </p>
        {change !== undefined && (
          <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${change >= 0 ? "text-success-600" : "text-danger-600"}`}>
            {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(change)}% vs last month
          </div>
        )}
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </motion.div>
);


  export default function DashboardPage() {
  const { user } = useAuthStore();
    const { data, isLoading } = useQuery({
  queryKey: ["dashboard-summary"],
  queryFn: () => api.analytics.summary(),
});
if (isLoading) {
  return (
    <div className="p-8 text-center">
      Loading Dashboard...
    </div>
  );
}
const summary = data?.data?.summary ?? {
  totalIncome: 0,
  totalExpense: 0,
  netSavings: 0,
  netWorth: 0,
  financialHealthScore: 0,
  budgetUsagePercent: 0,
  monthOverMonthChange: {
    income: 0,
    expense: 0,
    savings: 0,
  },
};

const trends = data?.data?.trends ?? [];
const categories = data?.data?.categories ?? [];
const transactions = data?.data?.transactions ?? [];
const insights = data?.data?.insights ?? [];
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">
  Good morning, {user?.name || "User"} 👋
</h1>
        <p className="text-sm text-muted-foreground">
          Here's your financial overview for January 2024
        </p>
      </div>

      {/* AI Insights banner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 rounded-xl border border-brand-500/20 bg-brand-500/5 p-4"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">AI Insight</p>
          <p className="text-xs text-muted-foreground">
  Your savings rate increased by 12.5% this month...
</p>
        </div>
        <button className="shrink-0 rounded-lg border border-brand-500/30 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-500/10 transition-colors">
          View insights →
        </button>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Monthly Income"
          value={summary.totalIncome}
          change={summary.monthOverMonthChange.income}
          icon={TrendingUp}
          color="bg-success-500/10 text-success-600"
        />
        <StatCard
          title="Monthly Expense"
          value={summary.totalExpense}
          change={summary.monthOverMonthChange.expense}
          icon={TrendingDown}
          color="bg-danger-500/10 text-danger-600"
        />
        <StatCard
          title="Net Savings"
          value={summary.netSavings}
          change={summary.monthOverMonthChange.savings}
          icon={PiggyBank}
          color="bg-brand-500/10 text-brand-600"
        />
        <StatCard
          title="Net Worth"
          value={summary.netWorth}
          icon={DollarSign}
          color="bg-amber-500/10 text-amber-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Income vs Expense Trend */}
        <div className="col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Income vs Expense</h3>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <select className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/30">
              <option>6 months</option>
              <option>12 months</option>
              <option>YTD</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
                contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
              />
              <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fill="url(#income)" name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#expense)" name="Expense" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-6">
            <h3 className="font-semibold">Spending by Category</h3>
            <p className="text-xs text-muted-foreground">January 2024</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {categories.map((entry: any, index: number) => (
  <Cell key={`cell-${index}`} fill={entry.color} />
))}
              </Pie>
              <Tooltip formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {categories.slice(0, 4).map((cat: any) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ background: cat.color }} />
                <span className="flex-1 text-xs text-muted-foreground">{cat.name}</span>
                <span className="text-xs font-medium tabular-nums">₹{cat.value.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold">Recent Transactions</h3>
            <button className="text-xs text-brand-600 hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {transactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-accent transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-lg">
                  {tx.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.merchant}</p>
                  <p className="text-xs text-muted-foreground">{tx.category} · {tx.date}</p>
                </div>
                <span className={`text-sm font-semibold tabular-nums ${tx.amount > 0 ? "text-success-600" : "text-foreground"}`}>
                  {tx.amount > 0 ? "+" : ""}₹{Math.abs(tx.amount).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold">AI Insights</h3>
            <span className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-medium text-brand-600">
              {insights.length} new
            </span>
          </div>
          <div className="space-y-3">
            {insights.map((insight: any, i: number) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${
                  insight.type === "warning" ? "border-amber-500/20 bg-amber-500/5" :
                  insight.type === "success" ? "border-success-500/20 bg-success-500/5" :
                  insight.type === "alert" ? "border-danger-500/20 bg-danger-500/5" :
                  "border-brand-500/20 bg-brand-500/5"
                }`}
              >
                <span className="text-base">{insight.icon}</span>
                <p className="leading-relaxed text-xs">{insight.message}</p>
              </div>
            ))}
          </div>

          {/* Financial Health Score */}
          <div className="mt-6 rounded-xl bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Shield className="h-4 w-4 text-brand-600" />
                Financial Health Score
              </div>
              <span className="text-2xl font-bold text-brand-600">{summary.financialHealthScore}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${summary.financialHealthScore}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-green-500"
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Good — above average. Focus on reducing discretionary spending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
