'use client';
// ─── First-use guided tour + user guide dialog ───────────────────────────────
import React, { useState } from 'react';
import { useApp } from './app-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Compass, ShieldCheck, Sparkles } from 'lucide-react';

export function Tour({ onClose }: { onClose: (dontShow: boolean) => void }) {
  const { t } = useApp();
  const [i, setI] = useState(0);
  const [dontShow, setDontShow] = useState(true);
  const steps = [
    { icon: Compass, title: t.tour1t, body: t.tour1d },
    { icon: Compass, title: t.tour2t, body: t.tour2d },
    { icon: Sparkles, title: t.tour3t, body: t.tour3d },
    { icon: Sparkles, title: t.tour4t, body: t.tour4d },
    { icon: ShieldCheck, title: t.tour5t, body: t.tour5d },
    { icon: ShieldCheck, title: t.tour6t, body: t.tour6d },
  ];
  const s = steps[i];
  return (
    <Dialog open onOpenChange={v => !v && onClose(dontShow)}>
      <DialogContent className="no-print sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary"><s.icon className="h-5 w-5" />{s.title}</DialogTitle>
          <DialogDescription className="sr-only">{s.title}</DialogDescription>
        </DialogHeader>
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">{s.body}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, k) => <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-5 bg-primary' : 'w-1.5 bg-border'}`} />)}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => onClose(dontShow)}>{t.tourSkip}</Button>
            {i < steps.length - 1 ? (
              <Button size="sm" onClick={() => setI(v => v + 1)}>{t.tourNext}</Button>
            ) : (
              <Button size="sm" onClick={() => onClose(dontShow)}>{t.tourEnd}</Button>
            )}
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-[12px] text-muted-foreground">
          <Checkbox checked={dontShow} onCheckedChange={v => setDontShow(!!v)} />
          {t.tourDontShow}
        </label>
      </DialogContent>
    </Dialog>
  );
}

export function GuideDialog({ onClose }: { onClose: () => void }) {
  const { t } = useApp();
  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="no-print max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary">{t.guideTitle}</DialogTitle>
          <DialogDescription className="sr-only">{t.guideTitle}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 font-bold text-[var(--ok)]"><ShieldCheck className="h-4.5 w-4.5" />{t.privacyTitle}</h3>
            <ul className="space-y-2 text-[13px] leading-relaxed text-muted-foreground">
              {t.privacyLines.map((l, i) => <li key={i} className="flex gap-2"><span className="text-primary">✓</span><span>{l}</span></li>)}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-bold text-primary">{t.guide}</h3>
            <ol className="list-decimal space-y-2 ps-5 text-[13px] leading-relaxed text-muted-foreground">
              {t.stepsGuide.map((l, i) => <li key={i}>{l}</li>)}
            </ol>
          </div>
          <div>
            <h3 className="mb-2 font-bold text-primary">{t.steps[7]}</h3>
            <ul className="list-disc space-y-1 ps-5 text-[13px] text-muted-foreground">
              {t.appendices.slice(0, 10).map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>{t.close}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
