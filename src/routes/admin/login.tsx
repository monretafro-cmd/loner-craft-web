import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Chrome, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";


export const Route = createFileRoute("/admin/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const errorCode = params.get("error_code");
    
    if (error === "unsupported_provider" || errorCode === "validation_failed") {
      setOauthError("Google sign-in is temporarily unavailable. Please use email and password or try again later.");
    } else if (error) {
      setOauthError(params.get("error_description") || "Authentication failed. Please check your credentials or configuration.");
    }
  }, []);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin/auth/callback`,
      },
    });
    if (error) toast.error(error.message);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast.error(error.message);
    } else {
      window.location.href = "/admin";
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#241812] p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-serif text-white tracking-widest uppercase">Loner Leather</h1>
          <p className="text-stone-400 font-light italic">Administration Suite</p>
        </div>

        <Card className="bg-[#F7F3EF] border-none shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-serif text-[#241812]">Login</CardTitle>
            <CardDescription className="text-stone-500">
              Enter your credentials to access the management panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {oauthError && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{oauthError}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-stone-300 focus:ring-[#8A4D25] focus:border-[#8A4D25]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-[#8A4D25] hover:underline">Forgot?</a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-stone-300 focus:ring-[#8A4D25] focus:border-[#8A4D25]"
                />
              </div>
              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#8A4D25] hover:bg-[#241812] text-white py-6 text-base"
              >
                {loading ? "Authenticating..." : "Login to Admin"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-stone-300"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#F7F3EF] px-2 text-stone-500">Or continue with</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={handleGoogleLogin}
              className="w-full border-stone-300 py-6 hover:bg-stone-50 flex items-center justify-center gap-2"
            >
              <Chrome className="h-5 w-5" />
              Continue with Google
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-stone-500 text-xs">
          &copy; {new Date().getFullYear()} Loner Leather. Restricted Access.
        </p>
      </div>
    </div>
  );
}
