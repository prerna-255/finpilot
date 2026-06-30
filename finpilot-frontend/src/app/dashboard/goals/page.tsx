"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target, Car, Plane, Home, Laptop, GraduationCap, ShieldCheck, X, Sparkles } from "lucide-react";
import { Goal, GoalType } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

const GOAL_ICONS: Record<GoalType, { icon: React.ElementType; color: string; bg: string }> = {
  emergency_fund: { icon: ShieldCheck, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  vacation: { icon: Plane, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  car: { icon: Car, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
  house: { icon: Home, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
  education: { icon: GraduationCap, color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30" },
  gadget: { icon: Laptop, color: "text-cyan-600", bg: "bg-cyan-100 dark:bg-cyan-900/30" },
  retirement: { icon: Target, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  custom: { icon: Target, color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-900/30" },
};

const MOCK_GOALS: Goal[] = [
  {
    id: "1", userId: "u1", name: "Emergency Fund", type: "emergency_fund",
    targetAmount: 300000, currentAmount: 185000, targetDate: "2024-06-30",
    monthlySavingsNeeded: 19167, probability: 89,
    suggestions: ["Increase monthly savings by ₹2,000", "Redirect dining budget to this goal"],
    isCompleted: false, createdAt: "", updatedAt: "",
  },
  {
    id: "2", userId: "u1", name: "Goa Vacation", type: "vacation",
    targetAmount: 80000, currentAmount: 32000, targetDate: "2024-12-15",
    monthlySavingsNeeded: 4364, probability: 72,
    suggestions: ["Book flights early for better prices", "Set up auto-transfer on salary day"],
    isCompleted: false, createdAt: "", updatedAt: "",
  },
  {
    id: "3", userId: "u1", name: "MacBook Pro", type: "gadget",
    targetAmount: 200000, currentAmount: 200000, targetDate: "2024-02-01",
    monthlySavingsNeeded: 0, probability: 100,
    suggestions: [],
    isCompleted: true, createdAt: "", updatedAt: "",
  },
];

export default function GoalsPage() {
  const {
  data: goalsData,
  isLoading,
} = useQuery({
  queryKey: ["goals"],
  queryFn: () => api.goals.list(),
});
const goals: Goal[] = (goalsData as any)?.data || [];
const queryClient = useQueryClient();

const createGoalMutation = useMutation({
  mutationFn: (goal: any) => api.goals.create(goal),

  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["goals"] });
    setShowCreate(false);
  },
});
  const [showCreate, setShowCreate] = useState(false);
  const [newGoal, setNewGoal] = useState({
  name: "",
  type: "custom",
  target_amount: "",
  current_amount: "0",
  target_date: "",
});
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Goal Planner</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set financial goals and let AI track your progress
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Goal
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Active Goals", value: goals.filter(g => !g.isCompleted).length, color: "text-brand-600" },
          { label: "Completed", value: goals.filter(g => g.isCompleted).length, color: "text-success-600" },
          {
               label: "Total Saved",
                value: `₹${goals
                   .reduce((sum, goal) => sum + goal.currentAmount, 0)
                 .toLocaleString("en-IN")}`,
                  color: "text-amber-600",
}
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Goals */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {goals.map((goal) => {
            const { icon: Icon, color, bg } = GOAL_ICONS[goal.type];
            const progress = (goal.currentAmount / goal.targetAmount) * 100;

            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-2xl border bg-card p-6 ${goal.isCompleted ? "border-success-500/30" : "border-border"}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  {goal.isCompleted && (
                    <span className="rounded-full bg-success-500/10 px-2.5 py-0.5 text-xs font-medium text-success-600">
                      ✓ Completed
                    </span>
                  )}
                </div>

                <h3 className="font-semibold">{goal.name}</h3>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-lg font-bold">
                  ₹{String(goal.currentAmount)}
                        </span>
                  <span className="text-xs text-muted-foreground">of ₹{String(goal.targetAmount)}</span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full rounded-full ${goal.isCompleted ? "bg-success-500" : "bg-brand-600"}`}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>{progress.toFixed(0)}% reached</span>
                  <span>By {new Date(goal.targetDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                </div>

                {!goal.isCompleted && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
                      <span className="text-muted-foreground">Monthly needed</span>
                      <span className="font-semibold">₹{goal.monthlySavingsNeeded.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
                      <span className="text-muted-foreground">Success probability</span>
                      <span className={`font-semibold ${goal.probability >= 80 ? "text-success-600" : goal.probability >= 60 ? "text-amber-600" : "text-danger-600"}`}>
                        {goal.probability}%
                      </span>
                    </div>

                    {goal.suggestions.length > 0 && (
                      <div className="rounded-lg border border-brand-500/20 bg-brand-500/5 p-3">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-brand-600 mb-1.5">
                          <Sparkles className="h-3 w-3" /> AI Suggestions
                        </div>
                        <ul className="space-y-1">
                          {goal.suggestions.map((s, i) => (
                            <li key={i} className="text-xs text-muted-foreground">• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {/* Create Goal Modal */}
<AnimatePresence>
  {showCreate && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create Goal</h2>

          <button onClick={() => setShowCreate(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <input
            placeholder="Goal Name"
            value={newGoal.name}
            onChange={(e) =>
              setNewGoal({ ...newGoal, name: e.target.value })
            }
            className="w-full rounded-lg border p-2"
          />

          <select
            value={newGoal.type}
            onChange={(e) =>
              setNewGoal({ ...newGoal, type: e.target.value })
            }
            className="w-full rounded-lg border p-2"
          >
            <option value="custom">Custom</option>
            <option value="vacation">Vacation</option>
            <option value="car">Car</option>
            <option value="house">House</option>
            <option value="education">Education</option>
            <option value="gadget">Gadget</option>
            <option value="retirement">Retirement</option>
            <option value="emergency_fund">Emergency Fund</option>
          </select>

          <input
            type="number"
            placeholder="Target Amount"
            value={newGoal.target_amount}
            onChange={(e) =>
              setNewGoal({
                ...newGoal,
                target_amount: e.target.value,
              })
            }
            className="w-full rounded-lg border p-2"
          />

          <input
            type="date"
            value={newGoal.target_date}
            onChange={(e) =>
              setNewGoal({
                ...newGoal,
                target_date: e.target.value,
              })
            }
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => setShowCreate(false)}
            className="rounded-lg border px-4 py-2"
          >
            Cancel
          </button>

          <button
            onClick={() =>
            createGoalMutation.mutate({
            ...newGoal,
            target_amount: Number(newGoal.target_amount),
            current_amount: Number(newGoal.current_amount),
            })
            }
             className="rounded-lg bg-brand-600 px-4 py-2 text-white"
              >
             Create Goal
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
    
  );
}
