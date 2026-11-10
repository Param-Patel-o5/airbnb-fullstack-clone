import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import FilterModal from "@/components/FilterModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Airbnb | Holiday rentals, cabins, beach houses & more",
  description: "Full-stack Airbnb clone built with Next.js, FastAPI, and SQLite.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[#222222]">
        <AppProvider>
          <Navbar />
          <AuthModal />
          <FilterModal />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[#DDDDDD] bg-[#F7F7F7] mt-12">
            <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6A6A6A]">
              <div>© 2026 Airbnb Clone · SDE Fullstack Evaluation</div>
              <div className="flex items-center gap-4">
                <span>Privacy</span>
                <span>·</span>
                <span>Terms</span>
                <span>·</span>
                <span>INR (₹)</span>
              </div>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
