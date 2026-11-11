'use client';
// ─── Settings view: white-label identity + language ──────────────────────────
import React, { useRef, useState } from 'react';
import { useApp, CALM_PALETTE } from './app-context';
import { fileToLogo } from '@/lib/storage';
import { SectionCard, TextField, AreaField, AlertCalm } from './bmc-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast as sonner } from '@/hooks/use-toast';
import { Upload, RotateCcw, Palette, Languages } from 'lucide-react';
import { Lang } from '@/lib/types';

export function SettingsView({ onBack }: { onBack: () => void }) {
  const { t, lang, setLang, branding, saveBranding } = useApp();
  const [local, setLocal] = useState(branding);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<typeof local>) => setLocal(v => ({ ...v, ...patch }));

  const save = () => {
    saveBranding(local);
    sonner({ description: t.saved });
  };

  const onLogo = async (f: File) => {
    try {
      const data = await fileToLogo(f);
      set({ logo: data });
    } catch {
      sonner({ description: t.logoTooBig, variant: 'destructive' });
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold font-heading">{t.settingsTitle}</h1>
          <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed">{t.settingsDesc}</p>
        </div>
        <Button variant="outline" onClick={onBack}>{t.backToApp}</Button>
      </div>

      <SectionCard icon={<Palette className="h-5 w-5" />} title={t.settingsTitle}>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <TextField label={t.brOrgName} value={local.orgName} onChange={v => set({ orgName: v })} placeholder={t.appName} />
          <TextField label={t.brTagline} value={local.tagline} onChange={v => set({ tagline: v })} placeholder={t.appTagline} />
          <TextField label={t.brFooter} value={local.footerNote} onChange={v => set({ footerNote: v })} placeholder="© …" />
          <TextField label={t.brCoverNote} value={local.reportCoverNote} onChange={v => set({ reportCoverNote: v })} />
        </div>

        <div className="mt-4">
          <div className="mb-1.5 text-[13px] font-medium text-muted-foreground">{t.brLogo}</div>
          <div className="flex items-center gap-3">
            {local.logo ? (
              <img src={local.logo} alt="logo" className="h-16 w-auto rounded-lg border border-border/70 bg-white p-1.5" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border text-[10px] text-muted-foreground">logo</div>
            )}
            <div className="space-y-1.5">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => fileRef.current?.click()}><Upload className="h-3.5 w-3.5" />{t.brLogo}</Button>
              {local.logo && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => set({ logo: null })}>{t.delete}</Button>}
              <div className="text-[11.5px] text-muted-foreground">{t.brLogoHint}</div>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onLogo(f); e.target.value = ''; }} />
        </div>

        <div className="mt-4">
          <div className="mb-1.5 text-[13px] font-medium text-muted-foreground">{t.brPrimary}</div>
          <div className="flex flex-wrap items-center gap-2">
            {CALM_PALETTE.map(c => (
              <button key={c} onClick={() => set({ primary: c })}
                className={`h-9 w-9 rounded-full border-2 transition ${local.primary === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                style={{ background: c }} aria-label={c} />
            ))}
            <label className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
              <input type="color" value={local.primary} onChange={e => set({ primary: e.target.value })} className="h-9 w-12 cursor-pointer rounded border border-border" />
              {local.primary}
            </label>
          </div>
          <div className="mt-2 text-[11.5px] text-muted-foreground">{t.brPalette}</div>
        </div>

        {/* live preview */}
        <div className="mt-5 rounded-xl border border-border/70 p-4" style={{ background: 'var(--muted)' }}>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Preview</div>
          <div className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-white" style={{ background: local.primary }}>
            {local.logo && <img src={local.logo} alt="" className="h-9 w-auto rounded bg-white/90 p-1" />}
            <div>
              <div className="text-[14px] font-bold font-heading">{local.orgName || t.appName}</div>
              <div className="text-[11.5px] opacity-85">{local.tagline || t.appTagline}</div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="mt-4" icon={<Languages className="h-5 w-5" />} title={t.langDefault}>
        <Select value={lang} onValueChange={v => setLang(v as Lang)}>
          <SelectTrigger className="w-52 bg-white/80 dark:bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ar">العربية</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </SectionCard>

      <div className="sticky bottom-4 mt-5 flex justify-end gap-2">
        <Button variant="outline" className="gap-1.5 bg-card" onClick={() => setLocal({ ...branding })}><RotateCcw className="h-4 w-4" />{t.brReset}</Button>
        <Button onClick={save} className="shadow-lg">{t.saved}</Button>
      </div>

      <AlertCalm tone="ok">
        <span className="text-[12.5px]">{t.privacyLines[2]}</span>
      </AlertCalm>
    </div>
  );
}
