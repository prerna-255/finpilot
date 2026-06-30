import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { ApiError } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${BASE_URL}/api/v1`,
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request: attach JWT
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("access_token");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response: handle 401, refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken) {
              const { data } = await axios.post(
                `${BASE_URL}/api/v1/auth/refresh`,
                { refresh_token: refreshToken }
              );
              localStorage.setItem("access_token", data.access_token);
              originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
              return this.client(originalRequest);
            }
          } catch {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/auth/login";
          }
        }

        const apiError: ApiError = {
          message:
            (error.response?.data as { detail?: string })?.detail ||
            error.message ||
            "An unexpected error occurred",
          statusCode: error.response?.status || 500,
        };
        return Promise.reject(apiError);
      }
    );
  }

  // Auth
  auth = {
    login: (email: string, password: string) =>
      this.client.post("/auth/login", { email, password }),
    register: (name: string, email: string, password: string) =>
      this.client.post("/auth/register", { name, email, password }),
    loginWithGoogle: (token: string) =>
      this.client.post("/auth/google", { token }),
    logout: () => this.client.post("/auth/logout"),
    refreshToken: (refreshToken: string) =>
      this.client.post("/auth/refresh", { refresh_token: refreshToken }),
    verifyEmail: (token: string) =>
      this.client.post("/auth/verify-email", { token }),
    forgotPassword: (email: string) =>
      this.client.post("/auth/forgot-password", { email }),
    resetPassword: (token: string, password: string) =>
      this.client.post("/auth/reset-password", { token, password }),
    me: () => this.client.get("/auth/me"),
    updateProfile: (data: FormData) =>
      this.client.put("/auth/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  };

  // Transactions
  transactions = {
    list: (params?: Record<string, unknown>) =>
      this.client.get("/transactions", { params }),
    get: (id: string) => this.client.get(`/transactions/${id}`),
    create: (data: Record<string, unknown>) =>
      this.client.post("/transactions", data),
    update: (id: string, data: Record<string, unknown>) =>
      this.client.put(`/transactions/${id}`, data),
    delete: (id: string) => this.client.delete(`/transactions/${id}`),
    export: (format: "csv" | "excel") =>
      this.client.get("/transactions/export", {
        params: { format },
        responseType: "blob",
      }),
  };

  // Analytics
  analytics = {
    summary: (period?: string) =>
      this.client.get("/analytics/summary", { params: { period } }),
    trends: (months?: number) =>
      this.client.get("/analytics/trends", { params: { months } }),
    categoryBreakdown: (period?: string) =>
      this.client.get("/analytics/categories", { params: { period } }),
    cashFlow: (days?: number) =>
      this.client.get("/analytics/cashflow", { params: { days } }),
    heatmap: (year?: number) =>
      this.client.get("/analytics/heatmap", { params: { year } }),
    topMerchants: (limit?: number) =>
      this.client.get("/analytics/merchants", { params: { limit } }),
    insights: () => this.client.get("/analytics/insights"),
  };

  // ML / Forecasting
  ml = {
    forecast: (months?: number) =>
      this.client.get("/ml/forecast", { params: { months } }),
    anomalies: () => this.client.get("/ml/anomalies"),
    budgetPrediction: () => this.client.get("/ml/budget-prediction"),
    healthScore: () => this.client.get("/ml/health-score"),
    subscriptions: () => this.client.get("/ml/subscriptions"),
  };

  // Upload
  upload = {
    statement: (file: File, onProgress?: (pct: number) => void) => {
      const formData = new FormData();
      formData.append("file", file);
      this.client.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      });
    },
    history: () => this.client.get("/upload/history"),
    delete: (id: string) => this.client.delete(`/upload/${id}`),
  };

  // Goals
  goals = {
    list: () => this.client.get("/goals"),
    get: (id: string) => this.client.get(`/goals/${id}`),
    create: (data: Record<string, unknown>) =>
      this.client.post("/goals", data),
    update: (id: string, data: Record<string, unknown>) =>
      this.client.put(`/goals/${id}`, data),
    delete: (id: string) => this.client.delete(`/goals/${id}`),
    deposit: (id: string, amount: number) =>
      this.client.post(`/goals/${id}/deposit`, { amount }),
  };

  // Chat
  chat = {
    sessions: () => this.client.get("/chat/sessions"),
    session: (id: string) => this.client.get(`/chat/sessions/${id}`),
    sendMessage: (sessionId: string | null, message: string) =>
      this.client.post("/chat", {
        session_id: sessionId,
        message,
      }),
    createSession: () => this.client.post("/chat/sessions"),
    deleteSession: (id: string) =>
      this.client.delete(`/chat/sessions/${id}`),
  };

  // Reports
  reports = {
    list: () => this.client.get("/reports"),
    generate: (period: string) =>
      this.client.post("/reports/generate", { period }),
    download: (id: string) =>
  this.client.get(`/reports/${id}/pdf`, { responseType: "blob" }),
  };

  // Budgets
  budgets = {
    list: () => this.client.get("/budgets"),
    upsert: (data: Record<string, unknown>) =>
      this.client.post("/budgets", data),
    delete: (id: string) => this.client.delete(`/budgets/${id}`),
  };

  // Notifications
  notifications = {
  list: () => this.client.get("/notifications"),

  markRead: (id: string) =>
    this.client.post(`/notifications/${id}/read`),

  markAllRead: () =>
    this.client.post("/notifications/read-all"),
};
}
export const api = new ApiClient();
export default api;
