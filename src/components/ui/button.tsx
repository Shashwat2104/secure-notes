import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
      primary:
        "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 focus:ring-offset-slate-900 shadow-sm",
      secondary:
        "bg-slate-800 hover:bg-slate-700 text-slate-100 focus:ring-slate-500 focus:ring-offset-slate-900 border border-slate-700",
      danger:
        "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 focus:ring-offset-slate-900 shadow-sm",
      outline:
        "border border-slate-600 hover:bg-slate-800 text-slate-200 focus:ring-slate-400 focus:ring-offset-slate-900",
      ghost:
        "hover:bg-slate-800 text-slate-300 hover:text-white focus:ring-slate-400 focus:ring-offset-slate-900",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base font-semibold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
