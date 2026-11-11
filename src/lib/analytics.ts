// ─── Completeness meter, interpreted indicators, committee simulation ────────
import { Project, Lang } from './types';
import { fixedMonthly, computeSnapshot } from './engine';
import { getDict } from './i18n';

// ── Completeness ─────────────────────────────────────────────────────────────
export interface CompletenessCheck { key: string; done: boolean }
export interface Completeness { checks: CompletenessCheck[]; percent: number; missingKeys: string[] }

export function completeness(p: Project): Completeness {
  const snap = computeSnapshot(p);
  const smart = getSmartPercents(p);
  const checks: CompletenessCheck[] = [
    { key: 'cInfo', done: !!(p.info.projectTitleAr?.trim() || p.info.projectTitleEn?.trim() || p.name?.trim()) },
    { key: 'cProduct', done: p.products.some(pr => pr.name?.trim() && ((pr.model === 'fixed' && pr.price > 0 && pr.qty > 0) || (pr.model === 'commission' && pr.deal > 0 && pr.deals > 0 && pr.commission > 0) || (pr.model === 'subscription' && pr.sub > 0 && pr.subs > 0))) },
    { key: 'cFixed', done: fixedMonthly(p) > 0 },
    { key: 'cAssets', done: p.assets.length > 0 && snap.assets.invest > 0 },
    { key: 'cFunding', done: smart >= 100 && snap.financingGap <= 0 },
    { key: 'cBmc', done: !!(p.market.customers?.trim() && p.market.valueProp?.trim() && p.market.channels?.trim() && p.market.partners?.trim() && p.market.activities?.trim()) },
    { key: 'cSwot', done: p.market.swot.strengths.length > 0 && p.market.swot.weaknesses.length > 0 && p.market.swot.opportunities.length > 0 && p.market.swot.threats.length > 0 },
    { key: 'cCompetitors', done: p.market.competitors.length > 0 },
    { key: 'cPersona', done: p.market.personas.length > 0 },
  ];
  const doneCount = checks.filter(c => c.done).length;
  const percent = Math.round((doneCount / checks.length) * 100);
  return { checks, percent, missingKeys: checks.filter(c => !c.done).map(c => c.key) };
}

function getSmartPercents(p: Project): number {
  return p.funding.selfPercent + p.funding.loanPercent + p.funding.grantPercent;
}

// ── Interpreted indicators ───────────────────────────────────────────────────
export type Verdict = 'good' | 'mid' | 'weak';
export interface Indicator {
  key: string;
  value: string;          // formatted value
  verdict: Verdict;
  explain: string;        // i18n key of the explanation
}

export function indicators(p: Project, lang: Lang, money: (n: number) => string): Indicator[] {
  const snap = computeSnapshot(p);
  const t = getDict(lang);
  const out: Indicator[] = [];

  // ROI year 1
  const roi = snap.budget.total > 0 ? snap.year1.net / snap.budget.total : 0;
  out.push({
    key: 'indRoi',
    value: roi > 0 ? `${(roi * 100).toFixed(1)}%` : '0%',
    verdict: roi >= 0.25 ? 'good' : roi >= 0.1 ? 'mid' : 'weak',
    explain: roi >= 0.25 ? 'indGoodRoi' : roi >= 0.1 ? 'indMidRoi' : 'indWeakRoi',
  });

  // Payback
  const annualCash = snap.year1.net + snap.year1.depr;
  const paybackYears = annualCash > 0 ? snap.budget.total / annualCash : Infinity;
  out.push({
    key: 'indPayback',
    value: paybackYears === Infinity ? t.never : `${paybackYears.toFixed(1)} ${t.indYearsUnit}`,
    verdict: paybackYears <= 2 ? 'good' : paybackYears <= 4 ? 'mid' : 'weak',
    explain: paybackYears <= 2 ? 'indGoodPayback' : paybackYears <= 4 ? 'indMidPayback' : 'indWeakPayback',
  });

  // Added value
  const vaRate = snap.year1.rev > 0 ? snap.year1.va / snap.year1.rev : 0;
  out.push({
    key: 'indVa',
    value: money(snap.year1.va),
    verdict: vaRate >= 0.4 ? 'good' : vaRate >= 0.2 ? 'mid' : 'weak',
    explain: vaRate >= 0.4 ? 'indGoodVa' : vaRate >= 0.2 ? 'indMidVa' : 'indWeakVa',
  });

  // EBE
  const ebeRate = snap.year1.rev > 0 ? snap.year1.ebe / snap.year1.rev : -1;
  out.push({
    key: 'indEbe',
    value: money(snap.year1.ebe),
    verdict: ebeRate >= 0.15 ? 'good' : ebeRate > 0 ? 'mid' : 'weak',
    explain: ebeRate >= 0.15 ? 'indGoodEbe' : ebeRate > 0 ? 'indMidEbe' : 'indWeakEbe',
  });

  // Margin
  const marginRate = snap.base.rev > 0 ? (snap.base.rev - snap.base.varCost) / snap.base.rev : 0;
  out.push({
    key: 'indMargin',
    value: `${(marginRate * 100).toFixed(1)}%`,
    verdict: marginRate >= 0.3 ? 'good' : marginRate >= 0.15 ? 'mid' : 'weak',
    explain: marginRate >= 0.3 ? 'indGoodMargin' : marginRate >= 0.15 ? 'indMidMargin' : 'indWeakMargin',
  });

  // Minimum treasury
  const minC = snap.minCash;
  out.push({
    key: 'indMinTreasury',
    value: money(minC),
    verdict: minC >= 0 ? 'good' : minC > -snap.base.rev * 3 ? 'mid' : 'weak',
    explain: minC >= 0 ? 'indGoodTreasury' : minC > -snap.base.rev * 3 ? 'indMidTreasury' : 'indWeakTreasury',
  });

  return out;
}

// ── Committee simulation ─────────────────────────────────────────────────────
export interface CommitteeQuestion { q: string; reasonKey: string }

export function committeeQuestions(p: Project, lang: Lang): CommitteeQuestion[] {
  const t = getDict(lang);
  const snap = computeSnapshot(p);
  const qs: CommitteeQuestion[] = [];
  const marginRate = snap.base.rev > 0 ? (snap.base.rev - snap.base.varCost) / snap.base.rev : 0;

  if (snap.base.rev <= 0) {
    qs.push({ q: t.q1, reasonKey: 'rNoRev' });
  } else {
    qs.push({ q: t.q1, reasonKey: '' });
  }
  if (snap.minCash < 0) qs.push({ q: t.q3, reasonKey: 'rCash' });
  if (snap.loanShare > 0.6) qs.push({ q: t.q4, reasonKey: 'rLoan' });
  if (marginRate > 0 && marginRate < 0.25) qs.push({ q: t.aMargin.replace(/^./, c => c.toUpperCase()), reasonKey: 'rMargin' });
  if (snap.be.breakEvenMonths > 12) qs.push({ q: `${t.aBe} (${snap.be.breakEvenMonths.toFixed(1)} ${t.monthUnit})`, reasonKey: 'rBe' });
  if (snap.fixed > snap.base.rev * 0.5 && snap.base.rev > 0) qs.push({ q: `${t.aFixed} (${Math.round((snap.fixed / snap.base.rev) * 100)}%)`, reasonKey: 'rFixed' });
  if (p.market.competitors.length === 0) qs.push({ q: t.qComp, reasonKey: 'cCompetitors' });
  if (p.market.personas.length === 0) qs.push({ q: t.qPersona, reasonKey: 'cPersona' });
  if (!p.market.swot.threats.length) qs.push({ q: t.qSwot, reasonKey: 'cSwot' });
  if (snap.financingGap > 0) qs.push({ q: `${t.aGap} (${Math.round(snap.financingGap).toLocaleString('fr-DZ')} ${lang === 'fr' ? 'DA' : lang === 'en' ? 'DZD' : 'دج'})`, reasonKey: 'rGap' });
  if (!qs.some(q => q.q === t.q2)) qs.push({ q: t.q2, reasonKey: '' });
  return qs.slice(0, 8);
}

// ── Persona ↔ sales assumption consistency ───────────────────────────────────
export function personaCheck(p: Project): { state: 'ok' | 'high' | 'none'; sold: number; buyers: number; avg: number } {
  const sold = p.products.reduce((s, pr) => s + (pr.model === 'fixed' ? pr.qty : pr.model === 'commission' ? pr.deals : pr.subs), 0);
  const buyers = p.market.personas.reduce((s, pe) => s + (pe.monthlyBuyers || 0), 0);
  if (!p.market.personas.length || buyers <= 0) return { state: 'none', sold, buyers, avg: 0 };
  const avg = sold / buyers;
  return { state: avg <= 30 ? 'ok' : 'high', sold, buyers, avg };
}
