import { useRouterState } from "@tanstack/react-router";

export function PageLoader() {
  const isLoading = useRouterState({ select: (s) => s.isLoading || s.status === "pending" });

  if (!isLoading) return null;

  return (
    <>
      {/* Top progress bar */}
      <div
        className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="h-full w-1/3 bg-gradient-to-r from-secondary via-primary to-secondary animate-loader-bar" />
      </div>
      {/* Subtle centered toy spinner */}
      <div
        className="fixed inset-0 z-[55] grid place-items-center bg-background/40 backdrop-blur-sm pointer-events-none"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="text-5xl animate-bounce">🧸</div>
          <div className="text-xs font-   tracking-widest text-foreground/80 uppercase">
            Loading…
          </div>
        </div>
      </div>
    </>
  );
}
