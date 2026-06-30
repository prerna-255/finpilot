"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BarChart3, Bot, Shield, Zap, TrendingUp, Upload, Brain } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload Any Statement",
    description: "CSV, Excel, PDF bank statements. Auto-parsed, cleaned, and categorized in seconds.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Get intelligent insights about your spending patterns, anomalies, and saving opportunities.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: TrendingUp,
    title: "Expense Forecasting",
    description: "Prophet + XGBoost ML models predict your future expenses with confidence intervals.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: Bot,
    title: "RAG Chatbot",
    description: "Ask anything about your finances. Our AI answers using your actual transaction data.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: BarChart3,
    title: "Premium Dashboards",
    description: "Beautiful interactive charts — bar, line, treemap, heatmap, Sankey diagrams.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "End-to-end encryption, JWT auth, SQL injection prevention, CSRF protection.",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
];

const stats = [
  { label: "Transactions Analyzed", value: "10M+" },
  { label: "Users", value: "50K+" },
  { label: "Avg Savings Identified", value: "$340/mo" },
  { label: "Anomalies Detected", value: "99.2%" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">FinPilot AI</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
            <Link
              href="/auth/register"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 mx-auto max-w-4xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-600 dark:text-brand-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            Now with GPT-4o powered RAG Chatbot
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
            Your Money,{" "}
            <span className="gradient-text">Intelligently</span>{" "}
            Managed
          </h1>

          <p className="mb-10 text-xl text-muted-foreground md:text-2xl">
            Upload your bank statements. Get AI-powered insights, anomaly detection,
            expense forecasting, and a financial copilot that knows your money inside out.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/register"
              className="group flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700 transition-all"
            >
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-border bg-card px-8 py-3.5 text-base font-medium hover:bg-accent transition-colors"
            >
              View demo
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required · Free forever plan · Bank-grade encryption
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold md:text-5xl">
              Everything you need to master your finances
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powered by ML models, LangChain RAG, and beautiful visualizations.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 card-hover"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.bg}`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold md:text-5xl">
            Ready to take control of your finances?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of users who have discovered smarter ways to manage money.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700 transition-all"
            >
              Get started — it&apos;s free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-brand-600" />
            <span className="font-semibold">FinPilot AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 FinPilot AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
