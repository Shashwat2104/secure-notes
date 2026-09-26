import * as React from "react";

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-[#0b1326] border border-[#1e293b] rounded-[4px] p-4 sm:p-5 relative ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`mb-5 space-y-1 ${className}`}>{children}</div>;
}

export function CardTitle({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h2 className={`text-base sm:text-lg font-semibold tracking-tight text-slate-100 ${className}`}>
      {children}
    </h2>
  );
}

export function CardDescription({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <p className={`text-xs text-slate-400 leading-relaxed ${className}`}>{children}</p>;
}

export function CardContent({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

export function CardFooter({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between gap-3 ${className}`}>
      {children}
    </div>
  );
}


