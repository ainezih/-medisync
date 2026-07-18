import { cn } from "@/lib/utils";
import appConfig from "@/app.config";

/**
 * Clinica brand mark — a bespoke inline-SVG logomark: a soft rounded medical
 * cross whose vertical bar dips into a single heartbeat / pulse line, drawn in
 * a calm teal gradient. No external image. The setup can swap `appConfig.name`
 * for the wordmark; drop a real file at public/logo.svg if you have one.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-8 w-8 shrink-0", className)}
      aria-hidden
      fill="none"
    >
      <defs>
        <linearGradient id="clinica-mark" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(68% 0.11 192)" />
          <stop offset="1" stopColor="oklch(56% 0.12 206)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#clinica-mark)" />
      {/* soft rounded medical cross — the negative space reads as care */}
      <path
        d="M13.4 7.2 h5.2 a1.2 1.2 0 0 1 1.2 1.2 v4 h4 a1.2 1.2 0 0 1 1.2 1.2 v5.2 a1.2 1.2 0 0 1 -1.2 1.2 h-4 v4 a1.2 1.2 0 0 1 -1.2 1.2 h-5.2 a1.2 1.2 0 0 1 -1.2 -1.2 v-4 h-4 a1.2 1.2 0 0 1 -1.2 -1.2 v-5.2 a1.2 1.2 0 0 1 1.2 -1.2 h4 v-4 a1.2 1.2 0 0 1 1.2 -1.2 z"
        fill="#fff"
        fillOpacity="0.16"
      />
      {/* heartbeat / pulse line crossing the mark */}
      <path
        d="M6.5 16 H11 l1.6 -3.4 2.6 6.4 2 -3.6 1.4 2 H25.5"
        stroke="#fff"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  withWordmark = true,
  withChevron = false,
  onDark = false,
}: {
  className?: string;
  withWordmark?: boolean;
  /** Render a small chevron after the wordmark (matches the sidebar header). */
  withChevron?: boolean;
  /** Use light wordmark on a dark surface (e.g. the auth brand panel). */
  onDark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-8 w-8 shadow-pill" />
      {withWordmark && (
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              "font-display text-[17px] font-bold tracking-[-0.02em]",
              onDark ? "text-white" : "text-foreground",
            )}
          >
            {appConfig.name}
          </span>
          {withChevron && (
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-muted-foreground" aria-hidden>
              <path d="M5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          )}
        </span>
      )}
    </span>
  );
}
