import Link from "next/link";
import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-8">
          <Link href="/" aria-label="Flowryd Home">
            <Image src="/flowrydlogo.svg" alt="Flowryd" width={120} height={32} className="h-8 w-auto" />
          </Link>
        </div>
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between text-white/60 nav-compact gap-4">
          <div className="flex items-center gap-6">
            <a href="/media-kit">Media Kit</a>
            <a href="/terms">Terms of Use</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/cookies">Cookie Policy</a>
          </div>
          <div>Built for networks. © 2025 Flowyd Limited. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}


