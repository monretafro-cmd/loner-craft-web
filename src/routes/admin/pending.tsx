import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/pending")({
  component: PendingPage,
});

function PendingPage() {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F3EF] p-4 text-center">
      <div className="max-w-md">
        <h1 className="text-3xl font-serif text-[#241812] mb-4">Approval Pending</h1>
        <p className="text-stone-600 mb-8">
          Your account is awaiting approval from a Super Admin. You will be able to access the admin panel once your request has been processed.
        </p>
        <Button 
          onClick={handleSignOut}
          variant="outline"
          className="border-[#8A4D25] text-[#8A4D25] hover:bg-[#8A4D25] hover:text-white"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
