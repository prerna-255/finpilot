// ========================
// FinPilot AI — TypeScript Types
// ========================

// Auth
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  isEmailVerified: boolean;
  plan: "free" | "pro" | "enterprise";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Transactions
export type TransactionType = "income" | "expense" | "transfer";
export type TransactionCategory =
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "utilities"
  | "health"
  | "education"
  | "housing"
  | "investments"
  | "salary"
  | "freelance"
  | "subscriptions"
  | "travel"
  | "other";

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  type: TransactionType;
  category: TransactionCategory;
  merchant?: string;
  account?: string;
  tags?: string[];
  isAnomaly: boolean;
  isRecurring: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics / Dashboard
export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  netWorth: number;
  financialHealthScore: number;
  budgetUsagePercent: number;
  savingsRatePercent: number;
  topCategory: string;
  monthOverMonthChange: {
    income: number;
    expense: number;
    savings: number;
  };
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

export interface CategoryBreakdown {
  category: TransactionCategory;
  amount: number;
  percent: number;
  count: number;
  color: string;
}

export interface CashFlow {
  date: string;
  inflow: number;
  outflow: number;
  net: number;
  balance: number;
}

export interface SpendingHeatmap {
  date: string;
  value: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface TopMerchant {
  merchant: string;
  amount: number;
  count: number;
  category: TransactionCategory;
}

// ML / Forecasting
export interface ForecastPoint {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
  actual?: number;
}

export interface AnomalyDetection {
  transactionId: string;
  transaction: Transaction;
  anomalyScore: number;
  reason: string;
  severity: "low" | "medium" | "high";
}

export interface BudgetPrediction {
  category: TransactionCategory;
  predictedAmount: number;
  recommendedBudget: number;
  currentBudget?: number;
  confidence: number;
}

export interface FinancialInsight {
  id: string;
  type: "warning" | "success" | "info" | "tip";
  title: string;
  description: string;
  metric?: number;
  action?: string;
  createdAt: string;
}

// Goals
export type GoalType =
  | "emergency_fund"
  | "vacation"
  | "car"
  | "house"
  | "education"
  | "retirement"
  | "gadget"
  | "custom";

export interface Goal {
  id: string;
  userId: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlySavingsNeeded: number;
  probability: number;
  suggestions: string[];
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Upload
export type UploadStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface UploadedFile {
  id: string;
  userId: string;
  filename: string;
  fileType: "csv" | "excel" | "pdf";
  fileSize: number;
  s3Key: string;
  status: UploadStatus;
  transactionCount?: number;
  errorMessage?: string;
  uploadedAt: string;
}

// Chat
export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  charts?: ChartData[];
  tables?: TableData[];
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChartData {
  type: "bar" | "line" | "pie" | "area";
  title: string;
  data: Record<string, unknown>[];
}

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

// Reports
export interface Report {
  id: string;
  userId: string;
  title: string;
  period: string;
  generatedAt: string;
  s3Key: string;
  summary: string;
  kpis: Record<string, number>;
}

// Budget
export interface Budget {
  id: string;
  userId: string;
  category: TransactionCategory;
  amount: number;
  period: "monthly" | "weekly" | "annual";
  spent: number;
  remaining: number;
  usagePercent: number;
}

// Notifications
export type NotificationType =
  | "budget_exceeded"
  | "bill_due"
  | "high_spending"
  | "suspicious_transaction"
  | "savings_milestone"
  | "goal_reminder";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// API response wrappers
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
