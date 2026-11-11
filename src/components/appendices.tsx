'use client';
// ─── Financial appendices renderers (shared by wizard step 8 & report) ───────
import React from 'react';
import { Project, Lang } from '@/lib/types';
import { Dict, getDict } from '@/lib/i18n';
import { money as fmtMoney, num } from '@/lib/format';
import {
  computeSnapshot, getProductYearTotals, loanSchedule, buildScfYear, assetTotals,
} from '@/lib/engine';
import { BarChartSvg, LineChartSvg } from './bmc-ui';
import { getDoc, DOC_LABEL, DOC_TITLES, DocKey } from '@/lib/annex-docs';

export interface AppxProps { p: Project; lang: Lang }

const T = (lang: Lang): Dict => getDict(lang);
const M = (lang: Lang) => (n: number) => fmtMoney(n, lang);

function FinTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="tbl-wrap">
      <table className="fin-table">
        <thead><tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] text-muted-foreground mt-2 leading-relaxed">{children}</p>;
}

/** Reference definition + formulas card — static content, identical in every project. */
export function DocCard({ lang, k }: { lang: Lang; k: DocKey }) {
  const d = getDoc(lang, k);
  return (
    <div className="doc-card mb-3 rounded-xl border border-border/60 bg-[#F7FAFB] px-4 py-3 print:break-inside-avoid">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span aria-hidden className="text-[#C99A3C]">§</span>
        <span className="text-[13.5px] font-extrabold font-heading text-[#2E5E73]">{DOC_TITLES[k][lang]}</span>
        <span className="rounded-full border border-[#C9DAE5] bg-white px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-[#8FA0AD]">{DOC_LABEL[lang]}</span>
      </div>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#3A4A56]">{d.def}</p>
      {d.formulas.length > 0 && (
        <div className="mt-2.5 grid gap-1.5">
          {d.formulas.map((f, i) => (
            <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[12px] font-semibold text-[#4A5B68]">{f.label}:</span>
              <code dir="ltr" className="rounded-lg border border-border/60 bg-white px-2.5 py-1 text-[12px] tracking-tight text-[#22313A]">{f.expr}</code>
            </div>
          ))}
        </div>
      )}
      {d.note && <p className="mt-2 text-[11px] leading-relaxed text-[#7A8B98]">{d.note}</p>}
    </div>
  );
}

// ── Annexe 01: break-even ────────────────────────────────────────────────────
export function AppendixBreakEven({ p, lang }: AppxProps) {
  const t = T(lang), m = M(lang);
  const s = computeSnapshot(p);
  const be = s.be;
  const vals = [
    m(s.fixed), m(s.base.rev), m(be.marginValue), `${(be.marginRate * 100).toFixed(1)}%`,
    be.avgUnit > 0 ? m(be.avgUnit) : t.na,
    be.breakEvenUnits > 0 ? `${Math.ceil(be.breakEvenUnits).toLocaleString('fr-DZ')} ${t.unit}` : t.na,
    be.breakEvenRevenue > 0 ? m(be.breakEvenRevenue) : t.na,
    be.breakEvenMonths > 0 ? `${be.breakEvenMonths.toFixed(1)} ${t.monthUnit}` : t.na,
  ];
  return (
    <div>
      <DocCard lang={lang} k="breakEven" />
      <FinTable headers={t.beHeaders}>
        {t.beRows.map((r, i) => (
          <tr key={i} className={i === 5 || i === 6 ? 'subtotal-row' : i === 7 ? 'total-row' : ''}>
            <td>{r}</td><td>{vals[i]}</td><td className="text-muted-foreground">{t.beCalc[i]}</td>
          </tr>
        ))}
      </FinTable>
      <Note>{t.beNote}</Note>
    </div>
  );
}

// ── Annexe 02: scenarios ─────────────────────────────────────────────────────
export function AppendixScenario({ p, lang }: AppxProps) {
  const t = T(lang), m = M(lang);
  const sc: [string, number][] = [[t.scenarios[0], p.market.growthOpt / 100], [t.scenarios[1], p.market.growthReal / 100], [t.scenarios[2], p.market.growthPes / 100]];
  return (
    <div>
      <DocCard lang={lang} k="scenarios" />
      <FinTable headers={t.tableScenario}>
        {sc.map(([n, g], i) => (
          <tr key={i}>
            <td className="font-semibold">{n}</td>
            {Array.from({ length: 5 }, (_, y) => <td key={y}>{m(getProductYearTotals(p, y + 1, g).rev)}</td>)}
          </tr>
        ))}
      </FinTable>
    </div>
  );
}

// ── Annexe 03: detailed revenue (realistic) ──────────────────────────────────
export function AppendixDetailedRevenue({ p, lang }: AppxProps) {
  const t = T(lang), m = M(lang);
  return (
    <div>
      <DocCard lang={lang} k="detailedRevenue" />
      <FinTable headers={t.detailedHeaders}>
        {Array.from({ length: 5 }, (_, i) => {
          const y = i + 1;
          const tot = getProductYearTotals(p, y, p.market.growthReal / 100);
          const margin = tot.rev - tot.varCost;
          const rate = tot.rev > 0 ? (margin / tot.rev) * 100 : 0;
          return (
            <tr key={y}>
              <td className="font-semibold">{y}</td>
              <td>{m(tot.rev)}</td><td>{m(tot.varCost)}</td><td>{m(margin)}</td>
              <td className={rate < 20 ? 'negative' : 'positive'}>{rate.toFixed(1)}%</td>
            </tr>
          );
        })}
      </FinTable>
    </div>
  );
}

// ── Annexe 04: assets & depreciation ─────────────────────────────────────────
export function AppendixAssets({ p, lang }: AppxProps) {
  const t = T(lang), m = M(lang);
  const a = assetTotals(p);
  return (
    <div>
      <DocCard lang={lang} k="assets" />
      <FinTable headers={t.assetHeaders}>
        {a.rows.map((r, i) => (
          <tr key={i}>
            <td>{r.name}</td><td className="text-muted-foreground">{r.account}</td>
            <td>{m(r.value)}</td><td>{r.years}</td><td>{m(r.dep)}</td>
          </tr>
        ))}
        <tr className="total-row">
          <td colSpan={2}>{t.total}</td><td>{m(a.invest)}</td><td>{t.na}</td><td>{m(a.dep)}</td>
        </tr>
      </FinTable>
    </div>
  );
}

// ── Annexe 04-B: financing structure ─────────────────────────────────────────
export function AppendixFinancing({ p, lang }: AppxProps) {
  const t = T(lang), m = M(lang);
  const s = computeSnapshot(p);
  const wc = s.budget.workingCapital;
  const need = s.assets.invest + wc;
  const self = p.funding.selfFunding, grant = p.funding.grantAmount;
  const loan = p.funding.hasLoan === 'yes' ? p.funding.loanAmount : 0;
  const total = self + grant + loan;
  const gap = need - total;
  const pctOf = (x: number) => (total > 0 ? `${((x / total) * 100).toFixed(1)}%` : t.na);
  const rows: [string, number, string, string, string][] = [
    [t.finInvest, s.assets.invest, t.na, t.nInvest, ''],
    [t.finWc, wc, t.na, t.nWc, ''],
    [t.finNeed, need, '100%', t.nNeed, 'subtotal-row'],
    [t.finSelf, self, pctOf(self), t.nAuto, ''],
    [t.finGrant, grant, pctOf(grant), t.nAuto, ''],
    [t.finLoan, loan, pctOf(loan), t.nChoice, ''],
    [gap > 0 ? t.finGap : t.finOk, Math.abs(gap), t.na, gap > 0 ? t.nGapYes : t.nGapNo, gap > 0 ? 'total-row' : 'subtotal-row'],
  ];
  return (
    <div>
      <DocCard lang={lang} k="financing" />
      <FinTable headers={t.financingHeaders}>
        {rows.map((r, i) => (
          <tr key={i} className={r[4]}>
            <td>{r[0]}</td><td>{m(r[1])}</td><td>{r[2]}</td><td className="text-muted-foreground">{r[3]}</td>
          </tr>
        ))}
      </FinTable>
    </div>
  );
}

// ── Annexe 05: loan schedule ─────────────────────────────────────────────────
export function AppendixLoan({ p, lang }: AppxProps) {
  const t = T(lang), m = M(lang);
  const l = loanSchedule(p);
  if (!l.rows.length) return <p className="text-[13px] text-muted-foreground">{t.noLoan}</p>;
  return (
    <div>
      <DocCard lang={lang} k="loan" />
      <FinTable headers={t.loanHeaders}>
        {l.rows.map(r => (
          <tr key={r.y}>
            <td className="font-semibold">{r.y}</td>
            <td>{m(r.annual)}</td><td>{m(r.interest)}</td><td>{m(r.principal)}</td>
            <td className={r.balance > 0 ? '' : 'positive'}>{m(r.balance)}</td>
          </tr>
        ))}
      </FinTable>
    </div>
  );
}

// ── Annexe 06: monthly treasury ──────────────────────────────────────────────
export function AppendixCashflow({ p, lang }: AppxProps) {
  const t = T(lang), m = M(lang);
  const s = computeSnapshot(p);
  return (
    <div>
      <DocCard lang={lang} k="cashflow" />
      <FinTable headers={t.cashHeaders}>
        {s.cashRows.map(r => (
          <tr key={r.m}>
            <td className="font-semibold">{t.months[r.m - 1]}</td>
            <td>{m(r.rev)}</td><td>{m(r.varCost)}</td><td>{m(r.fixed)}</td><td>{m(r.loanM)}</td>
            <td>{m(r.out)}</td>
            <td className={r.net >= 0 ? 'positive' : 'negative'}>{m(r.net)}</td>
            <td className={r.cumulative >= 0 ? 'positive' : 'negative'}>{m(r.cumulative)}</td>
          </tr>
        ))}
      </FinTable>
      <Note>{t.cashNote}</Note>
      <div className="mt-4">
        <div className="text-[13px] font-semibold text-primary mb-1">{t.chartTreasury}</div>
        <LineChartSvg values={s.cashRows.map(r => r.cumulative)} labels={t.months.map(x => x.slice(0, 4))} format={(v) => `${Math.round(v / 1000)}k ${lang === 'fr' ? 'DA' : lang === 'en' ? 'DZD' : 'دج'}`} />
      </div>
    </div>
  );
}

// ── Annexe 06-B: cash gap ────────────────────────────────────────────────────
export function AppendixCashGap({ p, lang }: AppxProps) {
  const t = T(lang), m = M(lang);
  const s = computeSnapshot(p);
  const rows = s.cashRows;
  const negatives = rows.filter(r => r.cumulative < 0);
  const minRow = rows.reduce((a, b) => (b.cumulative < a.cumulative ? b : a), rows[0] || { m: 0, cumulative: 0 });
  const needed = Math.max(0, Math.abs(Math.min(...rows.map(r => r.cumulative), 0)));
  const vals = [
    String(negatives.length),
    negatives[0] ? t.months[negatives[0].m - 1] : t.na,
    negatives[negatives.length - 1] ? t.months[negatives[negatives.length - 1].m - 1] : t.na,
    m(minRow.cumulative),
    m(needed),
  ];
  const reads = [
    negatives.length ? t.cashGapRead[0] : t.cashGapNone,
    t.cashGapRead[1], t.cashGapRead[2], t.cashGapRead[3], t.cashGapRead[4],
  ];
  return (
    <div>
      <DocCard lang={lang} k="cashGap" />
      <FinTable headers={t.cashGapHeaders}>
        {t.cashGapRows.map((r, i) => (
          <tr key={i} className={i === 3 ? 'subtotal-row' : i === 4 ? 'total-row' : ''}>
            <td>{r}</td><td>{vals[i]}</td><td className="text-muted-foreground">{reads[i]}</td>
          </tr>
        ))}
      </FinTable>
      <Note>{t.cashGapNote}</Note>
    </div>
  );
}

// ── Annexe 07: tax simulator ─────────────────────────────────────────────────
export function AppendixTax({ p, lang }: AppxProps) {
  const t = T(lang), m = M(lang);
  const regimeLabel = (key: string) => ({
    exemptManual: t.trExemptManual, exemptStartup: t.trExemptStartup,
    exemptPatent: t.trExemptPatent, ifu: t.trIfu, ibsReal: t.trIbs,
  }[key as never] || key);
  return (
    <div>
      <DocCard lang={lang} k="tax" />
      <FinTable headers={t.taxHeaders}>
        {Array.from({ length: 5 }, (_, i) => {
          const y = i + 1;
          const s = buildScfYear(p, y, p.market.growthReal / 100);
          return (
            <tr key={y}>
              <td className="font-semibold">{y}</td>
              <td>{m(s.rev)}</td>
              <td>{regimeLabel(s.tax.regime)}</td>
              <td>{(s.tax.rate * 100).toFixed(0)}%</td>
              <td className="text-muted-foreground">{(t as unknown as Record<string, string>)[`reason${s.tax.reasonKey.charAt(0).toUpperCase()}${s.tax.reasonKey.slice(1)}`] || s.tax.reasonKey}</td>
              <td>{m(s.opResult)}</td>
              <td>{s.tax.amount === 0 && s.tax.rate === 0 ? <span className="positive">{t.exempted}</span> : m(s.tax.amount)}</td>
              <td className={s.net >= 0 ? 'positive' : 'negative'}>{m(s.net)}</td>
            </tr>
          );
        })}
      </FinTable>
      <Note>{t.taxNote}</Note>
    </div>
  );
}

// ── Annexe 08: SCF income statement ──────────────────────────────────────────
export function AppendixSCF({ p, lang }: AppxProps) {
  const t = T(lang), m = M(lang);
  const rows = Array.from({ length: 5 }, (_, i) => buildScfYear(p, i + 1, p.market.growthReal / 100));
  const regimeLabel = (key: string) => ({
    exemptManual: t.trExemptManual, exemptStartup: t.trExemptStartup,
    exemptPatent: t.trExemptPatent, ifu: t.trIfu, ibsReal: t.trIbs,
  }[key as never] || key);
  const row = (label: string, account: string, vals: (React.ReactNode)[] | number[], cls = '', fmt?: (v: number) => React.ReactNode) => (
    <tr className={cls}>
      <td>{label} <span className="text-muted-foreground text-[11px]">{account}</span></td>
      {vals.map((v, i) => <td key={i}>{typeof v === 'number' ? (fmt ? fmt(v) : <span className={v < 0 ? 'negative' : ''}>{m(v)}</span>) : v}</td>)}
    </tr>
  );
  return (
    <div>
      <DocCard lang={lang} k="scf" />
      <FinTable headers={t.scfHeaders}>
        <tr className="subtotal-row"><td colSpan={6} className="font-bold">{t.scfSections[0]}</td></tr>
        {row(t.scfLabels[0], '70', rows.map(r => r.rev))}
        {row(t.scfLabels[1], '60', rows.map(r => -r.cogs))}
        {row(t.scfLabels[2], '61/62', rows.map(r => -r.ext))}
        {row(t.scfLabels[3], 'VA = 70 − (60+61+62)', rows.map(r => r.va), 'subtotal-row')}
        <tr className="subtotal-row"><td colSpan={6} className="font-bold">{t.scfSections[1]}</td></tr>
        {row(t.scfLabels[4], '63/64', rows.map(r => -r.sal))}
        {row(t.scfLabels[5], 'EBE = VA − (63+64)', rows.map(r => r.ebe), 'subtotal-row')}
        <tr className="subtotal-row"><td colSpan={6} className="font-bold">{t.scfSections[2]}</td></tr>
        {row(t.scfLabels[6], '68', rows.map(r => -r.depr))}
        {row(t.scfLabels[7], 'RE = EBE − 68', rows.map(r => r.opResult), 'subtotal-row')}
        <tr>
          <td>{t.scfLabels[8]} <span className="text-muted-foreground text-[11px]">69</span></td>
          {rows.map((r, i) => (
            <td key={i}>
              {r.tax.rate === 0 && <span className="positive">{t.exempted}<br /></span>}
              {m(r.tax.amount)}
              <br /><small className="text-muted-foreground">{regimeLabel(r.tax.regime)} {(r.tax.rate * 100).toFixed(0)}%</small>
            </td>
          ))}
        </tr>
        {row(t.scfLabels[9], 'RN = RE − 69', rows.map(r => r.net), 'total-row')}
      </FinTable>
    </div>
  );
}

// ── Annexe 09: BMC visual ────────────────────────────────────────────────────
export function AppendixBMC({ p, lang }: AppxProps) {
  const t = T(lang), m = M(lang);
  const s = computeSnapshot(p);
  const depM = s.assets.dep / 12;
  const totalMonthly = s.base.varCost + s.fixed + depM;
  const def = (v: string, d: string) => (v && v.trim() ? v : d);
  const products = p.products.filter(x => x.name).map(x => `• ${x.name}`).join('\n') || `• ${t.bmcProducts}`;
  const cells: [string, string, string][] = [
    ['bmc-partners', t.bmcBlocks[0], def(p.market.partners, t.bmcDefPartners)],
    ['bmc-activities', t.bmcBlocks[1], def(p.market.activities, t.bmcDefActivities)],
    ['bmc-resources', t.bmcBlocks[2],
      `• ${lang === 'fr' ? 'Investissements' : lang === 'en' ? 'Investments' : 'تجهيزات واستثمارات'}: ${m(s.assets.invest)}\n• ${lang === 'fr' ? 'RH et techniques' : lang === 'en' ? 'Human & technical resources' : 'موارد بشرية وتقنية'}\n• ${lang === 'fr' ? 'Savoir-faire' : lang === 'en' ? 'Know-how' : 'معرفة وخبرة الفريق'}`],
    ['bmc-value', t.bmcBlocks[3], def(p.market.valueProp, t.bmcDefValue.replace('{p}', p.products.filter(x => x.name).map(x => x.name).join(', ') || t.bmcProducts))],
    ['bmc-relations', t.bmcRel, t.bmcDefRel],
    ['bmc-channels', t.bmcBlocks[5], def(p.market.channels, t.bmcDefChannels)],
    ['bmc-customers', t.bmcBlocks[6], def(p.market.customers, t.bmcDefCustomers)],
    ['bmc-costs', t.bmcBlocks[7],
      `${lang === 'fr' ? 'Charges fixes' : lang === 'en' ? 'Fixed costs' : 'تكاليف ثابتة'}: ${m(s.fixed)}\n${lang === 'fr' ? 'Coûts variables' : lang === 'en' ? 'Variable costs' : 'تكاليف متغيرة'}: ${m(s.base.varCost)}\n${lang === 'fr' ? 'Amortissement' : lang === 'en' ? 'Depreciation' : 'اهتلاك'}: ${m(depM)}\n${lang === 'fr' ? 'Total mensuel' : lang === 'en' ? 'Monthly total' : 'الإجمالي الشهري'}: ${m(totalMonthly)}\n${lang === 'fr' ? 'Total annuel' : lang === 'en' ? 'Annual total' : 'الإجمالي السنوي'}: ${m(totalMonthly * 12)}`],
    ['bmc-revenue', t.bmcBlocks[8],
      `${products}\n${lang === 'fr' ? 'CA mensuel' : lang === 'en' ? 'Monthly revenue' : 'رقم الأعمال الشهري'}: ${m(s.base.rev)}\n${lang === 'fr' ? 'CA annuel' : lang === 'en' ? 'Annual revenue' : 'رقم الأعمال السنوي'}: ${m(s.base.rev * 12)}`],
  ];
  return (
    <div>
      <DocCard lang={lang} k="bmc" />
      <div className="bmc-grid">
        {cells.map(([cls, title, body], i) => (
          <div key={i} className={`bmc-cell ${cls}`}>
            <strong>{title}</strong>
            <div className="whitespace-pre-line leading-relaxed">{body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Annexe 10: BMC finance link ──────────────────────────────────────────────
export function AppendixBMCFinance({ p, lang }: AppxProps) {
  const t = T(lang), m = M(lang);
  const s = computeSnapshot(p);
  const depM = s.assets.dep / 12;
  const totalMonthly = s.base.varCost + s.fixed + depM;
  const rows: [string, number, number, string][] = [
    [t.bmcFinRows[0], s.base.rev, s.base.rev * 12, 'positive'],
    [t.bmcFinRows[1], s.base.varCost, s.base.varCost * 12, ''],
    [t.bmcFinRows[2], s.fixed, s.fixed * 12, ''],
    [t.bmcFinRows[3], depM, depM * 12, ''],
    [t.bmcFinRows[4], totalMonthly, totalMonthly * 12, 'negative'],
  ];
  return (
    <div>
      <DocCard lang={lang} k="bmcFinance" />
      <FinTable headers={t.bmcFinHeaders}>
        {rows.map((r, i) => (
          <tr key={i} className={i === 4 ? 'total-row' : ''}>
            <td>{r[0]}</td>
            <td className={i === 4 ? '' : r[3]}>{m(r[1])}</td>
            <td className={i === 4 ? '' : r[3]}>{m(r[2])}</td>
          </tr>
        ))}
      </FinTable>
    </div>
  );
}

// ── Monthly results bar chart ────────────────────────────────────────────────
export function MonthlyResultsChart({ p, lang }: AppxProps) {
  const t = T(lang), m = M(lang);
  const s = computeSnapshot(p);
  const data = [
    { label: t.chartRev, value: s.base.rev, color: '#2E5E73' },
    { label: t.chartCost, value: s.base.varCost + s.fixed, color: '#C99A3C' },
    { label: t.chartDep, value: s.depMonthly, color: '#8FA0AD' },
    { label: t.chartTax, value: s.taxY1.amount / 12, color: '#9B6B63' },
    { label: t.chartNet, value: s.netMonthly, color: s.netMonthly >= 0 ? '#3E7C59' : '#AC4F46' },
  ];
  return <BarChartSvg data={data} format={m} />;
}

export function numStr(n: number): string { return num(n); }
