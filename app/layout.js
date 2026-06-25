import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import AnimatedBackground from "@/components/AnimatedBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Saving Tracker — Track every rupee",
  description:
    "A modern, month-wise expense and savings tracker. Categorize spends, see where your money goes, and grow your savings.",
};

export const viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <AnimatedBackground />
        {children}
        <Toaster
          theme="dark"
          position="top-center"
          richColors
          toastOptions={{
            style: {
              background: "#181824",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e7e7ef",
            },
          }}
        />
      </body>
    </html>
  );
}
