'use client';
// ─── Pitch deck view: 12 slides (print→PDF 16:9 + PPTX) ──────────────────────
import React, { useEffect, useMemo } from 'react';
import { useApp } from './app-context';
import { Project } from '@/lib/types';
import { computeSnapshot, getStartupBudget } from '@/lib/engine';
import { matchPrograms } from '@/lib/knowledge';
import { money as fmtMoney } from '@/lib/format';
import { generatePptx } from '@/lib/pptx';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Printer, FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function DeckView({ p, onBack }: { p: Project; onBack: () => void }) {
  const { t, lang, branding } = useApp();
  const money = (n: number) => fmtMoney(n, lang);
  const snap = useMemo(() => computeSnapshot(p), [p]);
  const budget = getStartupBudget(p);
  const need = snap.assets.invest + budget.workingCapital;
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
  const lines = (v?: string) => (v || '').split('\n').map(x => x.trim().replace(/^•\s*/, '')).filter(Boolean);
  const progs = matchPrograms(p).filter(pr => pr.fit !== 'low').slice(0, 3).map(pr => (t as unknown as Record<string, string>)[pr.nameKey]);

  const doPptx = async () => {
    setBusy(true);
    try {
      await generatePptx(p, lang, branding);
      toast({ description: t.saved });
    } catch {
      toast({ description: t.importError, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const Slide = ({ n, title, children, dark = false }: { n: string; title?: string; children: React.ReactNode; dark?: boolean }) => (
    <div className={`deck-slide mx-auto flex flex-col ${dark ? 'text-white' : 'text-[#22313A]'}`} style={dark ? { background: primary } : { background: '#fff' }}>
      {!dark && <div className="h-2.5 w-full shrink-0" style={{ background: primary }} />}
      <div className="flex flex-1 flex-col px-[14mm] py-[9mm]">
        {title && <h2 className={`text-[26px] font-extrabold font-heading leading-snug ${dark ? '' : ''}`} style={{ color: dark ? '#fff' : primary }}>{title}</h2>}
        <div className="mt-4 flex-1 text-[15px] leading-relaxed">{children}</div>
        <div className={`flex items-center justify-between text-[10px] ${dark ? 'text-white/70' : 'text-[#8FA0AD]'}`}>
          <span>{orgName}</span>
          <span className="num">{t.slideOf} {n} / 12</span>
        </div>
      </div>
    </div>
  );

  const Bullets = ({ items, tone }: { items: string[]; tone?: string }) => (
    <ul className="list-disc space-y-1.5 ps-5" style={tone ? { color: tone } : undefined}>
      {items.map((x, i) => <li key={i}>{x}</li>)}
    </ul>
  );

  const tableCls = 'fin-table w-full';

  return (
    <div className="min-h-screen bg-secondary/70 pb-10">
      <div className="no-print sticky top-0 z-20 border-b border-border/70 bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2.5">
          <Button size="sm" variant="ghost" className="gap-1" onClick={onBack}><ArrowLeft className="h-4 w-4" />{t.backToApp}</Button>
          <span className="text-[13px] font-semibold">{t.deckTitle}</span>
          <span className="hidden text-[12px] text-muted-foreground md:inline">— {t.deckDesc}</span>
          <div className="ms-auto flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.print()}><Printer className="h-4 w-4" />{t.deckPdf}</Button>
            <Button size="sm" className="gap-1.5" onClick={doPptx} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}{t.deckPptx}</Button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-5xl space-y-6 overflow-x-auto px-4 print:space-y-0 print:overflow-visible print:px-0">
        {/* 1 cover */}
        <Slide n="1" dark>
          <div className="flex h-full flex-col items-center justify-center text-center">
            {branding.logo && <img src={branding.logo} alt={orgName} className="mb-4 h-16 w-auto rounded-lg bg-white/95 p-1.5" />}
            <div className="text-[14px] font-medium text-white/85">{orgName}</div>
            <h1 className="mt-5 text-[40px] font-extrabold font-heading leading-tight">{projectName}</h1>
            {p.info.projectTitleEn && <div className="mt-2 text-[17px] text-white/85">{p.info.projectTitleEn}</div>}
            <div className="mt-5 text-[14px] text-white/90">{p.info.ownerName}{p.info.wilaya ? ` · ${p.info.wilaya}` : ''}</div>
            <div className="mt-8 text-[12px] text-white/70">{branding.tagline || t.appTagline}</div>
          </div>
        </Slide>

        {/* 2 problem */}
        <Slide n="2" title={`${t.dProblem} — ${t.dProblemT}`}>
          <p className="text-[16px]">{p.info.description || t.na}</p>
          <div className="mt-4"><Bullets items={lines(p.market.customers).slice(0, 4)} tone="#4A5B68" /></div>
        </Slide>

        {/* 3 solution */}
        <Slide n="3" title={`${t.dSolution} — ${t.dSolutionT}`}>
          <Bullets items={lines(p.market.valueProp)} />
          <div className="mt-5 text-[13.5px] text-[#4A5B68]"><Bullets items={lines(p.market.activities)} /></div>
        </Slide>

        {/* 4 market */}
        <Slide n="4" title={`${t.dMarket} — ${t.dMarketT}`}>
          <Bullets items={lines(p.market.customers).slice(0, 3)} />
          {p.market.personas.length > 0 && (
            <table className={`${tableCls} mt-4`}>
              <thead><tr><th>{t.peName}</th><th>{t.peAge}</th><th>{t.peLocation}</th><th>{t.peMonthly}</th></tr></thead>
              <tbody>
                {p.market.personas.slice(0, 4).map(pe => (
                  <tr key={pe.id}><td className="font-semibold">{pe.name}</td><td>{pe.ageRange}</td><td>{pe.location}</td><td className="num">{pe.monthlyBuyers}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </Slide>

        {/* 5 value & edge */}
        <Slide n="5" title={`${t.dValue} — ${t.dValueT}`}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="mb-1.5 text-[13px] font-bold text-[#3E7C59]">{t.swotS}</div>
              <Bullets items={p.market.swot.strengths.slice(0, 4)} />
            </div>
            <div>
              <div className="mb-1.5 text-[13px] font-bold text-[#4A5B68]">{t.compEdge}</div>
              <Bullets items={p.market.competitors.map(cp => `${cp.name}: ${cp.edge}`).slice(0, 4)} />
            </div>
          </div>
        </Slide>

        {/* 6 BMC */}
        <Slide n="6" title={`${t.dBmc} — ${t.dBmcT}`}>
          <table className={tableCls}>
            <tbody>
              {([
                [t.bmcBlocks[0], lines(p.market.partners)[0]],
                [t.bmcBlocks[1], lines(p.market.activities)[0]],
                [t.bmcBlocks[3], lines(p.market.valueProp)[0]],
                [t.bmcBlocks[5], lines(p.market.channels)[0]],
                [t.bmcBlocks[6], lines(p.market.customers)[0]],
                [t.bmcBlocks[7], `${money(snap.fixed)} / ${t.monthUnit}`],
                [t.bmcBlocks[8], `${money(snap.base.rev)} / ${t.monthUnit}`],
              ] as [string, string][]).map(([k, v], i) => (
                <tr key={i}><td className="w-56 font-semibold" style={{ background: `${primary}14`, color: primary }}>{k}</td><td>{v || t.na}</td></tr>
              ))}
            </tbody>
          </table>
        </Slide>

        {/* 7 revenue model */}
        <Slide n="7" title={`${t.dModel} — ${t.dModelT}`}>
          <table className={tableCls}>
            <thead><tr><th>{t.productName}</th><th>{t.pPrice}</th><th>{t.pQty}</th><th>{t.ueMonthlyRev}</th><th>{t.ueMonthlyMargin}</th></tr></thead>
            <tbody>
              {p.products.filter(x => x.name).map(x => {
                const rev = x.model === 'fixed' ? x.price * x.qty : x.model === 'commission' ? x.deal * (x.commission / 100) * x.deals : x.sub * x.subs;
                const marg = x.model === 'fixed' ? (x.price - x.variable) * x.qty : x.model === 'commission' ? (x.deal * x.commission / 100 - x.dealCost) * x.deals : (x.sub - x.subCost) * x.subs;
                return (
                  <tr key={x.id}>
                    <td className="font-semibold">{x.name}</td>
                    <td>{money(x.model === 'fixed' ? x.price : x.model === 'commission' ? x.deal * x.commission / 100 : x.sub)}</td>
                    <td className="num">{Math.round(x.model === 'fixed' ? x.qty : x.model === 'commission' ? x.deals : x.subs)}</td>
                    <td>{money(rev)}</td><td>{money(marg)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Slide>

        {/* 8 numbers */}
        <Slide n="8" title={`${t.dNumbers} — ${t.dNumbersT}`}>
          <div className="grid grid-cols-3 gap-4">
            {[
              [t.kpiMonthlyRev, money(snap.base.rev)],
              [t.kpiNetMonthly, money(snap.netMonthly)],
              [t.kpiFixed, money(snap.fixed)],
              [t.kpiBreakEven, snap.be.breakEvenMonths > 0 ? `${snap.be.breakEvenMonths.toFixed(1)} ${t.monthUnit}` : t.na],
              [t.kpiBudget, money(budget.total)],
              [t.kpiScore, `${snap.score.toFixed(1)}/10`],
            ].map(([k, v], i) => (
              <div key={i} className="rounded-2xl border border-border/70 p-4">
                <div className="text-[11.5px] text-[#8FA0AD]">{k}</div>
                <div className="mt-1 text-[20px] font-extrabold font-heading num" style={{ color: primary }}>{v}</div>
              </div>
            ))}
          </div>
        </Slide>

        {/* 9 breakeven & treasury */}
        <Slide n="9" title={`${t.dBreakeven} — ${t.dBeT}`}>
          <Bullets items={[
            `${t.kpiBreakEven}: ${snap.be.breakEvenMonths > 0 ? `${snap.be.breakEvenMonths.toFixed(1)} ${t.monthUnit}` : t.na}`,
            `${t.indMinTreasury}: ${money(snap.minCash)}`,
            `${t.cashGapRows[4]}: ${money(Math.max(0, Math.abs(Math.min(...snap.cashRows.map(r => r.cumulative), 0))))}`,
          ]} />
        </Slide>

        {/* 10 financing ask */}
        <Slide n="10" title={`${t.dAsk} — ${t.dAskT}`}>
          <Bullets items={[
            `${t.opFundingNeed}: ${money(need)}`,
            t.opPlan.replace('{s}', money(p.funding.selfFunding)).replace('{g}', money(p.funding.grantAmount)).replace('{l}', money(p.funding.hasLoan === 'yes' ? p.funding.loanAmount : 0)),
            t.fWc.replace('{v}', money(budget.workingCapital)),
            ...(progs.length ? [`${t.programsAdvisor}: ${progs.join(' · ')}`] : []),
          ]} />
        </Slide>

        {/* 11 team */}
        <Slide n="11" title={`${t.dTeam} — ${t.dTeamT}`}>
          <Bullets items={[
            `${t.ownerName}: ${p.info.ownerName || t.na}`,
            `${t.phone}: ${p.info.phone || t.na}`,
            `${t.wilaya}: ${p.info.wilaya || t.na}`,
            `${t.incubator}: ${p.info.incubator || orgName}`,
          ]} />
        </Slide>

        {/* 12 closing */}
        <Slide n="12" dark>
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="text-[32px] font-extrabold font-heading">{t.dClosingT}</h2>
            <div className="mt-4 text-[15px] text-white/85">{orgName}{p.info.phone ? ` — ${p.info.phone}` : ''}</div>
          </div>
        </Slide>
      </div>
    </div>
  );
}
