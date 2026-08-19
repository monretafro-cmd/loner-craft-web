import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRows, useSaveRow } from "@/lib/admin/api";
import { PageHeader, Panel, LoadingRows } from "@/components/admin/AdminUI";
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
        <div className="space-y-6">
          {(sections.data ?? []).filter((s: any) => !s.section.startsWith("shop_")).map((section: any) => (
            <Panel key={section.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl capitalize">{String(section.section).replace(/_/g, " ")}</h2>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">Visible</span>
                  <Switch checked={section.active} onCheckedChange={(value) => save.mutate({ id: section.id, active: value })} />
                </div>
              </div>
              <Textarea
                rows={10}
                className="font-mono text-xs"
                value={drafts[section.id] ?? ""}
                onChange={(event) => setDrafts({ ...drafts, [section.id]: event.target.value })}
              />
              <Button
                className="bg-ink text-ink-foreground hover:bg-ink/90"
                onClick={() => {
                  try {
                    save.mutate({ id: section.id, content: JSON.parse(drafts[section.id] ?? "{}") });
                  } catch {
                    toast.error("Please fix the formatting before saving");
                  }
                }}
              >
                Save section
              </Button>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}