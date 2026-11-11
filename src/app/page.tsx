'use client';
// ─── App shell: landing → workspace routing, project state, autosave ─────────
import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AppProvider, useApp } from '@/components/app-context';
import { HomeView } from '@/components/home-view';
import { LandingView, LangPills } from '@/components/landing-view';
import { WizardView } from '@/components/wizard-view';
import { ReportView } from '@/components/report-view';
import { DeckView } from '@/components/deck-view';
import { SettingsView } from '@/components/settings-view';
import { Tour, GuideDialog } from '@/components/tour';
import { Moon, Sun } from 'lucide-react';
import { Project } from '@/lib/types';
import { getProject, saveProject, getTourDone, setTourDone, getActiveId, setActiveId, importJsonFile } from '@/lib/storage';
import { countUse } from '@/lib/stats';
import { buildDemoProject } from '@/lib/demo';
import { uid } from '@/lib/types';

type View = 'landing' | 'home' | 'wizard' | 'report' | 'deck' | 'settings';

const VIEWS: string[] = ['home', 'wizard', 'report', 'deck', 'settings'];

const viewStore = {
  subscribe(listener: () => void) {
    window.addEventListener('hashchange', listener);
    return () => window.removeEventListener('hashchange', listener);
  },
  get(): View {
    const h = window.location.hash.replace('#/', '');
    return VIEWS.includes(h) ? (h as View) : 'landing';
  },
  serverGet(): View { return 'landing'; },
};

function Shell() {
  const { t, branding } = useApp();
  const view = useSyncExternalStore(viewStore.subscribe, viewStore.get, viewStore.serverGet);
  const [project, setProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef<Project | null>(null);

  const go = useCallback((v: View) => {
    window.location.hash = v === 'landing' ? '' : `/${v}`;
    window.scrollTo({ top: 0 });
  }, []);

  // apply saved theme (DOM only, no state)
  useEffect(() => {
    try {
      if (localStorage.getItem('bmc_tool_theme') === 'dark') document.documentElement.classList.add('dark');
    } catch { /* ignore */ }
  }, []);

  // open project + tour on first visit
  useEffect(() => {
    const id = getActiveId();
    if (id) {
      getProject(id).then(p => { if (p) setProject(p); });
    }
    if (!getTourDone()) setTimeout(() => setTourOpen(true), 800);
  }, []);

  // debounced autosave to IndexedDB (effect only touches the external system)
  useEffect(() => {
    if (!project) return;
    dirty.current = project;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (dirty.current) {
        await saveProject(dirty.current);
        setActiveId(dirty.current.id);
        dirty.current = null;
      }
      setSaving(false);
    }, 700);
  }, [project]);

  const openProject = (p: Project) => { countUse(); setProject(p); setActiveId(p.id); go('wizard'); };

  const update = useCallback((fn: (draft: Project) => void) => {
    setSaving(true);
    setProject(prev => {
      if (!prev) return prev;
      const draft = structuredClone(prev);
      fn(draft);
      return draft;
    });
  }, []);

  const startApp = () => { countUse(); go('home'); };
  const continueApp = () => {
    countUse();
    if (project) go('wizard'); else go('home');
  };
  const importFromLanding = async (f: File) => {
    try {
      const p = await importJsonFile(f);
      openProject(p);
    } catch { /* toast happens in home; silent here */ }
  };
  const demoFromLanding = async () => {
    const demo = buildDemoProject();
    demo.id = uid();
    await saveProject(demo);
    openProject(demo);
  };

  const orgName = branding.orgName || t.appName;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* app header (hidden on the landing page which has its own) */}
      {view !== 'landing' && (
        <header className="no-print sticky top-0 z-30 border-b border-border/60 bg-card/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
            <button className="flex items-center gap-2.5" onClick={() => go('landing')}>
              {branding.logo ? (
                <img src={branding.logo} alt={orgName} className="h-9 w-auto rounded-md bg-white p-0.5" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg text-[15px] font-black text-white" style={{ background: branding.primary }}>B</div>
              )}
              <div className="text-start">
                <div className="text-[14px] font-extrabold font-heading leading-tight">{orgName}</div>
                <div className="text-[10.5px] text-muted-foreground leading-tight">{t.appTagline}</div>
              </div>
            </button>
            <div className="ms-auto hidden items-center gap-1 text-[11px] text-muted-foreground md:flex">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--ok)]" />
              {t.privacyLines[0]}
            </div>
            <LangPills compact />
            <button
              aria-label="theme"
              className="rounded-lg border border-border/70 bg-card p-2 text-muted-foreground transition hover:text-primary"
              onClick={() => {
                const el = document.documentElement;
                const dark = el.classList.toggle('dark');
                try { localStorage.setItem('bmc_tool_theme', dark ? 'dark' : 'light'); } catch { /* ignore */ }
              }}
            >
              <Sun className="hidden h-4 w-4 dark:block" />
              <Moon className="h-4 w-4 dark:hidden" />
            </button>
          </div>
        </header>
      )}

      <main className="flex-1">
        {view === 'landing' && (
          <LandingView
            onStart={startApp}
            onContinue={continueApp}
            continueName={project ? (project.name || project.info.projectTitleAr || t.untitled) : null}
            onDemo={demoFromLanding}
            onImport={importFromLanding}
            onGuide={() => setGuideOpen(true)}
          />
        )}
        {view === 'home' && (
          <HomeView
            onOpen={openProject}
            onSettings={() => go('settings')}
            onGuide={() => setGuideOpen(true)}
            firstVisit={false}
            onStartTour={() => setTourOpen(true)}
          />
        )}
        {view === 'wizard' && project && (
          <WizardView p={project} update={update} saving={saving} onHome={() => go('landing')} onReport={() => go('report')} onDeck={() => go('deck')} />
        )}
        {view === 'report' && project && <ReportView p={project} onBack={() => go('wizard')} />}
        {view === 'deck' && project && <DeckView p={project} onBack={() => go('wizard')} />}
        {view === 'settings' && <SettingsView onBack={() => go('home')} />}
        {(view === 'wizard' || view === 'report' || view === 'deck') && !project && (
          <div className="mx-auto max-w-md px-4 py-20 text-center text-sm text-muted-foreground">{t.noProjects}</div>
        )}
      </main>

      {view !== 'landing' && (
        <footer className="no-print mt-auto border-t border-border/60 bg-card/60">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3 text-[11.5px] text-muted-foreground">
            <span>{branding.footerNote || `© ${new Date().getFullYear()} ${orgName}`}</span>
            <button className="underline-offset-2 hover:underline" onClick={() => setGuideOpen(true)}>{t.guide}</button>
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--ok)]" />
              {t.privacyLines[1]}
            </span>
          </div>
        </footer>
      )}

      {tourOpen && <Tour onClose={dont => { setTourOpen(false); if (dont) setTourDone(); }} />}
      {guideOpen && <GuideDialog onClose={() => setGuideOpen(false)} />}
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
