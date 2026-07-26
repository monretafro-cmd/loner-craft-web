import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Loner Leather monogram"
      width={1024}
      height={1024}
      loading="lazy"
      className={cn("h-9 w-9 object-contain", className)}
    />
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)} aria-label="Loner Leather — home">
      <LogoMark className="h-9 w-9 transition-transform duration-500 ease-out group-hover:-rotate-3 group-hover:scale-105" />
      {!compact && (
        <span className="leading-none">
          <span className="font-display block text-base font-semibold tracking-[0.16em] uppercase">
            Loner
          </span>
          <span className="eyebrow block text-[0.6rem] tracking-[0.32em]">Leather</span>
        </span>
      )}
    </Link>
  );
}