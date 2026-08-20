import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings as SettingsIcon, 
  Globe, 
  ShieldCheck, 
  MessageCircle, 
  Bell, 
  CreditCard,
  ChevronRight,
  Database
} from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const sections = [
    {
      title: "Store Details",
      description: "Business name, location, and currency settings",
      icon: SettingsIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Localization",
      description: "Enable/disable languages (EN, FR, AR) and regions",
      icon: Globe,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Payments & COD",
      description: "Manage Cash on Delivery and payment gateways",
      icon: CreditCard,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "WhatsApp API",
      description: "Configure message templates and business numbers",
      icon: MessageCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Notifications",
      description: "Admin alerts for new orders and low stock",
      icon: Bell,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Security & RLS",
      description: "Harden database access and audit log settings",
      icon: ShieldCheck,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-serif text-[#241812]">Settings</h1>
        <p className="text-stone-500 text-sm mt-1">Configure your administration environment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, i) => (
          <Card key={i} className="border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow group">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className={`${section.bgColor} ${section.color} p-4 rounded-xl group-hover:scale-105 transition-transform`}>
                  <section.icon size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-serif text-[#241812] group-hover:text-[#8A4D25] transition-colors">{section.title}</h3>
                  <p className="text-sm text-stone-500 mt-1">{section.description}</p>
                </div>
                <ChevronRight className="text-stone-300 group-hover:text-[#8A4D25] transition-colors" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm bg-stone-900 text-white overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Database size={120} />
        </div>
        <CardHeader>
          <CardTitle className="font-serif">Maintenance Mode</CardTitle>
          <CardDescription className="text-stone-400">
            Temporarily disable the storefront for all users except admins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <span className="font-medium">System status: Normal</span>
            </div>
            <Button variant="outline" className="border-stone-700 hover:bg-stone-800 text-white whitespace-nowrap">
              Enable Maintenance Mode
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
