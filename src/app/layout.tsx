import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PageBackground } from "@/components/layout/PageBackground";
import { Navbar } from "@/components/layout/Navbar";
import { CTABanner } from "@/components/layout/CTABanner";
import { Footer } from "@/components/layout/Footer";
import { AuthModal } from "@/components/features/auth/AuthModal";
import { AuthProvider } from "@/components/features/auth/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AWS Builder Group LPU",
  description:
    "Official website for AWS Builder Group LPU - Learn, Build, and Grow with Cloud Computing.",
  icons: {
    icon: [
      { url: "/images/logo.svg", type: "image/svg+xml" },
      { url: "/images/logo.png", type: "image/png" },
    ],
    shortcut: "/images/logo.svg",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <AuthProvider>
          <PageBackground />
          <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <CTABanner />
            <Footer />
            <Suspense fallback={null}>
              <AuthModal />
            </Suspense>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
