import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  User, 
  Activity, 
  Clock, 
  Search, 
  Filter,
  Calendar
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/audit")({
  component: AuditLogPage,
});

function AuditLogPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin", "audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select(`
          *,
          profile:profiles(full_name, email)
        `)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const getEventBadge = (event: string) => {
    const events: Record<string, string> = {
      login: "bg-blue-100 text-blue-700",
      product_update: "bg-indigo-100 text-indigo-700",
      order_status_change: "bg-amber-100 text-amber-700",
      price_change: "bg-purple-100 text-purple-700",
      admin_approved: "bg-green-100 text-green-700",
      settings_change: "bg-stone-100 text-stone-700",
    };

    return (
      <Badge variant="outline" className={`${events[event] || "bg-stone-50 text-stone-500"} border-none capitalize`}>
        {event.replace(/_/g, " ")}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-full bg-stone-200 animate-pulse rounded"></div>
        <div className="h-[600px] w-full bg-stone-100 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#241812]">Audit Log</h1>
          <p className="text-stone-500 text-sm mt-1">Track all administrative actions and security events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-stone-200 bg-white">
            <Calendar size={18} className="mr-2" />
            Date Range
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <Input 
              placeholder="Search by admin or action..." 
              className="pl-10 border-stone-200 bg-white"
            />
          </div>
          <Button variant="outline" className="gap-2 border-stone-200">
            <Filter size={18} />
            Filter Actions
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50">
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="w-[120px]">IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(logs || []).map((log: any) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[#241812]">
                      {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {format(new Date(log.created_at), "yyyy")}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] text-stone-500 border border-stone-200">
                      {log.profile?.full_name?.charAt(0) || "A"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#241812]">{log.profile?.full_name || "System"}</span>
                      <span className="text-[10px] text-stone-400">{log.profile?.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getEventBadge(log.event_type)}
                </TableCell>
                <TableCell>
                  <div className="max-w-md">
                    <p className="text-xs text-stone-600 line-clamp-1">{log.description}</p>
                    {log.metadata && (
                      <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
                        ID: {log.metadata.id || log.entity_id || 'N/A'}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[10px] font-mono text-stone-400">
                    {log.ip_address || "127.0.0.1"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {(!logs || logs.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-stone-400 space-y-2">
                    <FileText size={48} strokeWidth={1} />
                    <p>No activity logged yet.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
