import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { QueryProvider } from "@/components/layout/QueryProvider";
import { Toaster } from "sonner";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FinPilot AI — AI Financial Copilot",
    template: "%s | FinPilot AI",
  },
  description:
    "AI-powered financial analytics platform. Upload your bank statements, get instant insights, anomaly detection, expense forecasting, and intelligent financial advice.",
  keywords: [
    "personal finance",
    "AI finance",
    "expense tracker",
    "budget planner",
    "financial analytics",
    "expense forecasting",
  ],
  authors: [{ name: "FinPilot AI Team" }],
  creator: "FinPilot AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://finpilot.ai",
    title: "FinPilot AI — AI Financial Copilot",
    description: "Your money, intelligently managed.",
    siteName: "FinPilot AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "FinPilot AI",
    description: "Your money, intelligently managed.",
    creator: "@finpilotai",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: { borderRadius: "12px" },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
