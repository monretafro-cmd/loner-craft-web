import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useRows, useSaveRow, useDeleteRow } from "@/lib/admin/api";
import { useAdminSession } from "@/lib/admin/session";
import { PageHeader, Panel, StatusPill, LoadingRows, EmptyState, shortDate } from "@/components/admin_new/AdminUI";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/_shell/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { data: session } = useAdminSession();
  const reviews = useRows<any>("reviews", { orderBy: "created_at" });
  const products = useRows<{ id: string; name: string }>("products", { select: "id, name" });
  const save = useSaveRow("reviews", "reviews");
  const remove = useDeleteRow("reviews", "reviews");
  const names = new Map((products.data ?? []).map((p) => [p.id, p.name]));

  return (
    <>
      <PageHeader title="Reviews" subtitle="Approve customer feedback before it appears on the storefront" />
      {reviews.isLoading ? (
        <LoadingRows />
      ) : (reviews.data ?? []).length === 0 ? (
        <EmptyState title="No reviews yet" hint="Approved reviews are shown publicly on product pages." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(reviews.data ?? []).map((review: any) => (
            <Panel key={review.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{review.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {review.city ?? "—"} · {names.get(review.product_id) ?? "General"} · {shortDate(review.created_at)}
                  </p>
                </div>
                <StatusPill status={review.status} />
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${index < review.rating ? "fill-cognac text-cognac" : "text-muted-foreground/40"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{review.text}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => save.mutate({ id: review.id, status: "approved" })}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => save.mutate({ id: review.id, status: "rejected" })}>Reject</Button>
                {session?.role === "super_admin" ? (
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove.mutate(review.id)}>Delete</Button>
                ) : null}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}