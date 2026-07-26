import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/logo-mark.png.asset.json";
import { cn } from "@/lib/utils";

/** Official Loner Leather mark, cropped of empty margins. Never redrawn or restyled. */
export const LOGO_SRC = logoAsset.url;

export function LogoMark({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={LOGO_SRC}
      alt="Loner Leather"
      width={381}
      height={456}
      style={style}
      className={cn("w-auto max-w-full object-contain", className)}
    />
  );
}

export function Logo({
  className,
  markClassName,
  markStyle,
}: {
  className?: string;
  markClassName?: string;
  markStyle?: React.CSSProperties;
}) {
  return (
    <Link
      to="/"
      className={cn("flex items-center", className)}
      aria-label="Loner Leather — home"
    >
      <LogoMark className={cn("h-11 lg:h-14", markClassName)} style={markStyle} />
    </Link>
  );
}
