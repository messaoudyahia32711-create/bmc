// ─── Formatting helpers ───────────────────────────────────────────────────────
import { Lang } from './types';

export function money(n: number | undefined | null, lang: Lang): string {
  const v = Math.round(Number(n || 0));
  const suffix = lang === 'fr' ? ' DA' : lang === 'en' ? ' DZD' : ' دج';
  return v.toLocaleString('fr-DZ').replace(/\u202f|\u00a0/g, ' ') + suffix;
}

export function num(n: number | undefined | null): string {
  return Math.round(Number(n || 0)).toLocaleString('fr-DZ').replace(/\u202f|\u00a0/g, ' ');
}

export function pct(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`;
}

export function fmtDate(ts: number, lang: Lang): string {
  const d = new Date(ts);
  const locale = lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-FR' : 'en-GB';
  try {
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export function todayStr(lang: Lang): string {
  const d = new Date();
  const locale = lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-FR' : 'en-GB';
  try {
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return d.toISOString().slice(0, 10);
  }
}
