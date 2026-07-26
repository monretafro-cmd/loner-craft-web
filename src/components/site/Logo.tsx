import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Loner Leather"
      width={1024}
      height={1024}
      className={cn("h-11 w-auto object-contain lg:h-14", className)}
    />
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn("flex items-center", className)}
      aria-label="Loner Leather — home"
    >
      <LogoMark />
    </Link>
  );
}
