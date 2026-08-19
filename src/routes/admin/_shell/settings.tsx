import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useRows, useSaveRow } from "@/lib/admin/api";
import { PageHeader, Panel, LoadingRows, StatusPill } from "@/components/admin_new/AdminUI";
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
          <h2 className="font-display text-xl text-ink">Store settings</h2>
          {settings.isLoading ? (
            <LoadingRows />
          ) : (
            <div className="space-y-4">
              {(settings.data ?? []).map((row: any) => (
                <div key={row.id} className="space-y-2 p-3 rounded-xl bg-secondary/10 border border-border/20 transition-all hover:border-cognac/30">
                  <Label className="capitalize text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {String(row.key).replace(/_/g, " ")}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      className="bg-white border-border/40 focus-visible:ring-cognac font-medium text-ink h-10"
                      value={values[row.id] ?? ""}
                      onChange={(event) => setValues({ ...values, [row.id]: event.target.value })}
                    />
                    <Button 
                      className="bg-ink text-white hover:bg-ink/90 font-bold uppercase tracking-widest text-[10px] px-6 h-10"
                      onClick={() => saveSetting.mutate({ id: row.id, value: values[row.id] })}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel className="space-y-4">
          <h2 className="font-display text-xl text-ink">Delivery zones</h2>
          {zones.isLoading ? (
            <LoadingRows />
          ) : (zones.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No delivery zones configured yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border/40">
                    <th className="pb-3 font-semibold">City</th>
                    <th className="pb-3 font-semibold">Fee (MAD)</th>
                    <th className="pb-3 font-semibold text-center">Days</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(zones.data ?? []).map((zone: any) => (
                    <tr key={zone.id} className="border-t border-border/60">
                      <td className="py-3 font-medium text-ink">{zone.city}</td>
                      <td className="py-3">
                        <Input
                          className="h-8 w-24 bg-white border-border/40"
                          defaultValue={zone.fee}
                          onBlur={(event) => saveZone.mutate({ id: zone.id, fee: Number(event.target.value) })}
                        />
                      </td>
                      <td className="py-3 text-center text-muted-foreground">{zone.delivery_days ?? "—"}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => saveZone.mutate({ id: zone.id, active: !zone.active })}
                          className="hover:opacity-80 transition-opacity"
                        >
                          <StatusPill 
                            status={zone.active ? "approved" : "pending"} 
                            label={zone.active ? "Active" : "Disabled"}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
