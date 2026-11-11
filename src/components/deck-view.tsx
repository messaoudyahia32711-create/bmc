'use client';
// ─── Pitch deck v2: 14 data-rich slides (print→PDF 16:9 + PPTX) ───────────────
import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from './app-context';
import { Project } from '@/lib/types';
import { computeSnapshot, getStartupBudget, buildScfYear } from '@/lib/engine';
import { matchPrograms } from '@/lib/knowledge';
import { money as fmtMoney, fmtDate } from '@/lib/format';
import { generatePptx } from '@/lib/pptx';
import { getX } from '@/lib/i18n2';
import { countPdf, countPptx } from '@/lib/stats';
import { completeness } from '@/lib/analytics';
import { LineChartSvg, BarChartSvg } from './bmc-ui';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Printer, FileDown, Loader2 } from 'lucide-react';

const SWOT_STYLES = {
  s: { head: '#3E7C59', bg: '#E7F2EB', border: '#C6DFD0' },
  w: { head: '#AC4F46', bg: '#F7E7E5', border: '#E8C7C3' },
  o: { head: '#2E5E73', bg: '#EAF0F5', border: '#C9DAE5' },
  t: { head: '#96691F', bg: '#F6EFDD', border: '#E5D5AE' },
};

export function DeckView({ p, onBack }: { p: Project; onBack: () => void }) {
  const { t, lang, branding } = useApp();
  const x = getX(lang);
  const money = (n: number) => fmtMoney(n, lang);
  const md = (n: number) => n >= 1e6 ? `${(n / 1e6).toLocaleString('fr-DZ', { maximumFractionDigits: 1 })} ${x.dMd}` : money(n);
  const snap = useMemo(() => computeSnapshot(p), [p]);
  const budget = getStartupBudget(p);
  const need = snap.assets.invest + budget.workingCapital;
  const comp = useMemo(() => completeness(p), [p]);
  const years = useMemo(() => [1, 2, 3, 4, 5].map(y => {
    const s = buildScfYear(p, y, p.market.growthReal / 100);
    return { y, rev: s.rev, net: s.net, ebe: s.ebe, va: s.va };
  }), [p]);
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  // inject 16:9 @page while deck is mounted
  useEffect(() => {
    document.body.classList.add('deck-mode');
    const style = document.createElement('style');
    style.id = 'deck-page-style';
    style.textContent = '@media print { @page { size: 297mm 166mm; margin: 0; } }';
    document.head.appendChild(style);
    return () => {
      document.body.classList.remove('deck-mode');
      document.getElementById('deck-page-style')?.remove();
    };
  }, []);

  const orgName = branding.orgName || t.appName;
  const primary = branding.primary || '#2E5E73';
  const projectName = p.info.projectTitleAr || p.name || t.untitled;
  const lines = (v?: string) => (v || '').split('\n').map(s => s.trim().replace(/^•\s*/, '')).filter(Boolean);
  const programs = useMemo(() => matchPrograms(p).filter(pr => pr.fit !== 'low').slice(0, 3), [p]);
  const legalLabel = { micro: t.legalMicro, startup: t.legalStartup, patent: t.legalPatent, other: t.legalOther }[p.info.legal];
  const typeLabels = { service: t.tService, industrial: t.tIndustrial, commercial: t.tCommercial, digital: t.tDigital };
  const totalBuyers = p.market.personas.reduce((s, pe) => s + (pe.monthlyBuyers || 0), 0);
  const marginRate = snap.base.rev > 0 ? (snap.base.rev - snap.base.varCost) / snap.base.rev : 0;
  const cum = snap.cashRows.map(r => r.cumulative);
  const cashGap = Math.max(0, Math.abs(Math.min(...cum, 0)));
  const yearLabels = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'].map((l, i) => lang === 'ar' ? `س${i + 1}` : lang === 'fr' ? `A${i + 1}` : l);

  const doPptx = async () => {
    setBusy(true);
    try {
      await generatePptx(p, lang, branding);
      countPptx();
      toast({ description: t.saved });
    } catch {
      toast({ description: t.importError, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const TOTAL = 14;
  const Slide = ({ n, title, children, dark = false }: { n: string; title?: string; children: React.ReactNode; dark?: boolean }) => (
    <div className={`deck-slide mx-auto flex flex-col ${dark ? 'deck-cover' : ''}`} style={{ ['--deck-primary' as string]: primary, background: dark ? undefined : '#fff', color: dark ? '#FFFFFF' : '#22313A' }}>
      {!dark && <div className="h-2.5 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${primary}, ${primary}88)` }} />}
      <div className="flex flex-1 flex-col px-[12mm] py-[8mm]">
        {title && (
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-[25px] font-extrabold font-heading leading-snug" style={{ color: dark ? '#fff' : primary }}>{title}</h2>
            <div className="h-1.5 w-16 shrink-0 rounded-full" style={{ background: dark ? '#ffffff66' : '#C99A3C' }} />
          </div>
        )}
        <div className="mt-3.5 flex-1 text-[14px] leading-relaxed">{children}</div>
        <div className={`flex items-center justify-between border-t pt-2 text-[9.5px] ${dark ? 'border-white/20 text-white/70' : 'border-[#E2E9EE] text-[#8FA0AD]'}`}>
          <span>{orgName}{branding.tagline ? ` — ${branding.tagline}` : ''}</span>
          <span className="num">{t.slideOf} {n} / {TOTAL}</span>
        </div>
      </div>
    </div>
  );

  const Bullets = ({ items, tone, size = 14 }: { items: string[]; tone?: string; size?: number }) => (
    <ul className="space-y-1.5 ps-5" style={tone ? { color: tone } : undefined}>
      {items.filter(Boolean).map((s, i) => <li key={i} style={{ fontSize: size }}>{s}</li>)}
    </ul>
  );

  const InfoTile = ({ k, v, accent = false }: { k: string; v: string; accent?: boolean }) => (
    <div className="rounded-xl border p-3" style={{ borderColor: accent ? `${primary}55` : '#E2E9EE', background: accent ? `${primary}0d` : '#FBFDFE' }}>
      <div className="text-[10px] font-bold uppercase tracking-wide text-[#8FA0AD]">{k}</div>
      <div className="mt-1 truncate text-[13.5px] font-bold" style={{ color: accent ? primary : '#22313A' }} title={v}><bdi>{v || t.na}</bdi></div>
    </div>
  );

  const KpiTile = ({ k, v, sub, color }: { k: string; v: string; sub?: string; color?: string }) => (
    <div className="rounded-2xl border p-3.5" style={{ borderColor: '#E2E9EE', background: '#F7FAFB' }}>
      <div className="text-[10.5px] font-semibold text-[#8FA0AD]">{k}</div>
      <div className="mt-1 text-[19px] font-black font-heading num" style={{ color: color || primary }}>{v}</div>
      {sub && <div className="mt-0.5 text-[10px] text-[#8FA0AD]">{sub}</div>}
    </div>
  );

  const SwotQuadrant = ({ q, label, items }: { q: keyof typeof SWOT_STYLES; label: string; items: string[] }) => {
    const st = SWOT_STYLES[q];
    return (
      <div className="rounded-xl border p-2.5" style={{ borderColor: st.border, background: st.bg }}>
        <div className="mb-1 flex items-center justify-between text-[11.5px] font-extrabold" style={{ color: st.head }}>
          <span>{label}</span>
          <span className="num rounded-full bg-white/70 px-1.5 text-[10px]">{items.length}</span>
        </div>
        {items.length ? (
          <ul className="space-y-0.5 ps-4 text-[10.5px] leading-snug text-[#3A4A56]">
            {items.slice(0, 4).map((s, i) => <li key={i} className="list-disc">{s}</li>)}
          </ul>
        ) : <div className="text-[10px] italic text-[#9AAAB6]">{x.dSwotEmpty}</div>}
      </div>
    );
  };

  const tableCls = 'fin-table w-full';

  const printDeck = () => { countPdf(); window.print(); };

  return (
    <div className="min-h-screen bg-secondary/70 pb-10">
      <div className="no-print sticky top-0 z-20 border-b border-border/70 bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2.5">
          <Button size="sm" variant="ghost" className="gap-1" onClick={onBack}><ArrowLeft className="h-4 w-4" />{t.backToApp}</Button>
          <span className="text-[13px] font-semibold">{t.deckTitle}</span>
          <span className="hidden text-[12px] text-muted-foreground md:inline">— {t.deckDesc}</span>
          <div className="ms-auto flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={printDeck}><Printer className="h-4 w-4" />{t.deckPdf}</Button>
            <Button size="sm" className="gap-1.5" onClick={doPptx} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}{t.deckPptx}</Button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-5xl space-y-6 overflow-x-auto px-4 print:space-y-0 print:overflow-visible print:px-0">
        {/* ── 1 · Cover ── */}
        <Slide n="1" dark>
          <div className="relative flex h-full flex-col items-center justify-center text-center">
            <div className="absolute -top-10 -end-10 h-52 w-52 rounded-full bg-white/5" aria-hidden />
            <div className="absolute -bottom-14 -start-8 h-64 w-64 rounded-full bg-white/5" aria-hidden />
            {branding.logo && <img src={branding.logo} alt={orgName} className="mb-3 h-14 w-auto rounded-lg bg-white/95 p-1.5" />}
            <span className="rounded-full border border-white/30 bg-white/10 px-4 py-1 text-[11.5px] font-bold tracking-wide">{x.dBadge}</span>
            <h1 className="mt-5 text-[38px] font-black font-heading leading-tight">{projectName}</h1>
            {p.info.projectTitleEn && <div className="mt-1.5 text-[16px] text-white/85">{p.info.projectTitleEn}</div>}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[12px] text-white/90">
              {[p.info.ownerName, p.info.wilaya, p.info.incubator || orgName, p.info.preparedDate || fmtDate(Date.now(), lang)].filter(Boolean).map((s, i) => (
                <span key={i} className="rounded-full bg-white/10 px-3 py-1">{s}</span>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-2.5">
              <span className="text-[11px] font-semibold text-white/80">{x.dScore}</span>
              <span className="num text-[22px] font-black">{snap.score.toFixed(1)}</span>
              <span className="num text-[12px] text-white/75">/ 10</span>
            </div>
          </div>
        </Slide>

        {/* ── 2 · Project card ── */}
        <Slide n="2" title={`${x.dCardT} — ${x.dCardD}`}>
          <div className="grid grid-cols-3 gap-2.5">
            <InfoTile k={t.tradeName} v={p.info.tradeName} accent />
            <InfoTile k={x.dLegal} v={legalLabel} accent />
            <InfoTile k={t.ownerName} v={p.info.ownerName} />
            <InfoTile k={t.wilaya} v={p.info.wilaya} />
            <InfoTile k={t.phone} v={p.info.phone} />
            <InfoTile k={x.dDate} v={p.info.preparedDate || fmtDate(Date.now(), lang)} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.type.types.map(tp => (
              <span key={tp} className="rounded-full px-3 py-1 text-[11px] font-bold" style={{ background: `${primary}14`, color: primary }}>{typeLabels[tp]}</span>
            ))}
          </div>
          <p className="mt-3 rounded-xl border border-[#E2E9EE] bg-[#FBFDFE] p-3 text-[13px] leading-relaxed">{p.info.description || t.na}</p>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#E2E9EE] p-2.5">
            <div className="w-40 shrink-0">
              <div className="flex justify-between text-[10px] text-[#8FA0AD]"><span>{x.dCompletion}</span><span className="num font-bold">{comp.percent}%</span></div>
              <div className="mt-1 h-2 rounded-full bg-[#EAF0F3]"><div className="h-2 rounded-full" style={{ width: `${comp.percent}%`, background: comp.percent >= 80 ? '#3E7C59' : '#C99A3C' }} /></div>
            </div>
            <InfoTile k={t.fiscalNature} v={{ commercial: t.faCommercial, services: t.faServices, production: t.faProduction, mixed: t.faMixed }[p.type.fiscalActivity]} />
          </div>
        </Slide>

        {/* ── 3 · Problem ── */}
        <Slide n="3" title={`${t.dProblem} — ${t.dProblemT}`}>
          <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="text-[15px] leading-relaxed">{p.info.description || t.na}</p>
              <div className="mt-4"><Bullets items={lines(p.market.customers)} tone="#4A5B68" /></div>
            </div>
            <div className="grid content-start gap-2">
              <div className="text-[11px] font-bold uppercase tracking-wide text-[#8FA0AD]">{lang === 'ar' ? 'شرائح العملاء المستهدفة' : lang === 'fr' ? 'Segments cibles' : 'Target segments'}</div>
              {lines(p.market.customers).slice(0, 3).map((c, i) => (
                <div key={i} className="rounded-xl border border-[#E2E9EE] bg-[#FBFDFE] p-3 text-[12.5px] font-semibold">{c}</div>
              ))}
              {lines(p.market.customers).length === 0 && <div className="text-[12px] text-[#9AAAB6]">{t.na}</div>}
            </div>
          </div>
        </Slide>

        {/* ── 4 · Solution ── */}
        <Slide n="4" title={`${t.dSolution} — ${t.dSolutionT}`}>
          <div className="grid gap-2.5 md:grid-cols-2">
            {lines(p.market.valueProp).map((v, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-xl border p-3" style={{ borderColor: '#C6DFD0', background: '#E7F2EB' }}>
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3E7C59] text-[10px] font-black text-white">✓</span>
                <span className="text-[13px] font-semibold leading-snug">{v}</span>
              </div>
            ))}
            {lines(p.market.valueProp).length === 0 && <div className="text-[12px] text-[#9AAAB6]">{t.na}</div>}
          </div>
          <div className="mt-4 rounded-xl border border-[#E2E9EE] p-3">
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#8FA0AD]">{t.dBmc} · {t.bmcBlocks[1]}</div>
            <Bullets items={lines(p.market.activities)} tone="#4A5B68" size={12.5} />
          </div>
        </Slide>

        {/* ── 5 · Market ── */}
        <Slide n="5" title={`${t.dMarket} — ${t.dMarketT}`}>
          <div className="grid gap-4 md:grid-cols-[1fr_1.3fr]">
            <div>
              <Bullets items={lines(p.market.customers).slice(0, 4)} tone="#3A4A56" size={13} />
              <div className="mt-4 rounded-2xl border p-3.5 text-center" style={{ borderColor: `${primary}44`, background: `${primary}0d` }}>
                <div className="text-[10.5px] font-bold text-[#8FA0AD]">{x.dBuyers}</div>
                <div className="num mt-1 text-[26px] font-black" style={{ color: primary }}>{totalBuyers.toLocaleString('fr-DZ')}</div>
                <div className="text-[10px] text-[#8FA0AD]">{x.dMargin}: <strong className="num">{(marginRate * 100).toFixed(0)}%</strong></div>
              </div>
            </div>
            <div>
              {p.market.personas.length > 0 ? (
                <table className={tableCls}>
                  <thead><tr><th>{t.peName}</th><th>{t.peAge}</th><th>{t.peLocation}</th><th>{t.peMonthly}</th></tr></thead>
                  <tbody>
                    {p.market.personas.slice(0, 5).map(pe => (
                      <tr key={pe.id}><td className="font-semibold">{pe.name}</td><td>{pe.ageRange}</td><td>{pe.location}</td><td className="num">{pe.monthlyBuyers.toLocaleString('fr-DZ')}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : <div className="rounded-xl border border-dashed p-6 text-center text-[12px] text-[#9AAAB6]">{t.personaNo}</div>}
            </div>
          </div>
        </Slide>

        {/* ── 6 · Competitors & SWOT ── */}
        <Slide n="6" title={`${x.dCompSwot} — ${x.dCompSwotT}`}>
          {p.market.competitors.length > 0 ? (
            <table className={tableCls}>
              <thead><tr><th>{t.compName}</th><th>{t.compOffer}</th><th>{t.compPrice}</th><th>{t.compEdge}</th></tr></thead>
              <tbody>
                {p.market.competitors.slice(0, 3).map(cp => (
                  <tr key={cp.id}>
                    <td className="font-semibold">{cp.name}</td><td>{cp.offer}</td>
                    <td>{{ low: t.priceLow, mid: t.priceMid, high: t.priceHigh }[cp.priceLevel] || cp.priceLevel}</td>
                    <td>{cp.edge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="rounded-xl border border-dashed p-3 text-center text-[12px] text-[#9AAAB6]">{x.dCompEmpty}</div>}
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <SwotQuadrant q="s" label={t.swotS} items={p.market.swot.strengths} />
            <SwotQuadrant q="w" label={t.swotW} items={p.market.swot.weaknesses} />
            <SwotQuadrant q="o" label={t.swotO} items={p.market.swot.opportunities} />
            <SwotQuadrant q="t" label={t.swotT} items={p.market.swot.threats} />
          </div>
        </Slide>

        {/* ── 7 · BMC ── */}
        <Slide n="7" title={`${t.dBmc} — ${t.dBmcT}`}>
          <div className="bmc-grid text-[11px]" style={{ fontSize: '10.5px' }}>
            <div className="bmc-cell bmc-partners"><strong>{t.bmcBlocks[0]}</strong>{lines(p.market.partners).slice(0, 4).join('\n') || t.na}</div>
            <div className="bmc-cell bmc-activities"><strong>{t.bmcBlocks[1]}</strong>{lines(p.market.activities).slice(0, 2).join('\n') || t.na}</div>
            <div className="bmc-cell bmc-resources"><strong>{t.bmcBlocks[2]}</strong>{lines(p.market.partners).slice(0, 2).join('\n') || t.na}</div>
            <div className="bmc-cell bmc-value"><strong>{t.bmcBlocks[3]}</strong>{lines(p.market.valueProp).slice(0, 4).join('\n') || t.na}</div>
            <div className="bmc-cell bmc-relations"><strong>{t.bmcBlocks[4]}</strong>{lines(p.market.channels).slice(0, 2).join('\n') || t.na}</div>
            <div className="bmc-cell bmc-channels"><strong>{t.bmcBlocks[5]}</strong>{lines(p.market.channels).slice(0, 2).join('\n') || t.na}</div>
            <div className="bmc-cell bmc-customers"><strong>{t.bmcBlocks[6]}</strong>{lines(p.market.customers).slice(0, 4).join('\n') || t.na}</div>
            <div className="bmc-cell bmc-costs"><strong>{t.bmcBlocks[7]}</strong>{money(snap.fixed)} / {t.monthUnit}</div>
            <div className="bmc-cell bmc-revenue"><strong>{t.bmcBlocks[8]}</strong>{money(snap.base.rev)} / {t.monthUnit}</div>
          </div>
          <div className="mt-2 text-center text-[10px] italic text-[#9AAAB6]">{x.dBmcHint}</div>
        </Slide>

        {/* ── 8 · Revenue model ── */}
        <Slide n="8" title={`${t.dModel} — ${t.dModelT}`}>
          <table className={tableCls}>
            <thead><tr><th>{t.productName}</th><th>{t.revenueModel}</th><th>{t.pPrice}</th><th>{t.pQty}</th><th>{t.ueMonthlyRev}</th><th>{t.ueMonthlyMargin}</th></tr></thead>
            <tbody>
              {p.products.filter(z => z.name).map(z => {
                const rev = z.model === 'fixed' ? z.price * z.qty : z.model === 'commission' ? z.deal * (z.commission / 100) * z.deals : z.sub * z.subs;
                const marg = z.model === 'fixed' ? (z.price - z.variable) * z.qty : z.model === 'commission' ? (z.deal * z.commission / 100 - z.dealCost) * z.deals : (z.sub - z.subCost) * z.subs;
                return (
                  <tr key={z.id}>
                    <td className="font-semibold">{z.name}</td>
                    <td>{{ fixed: t.rmFixed, commission: t.rmCommission, subscription: t.rmSubscription }[z.model]}</td>
                    <td>{money(z.model === 'fixed' ? z.price : z.model === 'commission' ? z.deal * z.commission / 100 : z.sub)}</td>
                    <td className="num">{Math.round(z.model === 'fixed' ? z.qty : z.model === 'commission' ? z.deals : z.subs).toLocaleString('fr-DZ')}</td>
                    <td>{money(rev)}</td>
                    <td className={marg >= 0 ? 'positive' : 'negative'}>{money(marg)}</td>
                  </tr>
                );
              })}
              <tr className="total-row"><td colSpan={4}>{t.total}</td><td>{money(snap.base.rev)}</td><td>{money(snap.base.rev - snap.base.varCost)}</td></tr>
            </tbody>
          </table>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            <KpiTile k={x.dMargin} v={`${(marginRate * 100).toFixed(0)}%`} color={marginRate >= 0.3 ? '#3E7C59' : '#96691F'} />
            <KpiTile k={t.fixedMonthlyTotal} v={money(snap.fixed)} />
            <KpiTile k={t.kpiNetMonthly} v={money(snap.netMonthly)} color={snap.netMonthly >= 0 ? '#3E7C59' : '#AC4F46'} />
          </div>
        </Slide>

        {/* ── 9 · Numbers ── */}
        <Slide n="9" title={`${t.dNumbers} — ${t.dNumbersT}`}>
          <div className="grid grid-cols-3 gap-3">
            <KpiTile k={t.kpiMonthlyRev} v={money(snap.base.rev)} />
            <KpiTile k={t.kpiNetMonthly} v={money(snap.netMonthly)} color={snap.netMonthly >= 0 ? '#3E7C59' : '#AC4F46'} />
            <KpiTile k={t.kpiFixed} v={money(snap.fixed)} />
            <KpiTile k={t.kpiBreakEven} v={snap.be.breakEvenMonths > 0 ? `${snap.be.breakEvenMonths.toFixed(1)} ${t.monthUnit}` : t.na} />
            <KpiTile k={t.kpiBudget} v={money(budget.total)} />
            <KpiTile k={t.kpiScore} v={`${snap.score.toFixed(1)}/10`} color="#C99A3C" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#E2E9EE] bg-[#FBFDFE] p-3 text-[12.5px]">
              <span className="font-bold" style={{ color: primary }}>{x.dTaxLine}:</span>{' '}
              {{ ifu: 'IFU', ibsReal: 'IBS', exemptManual: t.trExemptManual, exemptStartup: t.trExemptStartup, exemptPatent: t.trExemptPatent }[snap.taxY1.regime]}
              {snap.taxY1.regime !== 'exemptManual' && snap.taxY1.regime !== 'exemptStartup' && snap.taxY1.regime !== 'exemptPatent' && <span className="num"> — {(snap.taxY1.rate * 100).toFixed(0)}%</span>}
            </div>
            <div className="rounded-xl border border-[#E2E9EE] bg-[#FBFDFE] p-3 text-[12.5px]">
              <span className="font-bold" style={{ color: primary }}>{t.indVa}:</span> <span className="num">{money(snap.year1.va)}</span>
              <span className="mx-2 text-[#C9D6DE]">|</span>
              <span className="font-bold" style={{ color: primary }}>EBE:</span> <span className="num">{money(snap.year1.ebe)}</span>
            </div>
          </div>
        </Slide>

        {/* ── 10 · Investment & financing ── */}
        <Slide n="10" title={`${x.dInvest} — ${x.dInvestT}`}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#8FA0AD]">{x.dAssetsHead}</div>
              <table className={tableCls}>
                <tbody>
                  {snap.assets.rows.slice(0, 5).map((r, i) => (
                    <tr key={i}><td className="font-semibold">{r.name}</td><td className="num text-end">{money(r.value)}</td></tr>
                  ))}
                  <tr className="total-row"><td>{x.dAssetsTotal}</td><td className="num text-end">{money(snap.assets.invest)}</td></tr>
                </tbody>
              </table>
              <div className="mt-2 space-y-1 text-[11.5px] text-[#4A5B68]">
                <div>{x.dWC}: <strong className="num">{money(budget.workingCapital)}</strong></div>
                <div>{x.dPreStart}: <strong className="num">{money(p.funding.preStartCosts)}</strong></div>
                <div className="font-bold" style={{ color: primary }}>{x.dNeed}: <span className="num">{money(need)}</span></div>
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#8FA0AD]">{x.dFinStruct}</div>
              {(() => {
                const self = p.funding.selfFunding, grant = p.funding.grantAmount, loan = p.funding.hasLoan === 'yes' ? p.funding.loanAmount : 0;
                const tot = Math.max(self + grant + loan, 1);
                const bars: [string, number, string, string][] = [
                  [x.dSelf, self, '#3E7C59', money(self)],
                  [x.dGrant, grant, '#C99A3C', money(grant)],
                  [x.dLoan, loan, primary, money(loan)],
                ];
                return (
                  <div className="space-y-2.5">
                    {bars.map(([label, val, color, amount], i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[11px] font-semibold"><span>{label}</span><span className="num">{amount} ({Math.round(val / tot * 100)}%)</span></div>
                        <div className="h-3.5 rounded-full bg-[#EAF0F3]"><div className="h-3.5 rounded-full" style={{ width: `${Math.max(2, val / tot * 100)}%`, background: color }} /></div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div className={`mt-3 rounded-xl px-3 py-2 text-[12px] font-bold ${snap.financingGap <= 0 ? 'alert-calm alert-ok' : 'alert-calm alert-bad'}`}>
                {snap.financingGap <= 0 ? `✓ ${x.dGapOk}` : `⚠ ${x.dGapBad}: ${money(snap.financingGap)}`}
              </div>
              {programs.length > 0 && (
                <div className="mt-3">
                  <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#8FA0AD]">{x.dPrograms}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {programs.map(pr => (
                      <span key={pr.id} className="rounded-full border border-[#C9DAE5] bg-[#EAF0F5] px-3 py-1 text-[11px] font-bold" style={{ color: primary }}>{(t as unknown as Record<string, string>)[pr.nameKey]}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Slide>

        {/* ── 11 · Treasury & break-even ── */}
        <Slide n="11" title={`${t.dBreakeven} — ${t.dBeT}`}>
          <div className="rounded-2xl border border-[#E2E9EE] bg-white p-3">
            <div className="mb-1 text-[11px] font-bold" style={{ color: primary }}>{x.dTreasury}</div>
            <LineChartSvg
              values={cum}
              labels={snap.cashRows.map(r => `${lang === 'ar' ? 'ش' : lang === 'fr' ? 'M' : 'M'}${r.m}`)}
              format={v => md(v)}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <KpiTile k={t.indMinTreasury} v={money(snap.minCash)} color={snap.minCash >= 0 ? '#3E7C59' : '#AC4F46'} />
            <KpiTile k={t.kpiBreakEven} v={snap.be.breakEvenMonths > 0 ? `${snap.be.breakEvenMonths.toFixed(1)} ${t.monthUnit}` : t.na} />
            <KpiTile k={t.cashGapRows[4]} v={money(cashGap)} color={cashGap > 0 ? '#96691F' : '#3E7C59'} />
          </div>
        </Slide>

        {/* ── 12 · 5-year growth ── */}
        <Slide n="12" title={`${x.dGrowth} — ${x.dGrowthT}`}>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-[#E2E9EE] bg-white p-3">
              <div className="mb-1 text-[11px] font-bold" style={{ color: primary }}>{x.dRev5y}</div>
              <BarChartSvg data={years.map(yy => ({ label: yearLabels[yy.y - 1], value: yy.rev, color: primary }))} format={md} />
            </div>
            <div className="rounded-2xl border border-[#E2E9EE] bg-white p-3">
              <div className="mb-1 text-[11px] font-bold" style={{ color: '#3E7C59' }}>{x.dNet5y}</div>
              <BarChartSvg data={years.map(yy => ({ label: yearLabels[yy.y - 1], value: yy.net, color: yy.net >= 0 ? '#3E7C59' : '#AC4F46' }))} format={md} />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <KpiTile k={`${t.indEbe} — ${yearLabels[2]}`} v={md(years[2].ebe)} />
            <KpiTile k={`${t.indVa} — ${yearLabels[2]}`} v={md(years[2].va)} />
            <KpiTile k={`${t.kpiNetMonthly} — ${yearLabels[4]}`} v={md(years[4].net)} color={years[4].net >= 0 ? '#3E7C59' : '#AC4F46'} />
          </div>
        </Slide>

        {/* ── 13 · Team & contact ── */}
        <Slide n="13" title={`${t.dTeam} — ${t.dTeamT}`}>
          <div className="grid grid-cols-3 gap-2.5">
            <InfoTile k={t.ownerName} v={p.info.ownerName} accent />
            <InfoTile k={t.phone} v={p.info.phone} />
            <InfoTile k={t.wilaya} v={p.info.wilaya} />
            <InfoTile k={t.incubator} v={p.info.incubator || orgName} accent />
            <InfoTile k={x.dLegal} v={legalLabel} />
            <InfoTile k={x.dCompletion} v={`${comp.percent}%`} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-[#E2E9EE] bg-[#FBFDFE] p-3.5">
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#8FA0AD]">{t.tourCardTitle}</div>
              <Bullets items={lines(p.market.valueProp).slice(0, 3)} tone="#4A5B68" size={12.5} />
            </div>
            <div className="rounded-xl border p-3.5" style={{ borderColor: '#C9DAE5', background: '#EAF0F5' }}>
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: primary }}>{x.dContact}</div>
              <div className="space-y-1 text-[12.5px] text-[#3A4A56]">
                <div>{p.info.ownerName || t.na} — <bdi>{p.info.phone || t.na}</bdi></div>
                <div>{p.info.wilaya || t.na} · {p.info.incubator || orgName}</div>
                <div>{x.dDate}: {p.info.preparedDate || fmtDate(Date.now(), lang)}</div>
              </div>
            </div>
          </div>
        </Slide>

        {/* ── 14 · Closing ── */}
        <Slide n="14" dark>
          <div className="relative flex h-full flex-col items-center justify-center text-center">
            <div className="absolute -top-10 -start-10 h-48 w-48 rounded-full bg-white/5" aria-hidden />
            <div className="text-[12px] font-bold uppercase tracking-widest text-white/70">{x.dClosingAsk}</div>
            <div className="num mt-2 text-[46px] font-black leading-none">{money(need)}</div>
            <h2 className="mt-6 text-[26px] font-extrabold font-heading">{t.dClosingT}</h2>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[12.5px] text-white/85">
              <span className="rounded-full bg-white/10 px-3 py-1">{p.info.ownerName || orgName}</span>
              {p.info.phone && <span className="rounded-full bg-white/10 px-3 py-1"><bdi>{p.info.phone}</bdi></span>}
              {p.info.wilaya && <span className="rounded-full bg-white/10 px-3 py-1">{p.info.wilaya}</span>}
            </div>
            <div className="mt-6 text-[11px] text-white/60">{orgName}{branding.tagline ? ` — ${branding.tagline}` : ''}</div>
          </div>
        </Slide>
      </div>
    </div>
  );
}
