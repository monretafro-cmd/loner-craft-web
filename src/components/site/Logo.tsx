import { Link } from "@tanstack/react-router";
import logoBlack from "@/assets/logo-black.png.asset.json";
import logoWhite from "@/assets/logo-white.png.asset.json";
import { cn } from "@/lib/utils";

/** Official Loner Leather wolf roundel, trimmed of empty margins. Never redrawn or restyled. */
export const LOGO_SRC = logoBlack.url;
export const LOGO_SRC_LIGHT = logoWhite.url;

export function LogoMark({
  className,
  style,
  variant = "black",
}: {
  className?: string;
  style?: React.CSSProperties;
  /** "white" for dark backgrounds. */
  variant?: "black" | "white";
}) {
  return (
    <img
      src={variant === "white" ? LOGO_SRC_LIGHT : LOGO_SRC}
      alt="Loner Leather"
      width={751}
      height={857}
      style={style}
      className={cn("h-auto max-w-full object-contain", className)}
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
      <LogoMark
        className={cn("w-16 md:w-20 lg:w-[92px]", markClassName)}
        style={markStyle}
      />
    </Link>
  );
}
