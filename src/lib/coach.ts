// ─── Smart coach: decision + reasons + actions (ported from renderAICoach) ───
import { Project, Lang } from './types';
import { computeSnapshot, getStartupBudget, getSmartFunding, getSuggestedExemptionInfo } from './engine';
import { getDict, Dict, tpl } from './i18n';

export type CoachTone = 'ok' | 'warn' | 'bad';
export interface CoachResult {
  tone: CoachTone;
  statusText: string;
  decisionText: string;
  reasons: string[];
  actions: string[];
  fundingAdvice: string[];
  tax: { title: string; years: number; ibs: string; reason: string };
  committee: string[];
}

export function coach(p: Project, lang: Lang, money: (n: number) => string): CoachResult {
  const t: Dict = getDict(lang);
  const s = computeSnapshot(p);
  const { base, fixed, netMonthly, be, cashRows, score, financingGap, minCash, loanShare } = s;
  const marginRate = base.rev > 0 ? (base.rev - base.varCost) / base.rev : 0;
  const budget = getStartupBudget(p);
  const funding = getSmartFunding(p);
  const firstNeg = cashRows.find(r => r.cumulative < 0);
  const ex = getSuggestedExemptionInfo(p);

  let tone: CoachTone = 'warn';
  let statusText = t.coachNeedImprove;
  let decisionText = t.coachD1;
  if (base.rev <= 0) {
    tone = 'bad'; statusText = t.coachNotReady; decisionText = t.coachD2;
  } else if (score >= 7 && netMonthly > 0 && minCash >= 0 && financingGap <= 0) {
    tone = 'ok'; statusText = t.coachLaunchable; decisionText = t.coachD3;
  } else if (score < 4 || netMonthly < 0 || financingGap > 0) {
    tone = 'bad'; statusText = t.coachNotReadyFin; decisionText = t.coachD4;
  }

  const reasons: string[] = [];
  if (base.rev <= 0) reasons.push(t.rNoRev);
  if (netMonthly < 0) reasons.push(tpl(t.rNetNeg, { v: money(netMonthly) }));
  if (marginRate > 0 && marginRate < 0.25) reasons.push(tpl(t.rMargin, { v: (marginRate * 100).toFixed(1) }));
  if (base.rev > 0 && fixed > base.rev * 0.5) reasons.push(tpl(t.rFixed, { v: String(Math.round((fixed / base.rev) * 100)) }));
  if (be.breakEvenMonths > 10) reasons.push(tpl(t.rBe, { v: be.breakEvenMonths.toFixed(1) }));
  if (minCash < 0) {
    const from = firstNeg ? tpl(t.rFromMonth, { m: t.months[firstNeg.m - 1] }) : '';
    reasons.push(tpl(t.rCash, { v: money(minCash), m: from }));
  }
  if (financingGap > 0) reasons.push(tpl(t.rGap, { v: money(financingGap) }));
  if (loanShare > 0.6) reasons.push(tpl(t.rLoan, { v: String(Math.round(loanShare * 100)) }));
  if (!reasons.length) reasons.push(t.rNone);

  const actions: string[] = [];
  if (base.rev <= 0) actions.push(t.aNoRev);
  if (netMonthly < 0) {
    const gap = Math.abs(netMonthly);
    const neededRevenue = marginRate > 0 ? gap / marginRate : gap;
    actions.push(tpl(t.aNet, { rev: money(neededRevenue), cost: money(gap) }));
  }
  if (marginRate < 0.25 && base.rev > 0) actions.push(t.aMargin);
  if (fixed > base.rev * 0.5 && base.rev > 0) actions.push(t.aFixed);
  if (be.breakEvenMonths > 10) actions.push(t.aBe);
  if (minCash < 0) actions.push(tpl(t.aCash, { v: money(Math.abs(minCash)) }));
  if (financingGap > 0) actions.push(t.aGap);
  if (loanShare > 0.6) actions.push(t.aLoan);
  if (!actions.length) actions.push(t.aNone);

  const fundingAdvice: string[] = [];
  fundingAdvice.push(tpl(t.fBudget, { v: money(budget.total) }));
  fundingAdvice.push(tpl(t.fWc, { v: money(budget.workingCapital) }));
  if (funding.totalPercent > 100) fundingAdvice.push(t.fOver100);
  else if (funding.totalPercent < 100) fundingAdvice.push(tpl(t.fUnder100, { n: String(funding.totalPercent), s: String(p.funding.selfPercent), l: String(p.funding.loanPercent), g: String(p.funding.grantPercent) }));
  else fundingAdvice.push(tpl(t.fOk, { s: String(p.funding.selfPercent), l: String(p.funding.loanPercent), g: String(p.funding.grantPercent) }));
  if (p.funding.loanAmount > 0) fundingAdvice.push(tpl(t.fLoan, { v: money(p.funding.loanAmount), y: String(p.funding.loanYears), r: String(p.funding.interestRate) }));

  const taxLabel = ({ exNoAuto: t.exNoAuto, exStartup: t.exStartup, exMicro: t.exMicro, exPatent: t.exPatent, exAapi: t.exAapi } as Record<string, string>)[ex.titleKey] || '';
  const taxReason = ({ exNoAuto: t.exNoAutoReason, exStartup: t.exStartupReason, exMicro: t.exMicroReason, exPatent: t.exPatentReason, exAapi: t.exAapiReason } as Record<string, string>)[ex.reasonKey] || '';
  const ibs = ({ ibs19: t.ibs19, ibs23: t.ibs23, ibs26: t.ibs26 } as Record<string, string>)[ex.ibsKey] || '';

  const committee = [t.q1, t.q2, t.q3, t.q4];

  return {
    tone, statusText, decisionText, reasons: reasons.slice(0, 6), actions: actions.slice(0, 6),
    fundingAdvice,
    tax: { title: taxLabel, years: ex.years, ibs, reason: taxReason },
    committee,
  };
}
