import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation - Flowryd',
  description: 'Complete documentation for the Flowryd platform - authentication, flows, deals, API reference, and more.',
  keywords: ['flowryd', 'documentation', 'api', 'flows', 'deals', 'authentication', 'platform'],
};

export default function DocumentationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}