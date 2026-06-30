"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Trash2, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

const EMOJI: Record<string, string> = {
  food:"🍽️",transport:"🚗",shopping:"🛍️",entertainment:"🎬",utilities:"⚡",
  health:"💊",education:"📚",housing:"🏠",investments:"📈",salary:"💼",
  freelance:"💻",subscriptions:"📱",travel:"✈️",other:"💳",
};
const COLORS: Record<string, string> = {
  food:"bg-amber-500/10 text-amber-400",transport:"bg-emerald-500/10 text-emerald-400",
  shopping:"bg-pink-500/10 text-pink-400",entertainment:"bg-purple-500/10 text-purple-400",
  utilities:"bg-cyan-500/10 text-cyan-400",health:"bg-red-500/10 text-red-400",
  education:"bg-blue-500/10 text-blue-400",housing:"bg-indigo-500/10 text-indigo-400",
  investments:"bg-teal-500/10 text-teal-400",salary:"bg-green-500/10 text-green-400",
  freelance:"bg-green-500/10 text-green-400",subscriptions:"bg-violet-500/10 text-violet-400",
  travel:"bg-orange-500/10 text-orange-400",other:"bg-gray-500/10 text-gray-400",
};

export default function TransactionsPage() {
  const [showModal, setShowModal] = useState(false);

const [form, setForm] = useState({
  amount: "",
  description: "",
  merchant: "",
  category: "food",
  type: "expense",
  date: new Date().toISOString().split("T")[0],
});
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", page, search, typeFilter, categoryFilter],
    queryFn: () => api.transactions.list({ page, page_size: 20, search: search||undefined, type: typeFilter||undefined, category: categoryFilter||undefined }),
  });



  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.transactions.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["transactions"] }); toast.success("Deleted"); },
  });
  const addMutation = useMutation({
  mutationFn: () =>
    api.transactions.create({
      amount: Number(form.amount),
      description: form.description,
      merchant: form.merchant,
      category: form.category,
      type: form.type,
      date: form.date,
    }),

  onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["transactions"] });

  queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });

  queryClient.invalidateQueries({ queryKey: ["analytics-trends"] });

  queryClient.invalidateQueries({ queryKey: ["analytics-merchants"] });

  queryClient.invalidateQueries({ queryKey: ["analytics-heatmap"] });

  queryClient.invalidateQueries({ queryKey: ["health-score"] });

  queryClient.invalidateQueries({ queryKey: ["anomalies"] });

  queryClient.invalidateQueries({ queryKey: ["subscriptions"] });

  toast.success("Transaction added successfully");
},

  onError: (err: any) => {
    console.error(err);
    toast.error("Failed to add transaction");
  },
});
  const transactions: any[] = (data as any)?.data?.data || [];
  const total: number = (data as any)?.data?.total || 0;
  const totalPages: number = (data as any)?.data?.total_pages || 1;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-gray-400 mt-1">{total} transactions</p>
        </div>
        <button
    onClick={() => setShowModal(true)}
    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
>
    <Plus className="w-4 h-4"/>
    Add
</button>
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search..." value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"/>
        </div>
        <select value={typeFilter} onChange={(e)=>{setTypeFilter(e.target.value);setPage(1);}}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500">
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={categoryFilter} onChange={(e)=>{setCategoryFilter(e.target.value);setPage(1);}}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500">
          <option value="">All Categories</option>
          {Object.keys(EMOJI).map(cat=><option key={cat} value={cat}>{EMOJI[cat]} {cat}</option>)}
        </select>
      </div>
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center"><RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3"/><p className="text-gray-400">Loading...</p></div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center"><p className="text-gray-400 text-lg">No transactions found</p><p className="text-gray-600 mt-1">Upload a bank statement to get started</p></div>
        ) : (
          <div className="divide-y divide-white/5">
            {transactions.map((tx: any, i: number) => (
              <motion.div key={tx.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.02}}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${COLORS[tx.category]||"bg-gray-500/10"}`}>
                  {EMOJI[tx.category]||"💳"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{tx.merchant||tx.description}</p>
                  <p className="text-gray-500 text-sm truncate">{tx.description}</p>
                </div>
                <span className="text-gray-400 text-sm whitespace-nowrap">
                  {new Date(tx.date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${COLORS[tx.category]||"bg-gray-500/10 text-gray-400"}`}>
                  {tx.category}
                </span>
                <span className={`font-semibold whitespace-nowrap ${tx.type==="income"?"text-emerald-400":"text-red-400"}`}>
                  {tx.type==="income"?"+":"-"}{formatCurrency(tx.amount)}
                </span>
                <button onClick={()=>deleteMutation.mutate(tx.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4"/>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {totalPages>1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-40">Previous</button>
          <span className="text-gray-400 px-4">Page {page} of {totalPages}</span>
          <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-40">Next</button>
        </div>
      )}
      {showModal && (
<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

<div className="bg-[#111827] rounded-xl p-6 w-[450px] space-y-4">

<h2 className="text-xl font-bold text-white">
Add Transaction
</h2>

<input
placeholder="Amount"
className="w-full p-3 rounded bg-gray-800 text-white"
value={form.amount}
onChange={(e)=>setForm({...form,amount:e.target.value})}
/>

<input
placeholder="Merchant"
className="w-full p-3 rounded bg-gray-800 text-white"
value={form.merchant}
onChange={(e)=>setForm({...form,merchant:e.target.value})}
/>

<input
placeholder="Description"
className="w-full p-3 rounded bg-gray-800 text-white"
value={form.description}
onChange={(e)=>setForm({...form,description:e.target.value})}
/>

<select
className="w-full p-3 rounded bg-gray-800 text-white"
value={form.category}
onChange={(e)=>setForm({...form,category:e.target.value})}
>
{Object.keys(EMOJI).map(cat=>(
<option key={cat}>{cat}</option>
))}
</select>

<select
className="w-full p-3 rounded bg-gray-800 text-white"
value={form.type}
onChange={(e)=>setForm({...form,type:e.target.value})}
>
<option value="expense">Expense</option>
<option value="income">Income</option>
</select>

<input
type="date"
className="w-full p-3 rounded bg-gray-800 text-white"
value={form.date}
onChange={(e)=>setForm({...form,date:e.target.value})}
/>

<div className="flex justify-end gap-3">

<button
onClick={()=>setShowModal(false)}
className="px-4 py-2 rounded bg-gray-700 text-white"
>
Cancel
</button>

<button
  onClick={() => addMutation.mutate()}
  className="px-4 py-2 rounded bg-indigo-600 text-white"
>
  Save
</button>

</div>

</div>

</div>
)}
    </div>
  );
}
