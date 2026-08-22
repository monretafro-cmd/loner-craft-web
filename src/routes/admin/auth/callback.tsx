import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/auth/callback')({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#241812] text-[#F7F3EF]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#8A4D25] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h1 className="font-cormorant text-2xl tracking-widest uppercase">Authenticating</h1>
        <p className="mt-2 text-[#F7F3EF]/60">Processing your secure entry...</p>
      </div>
    </div>
  );
}
