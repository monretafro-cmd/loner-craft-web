import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRows, useSaveRow } from "@/lib/admin/api";
import { PageHeader, Panel, LoadingRows } from "@/components/admin_new/AdminUI";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/_shell/homepage")({
  head: () => ({ meta: [{ title: "Homepage — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: HomepagePage,
});

function HomepagePage() {
  const sections = useRows<any>("homepage_content", { orderBy: "display_order", ascending: true });
  const shopSections = (sections.data ?? []).filter((s: any) => s.section.startsWith("shop_"));
  const save = useSaveRow("homepage_content", "homepage");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!sections.data) return;
    setDrafts(
      Object.fromEntries(
        sections.data
          .filter((s: any) => !s.section.startsWith("shop_"))
          .map((section: any) => [section.id, JSON.stringify(section.content, null, 2)])
      ),
    );
  }, [sections.data]);

  return (
    <>
      <PageHeader title="Homepage" subtitle="Edit the storefront sections in all three languages" />
      {sections.isLoading ? (
        <LoadingRows />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {(sections.data ?? []).filter((s: any) => !s.section.startsWith("shop_")).map((section: any) => (
            <Panel key={section.id} className="flex flex-col">
              <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-4">
                <div>
                  <h2 className="font-display text-xl capitalize text-ink">{String(section.section).replace(/_/g, " ")}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Content Definition</p>
                </div>
                <div className="flex items-center gap-3 rounded-full bg-secondary/40 px-3 py-1.5 text-xs font-semibold">
                  <span className="text-muted-foreground">Active</span>
                  <Switch checked={section.active} onCheckedChange={(value) => save.mutate({ id: section.id, active: value })} />
                </div>
              </div>
              <div className="flex-1">
                <Textarea
                  rows={12}
                  className="font-mono text-[11px] leading-relaxed bg-secondary/10 border-none resize-none focus-visible:ring-cognac"
                  value={drafts[section.id] ?? ""}
                  onChange={(event) => setDrafts({ ...drafts, [section.id]: event.target.value })}
                />
              </div>
              <div className="mt-4 pt-4 border-t border-border/40">
                <Button
                  className="w-full bg-ink text-ink-foreground hover:bg-ink/90 font-bold uppercase tracking-[0.2em] text-[10px] h-10 shadow-lg"
                  onClick={() => {
                    try {
                      save.mutate({ id: section.id, content: JSON.parse(drafts[section.id] ?? "{}") });
                    } catch {
                      toast.error("Please fix the formatting before saving");
                    }
                  }}
                >
                  Save {String(section.section).replace(/_/g, " ")}
                </Button>
              </div>
            </Panel>
          ))}
        </div>

      )}
    </>
  );
}