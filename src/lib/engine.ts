// ─── Financial calculation engine — ported 1:1 from original BMC-TOOL ────────
// Pure functions over Project state. Same formulas & thresholds as the source.
import { Project, Asset, Product, LegalForm, FiscalActivity } from './types';

export const IFU_THRESHOLD = 30000000;

// ── Fixed costs ───────────────────────────────────────────────────────────────
export function fixedMonthly(p: Project): number {
  const f = p.fixed;
  return f.rent + f.utilities + f.internet + f.salaries + f.marketing + f.maintenance + f.adminCosts + f.otherCosts;
}
export function externalServicesMonthly(p: Project): number {
  const f = p.fixed;
  return f.rent + f.utilities + f.internet + f.marketing + f.maintenance + f.adminCosts + f.otherCosts;
}

// ── Assets / investment ───────────────────────────────────────────────────────
export interface AssetRow {
  name: string; account: string; value: number; years: number; dep: number;
}
export function assetTotals(p: Project): { invest: number; dep: number; rows: AssetRow[] } {
  let invest = 0, dep = 0;
  const rows: AssetRow[] = [];
  p.assets.forEach((a: Asset) => {
    const value = Number(a.value) || 0;
    const years = Number(a.years) || 0;
    invest += value;
    if (years > 0) dep += value / years;
    rows.push({ name: a.name || '-', account: a.account || defaultAccount(a.name), value, years, dep: years > 0 ? value / years : 0 });
  });
  return { invest, dep, rows };
}
export function defaultYears(n: string): number {
  if (n.includes('رأس المال العامل')) return 1;
  if (n.includes('تأسيس') || n.includes('إنشاء')) return 1;
  if (n.includes('برمجيات') || n.includes('منصة') || n.includes('تطبيق') || n.includes('موقع')) return 3;
  if (n.includes('إعلام آلي') || n.includes('حاسوب') || n.includes('مكتبي') || n.includes('اتصالات') || n.includes('سمعي') || n.includes('تصوير')) return 5;
  if (n.includes('آلات') || n.includes('معدات') || n.includes('أدوات') || n.includes('تهيئة')) return 10;
  return 5;
}
export function defaultAccount(n: string): string {
  if (n.includes('برمجيات') || n.includes('منصة') || n.includes('تطبيق') || n.includes('موقع')) return 'حـ/204 - برمجيات';
  if (n.includes('تأسيس') || n.includes('إنشاء')) return 'حـ/201 - مصاريف التأسيس';
  if (n.includes('آلات') || n.includes('معدات') || n.includes('أدوات')) return 'حـ/215 - معدات وأدوات';
  if (n.includes('إعلام آلي') || n.includes('حاسوب') || n.includes('مكتبي') || n.includes('اتصالات') || n.includes('سمعي') || n.includes('تصوير')) return 'حـ/218 - تثبيتات عينية أخرى';
  if (n.includes('رأس المال العامل')) return 'BFR - رأس مال عامل';
  return 'حـ/218 - تثبيتات أخرى';
}
export const ASSET_OPTIONS = [
  'تكاليف التأسيس والإنشاء', 'برمجيات وتراخيص', 'تطوير منصة / تطبيق', 'أجهزة حاسوب للتطوير',
  'آلات ومعدات الإنتاج', 'معدات وأدوات صناعية', 'تهيئة المحل', 'الأصول البيولوجية',
  'العتاد المتنقل', 'العتاد المكتبي', 'عتاد الإعلام الآلي', 'عتاد السمعي البصري',
  'عتاد الاتصالات', 'تركيب التجهيزات', 'رأس المال العامل', 'موقع إلكتروني / منصة', 'معدات تصوير وإنتاج محتوى',
];
export function suggestAssetsByProjectType(types: string[]): string[] {
  const a: string[] = [];
  if (types.includes('industrial')) a.push('آلات ومعدات الإنتاج', 'معدات وأدوات صناعية', 'تركيب التجهيزات', 'رأس المال العامل');
  if (types.includes('commercial')) a.push('تهيئة المحل', 'العتاد المكتبي', 'عتاد الإعلام الآلي', 'رأس المال العامل');
  if (types.includes('service')) a.push('العتاد المكتبي', 'عتاد الإعلام الآلي', 'برمجيات وتراخيص', 'تكاليف التأسيس والإنشاء');
  if (types.includes('digital')) a.push('أجهزة حاسوب للتطوير', 'برمجيات وتراخيص', 'تطوير منصة / تطبيق', 'موقع إلكتروني / منصة', 'تكاليف التأسيس والإنشاء', 'رأس المال العامل');
  return [...new Set(a)];
}

// ── Products / revenue ────────────────────────────────────────────────────────
export interface MonthlyTotals { rev: number; varCost: number; unitMargins: number[] }
export function getProductMonthlyTotals(p: Project, monthIndex = 1, scenarioAnnualGrowth = 0): MonthlyTotals {
  let rev = 0, varCost = 0;
  const unitMargins: number[] = [];
  const yearElapsed = Math.floor((monthIndex - 1) / 12);
  p.products.forEach((prod: Product) => {
    if (prod.model === 'fixed') {
      const price = +prod.price || 0, variable = +prod.variable || 0, baseQty = +prod.qty || 0;
      const productGrowth = (+prod.growth || 0) / 100;
      const g = productGrowth || scenarioAnnualGrowth;
      const qty = baseQty * Math.pow(1 + g, yearElapsed);
      rev += price * qty;
      varCost += variable * qty;
      if (price > variable) unitMargins.push(price - variable);
    } else if (prod.model === 'commission') {
      const deal = +prod.deal || 0, com = (+prod.commission || 0) / 100, baseDeals = +prod.deals || 0, cost = +prod.dealCost || 0;
      const deals = baseDeals * Math.pow(1 + scenarioAnnualGrowth, yearElapsed);
      rev += deal * com * deals;
      varCost += cost * deals;
    } else {
      const sub = +prod.sub || 0, baseSubs = +prod.subs || 0, g = (+prod.subGrowth || 0) / 100, cost = +prod.subCost || 0;
      const subs = g > 0 ? baseSubs * Math.pow(1 + g, monthIndex - 1) : baseSubs * Math.pow(1 + scenarioAnnualGrowth, yearElapsed);
      rev += sub * subs;
      varCost += cost * subs;
    }
  });
  return { rev, varCost, unitMargins };
}
export function getProductYearTotals(p: Project, year = 1, g = 0): { rev: number; varCost: number } {
  let rev = 0, varCost = 0;
  for (let m = (year - 1) * 12 + 1; m <= year * 12; m++) {
    const t = getProductMonthlyTotals(p, m, g);
    rev += t.rev; varCost += t.varCost;
  }
  return { rev, varCost };
}

// ── Funding ───────────────────────────────────────────────────────────────────
export function totalFunding(p: Project): number {
  return p.funding.selfFunding + p.funding.grantAmount + p.funding.otherFunding + (p.funding.hasLoan === 'yes' ? p.funding.loanAmount : 0);
}
export function buildOperationalCashRows(p: Project): CashRow[] {
  const rows: CashRow[] = [];
  let cumulative = 0;
  const first = Math.max(1, Math.min(12, p.funding.firstSalesMonth));
  const mg = p.funding.monthlyGrowth / 100;
  const loanM = getLoanMonthlyPayment(p);
  const fixed = fixedMonthly(p);
  for (let m = 1; m <= 12; m++) {
    const active = m >= first;
    const base = active ? getProductMonthlyTotals(p, m - first + 1, p.market.growthReal / 100) : { rev: 0, varCost: 0 };
    const factor = active ? Math.pow(1 + mg, m - first) : 1;
    const rev = active ? base.rev * factor : 0;
    const varCost = active ? base.varCost * factor : 0;
    const out = varCost + fixed + loanM;
    const net = rev - out;
    cumulative += net;
    rows.push({ m, rev, varCost, fixed, loanM, out, net, cumulative });
  }
  return rows;
}
export interface CashRow { m: number; rev: number; varCost: number; fixed: number; loanM: number; out: number; net: number; cumulative: number }
export function getStartupBudget(p: Project): { assets: number; preStart: number; workingCapital: number; total: number } {
  const assets = assetTotals(p).invest;
  const preStart = p.funding.preStartCosts;
  const opRows = buildOperationalCashRows(p);
  const minOp = Math.min(...opRows.map(r => r.cumulative), 0);
  const workingCapital = Math.abs(Math.min(minOp, 0));
  return { assets, preStart, workingCapital, total: assets + preStart + workingCapital };
}
export function computeAutoFundingRatios(p: Project): { self: number; loan: number; grant: number } {
  const budget = getStartupBudget(p).total;
  const types = p.type.types;
  let self = 20, loan = 50, grant = 30;
  if (types.includes('digital')) { self = 25; loan = 35; grant = 40; }
  else if (types.includes('industrial')) { self = 20; loan = 60; grant = 20; }
  else if (types.includes('commercial')) { self = 30; loan = 45; grant = 25; }
  else if (types.includes('service')) { self = 35; loan = 35; grant = 30; }
  else if (budget <= 1000000) { self = 40; loan = 30; grant = 30; }
  else if (budget > 5000000) { self = 20; loan = 60; grant = 20; }
  return { self, loan, grant };
}
export function getSmartFunding(p: Project): { budget: number; self: number; loan: number; grant: number; other: number; totalPercent: number } {
  const budget = getStartupBudget(p).total;
  const f = p.funding;
  return {
    budget,
    self: budget * f.selfPercent / 100,
    loan: budget * f.loanPercent / 100,
    grant: budget * f.grantPercent / 100,
    other: 0,
    totalPercent: f.selfPercent + f.loanPercent + f.grantPercent,
  };
}
export function autoLoanSettings(p: Project): { rate: number; years: number } {
  const budget = getStartupBudget(p).total;
  let years = 3;
  if (budget > 2000000) years = 5;
  if (budget > 5000000) years = 7;
  return { rate: 5, years };
}

// ── Loan ──────────────────────────────────────────────────────────────────────
export function getLoanAnnualPayment(p: Project): number {
  if (p.funding.hasLoan !== 'yes') return 0;
  const amount = p.funding.loanAmount, rate = p.funding.interestRate / 100, years = Math.max(p.funding.loanYears, 1);
  return rate > 0 ? amount * (rate / (1 - Math.pow(1 + rate, -years))) : amount / years;
}
export function getLoanMonthlyPayment(p: Project): number { return getLoanAnnualPayment(p) / 12; }
export function loanSchedule(p: Project): { rows: { y: number; annual: number; interest: number; principal: number; balance: number }[] } {
  if (p.funding.hasLoan !== 'yes') return { rows: [] };
  const amount = p.funding.loanAmount, rate = p.funding.interestRate / 100, years = Math.max(p.funding.loanYears, 1);
  const annual = getLoanAnnualPayment(p);
  let balance = amount;
  const rows: { y: number; annual: number; interest: number; principal: number; balance: number }[] = [];
  for (let y = 1; y <= years; y++) {
    const interest = balance * rate;
    const principal = annual - interest;
    balance = Math.max(0, balance - principal);
    rows.push({ y, annual, interest, principal, balance });
  }
  return { rows };
}

// ── Tax engine (1:1) ──────────────────────────────────────────────────────────
export type TaxRegimeKey = 'exemptManual' | 'exemptStartup' | 'exemptPatent' | 'ifu' | 'ibsReal';
export interface TaxInfo { rate: number; regime: TaxRegimeKey; reasonKey: string; year?: number }
export function getTaxInfo(p: Project, annualRevenue: number, year: number): TaxInfo {
  const legal: LegalForm = p.info.legal;
  const activity: FiscalActivity = p.type.fiscalActivity;
  const hasLabel = p.funding.hasStartupLabel === 'yes';
  const manualExempt = Math.max(0, p.funding.exemptionYears);
  if (manualExempt > 0 && year <= manualExempt) return { rate: 0, regime: 'exemptManual', reasonKey: 'manualExempt', year };
  if (legal === 'startup' && hasLabel && year <= 5) return { rate: 0, regime: 'exemptStartup', reasonKey: 'startupLabel' };
  if (legal === 'patent' && hasLabel && year <= 5) return { rate: 0, regime: 'exemptPatent', reasonKey: 'patentLabel' };
  if (annualRevenue <= IFU_THRESHOLD) {
    let rate = 0.10, reasonKey = 'ifuMixed';
    if (activity === 'commercial') { rate = 0.05; reasonKey = 'ifuCommercial'; }
    else if (activity === 'services') { rate = 0.12; reasonKey = 'ifuServices'; }
    else if (activity === 'production') { rate = 0.05; reasonKey = 'ifuProduction'; }
    return { rate, regime: 'ifu', reasonKey };
  }
  if (activity === 'production') return { rate: 0.19, regime: 'ibsReal', reasonKey: 'ibsProduction' };
  if (activity === 'mixed') return { rate: 0.23, regime: 'ibsReal', reasonKey: 'ibsMixed' };
  return { rate: 0.26, regime: 'ibsReal', reasonKey: 'ibsServices' };
}
export interface TaxResult extends TaxInfo { amount: number }
export function calculateTax(p: Project, annualRevenue: number, resultBeforeTax: number, year: number): TaxResult {
  const info = getTaxInfo(p, annualRevenue, year);
  const base = info.regime === 'ifu' ? annualRevenue : Math.max(0, resultBeforeTax);
  return { ...info, amount: Math.max(0, base * info.rate) };
}

// ── Cash flow / SCF ───────────────────────────────────────────────────────────
export function estimateFirstSalesMonth(p: Project): number {
  const types = p.type.types;
  if (types.includes('industrial')) return 3;
  if (types.includes('commercial')) return 2;
  if (types.includes('digital')) return 2;
  if (types.includes('service')) return 1;
  return 2;
}
export function buildCashflowRows(p: Project): CashRow[] {
  const assets = assetTotals(p);
  const rows: CashRow[] = [];
  let cumulative = totalFunding(p) - assets.invest - p.funding.preStartCosts;
  buildOperationalCashRows(p).forEach(r => {
    cumulative += r.net;
    rows.push({ ...r, cumulative });
  });
  return rows;
}
export interface ScfYear {
  rev: number; cogs: number; ext: number; va: number; sal: number; ebe: number;
  depr: number; opResult: number; tax: TaxResult; net: number;
}
export function buildScfYear(p: Project, y: number, growth: number): ScfYear {
  const t = getProductYearTotals(p, y, growth);
  const fixedGrowth = p.fixed.fixedGrowth / 100;
  const ext = externalServicesMonthly(p) * 12 * Math.pow(1 + fixedGrowth, y - 1);
  const sal = p.fixed.salaries * 12 * Math.pow(1 + fixedGrowth, y - 1);
  const depr = assetTotals(p).dep;
  const va = t.rev - t.varCost - ext;
  const ebe = va - sal;
  const opResult = ebe - depr;
  const tax = calculateTax(p, t.rev, opResult, y);
  const net = opResult - tax.amount;
  return { rev: t.rev, cogs: t.varCost, ext, va, sal, ebe, depr, opResult, tax, net };
}

// ── Break-even ────────────────────────────────────────────────────────────────
export interface BreakEvenData {
  marginValue: number; marginRate: number; breakEvenRevenue: number;
  breakEvenMonths: number; avgUnit: number; breakEvenUnits: number;
}
export function breakEven(p: Project, base: MonthlyTotals, fixed: number): BreakEvenData {
  const marginValue = base.rev - base.varCost;
  const marginRate = base.rev > 0 ? marginValue / base.rev : 0;
  const breakEvenRevenue = marginRate > 0 ? fixed / marginRate : 0;
  const breakEvenMonths = base.rev > 0 ? breakEvenRevenue / base.rev : 0;
  const avgUnit = base.unitMargins.length ? base.unitMargins.reduce((a, b) => a + b, 0) / base.unitMargins.length : 0;
  const breakEvenUnits = avgUnit > 0 ? fixed / avgUnit : 0;
  return { marginValue, marginRate, breakEvenRevenue, breakEvenMonths, avgUnit, breakEvenUnits };
}

// ── Scoring (1:1) ─────────────────────────────────────────────────────────────
export function scoreCalc(base: MonthlyTotals, netMonthly: number, breakEvenMonths: number, fixed: number, cashRows: CashRow[], yearNet: number): number {
  let score = 0;
  const revenue = Number(base?.rev || 0);
  const variable = Number(base?.varCost || 0);
  const marginRate = revenue > 0 ? (revenue - variable) / revenue : 0;
  const minCash = Array.isArray(cashRows) && cashRows.length ? Math.min(...cashRows.map(r => Number(r.cumulative || 0))) : 0;

  if (revenue > 0) score += 1.5;
  if (netMonthly > 0) score += 2;
  else if (netMonthly === 0 && revenue > 0) score += 0.5;

  if (marginRate >= 0.5) score += 2;
  else if (marginRate >= 0.3) score += 1.4;
  else if (marginRate >= 0.15) score += 0.8;

  if (breakEvenMonths > 0 && breakEvenMonths <= 6) score += 1.5;
  else if (breakEvenMonths > 0 && breakEvenMonths <= 12) score += 1;
  else if (breakEvenMonths > 0 && breakEvenMonths <= 18) score += 0.5;

  if (revenue > 0) {
    const fixedRatio = fixed / revenue;
    if (fixedRatio <= 0.30) score += 1;
    else if (fixedRatio <= 0.50) score += 0.6;
    else if (fixedRatio <= 0.80) score += 0.3;
  }

  if (minCash >= 0) score += 1;
  else if (revenue > 0 && Math.abs(minCash) <= revenue * 2) score += 0.5;

  if (yearNet > 0) score += 1;
  else if (yearNet === 0 && revenue > 0) score += 0.3;

  return Math.max(0, Math.min(10, score));
}

// ── Tax exemption advisor (1:1, de-branded) ───────────────────────────────────
export interface ExemptionAdvice { years: number; titleKey: string; reasonKey: string; ibsKey: string }
export function getSuggestedExemptionInfo(p: Project): ExemptionAdvice {
  const legal = p.info.legal;
  const hasLabel = p.funding.hasStartupLabel === 'yes';
  const activity = p.type.fiscalActivity;
  let years = 0, titleKey = 'noAuto', reasonKey = 'noAutoReason';
  if (legal === 'startup' && hasLabel) { years = 4; titleKey = 'exStartup'; reasonKey = 'exStartupReason'; }
  else if (legal === 'micro') { years = 5; titleKey = 'exMicro'; reasonKey = 'exMicroReason'; }
  else if (legal === 'patent') { years = 5; titleKey = 'exPatent'; reasonKey = 'exPatentReason'; }
  else { years = 10; titleKey = 'exAapi'; reasonKey = 'exAapiReason'; }
  let ibsKey = 'ibs26';
  if (activity === 'production') ibsKey = 'ibs19';
  else if (activity === 'mixed') ibsKey = 'ibs23';
  return { years, titleKey, reasonKey, ibsKey };
}

// ── Full derived snapshot used by wizard step 8 / report / coach ───────────────
export interface EngineSnapshot {
  base: MonthlyTotals;
  fixed: number;
  assets: { invest: number; dep: number; rows: AssetRow[] };
  depMonthly: number;
  operatingMonthly: number;
  taxY1: TaxResult;
  netMonthly: number;
  be: BreakEvenData;
  opRows: CashRow[];
  cashRows: CashRow[];
  year1: ScfYear;
  score: number;
  budget: { assets: number; preStart: number; workingCapital: number; total: number };
  financingGap: number;
  minCash: number;
  loanShare: number;
}
export function computeSnapshot(p: Project): EngineSnapshot {
  const base = getProductMonthlyTotals(p, 1, p.market.growthReal / 100);
  const fixed = fixedMonthly(p);
  const assets = assetTotals(p);
  const depM = assets.dep / 12;
  const operatingMonthly = base.rev - base.varCost - fixed - depM;
  const taxY1 = calculateTax(p, base.rev * 12, operatingMonthly * 12, 1);
  const netMonthly = operatingMonthly - taxY1.amount / 12;
  const be = breakEven(p, base, fixed);
  const opRows = buildOperationalCashRows(p);
  const cashRows = buildCashflowRows(p);
  const year1 = buildScfYear(p, 1, p.market.growthReal / 100);
  const score = scoreCalc(base, netMonthly, be.breakEvenMonths, fixed, cashRows, year1.net);
  const budget = getStartupBudget(p);
  // financing structure (1:1 from renderFinancingStructure)
  const minOp = Math.min(...opRows.map(r => r.cumulative), 0);
  const neededWorkingCapital = Math.abs(minOp);
  const investmentNeed = assets.invest + neededWorkingCapital;
  const self = p.funding.selfFunding, grant = p.funding.grantAmount;
  const loan = p.funding.hasLoan === 'yes' ? p.funding.loanAmount : 0;
  const total = self + grant + loan;
  const financingGap = investmentNeed - total;
  const minCash = cashRows.length ? Math.min(...cashRows.map(r => r.cumulative)) : 0;
  const loanShare = budget.total > 0 ? p.funding.loanAmount / budget.total : 0;
  return {
    base, fixed, assets, depMonthly: depM, operatingMonthly, taxY1, netMonthly,
    be, opRows, cashRows, year1, score, budget, financingGap, minCash, loanShare,
  };
}
