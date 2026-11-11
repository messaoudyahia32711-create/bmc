'use client';
// ─── Interactive landing page: hero, live counters, clickable features ───────
import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useApp } from './app-context';
import { Lang } from '@/lib/types';
import { getX } from '@/lib/i18n2';
import { statsStore, EMPTY_STATS, UsageStats } from '@/lib/stats';
import { fmtDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import {
  Rocket, Sparkles, Upload, ShieldCheck, ChevronDown, PlayCircle, Sun, Moon,
  Save, Palette, Landmark, LayoutGrid, Presentation, Languages, Gauge,
  MousePointerClick, FolderOpen, FileDown, FileUp, Compass, BookOpen,
} from 'lucide-react';

export function LangPills({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useApp();
  const langs: { id: Lang; label: string }[] = [
    { id: 'ar', label: 'عربية' }, { id: 'fr', label: 'FR' }, { id: 'en', label: 'EN' },
  ];
  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-border/70 bg-card/80 p-0.5 shadow-sm" role="group" aria-label="language">
      {langs.map(l => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          aria-pressed={lang === l.id}
          className={`rounded-lg px-2.5 font-semibold transition ${compact ? 'h-7 text-[11px]' : 'h-8 text-[12.5px]'} ${
            lang === l.id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function ThemeToggle() {
  return (
    <button
      aria-label="theme"
      className="rounded-xl border border-border/70 bg-card/80 p-2 text-muted-foreground shadow-sm transition hover:text-primary"
      onClick={() => {
        const el = document.documentElement;
        const dark = el.classList.toggle('dark');
        try { localStorage.setItem('bmc_tool_theme', dark ? 'dark' : 'light'); } catch { /* ignore */ }
      }}
    >
      <Sun className="hidden h-4 w-4 dark:block" />
      <Moon className="h-4 w-4 dark:hidden" />
    </button>
  );
}

function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current, to = value, t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
      else prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span className="num">{display.toLocaleString('fr-DZ')}</span>;
}

const FEATURE_ICONS = [Save, Palette, Landmark, LayoutGrid, Presentation, Languages, Gauge];
const FEATURE_BT = ['fc1t', 'fc1d', 'fc1b', 'fc2t', 'fc2d', 'fc2b', 'fc3t', 'fc3d', 'fc3b', 'fc4t', 'fc4d', 'fc4b', 'fc5t', 'fc5d', 'fc5b', 'fc6t', 'fc6d', 'fc6b', 'fc7t', 'fc7d', 'fc7b'] as const;

export function LandingView({ onStart, onContinue, continueName, onDemo, onImport, onGuide }: {
  onStart: () => void;
  onContinue: () => void;
  continueName: string | null;
  onDemo: () => void;
  onImport: (f: File) => void;
  onGuide: () => void;
}) {
  const { t, lang, branding } = useApp();
  const x = getX(lang);
  const stats: UsageStats = useSyncExternalStore(statsStore.subscribe, statsStore.get, () => EMPTY_STATS);
  const [openFeat, setOpenFeat] = useState<number | null>(null);
  const [selStep, setSelStep] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const orgName = branding.orgName || t.appName;
  const hasStats = stats.uses > 0 || stats.pdfExports > 0 || stats.pptxExports > 0 || stats.projectsCreated > 0;

  const statCards = [
    { icon: PlayCircle, label: x.stUses, value: stats.uses, color: 'text-primary bg-secondary' },
    { icon: FileDown, label: x.stPdf, value: stats.pdfExports, color: 'text-[#3E7C59] bg-[var(--ok-bg)]' },
    { icon: Presentation, label: x.stPptx, value: stats.pptxExports, color: 'text-[#96691F] bg-[var(--warn-bg)]' },
    { icon: FolderOpen, label: x.stProjects, value: stats.projectsCreated, color: 'text-[#7C5A6B] bg-[#F3EBF0] dark:bg-[#332830]' },
  ];

  const features = Array.from({ length: 7 }, (_, i) => ({
    icon: FEATURE_ICONS[i],
    title: (x as unknown as Record<string, string>)[FEATURE_BT[i * 3]],
    desc: (x as unknown as Record<string, string>)[FEATURE_BT[i * 3 + 1]],
    bullets: (x as unknown as Record<string, string[]>)[FEATURE_BT[i * 3 + 2]],
  }));

  return (
    <div className="lb-root">
      {/* ── top bar ── */}
      <header className="no-print sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            {branding.logo ? (
              <img src={branding.logo} alt={orgName} className="h-9 w-auto rounded-md bg-white p-0.5" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[#3E7C59] text-[15px] font-black text-white shadow-sm">B</div>
            )}
            <div className="text-start leading-tight">
              <div className="text-[14px] font-extrabold font-heading">{orgName}</div>
              <div className="text-[10.5px] text-muted-foreground">{t.appTagline}</div>
            </div>
          </div>
          <div className="ms-auto flex items-center gap-2">
            <LangPills />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── hero ── */}
      <section className="relative overflow-hidden">
        <div className="lb-blob lb-blob-1" />
        <div className="lb-blob lb-blob-2" />
        <div className="lb-blob lb-blob-3" />
        <div className="lb-grid-overlay" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-14 md:pb-20 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="lb-badge inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-card/70 px-4 py-1.5 text-[12.5px] font-semibold text-primary shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              {x.lbBadge}
            </span>
            <h1 className="mt-5 text-4xl font-black font-heading leading-[1.25] md:text-[52px]">
              {x.lbTitle1}
              <br />
              <span className="lb-gradient-text">{x.lbTitle2}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[15.5px] leading-relaxed text-muted-foreground md:text-[16.5px]">{x.lbSub}</p>

            {/* big START */}
            <div className="mt-9 flex flex-col items-center justify-center gap-3">
              <button
                onClick={onStart}
                className="lb-start-btn group relative inline-flex h-16 items-center gap-3 overflow-hidden rounded-2xl px-12 text-lg font-extrabold font-heading text-white shadow-[0_14px_44px_-10px_var(--primary)] transition-transform duration-200 hover:scale-[1.04] active:scale-95 md:h-[68px] md:px-14 md:text-xl"
              >
                <span className="lb-start-shine" aria-hidden />
                <Rocket className="h-6 w-6 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                {x.lbStart}
              </button>
              <span className="text-[12px] text-muted-foreground">{x.lbStartSub}</span>
            </div>

            {/* secondary actions */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              {continueName && (
                <Button variant="outline" className="h-10 gap-2 rounded-xl border-primary/40 text-primary hover:bg-secondary" onClick={onContinue}>
                  <PlayCircle className="h-4 w-4" />
                  {x.lbContinue.replace('{name}', continueName.slice(0, 28))}
                </Button>
              )}
              <Button variant="outline" className="h-10 gap-2 rounded-xl" onClick={onDemo}>
                <Sparkles className="h-4 w-4 text-[#C99A3C]" /> {x.lbDemo}
              </Button>
              <Button variant="outline" className="h-10 gap-2 rounded-xl" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4" /> {x.lbImport}
              </Button>
            </div>
            <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onImport(f); e.target.value = ''; }} />

            {/* trust chips */}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-2 text-[12px]">
              {[`${t.steps.length} ${lang === 'ar' ? 'خطوات موجهة' : lang === 'fr' ? 'étapes guidées' : 'guided steps'}`,
                `${lang === 'ar' ? '12 ملحقاً مالياً' : lang === 'fr' ? '12 annexes financières' : '12 financial appendices'}`,
                `${lang === 'ar' ? '3 لغات' : lang === 'fr' ? '3 langues' : '3 languages'}`,
                `${lang === 'ar' ? 'PDF + PPTX فوري' : lang === 'fr' ? 'PDF + PPTX instantané' : 'Instant PDF + PPTX'}`,
              ].map((chip, i) => (
                <span key={i} className="rounded-full border border-border/70 bg-card/70 px-3.5 py-1.5 font-semibold text-foreground/80 shadow-sm backdrop-blur">{chip}</span>
              ))}
            </div>

            <a href="#lb-features" className="mt-10 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary/80 transition hover:text-primary">
              {x.lbExplore} <ChevronDown className="h-4 w-4 animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      {/* ── live counters ── */}
      <section className="border-y border-border/60 bg-card/50 py-10 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-xl font-extrabold font-heading md:text-2xl">{x.lbStatsTitle}</h2>
            <p className="mt-1.5 text-[13px] text-muted-foreground">{x.lbStatsHint}</p>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            {statCards.map((s, i) => (
              <div key={i} className="rounded-2xl border border-border/70 bg-card p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl ${s.color}`}>
                  <s.icon className="h-5.5 w-5.5" />
                </div>
                <div className="mt-3 text-3xl font-black font-heading tracking-tight md:text-4xl">
                  <CountUp value={s.value} />
                </div>
                <div className="mt-1 text-[12.5px] font-semibold text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-[12px] text-muted-foreground">
            {hasStats
              ? <span>{x.lbLastUse}: <strong className="num">{stats.lastUse ? fmtDate(stats.lastUse, lang) : '—'}</strong></span>
              : <span className="inline-flex items-center gap-1.5"><MousePointerClick className="h-3.5 w-3.5" />{x.lbNoStatsYet}</span>}
          </p>
        </div>
      </section>

      {/* ── interactive feature cards ── */}
      <section id="lb-features" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-14">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold font-heading md:text-3xl">{x.lbFeaturesTitle}</h2>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
            <MousePointerClick className="h-4 w-4" /> {x.lbFeaturesSub}
          </p>
        </div>
        <div className="mt-8 grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const open = openFeat === i;
            return (
              <button
                key={i}
                onClick={() => setOpenFeat(open ? null : i)}
                aria-expanded={open}
                className={`group rounded-2xl border bg-card p-5 text-start shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                  open ? 'border-primary/60 ring-2 ring-primary/15 md:col-span-2 lg:col-span-3' : 'border-border/70'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${open ? 'bg-primary text-white' : 'bg-secondary text-primary group-hover:bg-primary group-hover:text-white'}`}>
                    <f.icon className="h-5.5 w-5.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[15.5px] font-extrabold font-heading">{f.title}</h3>
                      <span className={`hidden shrink-0 items-center gap-1 text-[11px] font-semibold text-primary/70 sm:inline-flex ${open ? 'opacity-0' : ''}`}>
                        {x.lbClickHint} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">{f.desc}</p>
                    <div className={`grid transition-all duration-300 ${open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <ul className="overflow-hidden">
                        {f.bullets.map((b, j) => (
                          <li key={j} className="flex items-start gap-2 py-1 text-[13px] leading-relaxed">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── interactive 8-step walkthrough ── */}
      <section className="border-y border-border/60 bg-secondary/40 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold font-heading md:text-3xl">{x.lbHowTitle}</h2>
            <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
              <MousePointerClick className="h-4 w-4" /> {x.lbHowSub}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-4 gap-2.5 md:grid-cols-8">
            {t.steps.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelStep(i)}
                aria-pressed={selStep === i}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all duration-200 hover:-translate-y-0.5 ${
                  selStep === i ? 'border-primary bg-primary text-white shadow-md' : 'border-border/70 bg-card shadow-sm hover:border-primary/40'
                }`}
              >
                <span className={`num flex h-8 w-8 items-center justify-center rounded-xl text-[13px] font-black ${selStep === i ? 'bg-white/20' : 'bg-secondary text-primary'}`}>{i + 1}</span>
                <span className="text-[11.5px] font-bold leading-snug">{s}</span>
              </button>
            ))}
          </div>
          <div className="mx-auto mt-4 max-w-2xl rounded-2xl border border-border/70 bg-card p-5 text-center shadow-sm">
            <div className="text-[13px] font-extrabold text-primary">{lang === 'ar' ? 'الخطوة' : lang === 'fr' ? 'Étape' : 'Step'} {selStep + 1} — {t.steps[selStep]}</div>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{(x as unknown as Record<string, string>)[`sd${selStep + 1}`]}</p>
          </div>
        </div>
      </section>

      {/* ── privacy ── */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--ok-border)] bg-[var(--ok-bg)] p-7 md:p-10">
          <ShieldCheck className="absolute -bottom-6 -start-6 h-40 w-40 text-[var(--ok)] opacity-10" aria-hidden />
          <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="flex items-center gap-2.5 text-xl font-extrabold font-heading text-[var(--ok)] md:text-2xl">
                <ShieldCheck className="h-6 w-6" /> {t.privacyTitle}
              </h2>
              <ul className="mt-4 space-y-2.5 text-[13.5px] leading-relaxed text-foreground/85">
                {t.privacyLines.slice(0, 3).map((l, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--ok)] text-[10px] font-black text-white">✓</span>
                    {l}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2.5">
              <Button size="lg" className="h-12 gap-2 rounded-xl bg-[var(--ok)] px-7 text-[15px] font-bold text-white hover:bg-[var(--ok)]/90" onClick={onStart}>
                <Rocket className="h-5 w-5" /> {x.lbOpenWorkspace}
              </Button>
              <Button size="lg" variant="outline" className="h-11 gap-2 rounded-xl border-[var(--ok-border)] bg-white/60 text-[13.5px] text-[var(--ok)] hover:bg-white/80" onClick={onGuide}>
                <BookOpen className="h-4.5 w-4.5" /> {x.lbGuideCta}
              </Button>
              <Button size="lg" variant="outline" className="h-11 gap-2 rounded-xl border-[var(--ok-border)] bg-white/60 text-[13.5px] text-[var(--ok)] hover:bg-white/80" onClick={() => { document.getElementById('lb-features')?.scrollIntoView({ behavior: 'smooth' }); }}>
                <Compass className="h-4.5 w-4.5" /> {t.tourCardTitle}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── footer ── */}
      <footer className="mt-auto border-t border-border/60 bg-card/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-[12px] text-muted-foreground">
          <span className="font-semibold">{branding.footerNote || orgName}</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--ok)]" />
            {x.lbFooter}
          </span>
          <LangPills compact />
        </div>
      </footer>
    </div>
  );
}
