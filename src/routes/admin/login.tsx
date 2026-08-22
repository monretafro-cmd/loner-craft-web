import React, { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/login')({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { status, profile, error: authError } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'authenticated' && profile?.status === 'approved') {
      navigate({ to: '/admin', replace: true });
    } else if (status === 'pending') {
      navigate({ to: '/admin/pending', replace: true });
    }
  }, [status, profile, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLocalError(error.message);
        toast.error(error.message);
      } else {
        toast.success('Successfully signed in');
      }
    } catch (err: any) {
      setLocalError(err.message || 'An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/auth/callback?type=recovery`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password reset email sent');
      }
    } catch (err: any) {
      toast.error('Failed to send reset email');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setLocalError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin/auth/callback`,
        },
      });

      if (error) {
        if (error.message.includes('missing OAuth secret') || error.message.includes('Unsupported provider')) {
          setLocalError('Google sign-in is not configured. Please contact the administrator.');
          toast.error('Google sign-in is not configured.');
        } else {
          setLocalError(error.message);
          toast.error(error.message);
        }
      }
    } catch (err: any) {
      setLocalError('An error occurred during Google sign-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#241812] px-4 font-inter text-[#F7F3EF]">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Loner Leather" className="mx-auto mb-4 h-16 w-auto" />
          <h1 className="font-cormorant text-3xl font-bold tracking-tight text-[#F7F3EF]">
            ADMIN PORTAL
          </h1>
          <p className="mt-2 text-[#F7F3EF]/60">Secure access for Loner Leather administration</p>
        </div>

        <Card className="border-[#8A4D25]/20 bg-[#2A1D16] text-[#F7F3EF]">
          <CardHeader>
            <CardTitle className="font-cormorant text-2xl">Sign In</CardTitle>
            <CardDescription className="text-[#F7F3EF]/60">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleEmailLogin}>
            <CardContent className="space-y-4">
              {(localError || authError) && (
                <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 text-red-400">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertDescription>{localError || authError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F7F3EF]/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="valaverde05@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-[#8A4D25]/20 bg-[#241812] pl-10 text-[#F7F3EF] placeholder:text-[#F7F3EF]/20 focus-visible:ring-[#8A4D25]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-[#8A4D25] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F7F3EF]/40" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-[#8A4D25]/20 bg-[#241812] pl-10 text-[#F7F3EF] placeholder:text-[#F7F3EF]/20 focus-visible:ring-[#8A4D25]"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8A4D25] text-[#F7F3EF] hover:bg-[#8A4D25]/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <div className="text-center text-xs text-[#F7F3EF]/40">
                Authorized Personnel Only
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
