import type { Metadata } from "next";
import { Toaster } from "sonner";
import { StudioShell } from "@/components/layout/studio-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paper House Studio",
  description:
    "Manuscript management studio for The House of Paper — a historical fiction series set in the Abbasid Caliphate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Inter:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased h-screen h-[100dvh] overflow-hidden">
        <StudioShell>{children}</StudioShell>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--card)",
              color: "var(--card-foreground)",
              border: "1px solid var(--border)",
            },
          }}
        />
      </body>
    </html>
  );
}
