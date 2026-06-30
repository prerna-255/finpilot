"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, Mail, Lock, User, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Needs an uppercase letter")
      .regex(/[0-9]/, "Needs a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const requirements = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /[0-9]/.test(v) },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterForm) => {
    setIsSubmitting(true);
    try {
      const { data } = await api.auth.register(values.name, values.email, values.password);
      setAuth(
       data.user,
       data.access_token,
      data.refresh_token
      );
      toast.success("Account created! Welcome to FinPilot AI 🎉");
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create account";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground">Start managing your money intelligently</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Arjun Sharma"
                  className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-danger-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-danger-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  {...register("password")}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
              <div className="mt-2 space-y-1">
                {requirements.map((req) => {
                  const passed = req.test(password);
                  return (
                    <div key={req.label} className="flex items-center gap-1.5 text-xs">
                      <span
                        className={cn(
                          "flex h-3.5 w-3.5 items-center justify-center rounded-full",
                          passed ? "bg-success-500 text-white" : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      <span className={passed ? "text-success-600" : "text-muted-foreground"}>{req.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-danger-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
