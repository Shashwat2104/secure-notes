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
      "inline-flex items-center justify-center font-medium rounded-[4px] transition-colors duration-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 focus-visible:ring-offset-[#020617] disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none active:scale-[0.99]";

    const variants = {
      primary:
        "bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-[#020617] font-semibold border border-emerald-400/60 shadow-none",
      secondary:
        "bg-[#0f172a] hover:bg-[#1e293b] active:bg-[#171f33] text-slate-100 border border-[#1e293b] hover:border-[#334155]",
      danger:
        "bg-rose-950/30 hover:bg-rose-900/50 active:bg-rose-950 text-rose-300 border border-rose-500/40 hover:border-rose-400",
      amber:
        "bg-amber-950/30 hover:bg-amber-900/50 active:bg-amber-950 text-amber-300 border border-amber-500/40 hover:border-amber-400",
      outline:
        "border border-[#1e293b] hover:border-[#334155] bg-transparent hover:bg-[#0f172a] text-slate-200",
      ghost:
        "hover:bg-[#1e293b]/70 text-slate-300 hover:text-white border border-transparent",
    };

    const sizes = {
      sm: "px-2.5 py-1 text-xs gap-1.5 h-7.5",
      md: "px-3.5 py-1.5 text-xs sm:text-sm gap-2 h-9",
      lg: "px-5 py-2 text-sm font-semibold gap-2.5 h-10",
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

