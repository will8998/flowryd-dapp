export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 text-white/80">
      <h1 className="text-4xl font-semibold mb-6 text-white">Cookie Policy</h1>
      <p className="mb-4">This Cookie Policy explains how Towler Advisory (“we”, “us”) uses cookies and similar technologies on our websites and Services.</p>

      <h2 className="text-2xl font-medium mt-8 mb-3 text-white">1. What Are Cookies?</h2>
      <p className="mb-4">Cookies are small text files stored on your device. They help us remember your preferences, understand how the Services are used, and improve performance.</p>

      <h2 className="text-2xl font-medium mt-8 mb-3 text-white">2. Types of Cookies We Use</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Essential cookies required for core functionality.</li>
        <li>Analytics cookies to measure usage and performance.</li>
        <li>Preference cookies to remember settings such as language or theme.</li>
      </ul>

      <h2 className="text-2xl font-medium mt-8 mb-3 text-white">3. Managing Cookies</h2>
      <p className="mb-4">You can control cookies through your browser settings. Disabling certain cookies may impact functionality.</p>

      <h2 className="text-2xl font-medium mt-8 mb-3 text-white">4. Changes</h2>
      <p className="mb-8">We may update this Cookie Policy from time to time. Continued use of the Services signifies your acceptance of the revised policy.</p>

      <div className="text-white/60 nav-compact">© {new Date().getFullYear()} Towler Advisory</div>
    </main>
  );
}


