"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, CheckCircle, AlertCircle, Loader2,
  X, BarChart3, FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: UploadStatus;
  progress: number;
  transactionCount?: number;
  error?: string;
}

const SUPPORTED_FORMATS = [
  { ext: "CSV", icon: FileSpreadsheet, color: "text-green-500", description: "Bank statement CSV" },
  { ext: "XLSX", icon: FileSpreadsheet, color: "text-blue-500", description: "Excel spreadsheet" },
  { ext: "PDF", icon: FileText, color: "text-red-500", description: "PDF bank statement" },
];

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const queryClient = useQueryClient();
  const router = useRouter();
  const uploadMutation = useMutation<
  any,
  Error,
  { file: File; uploadId: string }
>({
  mutationFn: async ({
  file,
  uploadId,
}: {
  file: File;
  uploadId: string;
}) => {
  return await api.upload.statement(file, (progress) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadId
          ? {
              ...f,
              progress,
            }
          : f
      )
    );
  });
},
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    queryClient.invalidateQueries({ queryKey: ["analytics-trends"] });
    queryClient.invalidateQueries({ queryKey: ["analytics-merchants"] });
    queryClient.invalidateQueries({ queryKey: ["analytics-heatmap"] });
    queryClient.invalidateQueries({ queryKey: ["health-score"] });
    queryClient.invalidateQueries({ queryKey: ["anomalies"] });
    queryClient.invalidateQueries({ queryKey: ["subscriptions"] });

    toast.success("Statement uploaded successfully!");
  },

  onError: (error: any) => {
    toast.error(error.message || "Upload failed");
  },
});
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const uploadFile: UploadedFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading",
        progress: 0,
      };

      setFiles((prev) => [...prev, uploadFile]);
      uploadMutation.mutate(
        {
             file,
              uploadId: uploadFile.id,
         },
  {
    onSuccess: (response: any) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: "success",
                progress: 100,
                transactionCount:
                  response?.data?.transactions_imported ?? 0,
              }
            : f
        )
      );
    },

    onError: (error: any) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: "error",
                error: error.message,
              }
            : f
        )
      );
    },
  }
);
      
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/pdf": [".pdf"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Upload Statements</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your bank or credit card statements for AI-powered analysis
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200",
          isDragActive
            ? "border-brand-500 bg-brand-500/5"
            : "border-border bg-muted/20 hover:border-brand-500/50 hover:bg-brand-500/5"
        )}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
          className="flex flex-col items-center gap-4 text-center px-6"
        >
          <div className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl transition-colors",
            isDragActive ? "bg-brand-500/20 text-brand-600" : "bg-muted text-muted-foreground"
          )}>
            <Upload className="h-7 w-7" />
          </div>
          <div>
            <p className="text-lg font-semibold">
              {isDragActive ? "Drop your files here" : "Drag & drop your statements"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or <span className="text-brand-600 font-medium">browse files</span>
            </p>
          </div>
          <div className="flex items-center gap-4 mt-2">
            {SUPPORTED_FORMATS.map((fmt) => (
              <div key={fmt.ext} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <fmt.icon className={cn("h-4 w-4", fmt.color)} />
                {fmt.ext}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Max 50MB per file</p>
        </motion.div>
      </div>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <h3 className="text-sm font-semibold">Uploaded Files</h3>
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      {file.status === "success" && (
                        <div className="flex items-center gap-1 text-xs text-success-600">
                          <CheckCircle className="h-3.5 w-3.5" />
                          {file.transactionCount} transactions
                        </div>
                      )}
                      {file.status === "processing" && (
                        <div className="flex items-center gap-1 text-xs text-brand-600">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Processing...
                        </div>
                      )}
                      {file.status === "error" && (
                        <div className="flex items-center gap-1 text-xs text-danger-600">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Error
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {file.status === "uploading" && (
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-brand-600"
                        style={{ width: `${Math.min(file.progress, 100)}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  )}
                  {file.status === "success" && (
                    <div className="h-1.5 overflow-hidden rounded-full bg-success-500/20">
                      <div className="h-full w-full rounded-full bg-success-500" />
                    </div>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </motion.div>
            ))}

            {files.some((f) => f.status === "success") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 rounded-xl border border-success-500/20 bg-success-500/5 p-4"
              >
                <CheckCircle className="h-5 w-5 text-success-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-success-700 dark:text-success-400">
                    Data processed successfully!
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your transactions have been categorized and analyzed.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-1.5 rounded-lg bg-success-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-success-700 transition-colors"
                  >
                  <BarChart3 className="h-3.5 w-3.5" />
                  View Dashboard
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supported formats info */}
      <div className="rounded-2xl border border-border bg-muted/20 p-6">
        <h3 className="text-sm font-semibold mb-4">Supported File Formats</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {SUPPORTED_FORMATS.map((fmt) => (
            <div key={fmt.ext} className="flex items-start gap-3">
              <fmt.icon className={cn("h-5 w-5 mt-0.5 shrink-0", fmt.color)} />
              <div>
                <p className="text-sm font-medium">.{fmt.ext.toLowerCase()}</p>
                <p className="text-xs text-muted-foreground">{fmt.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            🔒 Your data is encrypted in transit and at rest. We never share your financial data with third parties.
            Files are processed securely and stored in encrypted AWS S3.
          </p>
        </div>
      </div>
    </div>
  );
}
