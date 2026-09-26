import * as React from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({
  variant = "info",
  title,
  children,
  className = "",
}: AlertProps) {
  const styles = {
    info: "bg-blue-950/50 border-blue-800 text-blue-200",
    success: "bg-emerald-950/50 border-emerald-800 text-emerald-200",
    warning: "bg-amber-950/50 border-amber-800 text-amber-200",
    error: "bg-red-950/50 border-red-800 text-red-200",
  };

  const icons = {
    info: <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />,
  };

  return (
    <div
      role="alert"
      className={`border rounded-lg p-4 flex gap-3 text-sm ${styles[variant]} ${className}`}
    >
      {icons[variant]}
      <div className="space-y-1">
        {title && <h5 className="font-semibold">{title}</h5>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
