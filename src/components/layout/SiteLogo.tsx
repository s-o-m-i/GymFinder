import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE_LOGO_SRC, SITE_NAME } from "@/lib/constants";

export type SiteLogoSize = "xs" | "sm" | "md" | "lg" | "xl";

const LOGO_HEIGHT: Record<SiteLogoSize, string> = {
  xs: "h-8",
  sm: "h-10",
  md: "h-12 sm:h-14",
  lg: "h-14 sm:h-16",
  xl: "h-14 sm:h-16 md:h-[4.5rem] lg:h-20",
};

const LOGO_MAX_WIDTH: Record<SiteLogoSize, string> = {
  xs: "max-w-[160px]",
  sm: "max-w-[200px]",
  md: "max-w-[240px] sm:max-w-[280px]",
  lg: "max-w-[260px] sm:max-w-[300px]",
  xl: "max-w-[260px] sm:max-w-[300px] md:max-w-[340px] lg:max-w-[580px]",
};

/** Padding when logo sits on a light header — keeps white logo text readable. */
const LOGO_DARK_BG_PADDING: Record<SiteLogoSize, string> = {
  xs: "px-2 py-0.5",
  sm: "px-2.5 py-1",
  md: "px-3 py-1",
  lg: "px-3 py-1.5",
  xl: "px-3 py-1.5 sm:px-4 sm:py-2",
};

interface SiteLogoProps {
  href?: string;
  size?: SiteLogoSize;
  className?: string;
  onClick?: () => void;
  priority?: boolean;
  /** Navy pill behind the logo — use on light backgrounds (not home/auth hero). */
  darkBackground?: boolean;
}

/** Renders Logo.png directly (no Next/Image) to preserve transparency and avoid white boxes. */
export function SiteLogo({
  href = "/",
  size = "md",
  className,
  onClick,
  priority = false,
  darkBackground = false,
}: SiteLogoProps) {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SITE_LOGO_SRC}
      alt={SITE_NAME}
      width={707}
      height={353}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={cn(
        "w-auto object-contain object-left",
        LOGO_MAX_WIDTH[size],
        LOGO_HEIGHT[size],
        className
      )}
    />
  );

  const content = darkBackground ? (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-xl bg-[#0B2545]",
        LOGO_DARK_BG_PADDING[size]
      )}
    >
      {image}
    </span>
  ) : (
    image
  );

  if (!href) return content;

  return (
    <Link href={href} onClick={onClick} className="inline-flex shrink-0 items-center">
      {content}
    </Link>
  );
}

interface SiteLogoStackProps {
  href?: string;
  size?: SiteLogoSize;
  caption?: string;
  captionClassName?: string;
  className?: string;
  onClick?: () => void;
  priority?: boolean;
  darkBackground?: boolean;
}

export function SiteLogoStack({
  href = "/",
  size = "sm",
  caption,
  captionClassName,
  className,
  onClick,
  priority = false,
  darkBackground = false,
}: SiteLogoStackProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("inline-flex min-w-0 flex-col gap-1", className)}
    >
      <SiteLogo href={undefined} size={size} priority={priority} darkBackground={darkBackground} />
      {caption && (
        <span className={cn("truncate text-xs leading-tight", captionClassName)}>{caption}</span>
      )}
    </Link>
  );
}
