// ─── Local usage counters: every use & every export, counted in the browser ──
// Privacy-first: stored in localStorage only, never sent anywhere.
import { createLocalStore } from './storage';

export interface UsageStats {
  uses: number;           // every time the user enters the workspace / opens a project
  pdfExports: number;     // every PDF export (report or deck via print)
  pptxExports: number;    // every PPTX pitch-deck export
  projectsCreated: number;
  lastUse: number;        // timestamp
}

export const EMPTY_STATS: UsageStats = { uses: 0, pdfExports: 0, pptxExports: 0, projectsCreated: 0, lastUse: 0 };

function parseStats(raw: string): UsageStats {
  try {
    const v = JSON.parse(raw);
    return {
      uses: Number(v?.uses) || 0,
      pdfExports: Number(v?.pdfExports) || 0,
      pptxExports: Number(v?.pptxExports) || 0,
      projectsCreated: Number(v?.projectsCreated) || 0,
      lastUse: Number(v?.lastUse) || 0,
    };
  } catch {
    return { ...EMPTY_STATS };
  }
}

export const statsStore = createLocalStore<UsageStats>(
  'bmc_tool_stats',
  { ...EMPTY_STATS },
  parseStats,
  v => JSON.stringify(v),
);

function bump(field: keyof UsageStats) {
  const s = { ...statsStore.get() };
  if (field === 'lastUse') s.lastUse = Date.now();
  else (s[field] as number) = (s[field] as number) + 1;
  if (field !== 'lastUse') s.lastUse = Date.now();
  statsStore.set(s);
}

export const countUse = () => bump('uses');
export const countPdf = () => bump('pdfExports');
export const countPptx = () => bump('pptxExports');
export const countProject = () => bump('projectsCreated');
