'use client';
// ─── App-wide context: language + branding (white-label identity) ────────────
import React, { createContext, useContext, useCallback, useSyncExternalStore } from 'react';
import { Lang, Branding } from '@/lib/types';
import { Dict, getDict } from '@/lib/i18n';
import { langStore, brandingStore, DEFAULT_BRANDING } from '@/lib/storage';

interface AppCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  dir: 'rtl' | 'ltr';
  branding: Branding;
  saveBranding: (b: Branding) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export const CALM_PALETTE = ['#2E5E73', '#33635A', '#5A6B8C', '#705C53', '#4A6D7C', '#6B5E7A'];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(langStore.subscribe, langStore.get, langStore.serverGet);
  const branding = useSyncExternalStore(brandingStore.subscribe, brandingStore.get, brandingStore.serverGet);

  const setLang = useCallback((l: Lang) => {
    langStore.set(l);
  }, []);

  const saveBranding = useCallback((b: Branding) => {
    brandingStore.set(b);
  }, []);

  // apply direction + custom primary color live
  const dir: 'rtl' | 'ltr' = lang === 'ar' ? 'rtl' : 'ltr';
  React.useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  React.useEffect(() => {
    const root = document.documentElement;
    if (branding.primary && branding.primary !== DEFAULT_BRANDING.primary) root.style.setProperty('--primary', branding.primary);
    else root.style.removeProperty('--primary');
  }, [branding.primary]);

  const t: Dict = getDict(lang);

  return (
    <Ctx.Provider value={{ lang, setLang, t, dir, branding, saveBranding }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp(): AppCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside provider');
  return v;
}
