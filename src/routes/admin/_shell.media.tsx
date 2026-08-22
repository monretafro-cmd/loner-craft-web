import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_shell/media')({
  component: () => (
    <div className="p-8">
      <h1 className="font-cormorant text-3xl font-bold text-[#241812] uppercase tracking-widest">media-library</h1>
      <div className="mt-8 bg-white border border-[#8A4D25]/10 rounded-lg p-12 text-center text-[#241812]/40 italic">
        Module coming soon as part of the new Loner Leather Admin rebuild.
      </div>
    </div>
  ),
});
