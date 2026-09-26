import * as React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

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
    info: "bg-slate-900/90 border-slate-700 text-slate-200",
    success: "bg-emerald-950/60 border-emerald-500/40 text-emerald-200",
    warning: "bg-amber-950/60 border-amber-500/40 text-amber-200",
    error: "bg-rose-950/60 border-rose-500/40 text-rose-200",
  };

  const icons = {
    info: <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
  };

  return (
    <div
      role="alert"
      className={`border rounded-md p-3 flex gap-2.5 text-xs ${styles[variant]} ${className}`}
    >
      {icons[variant]}
      <div className="space-y-0.5 text-left flex-1">
        {title && <h5 className="font-mono font-medium text-[11px] tracking-wide uppercase opacity-95">{title}</h5>}
        <div className="leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}


