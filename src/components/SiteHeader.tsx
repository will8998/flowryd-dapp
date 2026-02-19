"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCantonAuth } from "@/lib/auth-context";

const AUTH_ROUTES = ["/login", "/register"];

export default function SiteHeader() {
  const pathname = usePathname();
  const { isConnected, isLoading } = useCantonAuth();

  if (isLoading || isConnected || AUTH_ROUTES.includes(pathname)) return null;

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-background/60 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Flowryd Home">
          <Image src="/flowrydlogo.svg" alt="Flowryd" width={100} height={28} className="h-6 w-auto" />
        </Link>
        <nav className="hidden md:flex items-center gap-6 nav-compact">
          <Link href="/#problem" className="text-white/70 hover:text-white">Why</Link>
          <Link href="/#what" className="text-white/70 hover:text-white">Playbook</Link>
          <Link href="/#intelligence" className="text-white/70 hover:text-white">Intelligence</Link>
          <Link href="/#moment" className="text-white/70 hover:text-white">Momentum</Link>
        </nav>
        <div className="flex items-center gap-4">
          <a href="/media-kit" className="nav-compact btn-outline px-4 py-2 rounded">Media Kit</a>
        </div>
      </div>
    </header>
  );
}
