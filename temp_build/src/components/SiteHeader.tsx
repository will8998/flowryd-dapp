"use client";

import Link from "next/link";
import Image from "next/image";
import { useCantonAuth } from "@/lib/auth-context";

export default function SiteHeader() {
  const { isConnected, partyId, disconnect } = useCantonAuth();

  if (isConnected) return null;

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-background/60 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Flowryd Home">
          <Image src="/flowrydlogo.svg" alt="Flowryd" width={100} height={28} className="h-6 w-auto" />
        </Link>
        <nav className="hidden md:flex items-center gap-6 nav-compact">
          {!isConnected ? (
            <>
              <a href="#problem" className="text-white/70 hover:text-white">Why</a>
              <a href="#what" className="text-white/70 hover:text-white">Playbook</a>
              <a href="#intelligence" className="text-white/70 hover:text-white">Intelligence</a>
              <a href="#moment" className="text-white/70 hover:text-white">Momentum</a>
            </>
          ) : (
            <>
              <Link href="/" className="text-blue-500 font-bold tracking-widest uppercase text-[10px]">Flows Studio</Link>
              <Link href="/discover" className="text-white/70 hover:text-white">Discover</Link>
              <Link href="/demo" className="text-white/70 hover:text-white">Private Canvas</Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-4">
          {isConnected ? (
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-white/40 hidden sm:inline">{partyId}</span>
              <button 
                onClick={disconnect}
                className="text-[10px] font-bold text-white/60 hover:text-white border border-white/10 rounded px-2 py-1"
              >
                Exit
              </button>
            </div>
          ) : (
            <a href="/media-kit" className="nav-compact btn-outline px-4 py-2 rounded">Media Kit</a>
          )}
        </div>
      </div>
    </header>
  );
}


