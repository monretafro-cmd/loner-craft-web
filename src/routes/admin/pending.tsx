import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, LogOut, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/admin/pending")({
  component: PendingPage,
});

function PendingPage() {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#241812] p-4">
      <Card className="w-full max-w-lg bg-[#F7F3EF] border-none shadow-2xl overflow-hidden">
        <div className="h-2 bg-[#8A4D25]" />
        <CardHeader className="text-center pt-8">
          <div className="mx-auto w-16 h-16 bg-[#8A4D25]/10 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-[#8A4D25]" />
          </div>
          <CardTitle className="text-3xl font-serif text-[#241812]">Access Pending</CardTitle>
          <CardDescription className="text-stone-600 text-lg mt-2">
            Your admin request is currently under review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-10">
          <div className="bg-stone-100 p-6 rounded-lg text-stone-700 space-y-4">
            <p>
              For security reasons, all new admin accounts must be manually approved by the Store Owner before they can access sensitive data.
            </p>
            <p className="font-medium">
              What happens next?
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-stone-600">
              <li>The Owner has been notified of your request</li>
              <li>Once approved, you will gain access to your assigned role</li>
              <li>You can try refreshing this page periodically</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              onClick={() => window.location.reload()}
              className="flex-1 bg-[#8A4D25] hover:bg-[#241812] text-white py-6"
            >
              Check Status
            </Button>
            <Button 
              variant="outline"
              onClick={handleSignOut}
              className="flex-1 border-stone-300 py-6 hover:bg-stone-50 gap-2"
            >
              <LogOut size={18} />
              Sign Out
            </Button>
          </div>

          <p className="text-center text-xs text-stone-500 pt-4 flex items-center justify-center gap-1">
            Need urgent access? 
            <a 
              href="https://wa.me/212661248803" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#8A4D25] hover:underline flex items-center gap-1"
            >
              <MessageCircle size={14} /> Contact Support
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
