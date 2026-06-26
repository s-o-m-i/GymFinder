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

interface SiteLogoProps {
  href?: string;
  size?: SiteLogoSize;
  className?: string;
  onClick?: () => void;
  priority?: boolean;
}

/** Renders Logo.png directly (no Next/Image) to preserve transparency and avoid white boxes. */
export function SiteLogo({
  href = "/",
  size = "md",
  className,
  onClick,
  priority = false,
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

  if (!href) return image;

  return (
    <Link href={href} onClick={onClick} className="inline-flex shrink-0 items-center">
      {image}
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
}

export function SiteLogoStack({
  href = "/",
  size = "sm",
  caption,
  captionClassName,
  className,
  onClick,
  priority = false,
}: SiteLogoStackProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("inline-flex min-w-0 flex-col gap-1", className)}
    >
      <SiteLogo href={undefined} size={size} priority={priority} />
      {caption && (
        <span className={cn("truncate text-xs leading-tight", captionClassName)}>{caption}</span>
      )}
    </Link>
  );
}
