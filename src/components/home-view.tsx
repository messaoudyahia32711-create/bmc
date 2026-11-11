'use client';
// ─── Home view: multi-project manager ────────────────────────────────────────
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from './app-context';
import { Project, newProject, uid } from '@/lib/types';
import { listProjects, saveProject, deleteProject, downloadJson, importJsonFile } from '@/lib/storage';
import { buildDemoProject } from '@/lib/demo';
import { completeness } from '@/lib/analytics';
import { countUse, countProject } from '@/lib/stats';
import { fmtDate } from '@/lib/format';
import { SectionCard, CompletenessMeter, AlertCalm } from './bmc-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Sparkles, Upload, Settings2, BookOpen, FolderOpen, Copy, Download,
  Trash2, Pencil, ShieldCheck, Compass, FileSpreadsheet, Presentation, RefreshCw,
} from 'lucide-react';

export function HomeView({ onOpen, onSettings, onGuide, firstVisit, onStartTour }: {
  onOpen: (p: Project) => void;
  onSettings: () => void;
  onGuide: () => void;
  firstVisit: boolean;
  onStartTour: () => void;
}) {
  const { t, lang, branding } = useApp();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const reload = () => { listProjects().then(ps => { setProjects(ps); setLoaded(true); }); };
  useEffect(reload, []);

  const createNew = async () => {
    const p = newProject();
    await saveProject(p);
    countUse();
    countProject();
    onOpen(p);
  };

  const loadDemo = async () => {
    const demo = buildDemoProject();
    demo.id = uid();
    await saveProject(demo);
    countUse();
    countProject();
    onOpen(demo);
  };

  const doImport = async (f: File) => {
    try {
      const p = await importJsonFile(f);
      toast({ description: t.importedOk });
      onOpen(p);
    } catch {
      toast({ description: t.importError, variant: 'destructive' });
    }
  };

  const duplicate = async (p: Project) => {
    const copy: Project = { ...structuredClone(p), id: uid(), name: `${p.name || t.untitled} — ${t.duplicate}`, createdAt: Date.now() };
    await saveProject(copy);
    reload();
  };

  const doRename = async () => {
    if (renameTarget) {
      await saveProject({ ...renameTarget, name: renameVal });
      setRenameTarget(null);
      reload();
    }
  };

  const doDelete = async () => {
    if (deleteTarget) {
      await deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      reload();
    }
  };

  const orgName = branding.orgName || t.appName;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-[var(--primary)] via-[color-mix(in_srgb,var(--primary)_86%,black)] to-[color-mix(in_srgb,var(--primary)_70%,#1a2b33)] text-[var(--primary-foreground)] px-6 py-9 md:px-10 md:py-12 shadow-sm">
        <div className="absolute -top-16 -end-16 h-56 w-56 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -start-10 h-64 w-64 rounded-full bg-white/5" />
        <div className="relative">
          {branding.logo && <img src={branding.logo} alt={orgName} className="h-16 w-auto mb-4 rounded-lg bg-white/90 p-1.5" />}
          <div className="text-[12.5px] opacity-80 font-medium tracking-wide">{orgName}</div>
          <h1 className="mt-1 text-2xl md:text-3xl font-extrabold font-heading leading-snug">{t.homeWelcome}</h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed opacity-90">{branding.tagline || t.appTagline} — {t.homeSub}</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button size="lg" className="gap-2 bg-white text-[color-mix(in_srgb,var(--primary)_88%,black)] hover:bg-white/90 shadow" onClick={createNew}>
              <Plus className="h-4.5 w-4.5" /> {t.newProject}
            </Button>
            <Button size="lg" variant="outline" className="gap-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white" onClick={loadDemo}>
              <Sparkles className="h-4.5 w-4.5" /> {t.demoProject}
            </Button>
            <Button size="lg" variant="outline" className="gap-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4.5 w-4.5" /> {t.importJson}
            </Button>
          </div>
          <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) doImport(f); e.target.value = ''; }} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button onClick={onSettings} className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 text-start shadow-sm transition hover:border-primary/50 hover:shadow">
          <div className="rounded-lg bg-secondary p-2 text-primary group-hover:bg-primary group-hover:text-white transition"><Settings2 className="h-5 w-5" /></div>
          <div>
            <div className="text-sm font-semibold">{t.settings}</div>
            <div className="text-[12px] text-muted-foreground">{t.settingsTitle}</div>
          </div>
        </button>
        <button onClick={onGuide} className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 text-start shadow-sm transition hover:border-primary/50 hover:shadow">
          <div className="rounded-lg bg-secondary p-2 text-primary group-hover:bg-primary group-hover:text-white transition"><BookOpen className="h-5 w-5" /></div>
          <div>
            <div className="text-sm font-semibold">{t.guide}</div>
            <div className="text-[12px] text-muted-foreground">{t.privacyTitle}</div>
          </div>
        </button>
        <button onClick={onStartTour} className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 text-start shadow-sm transition hover:border-primary/50 hover:shadow">
          <div className="rounded-lg bg-secondary p-2 text-primary group-hover:bg-primary group-hover:text-white transition"><Compass className="h-5 w-5" /></div>
          <div>
            <div className="text-sm font-semibold">{t.tourCardTitle}</div>
            <div className="text-[12px] text-muted-foreground">{t.steps.length} {lang === 'ar' ? 'خطوات' : lang === 'fr' ? 'étapes' : 'steps'}</div>
          </div>
        </button>
      </div>

      {/* Projects list */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading flex items-center gap-2"><FolderOpen className="h-5 w-5 text-primary" />{t.myProjects}</h2>
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={reload}><RefreshCw className="h-3.5 w-3.5" />{lang === 'ar' ? 'تحديث' : lang === 'fr' ? 'Rafraîchir' : 'Refresh'}</Button>
        </div>

        {!loaded ? (
          <p className="mt-4 text-sm text-muted-foreground">{t.loading}</p>
        ) : projects.length === 0 ? (
          <Card className="mt-4 border-dashed">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              <FileSpreadsheet className="mx-auto mb-3 h-8 w-8 opacity-40" />
              {t.noProjects}
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {projects.map(p => {
              const comp = completeness(p);
              return (
                <Card key={p.id} className="group border-border/70 shadow-sm hover:shadow-md transition">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold font-heading">{p.name || t.untitled}</h3>
                          {p.demo && <Badge variant="secondary" className="shrink-0">{t.demoProject}</Badge>}
                        </div>
                        <div className="mt-0.5 text-[12px] text-muted-foreground">
                          {p.info.ownerName || t.owner}: <span className="font-medium">{p.info.ownerName || t.na}</span> · {t.lastUpdate}: {fmtDate(p.updatedAt, lang)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <CompletenessMeter percent={comp.percent} label={t.completion} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <Button size="sm" className="h-8 gap-1.5" onClick={() => onOpen(p)}><FolderOpen className="h-3.5 w-3.5" />{t.open}</Button>
                      <Button size="sm" variant="ghost" className="h-8 gap-1.5" onClick={() => { setRenameTarget(p); setRenameVal(p.name || ''); }}><Pencil className="h-3.5 w-3.5" />{t.rename}</Button>
                      <Button size="sm" variant="ghost" className="h-8 gap-1.5" onClick={() => duplicate(p)}><Copy className="h-3.5 w-3.5" />{t.duplicate}</Button>
                      <Button size="sm" variant="ghost" className="h-8 gap-1.5" onClick={() => downloadJson(p)}><Download className="h-3.5 w-3.5" />JSON</Button>
                      <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(p)}><Trash2 className="h-3.5 w-3.5" />{t.delete}</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Privacy strip */}
      <SectionCard className="mt-8" icon={<ShieldCheck className="h-5 w-5" />} title={t.privacyTitle}>
        <ul className="space-y-2 text-[13px] leading-relaxed text-muted-foreground">
          {t.privacyLines.slice(0, 3).map((l, i) => (
            <li key={i} className="flex gap-2"><span className="text-primary mt-0.5">✓</span><span>{l}</span></li>
          ))}
        </ul>
      </SectionCard>

      {/* first visit hint */}
      {firstVisit && (
        <AlertCalm tone="ok">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span>{t.tourWelcome}</span>
            <Button size="sm" variant="outline" className="border-[var(--ok-border)] text-[var(--ok)]" onClick={onStartTour}>{t.tourNext} →</Button>
          </div>
        </AlertCalm>
      )}

      {/* rename dialog */}
      <Dialog open={!!renameTarget} onOpenChange={v => !v && setRenameTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.rename}</DialogTitle>
            <DialogDescription className="sr-only">{t.projectName}</DialogDescription>
          </DialogHeader>
          <Input value={renameVal} onChange={e => setRenameVal(e.target.value)} placeholder={t.projectName} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>{t.close}</Button>
            <Button onClick={doRename}>{t.saved}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.delete}</AlertDialogTitle>
            <AlertDialogDescription>{t.confirmDelete}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.close}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={doDelete}>{t.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Report/deck entry buttons exported for wizard header reuse
export const HomeIcons = { Presentation };
