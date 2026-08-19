import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * PageHeader
 * Shared header for all admin pages with title, subtitle and action buttons.
 */
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
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-4xl font-medium tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 animate-fade-in">
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * Panel
 * Premium card component for grouping content.
 */
export function Panel({ 
  className, 
  children,
  title,
  actions
}: { 
  className?: string; 
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}) {
  return (
    <div className={cn(
      "overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition-all duration-300 hover:shadow-md",
      className
    )}>
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-border/40 bg-secondary/10 px-6 py-4">
          {title && (
            <h3 className="font-display text-lg font-medium text-ink">
              {title}
            </h3>
          )}
          {actions}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

/**
 * StatCard
 * Large KPIs for the dashboard.
 */
export function StatCard({
  label,
  value,
  trend,
  trendType = "neutral",
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  hint?: string;
  icon?: any;
}) {
  return (
    <Panel className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 font-display text-3xl font-medium text-ink">
            {value}
          </p>
          {(trend || hint) && (
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              {trend && (
                <span className={cn(
                  "text-xs font-bold",
                  trendType === "up" && "text-emerald-600",
                  trendType === "down" && "text-rose-600",
                  trendType === "neutral" && "text-muted-foreground"
                )}>
                  {trend}
                </span>
              )}
              {hint && (
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {hint}
                </span>
              )}
              {trend && !hint && (
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  vs last month
                </span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className="rounded-xl bg-secondary/40 p-3 text-ink transition-transform duration-500 group-hover:scale-110">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Panel>
  );
}


/**
 * StatusPill
 * Semantic badges for orders, products, etc.
 */
const STATUS_STYLES: Record<string, string> = {
  // Orders
  new: "bg-blue-50 text-blue-700 border-blue-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-100",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold",
  cancelled: "bg-rose-50 text-rose-700 border-rose-100",
  returned: "bg-rose-50 text-rose-700 border-rose-100",
  
  // Products
  active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  draft: "bg-slate-50 text-slate-600 border-slate-100",
  archived: "bg-slate-100 text-slate-500 border-slate-200",
  
  // General
  low_stock: "bg-rose-50 text-rose-700 border-rose-200 animate-pulse",
  out_of_stock: "bg-ink text-white border-ink",
};

export function StatusPill({ status }: { status: string | null | undefined }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  
  const key = status.toLowerCase().replace(" ", "_");
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
      STATUS_STYLES[key] ?? "bg-slate-50 text-slate-600 border-slate-100"
    )}>
      {status.replace("_", " ")}
    </span>
  );
}

/**
 * Currency Formatter (MAD)
 */
export const MAD = (value: number | string | null | undefined) => {
  const num = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  return new Intl.NumberFormat("fr-MA", { 
    style: "currency", 
    currency: "MAD",
    maximumFractionDigits: 0 
  }).format(num).replace("MAD", "DH");
};

/**
 * Date Formatters
 */
export const shortDate = (date: string | null | undefined) => 
  date ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const shortDateTime = (date: string | null | undefined) =>
  date ? new Date(date).toLocaleString("en-GB", { 
    day: "2-digit", 
    month: "short", 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: false
  }) : "—";

/**
 * EmptyState
 */
export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-secondary/5 px-6 py-16 text-center">
      <h3 className="font-display text-xl font-medium text-ink">
        {title}
      </h3>
      {hint && (
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * LoadingRows
 */
export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div 
          key={index} 
          className="h-16 w-full animate-pulse rounded-xl bg-secondary/20" 
          style={{ animationDelay: `${index * 100}ms` }}
        />
      ))}
    </div>
  );
}

