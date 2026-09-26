import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Secure Notes | Ephemeral & Encrypted Sharing",
  description: "Production-grade, end-to-end secure, time-based and one-time self-destructing note sharing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased bg-[#020617] text-slate-100 min-h-screen flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
