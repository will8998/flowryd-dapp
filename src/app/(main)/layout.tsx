import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui";
import { SWRConfig } from 'swr';
import { authFetcher } from '@/lib/swr-config';
import { SocketProvider } from '@/providers/SocketProvider';
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <SWRConfig value={{ fetcher: authFetcher, revalidateOnFocus: false, dedupingInterval: 5000 }}>
        <SocketProvider>
          <ToastProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
          </ToastProvider>
        </SocketProvider>
      </SWRConfig>
    </AuthProvider>
  );
}
