import Image from "next/image";

export default function MediaKitPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 text-white/80">
      <h1 className="text-4xl font-semibold mb-8 text-white">Media Kit</h1>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Logo card */}
        <div className="rounded border border-white/10 bg-black/40 p-6">
          <h2 className="text-2xl font-medium text-white mb-4">Logo</h2>
          <p className="mb-4">Download the Flowryd primary logo in SVG format.</p>
          <div className="flex items-center justify-center h-40 rounded bg-black/30 border border-white/10 mb-4">
            <Image src="/flowrydlogo.svg" alt="Flowryd Logo" width={160} height={40} className="h-16 w-auto" />
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/flowrydlogo.svg"
              download
              className="nav-compact inline-flex items-center gap-2 rounded border border-white/20 hover:border-white/50 px-4 py-2"
            >
              Download SVG
            </a>
          </div>
        </div>

        {/* Brand font card */}
        <div className="rounded border border-white/10 bg-black/40 p-6">
          <h2 className="text-2xl font-medium text-white mb-4">Brand Font — Almarai</h2>
          <p className="mb-4">Download the Almarai font family. Use Regular and Bold weights for most brand applications.</p>
          <div className="rounded border border-white/10 bg-black/30 p-5 mb-4">
            <div className="text-white/90 text-2xl tracking-wide">Aa Bb Cc 123 — Almarai</div>
            <div className="text-white/70 mt-2">Sample preview of the brand font.</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://fonts.google.com/download?family=Almarai"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-compact inline-flex items-center gap-2 rounded border border-white/20 hover:border-white/50 px-4 py-2"
            >
              Download Almarai (Google Fonts)
            </a>
          </div>
        </div>
      </section>

      <p className="mt-10 text-white/60 nav-compact">© {new Date().getFullYear()} Towler Advisory</p>
    </main>
  );
}


