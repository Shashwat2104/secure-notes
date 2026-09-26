import * as React from "react";
import { Flame, Clock, Ban, Key, Globe, ShieldCheck } from "lucide-react";

export type BadgeVariant =
  | "active"
  | "consumed"
  | "one_time"
  | "expired"
  | "revoked"
  | "protected"
  | "public"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function Badge({
  variant = "neutral",
  showIcon = true,
  children,
  className = "",
  ...props
}: BadgeProps) {
  const styles: Record<BadgeVariant, string> = {
    active:
      "bg-emerald-950/60 text-emerald-400 border-emerald-500/30",
    consumed:
      "bg-amber-950/60 text-amber-300 border-amber-500/30",
    one_time:
      "bg-amber-950/60 text-amber-300 border-amber-500/30",
    expired:
      "bg-slate-900/90 text-slate-400 border-slate-700/60",
    revoked:
      "bg-rose-950/60 text-rose-300 border-rose-500/30",
    protected:
      "bg-emerald-950/60 text-emerald-300 border-emerald-500/30",
    public:
      "bg-sky-950/60 text-sky-300 border-sky-500/30",
    neutral:
      "bg-slate-900/90 text-slate-300 border-slate-800",
  };

  const icons: Record<BadgeVariant, React.ReactNode | null> = {
    active: <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />,
    consumed: <Flame className="w-3 h-3 text-amber-400 shrink-0" />,
    one_time: <Flame className="w-3 h-3 text-amber-400 shrink-0" />,
    expired: <Clock className="w-3 h-3 text-slate-400 shrink-0" />,
    revoked: <Ban className="w-3 h-3 text-rose-400 shrink-0" />,
    protected: <Key className="w-3 h-3 text-emerald-400 shrink-0" />,
    public: <Globe className="w-3 h-3 text-sky-400 shrink-0" />,
    neutral: null,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-mono font-medium border ${styles[variant]} ${className}`}
      {...props}
    >
      {showIcon && icons[variant]}
      <span>{children}</span>
    </span>
  );
}

