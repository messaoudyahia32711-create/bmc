'use client';
// ─── Wizard parts: re-export shared UI + small extras ────────────────────────
export { Field, NumField, TextField, AreaField, SectionCard, AlertCalm, KpiCard, CompletenessMeter } from './bmc-ui';

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle } from 'lucide-react';

export function PopHint({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline">
          <HelpCircle className="h-3.5 w-3.5" />
          <span className="text-[12px] font-medium">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-[13px] leading-relaxed">{children}</PopoverContent>
    </Popover>
  );
}
