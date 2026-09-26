import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helperText, icon, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-[11px] font-mono font-medium uppercase tracking-wider text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 pointer-events-none text-slate-500">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full ${
              icon ? "pl-9" : "px-3"
            } py-2 bg-[#020617] border rounded-[4px] text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 focus:border-emerald-400 transition-colors ${
              error
                ? "border-rose-500/80 focus-visible:ring-rose-400"
                : "border-[#1e293b] hover:border-[#334155]"
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] font-mono text-rose-400">{error}</p>}
        {helperText && !error && (
          <p className="text-[11px] font-mono text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";


