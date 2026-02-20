export default function TermsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 text-white/80">
      <h1 className="text-4xl font-semibold mb-6 text-white">Terms of Use</h1>
      <p className="mb-4">These Terms of Use (the “Terms”) govern your access to and use of products, software, websites, and services (collectively, the “Services”) provided by Towler Advisory (“Company”, “we”, “us”, or “our”). By accessing or using the Services, you agree to be bound by these Terms.</p>

      <h2 className="text-2xl font-medium mt-8 mb-3 text-white">1. Eligibility</h2>
      <p className="mb-4">You represent that you are at least the age of majority in your jurisdiction and have the authority to enter into these Terms.</p>

      <h2 className="text-2xl font-medium mt-8 mb-3 text-white">2. Use of Services</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Do not use the Services for unlawful, harmful, or abusive activities.</li>
        <li>Do not attempt to interfere with or disrupt the integrity or performance of the Services.</li>
        <li>You are responsible for maintaining the confidentiality of your credentials and all activities under your account.</li>
      </ul>

      <h2 className="text-2xl font-medium mt-8 mb-3 text-white">3. Intellectual Property</h2>
      <p className="mb-4">All content, trademarks, logos, and materials made available through the Services are owned by Towler Advisory or its licensors and are protected by applicable laws. You are granted a limited, non-exclusive, non-transferable license to use the Services for their intended purpose.</p>

      <h2 className="text-2xl font-medium mt-8 mb-3 text-white">4. Third-Party Services</h2>
      <p className="mb-4">The Services may link to or integrate with third-party services. We do not control and are not responsible for third-party content, policies, or practices.</p>

      <h2 className="text-2xl font-medium mt-8 mb-3 text-white">5. Disclaimers</h2>
      <p className="mb-4">THE SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TOWLER ADVISORY DISCLAIMS ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>

      <h2 className="text-2xl font-medium mt-8 mb-3 text-white">6. Limitation of Liability</h2>
      <p className="mb-4">TO THE MAXIMUM EXTENT PERMITTED BY LAW, TOWLER ADVISORY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL.</p>

      <h2 className="text-2xl font-medium mt-8 mb-3 text-white">7. Indemnification</h2>
      <p className="mb-4">You agree to indemnify, defend, and hold harmless Towler Advisory and its affiliates, officers, employees, and agents from any claims, liabilities, damages, losses, and expenses arising from or related to your use of the Services or violation of these Terms.</p>

      <h2 className="text-2xl font-medium mt-8 mb-3 text-white">8. Termination</h2>
      <p className="mb-4">We may suspend or terminate access to the Services at any time for any reason. Upon termination, your right to use the Services will immediately cease.</p>

      <h2 className="text-2xl font-medium mt-8 mb-3 text-white">9. Governing Law</h2>
      <p className="mb-4">These Terms are governed by the laws of the jurisdiction in which Towler Advisory is organized, without regard to its conflict of law rules.</p>

      <h2 className="text-2xl font-medium mt-8 mb-3 text-white">10. Changes</h2>
      <p className="mb-8">We may update these Terms from time to time. Continued use of the Services after an update constitutes acceptance of the revised Terms.</p>

      <div className="text-white/60 nav-compact">© {new Date().getFullYear()} Towler Advisory</div>
    </main>
  );
}


