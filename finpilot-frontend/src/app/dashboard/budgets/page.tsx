"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Target } from "lucide-react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

const CATEGORIES = ["food","transport","shopping","entertainment","utilities","health","education","housing","investments","subscriptions","travel","other"];

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: "food", amount: "", period: "monthly" });

  const { data } = useQuery({ queryKey: ["budgets"], queryFn: () => api.budgets.list() });
  const budgets: any[] = (data as any)?.data || [];

  const createMutation = useMutation({
    mutationFn: () => api.budgets.upsert({ category: newBudget.category, amount: parseFloat(newBudget.amount), period: newBudget.period }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["budgets"] }); setShowForm(false); toast.success("Budget created"); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.budgets.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["budgets"] }); toast.success("Budget deleted"); },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Budgets</h1>
          <p className="text-gray-400 mt-1">Set and track spending limits by category</p>
        </div>
        <button onClick={()=>setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4"/> New Budget
        </button>
      </div>
      {showForm && (
        <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold">Create Budget</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-gray-400 text-sm block mb-2">Category</label>
              <select value={newBudget.category} onChange={e=>setNewBudget({...newBudget,category:e.target.value})}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500">
                {CATEGORIES.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-2">Amount (₹)</label>
              <input type="number" value={newBudget.amount} onChange={e=>setNewBudget({...newBudget,amount:e.target.value})} placeholder="5000"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"/>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-2">Period</label>
              <select value={newBudget.period} onChange={e=>setNewBudget({...newBudget,period:e.target.value})}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={()=>createMutation.mutate()} disabled={!newBudget.amount}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium disabled:opacity-40 transition-colors">Save Budget</button>
            <button onClick={()=>setShowForm(false)} className="px-6 py-2.5 bg-white/5 text-gray-300 rounded-xl hover:bg-white/10 transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}
      {budgets.length === 0 ? (
        <div className="text-center py-20">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-4"/>
          <p className="text-gray-400 text-lg">No budgets set yet</p>
          <p className="text-gray-600 mt-1">Create a budget to track your spending limits</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b: any) => (
            <motion.div key={b.id} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.05] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold capitalize">{b.category}</h3>
                  <p className="text-gray-500 text-sm capitalize">{b.period}</p>
                </div>
                <button onClick={()=>deleteMutation.mutate(b.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Budget</span>
                  <span className="text-white font-semibold">{formatCurrency(b.amount)}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{width:"0%"}}/>
                </div>
                <p className="text-gray-500 text-xs">Connect to analytics to see usage</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
