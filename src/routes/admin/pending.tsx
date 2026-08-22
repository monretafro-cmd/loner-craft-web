import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useAdminAuth } from '@/lib/admin/auth-context';
import { Button } from '@/components/ui/button';
import { Clock, ShieldAlert, LogOut } from 'lucide-react';

export const Route = createFileRoute('/admin/pending')({
  component: AdminPendingPage,
});

function AdminPendingPage() {
  const { profile, signOut } = useAdminAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#241812] px-4 font-inter text-[#F7F3EF]">
      <div className="w-full max-w-[480px] text-center">
        <div className="mb-8">
          <img src="/logo.png" alt="Loner Leather" className="mx-auto mb-6 h-20 w-auto" />
          <div className="inline-flex items-center justify-center rounded-full bg-[#8A4D25]/20 p-4 text-[#8A4D25] mb-6">
            <Clock className="h-10 w-10" />
          </div>
          <h1 className="font-cormorant text-4xl font-bold tracking-tight text-[#F7F3EF] mb-4">
            ACCESS PENDING
          </h1>
          <p className="text-lg text-[#F7F3EF]/70 mb-8">
            Your admin account for <span className="text-[#8A4D25] font-medium">{profile?.email}</span> is currently awaiting approval from the Loner Leather owner.
          </p>
        </div>

        <div className="bg-[#2A1D16] border border-[#8A4D25]/20 rounded-lg p-6 mb-8 text-left">
          <div className="flex items-start gap-4">
            <ShieldAlert className="h-6 w-6 text-[#8A4D25] shrink-0 mt-1" />
            <div>
              <h3 className="text-[#F7F3EF] font-medium mb-1">What happens next?</h3>
              <p className="text-sm text-[#F7F3EF]/60">
                The store owner has been notified of your request. Once they verify your credentials and approve your account, you will be able to access the admin dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="border-[#8A4D25]/40 text-[#F7F3EF] hover:bg-[#8A4D25]/10 hover:text-[#F7F3EF]"
          >
            Check Status
          </Button>
          <Button 
            variant="ghost" 
            onClick={signOut}
            className="text-[#F7F3EF]/60 hover:text-[#F7F3EF] hover:bg-white/5"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
        
        <div className="mt-12 text-xs text-[#F7F3EF]/30 uppercase tracking-widest">
          Loner Leather • Internal Administration
        </div>
      </div>
    </div>
  );
}
