import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <ToastProvider>
        <SiteHeader />
        {children}
        <SiteFooter />
      </ToastProvider>
    </AuthProvider>
  );
}
