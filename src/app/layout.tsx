import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Public Sentiment Viewer",
  description: "Analisis Sentiment Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen font-sans antialiased flex flex-col", inter.variable)}>
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-slate-200/50 bg-white/40 backdrop-blur-sm mt-auto">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
            <div className="font-medium">
              &copy; 2026 <span className="text-indigo-600 font-semibold">@muhammadhabibna</span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://www.linkedin.com/in/muhammad-habib-nur-aiman-b82b07313/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-600 transition-colors flex items-center gap-2"
              >
                <span className="font-semibold">LinkedIn</span>
              </a>
              <a
                href="https://github.com/MuhammadHabibna"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 transition-colors flex items-center gap-2"
              >
                <span className="font-semibold">GitHub</span>
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
