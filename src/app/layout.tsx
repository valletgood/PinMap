import type { Metadata, Viewport } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";

export const metadata: Metadata = {
  title: "PinMap",
  description: "PinMap Application",
  icons: {
    icon: "/icons/logo.png",
    apple: "/icons/logo.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PinMap",
  },
  themeColor: "#6f62cb",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#6f62cb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          {children}
          <ToastProvider />
        </QueryProvider>
      </body>
    </html>
  );
}
