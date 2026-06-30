"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import api from "@/lib/api";

const SEVERITY_STYLES: Record<string, string> = {
  warning: "border-amber-500/30 bg-amber-500/5",
  info: "border-blue-500/30 bg-blue-500/5",
  success: "border-emerald-500/30 bg-emerald-500/5",
  danger: "border-red-500/30 bg-red-500/5",
};
const SEVERITY_ICON: Record<string, any> = {
  warning: AlertTriangle, info: Lightbulb, success: CheckCircle, danger: AlertTriangle,
};

export default function InsightsPage() {
  
  const {
  data: healthData,
  isLoading: loadingHealth,
} = useQuery({
  queryKey: ["health-score"],
  queryFn: () => api.ml.healthScore(),
});

const {
  data: anomalyData,
  isLoading: loadingAnomalies,
} = useQuery({
  queryKey: ["anomalies"],
  queryFn: () => api.ml.anomalies(),
});

const {
  data: subscriptionData,
  isLoading: loadingSubscriptions,
} = useQuery({
  queryKey: ["subscriptions"],
  queryFn: () => api.ml.subscriptions(),
});

  const health = (healthData as any)?.data || { score: 0, label: "—", breakdown: {} };
  const anomalies: any[] = (anomalyData as any)?.data || [];
  const subscriptions: any[] = (subscriptionData as any)?.data || [];
  if (loadingHealth || loadingAnomalies || loadingSubscriptions) {
  return (
    <div className="p-8 text-center text-gray-400">
      Loading AI Insights...
    </div>
  );
}

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Insights</h1>
        <p className="text-gray-400 mt-1">Personalized analysis powered by your financial data</p>
      </div>

      {/* Health Score */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8"/>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="8"
                strokeDasharray={`${health.score * 2.51} 251`} strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{health.score}</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Financial Health: {health.label}</h2>
            <p className="text-gray-400 mt-1">Based on your spending patterns, savings rate, and financial stability</p>
            <div className="flex gap-4 mt-3">
              {Object.entries(health.breakdown || {}).map(([k, v]: any) => (
                <div key={k} className="text-center">
                  <p className="text-white font-semibold">{v}</p>
                  <p className="text-gray-500 text-xs capitalize">{k}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400"/> Unusual Transactions ({anomalies.length})
          </h2>
          <div className="space-y-3">
            {anomalies.map((a: any, i: number) => (
              <motion.div key={i} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                className="flex items-start gap-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-400"/>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{a.merchant || a.category}</p>
                  <p className="text-gray-400 text-sm mt-0.5">{a.reason}</p>
                  <p className="text-amber-400 text-sm font-semibold mt-1">₹{a.amount?.toLocaleString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${a.severity==="high"?"bg-red-500/10 text-red-400":"bg-amber-500/10 text-amber-400"}`}>
                  {a.severity}
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Subscriptions */}
      {subscriptions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Detected Subscriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map((s: any, i: number) => (
              <motion.div key={i} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:i*0.05}}
                className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📱</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{s.merchant}</p>
                  <p className="text-gray-400 text-sm">₹{s.amountPerMonth}/month · Last used {s.lastUsedDaysAgo}d ago</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${s.recommendation==="cancel"?"bg-red-500/10 text-red-400":"bg-emerald-500/10 text-emerald-400"}`}>
                  {s.recommendation}
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {health.score === 0 && anomalies.length === 0 && subscriptions.length === 0 && (
        <div className="bg-[#111827] rounded-2xl p-10 border border-gray-800 text-center">

    <Lightbulb className="w-14 h-14 mx-auto text-indigo-500 mb-5"/>

    <h2 className="text-2xl font-bold text-white">
        No AI Insights Yet
    </h2>

    <p className="mt-3 text-gray-400">
        Upload your first bank statement to unlock
        AI-powered financial analysis.
    </p>

    <div className="mt-8 grid md:grid-cols-2 gap-4 text-left">

        <div className="bg-black/20 rounded-xl p-4">
            📊 Spending Analysis
        </div>

        <div className="bg-black/20 rounded-xl p-4">
            💡 Saving Opportunities
        </div>

        <div className="bg-black/20 rounded-xl p-4">
            📈 Expense Forecasting
        </div>

        <div className="bg-black/20 rounded-xl p-4">
            🤖 Personalized AI Advice
        </div>

    </div>

</div>
      )}
    </div>
  );
}
