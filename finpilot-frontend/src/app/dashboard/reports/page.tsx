"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Sparkles, Loader2, Plus, Calendar } from "lucide-react";
interface Report {
  id: string;
  title: string;
  period: string;
  generated_at: string;
  summary: string;
}


const PERIOD_OPTIONS = ["This Month", "Last Month", "This Quarter", "This Year", "Custom"];

export default function ReportsPage() {
    const queryClient = useQueryClient();

    const { data: reportsData } = useQuery({
        queryKey: ["reports"],
        queryFn: () => api.reports.list(),
    });

  const reports: Report[] = (reportsData as any)?.data || [];
  const generateMutation = useMutation({
      mutationFn: (period: string) => api.reports.generate(period),

      onSuccess: () => {
        queryClient.invalidateQueries({
        queryKey: ["reports"],
      });
    },
  });
  const [generating, setGenerating] = useState(false);
  const [period, setPeriod] = useState(PERIOD_OPTIONS[0]);

  const handleGenerate = () => {
    generateMutation.mutate(period);
  };


  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Beautiful, downloadable financial reports written by AI
          </p>
        </div>
      </div>

      {/* Generate card */}
      <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-brand-600" />
          <h3 className="font-semibold">Generate a new report</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-10 rounded-lg border border-border bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              {PERIOD_OPTIONS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60 transition-colors"
          >
            {generateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                  <Plus className="h-4 w-4" />
                    )}
            {generateMutation.isPending
                        ? "Generating report..."
                      : "Generate report"}
          </button>
        </div>
      </div>

      {/* Reports list */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Your Reports</h3>
        <AnimatePresence>
          {reports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-medium text-sm">{report.title}</h4>
                  <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors">
                    <Download className="h-3.5 w-3.5" /> PDF
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Generated {new Date(report.generated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{report.summary}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
