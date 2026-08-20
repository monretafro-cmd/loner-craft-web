import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/admin/login")({
  component: LoginPage,
});

function LoginPage() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin`,
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#241812]">
      <Card className="w-full max-w-md bg-[#F7F3EF]">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-serif text-[#241812]">Loner Leather Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleLogin}
            className="w-full bg-[#8A4D25] hover:bg-[#241812] text-white"
          >
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
