// ─── Local storage layer: IndexedDB for projects, localStorage for settings ──
// NO remote database — everything stays in the browser (privacy by design).
import { Project, Branding, Lang, SCHEMA_VERSION, newProject } from './types';

const DB_NAME = 'bmc-tool-v2';
const STORE = 'projects';
const LS_KEYS = {
  lang: 'bmc_tool_lang',
  branding: 'bmc_tool_branding',
  tour: 'bmc_tool_tour_done',
  active: 'bmc_tool_active',
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    t.oncomplete = () => db.close();
  });
}

export async function listProjects(): Promise<Project[]> {
  try {
    const all = await tx<Project[]>('readonly', s => s.getAll() as IDBRequest<Project[]>);
    return (all || []).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } catch {
    return [];
  }
}

export async function getProject(id: string): Promise<Project | undefined> {
  try {
    return await tx<Project | undefined>('readonly', s => s.get(id) as IDBRequest<Project | undefined>);
  } catch {
    return undefined;
  }
}

export async function saveProject(p: Project): Promise<void> {
  await tx('readwrite', s => s.put({ ...p, updatedAt: Date.now(), schemaVersion: SCHEMA_VERSION }) as IDBRequest<IDBValidKey>);
}

export async function deleteProject(id: string): Promise<void> {
  await tx('readwrite', s => s.delete(id) as unknown as IDBRequest<undefined>);
}

// ── localStorage helpers ─────────────────────────────────────────────────────
export function getLang(): Lang {
  try {
    const v = localStorage.getItem(LS_KEYS.lang);
    if (v === 'ar' || v === 'fr' || v === 'en') return v;
  } catch { /* ignore */ }
  return 'ar';
}
export function setLang(l: Lang) {
  try { localStorage.setItem(LS_KEYS.lang, l); } catch { /* ignore */ }
}

export const DEFAULT_BRANDING: Branding = {
  orgName: '',
  tagline: '',
  logo: null,
  primary: '#2E5E73',
  footerNote: '',
  reportCoverNote: '',
};

export function getBranding(): Branding {
  try {
    const raw = localStorage.getItem(LS_KEYS.branding);
    if (raw) return { ...DEFAULT_BRANDING, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_BRANDING };
}
export function setBranding(b: Branding) {
  try { localStorage.setItem(LS_KEYS.branding, JSON.stringify(b)); } catch { /* ignore */ }
}

export function getTourDone(): boolean {
  try { return localStorage.getItem(LS_KEYS.tour) === '1'; } catch { return false; }
}
export function setTourDone() {
  try { localStorage.setItem(LS_KEYS.tour, '1'); } catch { /* ignore */ }
}

export function getActiveId(): string | null {
  try { return localStorage.getItem(LS_KEYS.active); } catch { return null; }
}
export function setActiveId(id: string | null) {
  try {
    if (id) localStorage.setItem(LS_KEYS.active, id);
    else localStorage.removeItem(LS_KEYS.active);
  } catch { /* ignore */ }
}

export function downloadJson(p: Project) {
  const data = JSON.stringify({ bmcTool: true, schemaVersion: SCHEMA_VERSION, project: p }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bmc-project-${(p.name || 'sans-nom').replace(/\s+/g, '-').slice(0, 40)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importJsonFile(file: File): Promise<Project> {
  const text = await file.text();
  const data = JSON.parse(text);
  const p = data?.bmcTool ? data.project : data;
  if (!p || typeof p !== 'object' || !p.info || !p.products) throw new Error('invalid');
  const base = newProject();
  const merged: Project = {
    ...base,
    ...p,
    id: base.id,
    name: p.name ? `${p.name}` : base.name,
    schemaVersion: SCHEMA_VERSION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await saveProject(merged);
  return merged;
}

// Resize an uploaded logo image and convert to compact data URL
export function fileToLogo(file: File, maxSize = 280): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 4 * 1024 * 1024) { reject(new Error('too-big')); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('ctx')); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('img'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('read'));
    reader.readAsDataURL(file);
  });
}

// ── External store wrappers (useSyncExternalStore-friendly) ──────────────────
export function createLocalStore<T>(key: string, fallback: T, parse: (raw: string) => T, serialize: (v: T) => string) {
  let value = fallback;
  let initialized = false;
  const listeners = new Set<() => void>();
  const read = (): T => {
    if (!initialized && typeof window !== 'undefined') {
      initialized = true;
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) value = parse(raw);
      } catch { /* ignore */ }
    }
    return value;
  };
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    get: read,
    set(v: T) {
      value = v;
      try { localStorage.setItem(key, serialize(v)); } catch { /* ignore */ }
      listeners.forEach(l => l());
    },
    serverGet: () => fallback,
  };
}

export const langStore = createLocalStore<Lang>(LS_KEYS.lang, 'ar', r => (r === 'ar' || r === 'fr' || r === 'en' ? r : 'ar'), v => v);
export const brandingStore = createLocalStore<Branding>(LS_KEYS.branding, DEFAULT_BRANDING, r => { try { return { ...DEFAULT_BRANDING, ...JSON.parse(r) }; } catch { return DEFAULT_BRANDING; } }, v => JSON.stringify(v));
