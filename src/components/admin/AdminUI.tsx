import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl text-foreground">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]", className)}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <Panel className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className="mt-2 font-display text-3xl text-foreground">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {icon ? <div className="rounded-xl bg-secondary p-2.5 text-secondary-foreground">{icon}</div> : null}
    </Panel>
  );
}

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-500/12 text-blue-700",
  pending: "bg-amber-500/15 text-amber-700",
  confirmed: "bg-emerald-500/12 text-emerald-700",
  active: "bg-emerald-500/12 text-emerald-700",
  approved: "bg-emerald-500/12 text-emerald-700",
  packed: "bg-violet-500/12 text-violet-700",
  shipped: "bg-sky-500/12 text-sky-700",
  delivered: "bg-emerald-600/15 text-emerald-800",
  cancelled: "bg-destructive/12 text-destructive",
  rejected: "bg-destructive/12 text-destructive",
  returned: "bg-destructive/12 text-destructive",
  draft: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
  read: "bg-muted text-muted-foreground",
  replied: "bg-emerald-500/12 text-emerald-700",
};

export function StatusPill({ status }: { status: string | null | undefined }) {
  const key = (status ?? "").toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
        STATUS_STYLES[key] ?? "bg-secondary text-secondary-foreground",
      )}
    >
      {status ?? "—"}
    </span>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <p className="font-display text-xl text-foreground">{title}</p>
      {hint ? <p className="mt-2 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-xl bg-muted/60" />
      ))}
    </div>
  );
}

export const MAD = (value: number | string | null | undefined) =>
  `${new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(Number(value ?? 0))} MAD`;

export const shortDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const shortDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";