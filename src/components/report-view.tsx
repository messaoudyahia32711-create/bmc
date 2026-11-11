'use client';
// ─── Professional report view: cover + TOC + numbered sections + print ───────
import React, { useMemo, useRef, useState } from 'react';
import { useApp } from './app-context';
import { Project } from '@/lib/types';
import { computeSnapshot } from '@/lib/engine';
import { coach } from '@/lib/coach';
import { completeness, indicators } from '@/lib/analytics';
import { matchPrograms } from '@/lib/knowledge';
import { money as fmtMoney, todayStr, fmtDate } from '@/lib/format';
import { countPdf } from '@/lib/stats';
import {
  AppendixBreakEven, AppendixScenario, AppendixDetailedRevenue, AppendixAssets,
  AppendixFinancing, AppendixLoan, AppendixCashflow, AppendixCashGap, AppendixTax,
  AppendixSCF, AppendixBMC, AppendixBMCFinance, DocCard,
} from './appendices';
import { DocKey } from '@/lib/annex-docs';
import { getX } from '@/lib/i18n2';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, ArrowLeft, ShieldCheck } from 'lucide-react';

type ExportMode = 'full' | 'fin' | 'bmc' | 'one';

/** All static reference docs — definitions & formulas identical in every project. */
const METHOD_KEYS: DocKey[] = [
  'unitEconomics', 'breakEven', 'scenarios', 'detailedRevenue', 'assets', 'financing',
  'loan', 'cashflow', 'cashGap', 'tax', 'scf', 'bmc', 'bmcFinance', 'indicators',
];

export function ReportView({ p, onBack }: { p: Project; onBack: () => void }) {
  const { t, lang, branding } = useApp();
  const x = getX(lang);
  const [mode, setMode] = useState<ExportMode>('full');
  const money = (n: number) => fmtMoney(n, lang);
  const snap = useMemo(() => computeSnapshot(p), [p]);
  const c = coach(p, lang, money);
  const inds = indicators(p, lang, money);
  const comp = useMemo(() => completeness(p), [p]);
  const programs = useMemo(() => matchPrograms(p), [p]);
  const printRef = useRef<HTMLDivElement>(null);

  const orgName = branding.orgName || t.appName;
  const projectName = p.info.projectTitleAr || p.name || t.untitled;
  const show = (s: 'main' | 'fin' | 'bmc' | 'one') =>
    mode === 'full' ? s !== 'one' : mode === 'one' ? s === 'one' : mode === 'fin' ? s === 'main' || s === 'fin' : s === 'main' || s === 'bmc';

  const legalLabel = { micro: t.legalMicro, startup: t.legalStartup, patent: t.legalPatent, other: t.legalOther }[p.info.legal];
  const regimeTxt = ({ exemptManual: t.trExemptManual, exemptStartup: t.trExemptStartup, exemptPatent: t.trExemptPatent, ifu: t.trIfu, ibsReal: t.trIbs } as Record<string, string>)[snap.taxY1.regime] || String(snap.taxY1.regime);
  const summaryLine = t.reportSummaryLine.replace('{l}', String(legalLabel)).replace('{r}', money(snap.base.rev)).replace('{n}', money(snap.netMonthly)).replace('{t}', regimeTxt);

  return (
    <div className="min-h-screen bg-secondary/60">
      {/* toolbar (screen only) */}
      <div className="no-print sticky top-0 z-20 border-b border-border/70 bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2 px-4 py-2.5">
          <Button size="sm" variant="ghost" className="gap-1" onClick={onBack}>
            {lang === 'ar' ? <ArrowLeft className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" style={{ transform: 'scaleX(-1)' }} />}{t.backToApp}
          </Button>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="hidden text-[12.5px] text-muted-foreground sm:inline">{t.exportMode}:</span>
            <Select value={mode} onValueChange={v => setMode(v as ExportMode)}>
              <SelectTrigger className="h-8 w-full min-w-0 text-[13px] sm:w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="full">{t.expFull}</SelectItem>
                <SelectItem value="fin">{t.expFin}</SelectItem>
                <SelectItem value="bmc">{t.expBmc}</SelectItem>
                <SelectItem value="one">{t.expOne}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" className="ms-auto gap-1.5" onClick={() => { countPdf(); window.print(); }}><Printer className="h-4 w-4" />{t.printPdf}</Button>
        </div>
      </div>

      <div ref={printRef} className="report-shell mx-auto max-w-4xl bg-white px-6 py-8 shadow-sm print:px-0 print:py-0" style={{ color: '#22313A' }}>
        {/* repeated print header/footer */}
        <div className="rep-header hidden" aria-hidden>
          <span>{orgName}</span>
          <span>{projectName}</span>
        </div>
        <div className="rep-footer hidden" aria-hidden>
          <span>{t.toolCredits}</span>
          <span>{branding.footerNote || t.privacyLines[2]}</span>
          <span>{t.reportGenerated}: {fmtDate(Date.now(), lang)}</span>
        </div>

        {/* ── Cover ── */}
        {show('main') && (
          <div className="report-cover cover-block text-center">
            {/* formal banner — incubator identity */}
            <div className="cover-band absolute inset-x-0 top-0 flex min-h-16 items-center justify-center gap-3 px-6 py-3 text-white" style={{ background: branding.primary }}>
              {branding.logo && <img src={branding.logo} alt={orgName} className="h-10 w-auto rounded-md bg-white/95 p-1" />}
              <div className="leading-tight">
                <div className="text-[15px] font-extrabold font-heading">{orgName}</div>
                {branding.tagline && <div className="text-[11px] opacity-85">{branding.tagline}</div>}
              </div>
            </div>
            <div className="mt-24" aria-hidden />
            <h1 className="mt-2 text-3xl font-extrabold font-heading leading-snug">{t.reportTitle}</h1>
            <div className="mx-auto mt-2 h-1 w-24 rounded-full" style={{ background: branding.primary }} />
            <div className="mt-8 space-y-1.5">
              <div className="text-2xl font-bold font-heading">{projectName}</div>
              {p.info.projectTitleEn && <div className="text-[15px] text-[#5E7180]">{p.info.projectTitleEn}</div>}
              {p.info.tradeName && <div className="text-[13.5px] text-[#5E7180]">« {p.info.tradeName} »</div>}
            </div>
            <div className="mx-auto mt-8 grid w-fit grid-cols-2 gap-x-10 gap-y-2 text-start text-[13.5px]">
              <span className="text-[#7A8B98]">{t.coverPrepared}:</span><strong>{p.info.ownerName || t.na}</strong>
              <span className="text-[#7A8B98]">{t.wilaya}:</span><strong>{p.info.wilaya || t.na}</strong>
              <span className="text-[#7A8B98]">{t.legalFrame}:</span><strong>{legalLabel}</strong>
              <span className="text-[#7A8B98]">{t.incubator}:</span><strong>{p.info.incubator || orgName}</strong>
              <span className="text-[#7A8B98]">{t.coverDate}:</span><strong>{p.info.preparedDate || todayStr(lang)}</strong>
              <span className="text-[#7A8B98]">{t.kpiScore}:</span><strong className="num">{snap.score.toFixed(1)} / 10</strong>
            </div>
            {branding.reportCoverNote && <div className="mt-8 text-[12.5px] text-[#7A8B98]">{branding.reportCoverNote}</div>}
            <div className="mt-6 text-[11.5px] font-semibold text-[#5E7180]">{t.toolCredits}</div>
            <div className="mx-auto mt-10 max-w-xl rounded-xl border border-border/70 bg-[#F7FAFB] px-4 py-3 text-[12px] leading-relaxed text-[#5E7180]">
              <ShieldCheck className="me-1.5 -mt-0.5 inline h-4 w-4 text-[#3E7C59]" />
              {t.coverConf}
            </div>
          </div>
        )}

        {/* ── TOC ── */}
        {mode === 'full' && (
          <div className="report-section pt-10">
            <h2 className="text-2xl font-extrabold font-heading">{t.toc}</h2>
            <ol className="mt-4 space-y-2 text-[14px]">
              {[t.sec1, t.sec2, t.sec3, t.sec4, t.sec5, t.sec6, t.sec7, t.sec8, t.sec9].map((s, i) => (
                <li key={i} className="flex items-center gap-3 border-b border-border/50 pb-2">
                  <span className="num flex h-7 w-7 items-center justify-center rounded-lg text-[12.5px] font-bold text-white" style={{ background: branding.primary }}>{i + 1}</span>
                  <span className="font-semibold">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── Section 1: project card ── */}
        {show('main') && (
          <ReportSection n={1} title={t.sec1} branding={branding}>
            <div className="grid gap-x-6 gap-y-2 text-[13.5px] sm:grid-cols-2">
              <InfoLine k={t.projectName} v={projectName} />
              <InfoLine k={t.tradeName} v={p.info.tradeName} />
              <InfoLine k={t.ownerName} v={p.info.ownerName} />
              <InfoLine k={t.phone} v={p.info.phone} />
              <InfoLine k={t.wilaya} v={p.info.wilaya} />
              <InfoLine k={t.legalFrame} v={String(legalLabel)} />
              <InfoLine k={t.incubator} v={p.info.incubator} />
              <InfoLine k={t.preparedDate} v={p.info.preparedDate} />
            </div>
            {p.info.description && <p className="mt-3 rounded-xl bg-[#F7FAFB] p-3.5 text-[13.5px] leading-relaxed">{p.info.description}</p>}
            <p className="mt-3 text-[13px] leading-relaxed text-[#4A5B68]">{summaryLine}</p>
            <div className={`mt-3 rounded-xl p-3.5 text-[13.5px] font-semibold alert-calm alert-${c.tone}`}>
              {c.tone === 'ok' ? '●' : c.tone === 'warn' ? '●' : '●'} {c.statusText} — {c.decisionText}
            </div>
          </ReportSection>
        )}

        {/* ── Section 2: products ── */}
        {show('main') && (
          <ReportSection n={2} title={t.sec2} branding={branding}>
            <DocCard lang={lang} k="unitEconomics" />
            <div className="tbl-wrap">
            <table className="fin-table">
              <thead><tr>
                <th>{t.productName}</th><th>{t.revenueModel}</th><th>{t.pPrice}</th><th>{t.pVariable}</th><th>{t.pQty}</th><th>{t.ueMonthlyRev}</th><th>{t.ueMonthlyMargin}</th>
              </tr></thead>
              <tbody>
                {p.products.filter(x => x.name).map(x => {
                  const rev = x.model === 'fixed' ? x.price * x.qty : x.model === 'commission' ? x.deal * (x.commission / 100) * x.deals : x.sub * x.subs;
                  const marg = x.model === 'fixed' ? (x.price - x.variable) * x.qty : x.model === 'commission' ? (x.deal * x.commission / 100 - x.dealCost) * x.deals : (x.sub - x.subCost) * x.subs;
                  return (
                    <tr key={x.id}>
                      <td className="font-semibold">{x.name}</td>
                      <td>{{ fixed: t.rmFixed, commission: t.rmCommission, subscription: t.rmSubscription }[x.model]}</td>
                      <td>{money(x.model === 'fixed' ? x.price : x.model === 'commission' ? x.deal * x.commission / 100 : x.sub)}</td>
                      <td>{money(x.model === 'fixed' ? x.variable : x.model === 'commission' ? x.dealCost : x.subCost)}</td>
                      <td className="num">{Math.round(x.model === 'fixed' ? x.qty : x.model === 'commission' ? x.deals : x.subs).toLocaleString('fr-DZ')}</td>
                      <td>{money(rev)}</td>
                      <td className={marg >= 0 ? 'positive' : 'negative'}>{money(marg)}</td>
                    </tr>
                  );
                })}
                <tr className="total-row"><td colSpan={5}>{t.total}</td><td>{money(snap.base.rev)}</td><td>{money(snap.base.rev - snap.base.varCost)}</td></tr>
              </tbody>
            </table>
            </div>
          </ReportSection>
        )}

        {/* ── Section 3: market study ── */}
        {show('main') && (
          <ReportSection n={3} title={t.sec3} branding={branding}>
            <h3 className="mb-2 text-[15px] font-bold font-heading">{t.personaTitle}</h3>
            {p.market.personas.length ? (
              <div className="tbl-wrap">
              <table className="fin-table">
                <thead><tr><th>{t.peName}</th><th>{t.peAge}</th><th>{t.peLocation}</th><th>{t.pePower}</th><th>{t.peMonthly}</th></tr></thead>
                <tbody>
                  {p.market.personas.map(pe => (
                    <tr key={pe.id}>
                      <td className="font-semibold">{pe.name}</td><td>{pe.ageRange}</td><td>{pe.location}</td><td>{pe.purchasingPower}</td>
                      <td className="num">{pe.monthlyBuyers.toLocaleString('fr-DZ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            ) : <p className="text-[13px] text-[#7A8B98]">{t.personaNo}</p>}
            {p.market.personas.some(pe => pe.description) && (
              <ul className="mt-2 list-disc space-y-1 ps-5 text-[13px] text-[#4A5B68]">
                {p.market.personas.filter(pe => pe.description).map(pe => <li key={pe.id}><strong>{pe.name}:</strong> {pe.description}</li>)}
              </ul>
            )}

            <h3 className="mb-2 mt-5 text-[15px] font-bold font-heading">{t.competitorsTitle}</h3>
            {p.market.competitors.length ? (
              <div className="tbl-wrap">
              <table className="fin-table">
                <thead><tr><th>{t.compName}</th><th>{t.compOffer}</th><th>{t.compPrice}</th><th>{t.compEdge}</th></tr></thead>
                <tbody>
                  {p.market.competitors.map(cp => (
                    <tr key={cp.id}>
                      <td className="font-semibold">{cp.name}</td><td>{cp.offer}</td>
                      <td>{{ low: t.priceLow, mid: t.priceMid, high: t.priceHigh }[cp.priceLevel] || cp.priceLevel}</td>
                      <td>{cp.edge}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            ) : <p className="text-[13px] text-[#7A8B98]">{t.personaNo}</p>}

            <h3 className="mb-2 mt-5 text-[15px] font-bold font-heading">{t.swotTitle}</h3>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {([['S', t.swotS, p.market.swot.strengths], ['W', t.swotW, p.market.swot.weaknesses], ['O', t.swotO, p.market.swot.opportunities], ['T', t.swotT, p.market.swot.threats]] as const).map(([k, label, items]) => (
                <div key={k} className="rounded-xl border border-border/70 p-3">
                  <div className="mb-1.5 text-[13px] font-bold" style={{ color: k === 'S' || k === 'O' ? '#3E7C59' : '#AC4F46' }}>{label}</div>
                  {items.length ? <ul className="list-disc space-y-1 ps-4 text-[12.5px] leading-relaxed">{items.map((it, i) => <li key={i}>{it}</li>)}</ul> : <span className="text-[12.5px] text-[#9AAAB6]">—</span>}
                </div>
              ))}
            </div>
          </ReportSection>
        )}

        {/* ── Section 4: investment & financing ── */}
        {show('main') && (
          <ReportSection n={4} title={t.sec4} branding={branding}>
            <h3 className="mb-2 text-[14px] font-bold">{t.appendices[3]}</h3>
            <AppendixAssets p={p} lang={lang} />
            <h3 className="mb-2 mt-5 text-[14px] font-bold">{t.appendices[4]}</h3>
            <AppendixFinancing p={p} lang={lang} />
            <h3 className="mb-2 mt-5 text-[14px] font-bold">{t.appendices[5]}</h3>
            <AppendixLoan p={p} lang={lang} />
            <h3 className="mb-2 mt-5 text-[15px] font-bold font-heading">{t.programsAdvisor}</h3>
            <div className="space-y-2">
              {programs.filter(pr => pr.fit !== 'low').slice(0, 4).map(pr => (
                <div key={pr.id} className="rounded-xl border border-border/70 px-3.5 py-2.5 text-[13px]">
                  <strong>{(t as unknown as Record<string, string>)[pr.nameKey]}</strong>
                  <span className="text-[#7A8B98]"> — {pr.amount[lang]}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11.5px] text-[#7A8B98]">{t.programsDisclaimer}</p>
          </ReportSection>
        )}

        {/* ── Section 5: financial appendices ── */}
        {show('fin') && (
          <ReportSection n={5} title={t.sec5} branding={branding}>
            <h3 className="mb-2 text-[14px] font-bold">{t.appendices[0]}</h3>
            <AppendixBreakEven p={p} lang={lang} />
            <h3 className="mb-2 mt-5 text-[14px] font-bold">{t.appendices[1]}</h3>
            <AppendixScenario p={p} lang={lang} />
            <h3 className="mb-2 mt-5 text-[14px] font-bold">{t.appendices[2]}</h3>
            <AppendixDetailedRevenue p={p} lang={lang} />
            <h3 className="mb-2 mt-5 text-[14px] font-bold">{t.appendices[6]}</h3>
            <AppendixCashflow p={p} lang={lang} />
            <h3 className="mb-2 mt-5 text-[14px] font-bold">{t.appendices[7]}</h3>
            <AppendixCashGap p={p} lang={lang} />
            <h3 className="mb-2 mt-5 text-[14px] font-bold">{t.appendices[8]}</h3>
            <AppendixTax p={p} lang={lang} />
            <h3 className="mb-2 mt-5 text-[14px] font-bold">{t.appendices[9]}</h3>
            <AppendixSCF p={p} lang={lang} />
          </ReportSection>
        )}

        {/* ── Section 6: indicators & smart reading ── */}
        {show('main') && (
          <ReportSection n={6} title={t.sec6} branding={branding}>
            <DocCard lang={lang} k="indicators" />
            <div className="tbl-wrap">
            <table className="fin-table">
              <thead><tr><th>{t.indicatorsTitle}</th><th className="w-28">{t.kpiScore}</th><th>{t.hint}</th></tr></thead>
              <tbody>
                {inds.map(ind => (
                  <tr key={ind.key}>
                    <td className="font-semibold">{(t as unknown as Record<string, string>)[ind.key]}</td>
                    <td className="num">{ind.value}</td>
                    <td className="text-[12.5px] text-[#4A5B68]">{(t as unknown as Record<string, string>)[ind.explain]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="mt-5">
              <h3 className="mb-2 text-[15px] font-bold font-heading">{t.execBriefTitle}</h3>
              <div className={`alert-calm alert-${c.tone} text-[13px] leading-relaxed`}>
                <strong>{c.statusText}</strong> — {c.decisionText}
              </div>
              <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 p-3">
                  <div className="mb-1 text-[12.5px] font-bold text-[#AC4F46]">{t.coachWhy}</div>
                  <ul className="list-disc space-y-1 ps-4 text-[12.5px] leading-relaxed">{c.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
                <div className="rounded-xl border border-border/70 p-3">
                  <div className="mb-1 text-[12.5px] font-bold text-[#3E7C59]">{t.coachDo}</div>
                  <ul className="list-decimal space-y-1 ps-4 text-[12.5px] leading-relaxed">{c.actions.map((a, i) => <li key={i}>{a}</li>)}</ul>
                </div>
              </div>
            </div>
            {p.committee.some(x => x.a?.trim()) && (
              <div className="mt-5">
                <h3 className="mb-2 text-[15px] font-bold font-heading">{t.committeeTitle}</h3>
                <div className="space-y-2">
                  {p.committee.filter(x => x.a?.trim()).map((x, i) => (
                    <div key={i} className="rounded-xl border border-border/70 p-3 text-[13px]">
                      <strong>{x.q}</strong>
                      <p className="mt-1 whitespace-pre-line leading-relaxed text-[#4A5B68]">{x.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 text-[11.5px] text-[#7A8B98]">{t.completenessTitle}: <strong className="num">{comp.percent}%</strong>{comp.percent >= 100 ? ` — ${t.complete}` : ''}</div>
          </ReportSection>
        )}

        {/* ── Section 7: BMC ── */}
        {show('bmc') && (
          <ReportSection n={7} title={t.sec7} branding={branding}>
            <AppendixBMC p={p} lang={lang} />
            <h3 className="mb-2 mt-5 text-[14px] font-bold">{t.appendices[11]}</h3>
            <AppendixBMCFinance p={p} lang={lang} />
          </ReportSection>
        )}

        {/* ── Section 8 / one-pager ── */}
        {show('one') && (
          <ReportSection n={8} title={t.sec8} branding={branding}>
            <OnePager p={p} />
          </ReportSection>
        )}
        {mode === 'one' && (
          <div className="report-section">
            <h2 className="mb-3 text-xl font-extrabold font-heading">{t.execOnePager}</h2>
            <OnePager p={p} />
          </div>
        )}

        {/* ── Section 9: methodology, definitions & formulas (static) ── */}
        {show('main') && (
          <ReportSection n={9} title={t.sec9} branding={branding}>
            <p className="mb-4 rounded-xl border border-[#C9DAE5] bg-[#F7FAFB] p-3.5 text-[13px] leading-relaxed text-[#3A4A56]">
              {x.dMethodIntro}
            </p>
            <div className="grid gap-3 print:grid-cols-1 sm:grid-cols-2">
              {METHOD_KEYS.map(k => <DocCard key={k} lang={lang} k={k} />)}
            </div>
            <div className="mt-6 rounded-xl border border-border/70 bg-white px-4 py-3.5 text-center">
              <div className="text-[12.5px] font-bold text-[#2E5E73]">{t.toolCredits}</div>
              <div className="mt-1 text-[11px] text-[#7A8B98]">{t.reportGenerated}: {fmtDate(Date.now(), lang)}</div>
            </div>
          </ReportSection>
        )}
      </div>
    </div>
  );
}

function InfoLine({ k, v }: { k: string; v?: string }) {
  return (
    <div className="flex gap-2 border-b border-border/40 py-1">
      <span className="w-28 shrink-0 text-[#7A8B98] sm:w-36">{k}</span>
      <strong className="min-w-0 break-words"><bdi>{v || t_na}</bdi></strong>
    </div>
  );
}
const t_na = '—';

function ReportSection({ n, title, children, branding }: { n: number; title: string; children: React.ReactNode; branding: { primary: string } }) {
  return (
    <section className="report-section pt-9">
      <div className="mb-4 flex items-center gap-3">
        <span className="num flex h-9 w-9 items-center justify-center rounded-xl text-[15px] font-extrabold text-white" style={{ background: branding.primary }}>{n}</span>
        <h2 className="text-xl font-extrabold font-heading">{title}</h2>
        <div className="h-px flex-1 bg-border/70" />
      </div>
      {children}
    </section>
  );
}

function OnePager({ p }: { p: Project }) {
  const { t, lang, branding } = useApp();
  const money = (n: number) => fmtMoney(n, lang);
  const snap = computeSnapshot(p);
  const c = coach(p, lang, money);
  const wc = snap.budget.workingCapital;
  const need = snap.assets.invest + wc;
  const bullets = (v: string) => v ? v.split('\n').filter(Boolean) : [];
  return (
    <div className="space-y-4 text-[13px] leading-relaxed">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border/70 p-3.5">
          <div className="mb-1 font-bold font-heading" style={{ color: branding.primary }}>{t.onePagerIdea}</div>
          <p>{p.info.description || t.na}</p>
        </div>
        <div className="rounded-xl border border-border/70 p-3.5">
          <div className="mb-1 font-bold font-heading" style={{ color: branding.primary }}>{t.onePagerMarket}</div>
          <ul className="list-disc space-y-0.5 ps-4">{bullets(p.market.customers).map((b, i) => <li key={i}>{b.replace(/^•\s*/, '')}</li>)}
            {p.market.personas.slice(0, 2).map(pe => <li key={pe.id}><strong>{pe.name}</strong> ({pe.ageRange}, {pe.location})</li>)}
          </ul>
        </div>
        <div className="rounded-xl border border-border/70 p-3.5">
          <div className="mb-1 font-bold font-heading" style={{ color: branding.primary }}>{t.onePagerNumbers}</div>
          <table className="fin-table"><tbody>
            <tr><td>{t.kpiMonthlyRev}</td><td className="num">{money(snap.base.rev)}</td></tr>
            <tr><td>{t.kpiNetMonthly}</td><td className="num">{money(snap.netMonthly)}</td></tr>
            <tr><td>{t.kpiBreakEven}</td><td className="num">{snap.be.breakEvenMonths > 0 ? `${snap.be.breakEvenMonths.toFixed(1)} ${t.monthUnit}` : t.na}</td></tr>
            <tr><td>{t.kpiScore}</td><td className="num">{snap.score.toFixed(1)}/10</td></tr>
          </tbody></table>
        </div>
        <div className="rounded-xl border border-border/70 p-3.5">
          <div className="mb-1 font-bold font-heading" style={{ color: branding.primary }}>{t.onePagerAsk}</div>
          <div>{t.opFundingNeed}: <strong className="num">{money(need)}</strong></div>
          <div className="mt-1">{t.opPlan.replace('{s}', money(p.funding.selfFunding)).replace('{g}', money(p.funding.grantAmount)).replace('{l}', money(p.funding.hasLoan === 'yes' ? p.funding.loanAmount : 0))}</div>
          <div className="mt-1 text-[12.5px] text-[#7A8B98]">{t.fWc.replace('{v}', money(wc))}</div>
        </div>
      </div>
      <div className={`alert-calm alert-${c.tone}`}>
        <strong>{t.onePagerVerdict}: {c.statusText}</strong>
        <div className="mt-1">{c.decisionText}</div>
      </div>
    </div>
  );
}
