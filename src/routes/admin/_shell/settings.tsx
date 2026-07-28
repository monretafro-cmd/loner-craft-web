import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useRows, useSaveRow } from "@/lib/admin/api";
import { PageHeader, Panel, LoadingRows } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/_shell/settings")({
  head: () => ({ meta: [{ title: "Settings — Loner Leather Admin" }, { name: "robots", content: "noindex" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useRows<any>("site_settings", { orderBy: "key", ascending: true });
  const zones = useRows<any>("delivery_zones", { orderBy: "city", ascending: true });
  const saveSetting = useSaveRow("site_settings", "settings");
  const saveZone = useSaveRow("delivery_zones", "settings");
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!settings.data) return;
    setValues(Object.fromEntries(settings.data.map((row: any) => [row.id, String(row.value ?? "")])));
  }, [settings.data]);

  return (
    <>
      <PageHeader title="Settings" subtitle="Store details, shipping rules and contact channels" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="space-y-4">
          <h2 className="font-display text-xl">Store settings</h2>
          {settings.isLoading ? (
            <LoadingRows />
          ) : (
            (settings.data ?? []).map((row: any) => (
              <div key={row.id} className="space-y-1.5">
                <Label className="capitalize">{String(row.key).replace(/_/g, " ")}</Label>
                <div className="flex gap-2">
                  <Input
                    value={values[row.id] ?? ""}
                    onChange={(event) => setValues({ ...values, [row.id]: event.target.value })}
                  />
                  <Button variant="outline" onClick={() => saveSetting.mutate({ id: row.id, value: values[row.id] })}>
                    Save
                  </Button>
                </div>
              </div>
            ))
          )}
        </Panel>

        <Panel className="space-y-4">
          <h2 className="font-display text-xl">Delivery zones</h2>
          {(zones.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No delivery zones configured yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="pb-3">City</th>
                  <th className="pb-3">Fee</th>
                  <th className="pb-3">Days</th>
                  <th className="pb-3">Active</th>
                </tr>
              </thead>
              <tbody>
                {(zones.data ?? []).map((zone: any) => (
                  <tr key={zone.id} className="border-t border-border/60">
                    <td className="py-2">{zone.city}</td>
                    <td className="py-2">
                      <Input
                        className="h-8 w-24"
                        defaultValue={zone.fee}
                        onBlur={(event) => saveZone.mutate({ id: zone.id, fee: Number(event.target.value) })}
                      />
                    </td>
                    <td className="py-2 text-muted-foreground">{zone.delivery_days ?? "—"}</td>
                    <td className="py-2">
                      <button
                        className="text-xs underline"
                        onClick={() => saveZone.mutate({ id: zone.id, active: !zone.active })}
                      >
                        {zone.active ? "Active" : "Disabled"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>
    </>
  );
}