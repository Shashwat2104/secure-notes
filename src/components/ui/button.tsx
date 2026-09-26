import * as React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost" | "amber";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-md transition-all duration-120 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-500 text-slate-950 font-semibold border border-emerald-400/40 shadow-xs hover:shadow-emerald-500/10",
      secondary:
        "bg-slate-900/90 hover:bg-slate-850 hover:border-slate-600 text-slate-200 border border-slate-700/80 active:bg-slate-800",
      danger:
        "bg-rose-950/60 hover:bg-rose-900/80 active:bg-rose-950 text-rose-200 border border-rose-500/50 shadow-xs",
      amber:
        "bg-amber-950/60 hover:bg-amber-900/80 active:bg-amber-950 text-amber-200 border border-amber-500/50 shadow-xs",
      outline:
        "border border-slate-700 bg-transparent hover:bg-slate-800/60 text-slate-200",
      ghost:
        "hover:bg-slate-850 hover:bg-slate-800/60 text-slate-300 hover:text-white",
    };

    const sizes = {
      sm: "px-2.5 py-1 text-xs gap-1.5 h-7.5",
      md: "px-3.5 py-1.5 text-xs sm:text-sm gap-2 h-9",
      lg: "px-5 py-2.5 text-sm font-semibold gap-2.5 h-10.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

