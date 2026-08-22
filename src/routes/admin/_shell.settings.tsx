import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Shield, Bell, User, Globe, Palette, Truck, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/_shell/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-serif text-[#241812]">Settings</h1>
        <p className="text-stone-500 text-sm mt-1">Configure your store and administrative preferences</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-stone-100 p-1 border border-stone-200">
          <TabsTrigger value="general" className="data-[state=active]:bg-white">General</TabsTrigger>
          <TabsTrigger value="auth" className="data-[state=active]:bg-white">Authentication</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white">Notifications</TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-white">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-stone-100">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Globe size={18} className="text-[#8A4D25]" /> Store Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input id="store-name" defaultValue="Loner Leather" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" defaultValue="support@lonerleather.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Store Currency</Label>
                  <Input id="currency" defaultValue="MAD" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" defaultValue="(GMT+01:00) Casablanca" />
                </div>
              </div>
              <Button className="bg-[#8A4D25] hover:bg-[#241812] text-white">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="mt-6 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-stone-100">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Shield size={18} className="text-[#8A4D25]" /> Security & Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#241812]">Google OAuth</p>
                  <p className="text-xs text-stone-500">Enable Google sign-in for administrators</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between border-t border-stone-100 pt-6">
                <div>
                  <p className="text-sm font-bold text-[#241812]">Two-Factor Authentication</p>
                  <p className="text-xs text-stone-500">Require a second verification step for all admins</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6">
           <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-stone-100">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Bell size={18} className="text-[#8A4D25]" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#241812]">New Order Alerts</p>
                  <p className="text-xs text-stone-500">Get notified immediately when a new order is placed</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between border-t border-stone-100 pt-6">
                <div>
                  <p className="text-sm font-bold text-[#241812]">Inventory Alerts</p>
                  <p className="text-xs text-stone-500">Receive notifications when stock levels are low</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
