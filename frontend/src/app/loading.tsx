import React from 'react';
import { BotanicalSprig } from '@/components/graphics/BotanicalIllustrations';

export default function AppLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading Mehandi by Sana storefront content"
      className="editorial-container py-20 md:py-28"
    >
      <div className="max-w-3xl mx-auto space-y-8 animate-pulse motion-reduce:animate-none">
        <div className="flex flex-col items-center text-center gap-4">
          <BotanicalSprig />
          <div className="h-3 w-36 rounded-full bg-hairline" />
          <div className="h-10 w-72 sm:w-96 rounded-xl bg-linen" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-hairline bg-paper p-6 space-y-4"
            >
              <div className="aspect-[4/5] rounded-xl bg-linen" />
              <div className="h-4 w-3/4 rounded bg-linen" />
              <div className="h-3 w-1/2 rounded bg-hairline" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

