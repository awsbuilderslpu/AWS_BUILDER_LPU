import * as React from "react";
import { Suspense } from "react";
import { Navbar, NavbarFallback } from "@/components/layout/Navbar";
import { CTABanner } from "@/components/layout/CTABanner";
import { Footer } from "@/components/layout/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">{children}</main>
      <CTABanner />
      <Footer />
    </div>
  );
}

