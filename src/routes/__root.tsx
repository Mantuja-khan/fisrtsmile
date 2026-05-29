import { Outlet, Link, createRootRoute, useLocation } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PageLoader } from "@/components/PageLoader";
import { ShopProvider } from "@/store/shop";
import { AuthProvider } from "@/store/auth";
import { DiscountPopup } from "@/components/DiscountPopup";
import { UnauthenticatedPopup } from "@/components/UnauthenticatedPopup";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
      }),
  );
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShopProvider>
          <div className="flex flex-col min-h-screen">
            <PageLoader />
            {!isAdminPath && <Header />}
            <main className={`flex-1 ${!isAdminPath ? "pb-20 md:pb-0" : ""}`}>
              <Outlet />
            </main>
            {!isAdminPath && <Footer />}
            {!isAdminPath && <MobileBottomNav />}

            {/* Floating WhatsApp Widget */}
            {!isAdminPath && (
              <a
                href="https://wa.me/917827743263"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-36 md:bottom-6 right-4 md:right-6 z-50 flex items-center justify-center size-13 md:size-14 bg-[#25D366] text-white rounded-full shadow-2xl transition hover:scale-110 active:scale-90"
                aria-label="Chat on WhatsApp"
                title="Chat with support"
              >
                <svg viewBox="0 0 24 24" className="size-6 md:size-7 fill-current">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.56.931 3.35 1.488 5.277 1.489 5.632 0 10.213-4.58 10.216-10.213.002-5.453-4.486-9.891-9.931-9.892-5.45-.001-9.891 4.438-9.892 9.888-.001 1.92.524 3.797 1.515 5.41l-.993 3.628 3.815-.988zm11.587-6.869c-.303-.151-1.793-.885-2.071-.985-.278-.1-.482-.149-.684.151s-.783.985-.961 1.187-.354.226-.658.076c-1.512-.756-2.496-1.338-3.494-3.047-.261-.448.261-.416.747-1.389.082-.164.041-.307-.02-.458s-.684-1.646-.937-2.256c-.247-.594-.499-.513-.684-.522-.177-.008-.38-.009-.582-.009-.202 0-.531.076-.809.38s-1.062 1.037-1.062 2.529 1.087 2.929 1.239 3.131c.152.202 2.126 3.246 5.16 4.551.721.311 1.283.496 1.72.635.724.23 1.382.198 1.901.12.579-.087 1.793-.733 2.046-1.442.253-.709.253-1.314.177-1.441-.076-.127-.278-.203-.581-.354z" />
                </svg>
              </a>
            )}

            {!isAdminPath && <DiscountPopup />}
            {!isAdminPath && <UnauthenticatedPopup />}
            <Toaster richColors position="top-center" />
          </div>
        </ShopProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
