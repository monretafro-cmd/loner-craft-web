import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { data: config, refetch } = useQuery({
    queryKey: ["admin", "site-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_content")
        .select("*")
        .eq("section", "global_settings")
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return (data as any)?.content || { maintenance_mode: false, free_shipping_threshold: 500 };
    },
  });

  const toggleMaintenance = async (checked: boolean) => {
    const { error } = await supabase
      .from("homepage_content")
      .upsert({ 
        section: "global_settings",
        content: { ...config, maintenance_mode: checked },
        active: true
      } as any, { onConflict: "section" });
    
    if (error) {
      toast.error("Failed to update settings");
    } else {
      toast.success("Settings updated");
      refetch();
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-serif text-[#241812] mb-6">Site Settings</h1>
      
      <div className="max-w-2xl space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Maintenance Mode</Label>
              <p className="text-sm text-stone-500">
                Disable the storefront for public users while you make updates.
              </p>
            </div>
            <Switch 
              checked={config?.maintenance_mode || false} 
              onCheckedChange={toggleMaintenance}
            />
          </div>
          
          <div className="pt-6 border-t border-stone-100">
            <Label className="text-base mb-2 block">Free Shipping Threshold</Label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                readOnly
                value={config?.free_shipping_threshold || 500}
                className="flex h-10 w-32 rounded-md border border-input bg-stone-50 px-3 py-2 text-sm"
              />
              <span className="text-stone-500 font-medium">MAD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
