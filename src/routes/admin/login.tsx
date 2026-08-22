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
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#8A4D25]/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#2A1D16] px-2 text-[#F7F3EF]/40">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full border-[#8A4D25]/20 bg-transparent text-[#F7F3EF] hover:bg-[#8A4D25]/10"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="text-center text-[10px] text-[#F7F3EF]/40 uppercase tracking-widest">
                Authorized Personnel Only
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
