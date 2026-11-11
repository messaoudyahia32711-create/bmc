// ─── Formatting helpers ───────────────────────────────────────────────────────
import { Lang } from './types';

/**
 * Group an integer in thousands with a NO-BREAK SPACE (U+00A0) separator.
 *
 * ⚠ Never use a plain space (U+0020) as a thousands separator: its Unicode BiDi
 * class is WS (neutral), so inside an Arabic RTL paragraph it splits the number
 * into separate runs that the bidi algorithm reorders right-to-left — "105 000"
 * renders visually as "000 105" (numbers appear "reversed").
 * U+00A0 has BiDi class CS (Common Number Separator), so the grouped number
 * stays a single LTR run even inside RTL text. Same for U+202F.
 */
function groupInt(v: number): string {
  return String(Math.round(Math.abs(v))).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
}

export function money(n: number | undefined | null, lang: Lang): string {
  const v = Math.round(Number(n || 0));
  const suffix = lang === 'fr' ? ' DA' : lang === 'en' ? ' DZD' : ' دج';
  return (v < 0 ? '-' : '') + groupInt(v) + suffix;
}

export function num(n: number | undefined | null): string {
  const v = Math.round(Number(n || 0));
  return (v < 0 ? '-' : '') + groupInt(v);
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
