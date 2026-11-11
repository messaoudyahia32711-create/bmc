// ─── PPTX pitch deck generation (client-side, pptxgenjs) ─────────────────────
import { Project, Lang, Branding } from './types';
import { computeSnapshot, getStartupBudget } from './engine';
import { getDict } from './i18n';
import { money as fmtMoney } from './format';
import { matchPrograms } from './knowledge';

export async function generatePptx(p: Project, lang: Lang, branding: Branding): Promise<void> {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const t = getDict(lang);
  const money = (n: number) => fmtMoney(n, lang);
  const snap = computeSnapshot(p);
  const budget = getStartupBudget(p);
  const need = snap.assets.invest + budget.workingCapital;
  const rtl = lang === 'ar';
  const orgName = branding.orgName || t.appName;
  const primary = branding.primary || '#2E5E73';
  const projectName = p.info.projectTitleAr || p.name || t.untitled;

  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';
  pres.rtlMode = rtl;
  pres.title = projectName;

  const W = 10, H = 5.625;
  const align = rtl ? 'right' : 'left';
  const font = rtl ? 'Cairo' : 'Cairo';

  const baseSlide = () => {
    const s = pres.addSlide();
    s.background = { color: 'FFFFFF' };
    s.addShape('rect', { x: 0, y: 0, w: W, h: 0.12, fill: { color: primary } });
    return s;
  };
  const addTitle = (s: ReturnType<typeof baseSlide>, title: string) => {
    s.addText(title, {
      x: 0.5, y: 0.35, w: W - 1, h: 0.7, fontSize: 26, bold: true, color: primary,
      fontFace: font, align, rtlMode: rtl,
    });
  };
  const bullets = (lines: string[]) => lines.filter(Boolean).map(l => ({ text: l.replace(/^•\s*/, ''), options: { bullet: true, breakLine: true } }));

  // 1 — Cover
  {
    const s = pres.addSlide();
    s.background = { color: primary };
    if (branding.logo) {
      try { s.addImage({ data: branding.logo, x: W / 2 - 0.6, y: 0.7, w: 1.2, h: 1.2 }); } catch { /* ignore */ }
    }
    s.addText(orgName, { x: 0.5, y: 0.35, w: W - 1, h: 0.4, fontSize: 14, color: 'FFFFFF', align: 'center', fontFace: font, transparency: 20 });
    s.addText(projectName, { x: 0.5, y: 2.15, w: W - 1, h: 1, fontSize: 40, bold: true, color: 'FFFFFF', align: 'center', fontFace: font });
    if (p.info.projectTitleEn) s.addText(p.info.projectTitleEn, { x: 0.5, y: 3.1, w: W - 1, h: 0.5, fontSize: 18, color: 'D9E7EE', align: 'center', fontFace: font });
    s.addText(`${p.info.ownerName || ''} ${p.info.wilaya ? '· ' + p.info.wilaya : ''}`, { x: 0.5, y: 3.9, w: W - 1, h: 0.4, fontSize: 15, color: 'D9E7EE', align: 'center', fontFace: font });
    s.addText(branding.tagline || t.appTagline, { x: 0.5, y: 4.7, w: W - 1, h: 0.4, fontSize: 12, color: 'BFD5E0', align: 'center', fontFace: font });
  }

  // 2 — Problem
  {
    const s = baseSlide();
    addTitle(s, `${t.dProblem} — ${t.dProblemT}`);
    s.addText(p.info.description || t.na, { x: 0.6, y: 1.4, w: W - 1.2, h: 1.4, fontSize: 16, color: '22313A', align, fontFace: font, rtlMode: rtl, valign: 'top' });
    s.addText(bullets(t2b(p.market.customers)) as never, { x: 0.6, y: 2.9, w: W - 1.2, h: 1.8, fontSize: 15, color: '4A5B68', align, fontFace: font, rtlMode: rtl, valign: 'top' });
  }

  // 3 — Solution
  {
    const s = baseSlide();
    addTitle(s, `${t.dSolution} — ${t.dSolutionT}`);
    s.addText(bullets(t2b(p.market.valueProp)) as never, { x: 0.6, y: 1.4, w: W - 1.2, h: 1.9, fontSize: 17, color: '22313A', align, fontFace: font, rtlMode: rtl, valign: 'top' });
    s.addText(bullets(t2b(p.market.activities)) as never, { x: 0.6, y: 3.4, w: W - 1.2, h: 1.6, fontSize: 14, color: '4A5B68', align, fontFace: font, rtlMode: rtl, valign: 'top' });
  }

  // 4 — Market
  {
    const s = baseSlide();
    addTitle(s, `${t.dMarket} — ${t.dMarketT}`);
    const rows: string[][] = [];
    p.market.personas.slice(0, 4).forEach(pe => rows.push([pe.name || '—', pe.ageRange || '—', pe.location || '—', String(pe.monthlyBuyers || 0)]));
    s.addText(bullets(t2b(p.market.customers)).slice(0, 3) as never, { x: 0.6, y: 1.3, w: W - 1.2, h: 1.5, fontSize: 15, color: '22313A', align, fontFace: font, rtlMode: rtl, valign: 'top' });
    if (rows.length) {
      s.addTable([
        [
          { text: t.peName, options: { bold: true, color: 'FFFFFF', fill: { color: primary } } },
          { text: t.peAge, options: { bold: true, color: 'FFFFFF', fill: { color: primary } } },
          { text: t.peLocation, options: { bold: true, color: 'FFFFFF', fill: { color: primary } } },
          { text: t.peMonthly, options: { bold: true, color: 'FFFFFF', fill: { color: primary } } },
        ],
        ...rows.map(r => r.map(c2 => ({ text: c2, options: { fontFace: font } }))),
      ] as never, { x: 0.6, y: 3.0, w: W - 1.2, fontSize: 12, align: rtl ? 'right' : 'left', border: { pt: 0.5, color: 'D8E1E7' } });
    }
  }

  // 5 — Value / edge
  {
    const s = baseSlide();
    addTitle(s, `${t.dValue} — ${t.dValueT}`);
    s.addText(bullets(p.market.swot.strengths.slice(0, 4)) as never, { x: 0.6, y: 1.4, w: W / 2 - 0.9, h: 3, fontSize: 14, color: '3E7C59', align, fontFace: font, valign: 'top' });
    s.addText(bullets(p.market.competitors.map(cp => `${cp.name}: ${cp.edge}`)).slice(0, 4) as never, { x: W / 2 + 0.3, y: 1.4, w: W / 2 - 0.9, h: 3, fontSize: 14, color: '4A5B68', align, fontFace: font, valign: 'top' });
  }

  // 6 — BMC compact
  {
    const s = baseSlide();
    addTitle(s, `${t.dBmc} — ${t.dBmcT}`);
    const cells: [string, string][] = [
      [t.bmcBlocks[0], firstLine(p.market.partners)],
      [t.bmcBlocks[1], firstLine(p.market.activities)],
      [t.bmcBlocks[3], firstLine(p.market.valueProp)],
      [t.bmcBlocks[5], firstLine(p.market.channels)],
      [t.bmcBlocks[6], firstLine(p.market.customers)],
      [t.bmcBlocks[7], `${money(snap.fixed)} / ${t.monthUnit}`],
      [t.bmcBlocks[8], `${money(snap.base.rev)} / ${t.monthUnit}`],
    ];
    const tableRows = cells.map(([k, v]) => ([
      { text: k, options: { bold: true, color: 'FFFFFF', fill: { color: primary }, fontFace: font } },
      { text: v || '—', options: { fontFace: font } },
    ]));
    s.addTable(tableRows as never, { x: 0.6, y: 1.3, w: W - 1.2, fontSize: 12, border: { pt: 0.5, color: 'D8E1E7' }, align: rtl ? 'right' : 'left' });
  }

  // 7 — Revenue model
  {
    const s = baseSlide();
    addTitle(s, `${t.dModel} — ${t.dModelT}`);
    const head = [t.productName, t.pPrice, t.pQty, t.ueMonthlyRev, t.ueMonthlyMargin].map(x => ({ text: x, options: { bold: true, color: 'FFFFFF', fill: { color: primary }, fontFace: font } }));
    const rows = p.products.filter(x => x.name).map(x => {
      const rev = x.model === 'fixed' ? x.price * x.qty : x.model === 'commission' ? x.deal * (x.commission / 100) * x.deals : x.sub * x.subs;
      const marg = x.model === 'fixed' ? (x.price - x.variable) * x.qty : x.model === 'commission' ? (x.deal * x.commission / 100 - x.dealCost) * x.deals : (x.sub - x.subCost) * x.subs;
      return [x.name, money(x.model === 'fixed' ? x.price : x.model === 'commission' ? x.deal * x.commission / 100 : x.sub), String(Math.round(x.model === 'fixed' ? x.qty : x.model === 'commission' ? x.deals : x.subs)), money(rev), money(marg)].map(v => ({ text: v, options: { fontFace: font } }));
    });
    if (rows.length) s.addTable([head, ...rows] as never, { x: 0.6, y: 1.5, w: W - 1.2, fontSize: 12, border: { pt: 0.5, color: 'D8E1E7' }, align: rtl ? 'right' : 'left' });
  }

  // 8 — Numbers
  {
    const s = baseSlide();
    addTitle(s, `${t.dNumbers} — ${t.dNumbersT}`);
    const kpis: [string, string][] = [
      [t.kpiMonthlyRev, money(snap.base.rev)],
      [t.kpiNetMonthly, money(snap.netMonthly)],
      [t.kpiFixed, money(snap.fixed)],
      [t.kpiBreakEven, snap.be.breakEvenMonths > 0 ? `${snap.be.breakEvenMonths.toFixed(1)} ${t.monthUnit}` : '—'],
      [t.kpiBudget, money(budget.total)],
      [t.kpiScore, `${snap.score.toFixed(1)}/10`],
    ];
    s.addTable(kpis.map(([k, v]) => ([
      { text: k, options: { bold: true, fontFace: font } },
      { text: v, options: { fontFace: font, align: 'right' } },
    ])) as never, { x: 0.6, y: 1.5, w: W - 1.2, fontSize: 14, border: { pt: 0.5, color: 'D8E1E7' }, align: rtl ? 'right' : 'left' });
  }

  // 9 — Break-even & treasury
  {
    const s = baseSlide();
    addTitle(s, `${t.dBreakeven} — ${t.dBeT}`);
    s.addText([
      { text: `${t.kpiBreakEven}: ${snap.be.breakEvenMonths > 0 ? `${snap.be.breakEvenMonths.toFixed(1)} ${t.monthUnit}` : '—'}`, options: { bullet: true, breakLine: true } },
      { text: `${t.indMinTreasury}: ${money(snap.minCash)}`, options: { bullet: true, breakLine: true } },
      { text: `${t.cashGapRows[4]}: ${money(Math.max(0, Math.abs(Math.min(...snap.cashRows.map(r => r.cumulative), 0))))}`, options: { bullet: true } },
    ] as never, { x: 0.6, y: 1.6, w: W - 1.2, h: 2.4, fontSize: 16, color: '22313A', align, fontFace: font, rtlMode: rtl, valign: 'top' });
  }

  // 10 — Financing ask
  {
    const s = baseSlide();
    addTitle(s, `${t.dAsk} — ${t.dAskT}`);
    const progs = matchPrograms(p).filter(pr => pr.fit !== 'low').slice(0, 3).map(pr => (t as unknown as Record<string, string>)[pr.nameKey]);
    s.addText([
      { text: `${t.opFundingNeed}: ${money(need)}`, options: { bullet: true, breakLine: true, bold: true, fontSize: 18 } },
      { text: t.opPlan.replace('{s}', money(p.funding.selfFunding)).replace('{g}', money(p.funding.grantAmount)).replace('{l}', money(p.funding.hasLoan === 'yes' ? p.funding.loanAmount : 0)), options: { bullet: true, breakLine: true } },
      { text: `${t.fWc.replace('{v}', money(budget.workingCapital))}`, options: { bullet: true, breakLine: true } },
      ...(progs.length ? [{ text: `${t.programsAdvisor}: ${progs.join('، ')}`, options: { bullet: true } }] : []),
    ] as never, { x: 0.6, y: 1.5, w: W - 1.2, h: 2.8, fontSize: 15, color: '22313A', align, fontFace: font, rtlMode: rtl, valign: 'top' });
  }

  // 11 — Team & contact
  {
    const s = baseSlide();
    addTitle(s, `${t.dTeam} — ${t.dTeamT}`);
    s.addText([
      { text: `${t.ownerName}: ${p.info.ownerName || '—'}`, options: { bullet: true, breakLine: true } },
      { text: `${t.phone}: ${p.info.phone || '—'}`, options: { bullet: true, breakLine: true } },
      { text: `${t.wilaya}: ${p.info.wilaya || '—'}`, options: { bullet: true, breakLine: true } },
      { text: `${t.incubator}: ${p.info.incubator || orgName}`, options: { bullet: true } },
    ] as never, { x: 0.6, y: 1.6, w: W - 1.2, h: 2.4, fontSize: 16, color: '22313A', align, fontFace: font, rtlMode: rtl, valign: 'top' });
  }

  // 12 — Closing
  {
    const s = pres.addSlide();
    s.background = { color: primary };
    s.addText(t.dClosingT, { x: 0.5, y: 2.0, w: W - 1, h: 1, fontSize: 30, bold: true, color: 'FFFFFF', align: 'center', fontFace: font });
    s.addText(`${orgName} — ${p.info.phone || ''}`, { x: 0.5, y: 3.2, w: W - 1, h: 0.5, fontSize: 15, color: 'D9E7EE', align: 'center', fontFace: font });
  }

  await pres.writeFile({ fileName: `pitch-deck-${(p.name || 'project').replace(/\s+/g, '-').slice(0, 30)}.pptx` });
}

function t2b(v: string): string[] {
  return (v || '').split('\n').map(x => x.trim()).filter(Boolean);
}
function firstLine(v: string): string {
  const lines = t2b(v);
  return lines.length ? lines[0].replace(/^•\s*/, '') : '';
}
