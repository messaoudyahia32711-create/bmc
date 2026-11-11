// ─── PPTX pitch deck v2 (client-side, pptxgenjs): 14 data-rich slides ────────
import { Project, Lang, Branding } from './types';
import { computeSnapshot, getStartupBudget, buildScfYear } from './engine';
import { getDict } from './i18n';
import { getX } from './i18n2';
import { money as fmtMoney } from './format';
import { matchPrograms } from './knowledge';
import { completeness } from './analytics';

export async function generatePptx(p: Project, lang: Lang, branding: Branding): Promise<void> {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const t = getDict(lang);
  const x = getX(lang);
  const money = (n: number) => fmtMoney(n, lang);
  const md = (n: number) => n >= 1e6 ? `${(n / 1e6).toLocaleString('fr-DZ', { maximumFractionDigits: 1 })} ${x.dMd}` : money(n);
  const snap = computeSnapshot(p);
  const budget = getStartupBudget(p);
  const need = snap.assets.invest + budget.workingCapital;
  const comp = completeness(p);
  const rtl = lang === 'ar';
  const orgName = branding.orgName || t.appName;
  const primary = (branding.primary || '#2E5E73').replace('#', '');
  const primaryDark = '1E3D4C';
  const gold = 'C99A3C', green = '3E7C59', red = 'AC4F46', amber = '96691F';
  const ink = '22313A', sub = '4A5B68', faint = '8FA0AD', line = 'E2E9EE', panel = 'F7FAFB';
  const font = 'Cairo';
  const align = rtl ? ('right' as const) : ('left' as const);
  const projectName = p.info.projectTitleAr || p.name || t.untitled;
  const legalLabel = { micro: t.legalMicro, startup: t.legalStartup, patent: t.legalPatent, other: t.legalOther }[p.info.legal];
  const lines = (v?: string): string[] => (v || '').split('\n').map(s => s.trim().replace(/^•\s*/, '')).filter(Boolean);
  const programs = matchPrograms(p).filter(pr => pr.fit !== 'low').slice(0, 3).map(pr => (t as unknown as Record<string, string>)[pr.nameKey]);

  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';
  pres.rtlMode = rtl;
  pres.theme = { headFontFace: font, bodyFontFace: font };
  pres.title = projectName;

  const W = 10, H = 5.625;
  const TOTAL = 14;

  const txt = (s: PptxGenJS.Slide, text: string, opts: Partial<PptxGenJS.TextProps> = {}) => {
    s.addText(text, { fontFace: font, align, rtlMode: rtl, color: ink, ...opts } as PptxGenJS.TextProps);
  };
  const bulletOpts = { fontFace: font, align, rtlMode: rtl, valign: 'top' as const };
  const bullets = (items: string[]) => items.filter(Boolean).map(l => ({ text: l, options: { bullet: true, breakLine: true } }));

  const baseSlide = (n: number) => {
    const s = pres.addSlide();
    s.background = { color: 'FFFFFF' };
    s.addShape('rect', { x: 0, y: 0, w: W, h: 0.12, fill: { color: primary } });
    s.addShape('rect', { x: rtl ? 0.4 : W - 1.2, y: 0.62, w: 0.8, h: 0.05, fill: { color: gold } });
    s.addText(`${orgName}`, { x: 0.5, y: H - 0.34, w: W / 2, h: 0.3, fontSize: 8.5, color: faint, fontFace: font, align: rtl ? 'right' : 'left', rtlMode: rtl });
    s.addText(`${t.slideOf} ${n} / ${TOTAL}`, { x: W / 2, y: H - 0.34, w: W / 2 - 0.5, h: 0.3, fontSize: 8.5, color: faint, fontFace: font, align: rtl ? 'left' : 'right', rtlMode: rtl });
    return s;
  };
  const addTitle = (s: PptxGenJS.Slide, title: string) => {
    txt(s, title, { x: 0.5, y: 0.28, w: W - 1, h: 0.55, fontSize: 23, bold: true, color: primary });
  };
  const kpiCard = (s: PptxGenJS.Slide, i: number, count: number, row: number, k: string, v: string, color = primary) => {
    const cw = (W - 1.2) / count, x0 = 0.6 + i * cw + 0.06, y0 = row === 0 ? 1.15 : 2.75;
    s.addShape('roundRect', { x: x0, y: y0, w: cw - 0.12, h: 1.45, fill: { color: panel }, line: { color: line }, rectRadius: 0.08 });
    s.addText(k, { x: x0 + 0.1, y: y0 + 0.12, w: cw - 0.32, h: 0.3, fontSize: 9.5, color: faint, fontFace: font, align, rtlMode: rtl });
    s.addText(v, { x: x0 + 0.1, y: y0 + 0.45, w: cw - 0.32, h: 0.8, fontSize: 17, bold: true, color, fontFace: font, align, rtlMode: rtl });
  };
  const tableHead = (labels: string[]) => labels.map(l => ({ text: l, options: { bold: true, color: 'FFFFFF', fill: { color: primary }, fontFace: font } }));

  // ── 1 · Cover ──
  {
    const s = pres.addSlide();
    s.background = { color: primary };
    s.addShape('ellipse', { x: W - 2.2, y: -1, w: 3.4, h: 3.4, fill: { color: 'FFFFFF', transparency: 94 } });
    s.addShape('ellipse', { x: -1.2, y: H - 2.2, w: 3.6, h: 3.6, fill: { color: 'FFFFFF', transparency: 94 } });
    if (branding.logo) { try { s.addImage({ data: branding.logo, x: W / 2 - 0.55, y: 0.42, w: 1.1, h: 1.1 }); } catch { /* ignore */ } }
    s.addShape('roundRect', { x: W / 2 - 1.55, y: branding.logo ? 1.72 : 1.5, w: 3.1, h: 0.42, fill: { color: 'FFFFFF', transparency: 88 }, line: { color: 'FFFFFF', transparency: 60 }, rectRadius: 0.21 });
    s.addText(x.dBadge, { x: W / 2 - 1.55, y: branding.logo ? 1.72 : 1.5, w: 3.1, h: 0.42, fontSize: 11, bold: true, color: 'FFFFFF', align: 'center', fontFace: font });
    s.addText(projectName, { x: 0.5, y: 2.3, w: W - 1, h: 0.95, fontSize: 36, bold: true, color: 'FFFFFF', align: 'center', fontFace: font });
    if (p.info.projectTitleEn) s.addText(p.info.projectTitleEn, { x: 0.5, y: 3.2, w: W - 1, h: 0.4, fontSize: 15, color: 'D9E7EE', align: 'center', fontFace: font });
    const meta = [p.info.ownerName, p.info.wilaya, p.info.incubator || orgName].filter(Boolean).join('   ·   ');
    s.addText(meta, { x: 0.5, y: 3.75, w: W - 1, h: 0.4, fontSize: 12.5, color: 'EAF2F6', align: 'center', fontFace: font });
    s.addShape('roundRect', { x: W / 2 - 1.25, y: 4.35, w: 2.5, h: 0.62, fill: { color: 'FFFFFF', transparency: 86 }, line: { color: 'FFFFFF', transparency: 55 }, rectRadius: 0.1 });
    s.addText([
      { text: `${x.dScore}  `, options: { fontSize: 10.5, color: 'D9E7EE' } },
      { text: snap.score.toFixed(1), options: { fontSize: 20, bold: true, color: 'FFFFFF' } },
      { text: ' / 10', options: { fontSize: 11, color: 'D9E7EE' } },
    ], { x: W / 2 - 1.25, y: 4.35, w: 2.5, h: 0.62, align: 'center', valign: 'middle', fontFace: font });
  }

  // ── 2 · Project card ──
  {
    const s = baseSlide(2);
    addTitle(s, `${x.dCardT} — ${x.dCardD}`);
    const tiles: [string, string][] = [
      [t.tradeName, p.info.tradeName || t.na],
      [x.dLegal, legalLabel],
      [t.ownerName, p.info.ownerName || t.na],
      [t.wilaya, p.info.wilaya || t.na],
      [t.phone, p.info.phone || t.na],
      [x.dDate, p.info.preparedDate || new Date().toLocaleDateString('fr-DZ')],
    ];
    tiles.forEach(([k, v], i) => {
      const cw = (W - 1.2) / 3;
      const cx = 0.6 + (i % 3) * cw + 0.05, cy = 1.05 + Math.floor(i / 3) * 0.95;
      s.addShape('roundRect', { x: cx, y: cy, w: cw - 0.1, h: 0.82, fill: { color: panel }, line: { color: line }, rectRadius: 0.06 });
      s.addText(k, { x: cx + 0.1, y: cy + 0.08, w: cw - 0.2, h: 0.25, fontSize: 8.5, color: faint, fontFace: font, align, rtlMode: rtl });
      s.addText(v, { x: cx + 0.1, y: cy + 0.34, w: cw - 0.2, h: 0.42, fontSize: 12.5, bold: true, color: ink, fontFace: font, align, rtlMode: rtl });
    });
    txt(s, p.info.description || t.na, { x: 0.6, y: 3.05, w: W - 1.2, h: 1.15, fontSize: 12.5, color: sub, valign: 'top' });
    s.addShape('roundRect', { x: 0.6, y: 4.3, w: W - 1.2, h: 0.55, fill: { color: 'FFFFFF' }, line: { color: line }, rectRadius: 0.06 });
    s.addText(`${x.dCompletion}`, { x: 0.75, y: 4.3, w: 1.7, h: 0.55, fontSize: 10, color: faint, fontFace: font, align, rtlMode: rtl, valign: 'middle' });
    s.addShape('roundRect', { x: 2.5, y: 4.48, w: 4.6, h: 0.2, fill: { color: 'EAF0F3' }, rectRadius: 0.1 });
    s.addShape('roundRect', { x: 2.5, y: 4.48, w: Math.max(0.2, 4.6 * comp.percent / 100), h: 0.2, fill: { color: comp.percent >= 80 ? green : gold }, rectRadius: 0.1 });
    s.addText(`${comp.percent}%`, { x: 7.2, y: 4.3, w: 1.4, h: 0.55, fontSize: 12, bold: true, color: primary, fontFace: font, align: rtl ? 'left' : 'right', valign: 'middle' });
  }

  // ── 3 · Problem ──
  {
    const s = baseSlide(3);
    addTitle(s, `${t.dProblem} — ${t.dProblemT}`);
    txt(s, p.info.description || t.na, { x: 0.6, y: 1.1, w: W / 2 - 0.1, h: 1.7, fontSize: 13, color: ink, valign: 'top' });
    s.addText(bullets(lines(p.market.customers)) as never, { x: 0.6, y: 2.9, w: W / 2 - 0.1, h: 2.2, fontSize: 12, color: sub, ...bulletOpts });
    const segs = lines(p.market.customers).slice(0, 3);
    segs.forEach((c, i) => {
      s.addShape('roundRect', { x: W / 2 + 0.15, y: 1.15 + i * 1.15, w: W / 2 - 0.85, h: 1.0, fill: { color: panel }, line: { color: line }, rectRadius: 0.07 });
      s.addText(c, { x: W / 2 + 0.3, y: 1.15 + i * 1.15, w: W / 2 - 1.15, h: 1.0, fontSize: 11.5, bold: true, color: sub, fontFace: font, align, rtlMode: rtl, valign: 'middle' });
    });
  }

  // ── 4 · Solution ──
  {
    const s = baseSlide(4);
    addTitle(s, `${t.dSolution} — ${t.dSolutionT}`);
    lines(p.market.valueProp).slice(0, 4).forEach((v, i) => {
      const y0 = 1.15 + i * 0.85;
      s.addShape('roundRect', { x: 0.6, y: y0, w: W - 1.2, h: 0.72, fill: { color: 'E7F2EB' }, line: { color: 'C6DFD0' }, rectRadius: 0.07 });
      s.addText(`✓  ${v}`, { x: 0.8, y: y0, w: W - 1.6, h: 0.72, fontSize: 12.5, bold: true, color: '2A5646', fontFace: font, align, rtlMode: rtl, valign: 'middle' });
    });
    txt(s, `${t.bmcBlocks[1]}: ${lines(p.market.activities).join(' · ') || t.na}`, { x: 0.6, y: 4.75, w: W - 1.2, h: 0.6, fontSize: 10.5, color: sub, valign: 'top' });
  }

  // ── 5 · Market ──
  {
    const s = baseSlide(5);
    addTitle(s, `${t.dMarket} — ${t.dMarketT}`);
    s.addText(bullets(lines(p.market.customers).slice(0, 4)) as never, { x: 0.6, y: 1.15, w: W / 2 - 0.2, h: 2.3, fontSize: 12, color: ink, ...bulletOpts });
    const totalBuyers = p.market.personas.reduce((a, pe) => a + (pe.monthlyBuyers || 0), 0);
    const marginRate = snap.base.rev > 0 ? (snap.base.rev - snap.base.varCost) / snap.base.rev : 0;
    s.addShape('roundRect', { x: 0.6, y: 3.6, w: W / 2 - 0.35, h: 1.45, fill: { color: primary, transparency: 92 }, line: { color: primary, transparency: 70 }, rectRadius: 0.08 });
    s.addText(x.dBuyers, { x: 0.7, y: 3.7, w: W / 2 - 0.55, h: 0.3, fontSize: 10, color: faint, fontFace: font, align: 'center' });
    s.addText(totalBuyers.toLocaleString('fr-DZ'), { x: 0.7, y: 3.98, w: W / 2 - 0.55, h: 0.7, fontSize: 26, bold: true, color: primary, fontFace: font, align: 'center' });
    s.addText(`${x.dMargin}: ${(marginRate * 100).toFixed(0)}%`, { x: 0.7, y: 4.66, w: W / 2 - 0.55, h: 0.3, fontSize: 10, color: faint, fontFace: font, align: 'center' });
    if (p.market.personas.length) {
      const rows = p.market.personas.slice(0, 5).map(pe => [
        { text: pe.name || '—', options: { bold: true, fontFace: font } },
        { text: pe.ageRange || '—', options: { fontFace: font } },
        { text: pe.location || '—', options: { fontFace: font } },
        { text: (pe.monthlyBuyers || 0).toLocaleString('fr-DZ'), options: { fontFace: font } },
      ]);
      s.addTable([
        tableHead([t.peName, t.peAge, t.peLocation, t.peMonthly]),
        ...rows,
      ] as never, { x: W / 2 + 0.1, y: 1.2, w: W / 2 - 0.7, fontSize: 10.5, align: rtl ? 'right' : 'left', border: { pt: 0.5, color: line }, valign: 'middle' });
    }
  }

  // ── 6 · Competitors & SWOT ──
  {
    const s = baseSlide(6);
    addTitle(s, `${x.dCompSwot} — ${x.dCompSwotT}`);
    if (p.market.competitors.length) {
      const rows = p.market.competitors.slice(0, 3).map(cp => [
        { text: cp.name || '—', options: { bold: true, fontFace: font } },
        { text: cp.offer || '—', options: { fontFace: font } },
        { text: cp.edge || '—', options: { fontFace: font } },
      ]);
      s.addTable([tableHead([t.compName, t.compOffer, t.compEdge]), ...rows] as never,
        { x: 0.6, y: 1.05, w: W - 1.2, fontSize: 10, align: rtl ? 'right' : 'left', border: { pt: 0.5, color: line } });
    }
    const q = (x0: number, y0: number, w: number, h: number, label: string, items: string[], head: string, bg: string, bd: string) => {
      s.addShape('roundRect', { x: x0, y: y0, w, h, fill: { color: bg }, line: { color: bd }, rectRadius: 0.07 });
      s.addText(label, { x: x0 + 0.12, y: y0 + 0.05, w: w - 0.24, h: 0.3, fontSize: 10.5, bold: true, color: head, fontFace: font, align, rtlMode: rtl });
      s.addText(bullets(items.slice(0, 3)) as never, { x: x0 + 0.18, y: y0 + 0.36, w: w - 0.36, h: h - 0.44, fontSize: 9, color: sub, ...bulletOpts });
    };
    const qw = (W - 1.3) / 2, qh = 1.42;
    q(0.6, 2.6, qw, qh, t.swotS, p.market.swot.strengths, green, 'E7F2EB', 'C6DFD0');
    q(0.6 + qw + 0.1, 2.6, qw, qh, t.swotW, p.market.swot.weaknesses, red, 'F7E7E5', 'E8C7C3');
    q(0.6, 2.6 + qh + 0.1, qw, qh, t.swotO, p.market.swot.opportunities, primary, 'EAF0F5', 'C9DAE5');
    q(0.6 + qw + 0.1, 2.6 + qh + 0.1, qw, qh, t.swotT, p.market.swot.threats, amber, 'F6EFDD', 'E5D5AE');
  }

  // ── 7 · BMC ──
  {
    const s = baseSlide(7);
    addTitle(s, `${t.dBmc} — ${t.dBmcT}`);
    const cells: [string, string][] = [
      [t.bmcBlocks[0], lines(p.market.partners).slice(0, 3).join(' · ') || t.na],
      [t.bmcBlocks[1], lines(p.market.activities).slice(0, 3).join(' · ') || t.na],
      [t.bmcBlocks[3], lines(p.market.valueProp).slice(0, 3).join(' · ') || t.na],
      [t.bmcBlocks[5], lines(p.market.channels).slice(0, 3).join(' · ') || t.na],
      [t.bmcBlocks[6], lines(p.market.customers).slice(0, 3).join(' · ') || t.na],
      [t.bmcBlocks[7], `${money(snap.fixed)} / ${t.monthUnit}`],
      [t.bmcBlocks[8], `${money(snap.base.rev)} / ${t.monthUnit}`],
    ];
    s.addTable(cells.map(([k, v]) => ([
      { text: k, options: { bold: true, color: 'FFFFFF', fill: { color: primary }, fontFace: font } },
      { text: v, options: { fontFace: font } },
    ])) as never, { x: 0.6, y: 1.15, w: W - 1.2, fontSize: 10.5, border: { pt: 0.5, color: line }, align: rtl ? 'right' : 'left' });
    txt(s, x.dBmcHint, { x: 0.6, y: 4.9, w: W - 1.2, h: 0.3, fontSize: 9, italic: true, color: faint });
  }

  // ── 8 · Revenue model ──
  {
    const s = baseSlide(8);
    addTitle(s, `${t.dModel} — ${t.dModelT}`);
    const head = tableHead([t.productName, t.revenueModel, t.pPrice, t.pQty, t.ueMonthlyRev, t.ueMonthlyMargin]);
    const rows = p.products.filter(z => z.name).map(z => {
      const rev = z.model === 'fixed' ? z.price * z.qty : z.model === 'commission' ? z.deal * (z.commission / 100) * z.deals : z.sub * z.subs;
      const marg = z.model === 'fixed' ? (z.price - z.variable) * z.qty : z.model === 'commission' ? (z.deal * z.commission / 100 - z.dealCost) * z.deals : (z.sub - z.subCost) * z.subs;
      return [
        { text: z.name, options: { bold: true, fontFace: font } },
        { text: { fixed: t.rmFixed, commission: t.rmCommission, subscription: t.rmSubscription }[z.model], options: { fontFace: font } },
        { text: money(z.model === 'fixed' ? z.price : z.model === 'commission' ? z.deal * z.commission / 100 : z.sub), options: { fontFace: font } },
        { text: Math.round(z.model === 'fixed' ? z.qty : z.model === 'commission' ? z.deals : z.subs).toLocaleString('fr-DZ'), options: { fontFace: font } },
        { text: money(rev), options: { fontFace: font } },
        { text: money(marg), options: { fontFace: font, color: marg >= 0 ? green : red } },
      ];
    });
    if (rows.length) {
      s.addTable([head, ...rows, [
        { text: t.total, options: { bold: true, color: 'FFFFFF', fill: { color: primaryDark }, fontFace: font, colSpan: 4 } },
        { text: money(snap.base.rev), options: { bold: true, color: 'FFFFFF', fill: { color: primaryDark }, fontFace: font } },
        { text: money(snap.base.rev - snap.base.varCost), options: { bold: true, color: 'FFFFFF', fill: { color: primaryDark }, fontFace: font } },
      ]] as never, { x: 0.6, y: 1.15, w: W - 1.2, fontSize: 10.5, border: { pt: 0.5, color: line }, align: rtl ? 'right' : 'left' });
    }
    const marginRate = snap.base.rev > 0 ? (snap.base.rev - snap.base.varCost) / snap.base.rev : 0;
    kpiCard(s, 0, 3, 1, x.dMargin, `${(marginRate * 100).toFixed(0)}%`, marginRate >= 0.3 ? green : amber);
    kpiCard(s, 1, 3, 1, t.fixedMonthlyTotal, money(snap.fixed));
    kpiCard(s, 2, 3, 1, t.kpiNetMonthly, money(snap.netMonthly), snap.netMonthly >= 0 ? green : red);
  }

  // ── 9 · Numbers ──
  {
    const s = baseSlide(9);
    addTitle(s, `${t.dNumbers} — ${t.dNumbersT}`);
    kpiCard(s, 0, 3, 0, t.kpiMonthlyRev, money(snap.base.rev));
    kpiCard(s, 1, 3, 0, t.kpiNetMonthly, money(snap.netMonthly), snap.netMonthly >= 0 ? green : red);
    kpiCard(s, 2, 3, 0, t.kpiFixed, money(snap.fixed));
    kpiCard(s, 0, 3, 1, t.kpiBreakEven, snap.be.breakEvenMonths > 0 ? `${snap.be.breakEvenMonths.toFixed(1)} ${t.monthUnit}` : t.na);
    kpiCard(s, 1, 3, 1, t.kpiBudget, money(budget.total));
    kpiCard(s, 2, 3, 1, t.kpiScore, `${snap.score.toFixed(1)}/10`, gold);
    txt(s, `${x.dTaxLine}: ${snap.taxY1.regime === 'exemptManual' || snap.taxY1.regime === 'exemptStartup' || snap.taxY1.regime === 'exemptPatent' ? '' : `${(snap.taxY1.rate * 100).toFixed(0)}% `}${t.trIbs} / IFU`, { x: 0.6, y: 4.42, w: (W - 1.2) / 2 - 0.1, h: 0.5, fontSize: 11, color: sub, valign: 'middle' });
    txt(s, `${t.indVa}: ${money(snap.year1.va)}   |   EBE: ${money(snap.year1.ebe)}`, { x: (W - 1.2) / 2 + 0.5, y: 4.42, w: (W - 1.2) / 2 - 0.1, h: 0.5, fontSize: 11, color: sub, valign: 'middle' });
  }

  // ── 10 · Investment & financing ──
  {
    const s = baseSlide(10);
    addTitle(s, `${x.dInvest} — ${x.dInvestT}`);
    const rows = snap.assets.rows.slice(0, 5).map(r => ([
      { text: r.name, options: { bold: true, fontFace: font } },
      { text: money(r.value), options: { fontFace: font, align: rtl ? 'left' : 'right' } },
    ]));
    s.addTable([
      tableHead([x.dAssetsHead, '']),
      ...rows,
      [
        { text: x.dAssetsTotal, options: { bold: true, color: 'FFFFFF', fill: { color: primaryDark }, fontFace: font } },
        { text: money(snap.assets.invest), options: { bold: true, color: 'FFFFFF', fill: { color: primaryDark }, fontFace: font, align: rtl ? 'left' : 'right' } },
      ],
    ] as never, { x: 0.6, y: 1.1, w: (W - 1.2) / 2 - 0.15, fontSize: 9.5, border: { pt: 0.5, color: line }, align: rtl ? 'right' : 'left' });
    txt(s, `${x.dWC}: ${money(budget.workingCapital)}    ${x.dPreStart}: ${money(p.funding.preStartCosts)}`, { x: 0.6, y: 4.0, w: (W - 1.2) / 2 - 0.15, h: 0.35, fontSize: 10, color: sub });
    txt(s, `${x.dNeed}: ${money(need)}`, { x: 0.6, y: 4.35, w: (W - 1.2) / 2 - 0.15, h: 0.4, fontSize: 13, bold: true, color: primary });
    // funding bars
    const self = p.funding.selfFunding, grant = p.funding.grantAmount, loan = p.funding.hasLoan === 'yes' ? p.funding.loanAmount : 0;
    const tot = Math.max(self + grant + loan, 1);
    const barX = W / 2 + 0.15, barW = W / 2 - 0.9;
    const bars: [string, number, string][] = [[x.dSelf, self, green], [x.dGrant, grant, gold], [x.dLoan, loan, primary]];
    txt(s, x.dFinStruct, { x: barX, y: 1.02, w: barW, h: 0.3, fontSize: 10.5, bold: true, color: faint });
    bars.forEach(([label, val, color], i) => {
      const y0 = 1.38 + i * 0.62;
      txt(s, `${label} — ${money(val)} (${Math.round(val / tot * 100)}%)`, { x: barX, y: y0 - 0.02, w: barW, h: 0.28, fontSize: 9.5, bold: true, color: sub });
      s.addShape('roundRect', { x: barX, y: y0 + 0.24, w: barW, h: 0.18, fill: { color: 'EAF0F3' }, rectRadius: 0.09 });
      s.addShape('roundRect', { x: rtl ? barX + barW * (1 - Math.max(0.02, val / tot)) : barX, y: y0 + 0.24, w: Math.max(0.08, barW * (val / tot)), h: 0.18, fill: { color }, rectRadius: 0.09 });
    });
    const gapOk = snap.financingGap <= 0;
    s.addShape('roundRect', { x: barX, y: 3.35, w: barW, h: 0.5, fill: { color: gapOk ? 'E7F2EB' : 'F7E7E5' }, line: { color: gapOk ? 'C6DFD0' : 'E8C7C3' }, rectRadius: 0.06 });
    txt(s, gapOk ? `✓ ${x.dGapOk}` : `⚠ ${x.dGapBad}: ${money(snap.financingGap)}`, { x: barX + 0.1, y: 3.35, w: barW - 0.2, h: 0.5, fontSize: 10.5, bold: true, color: gapOk ? green : red, valign: 'middle' });
    txt(s, `${x.dPrograms}: ${programs.join(' · ') || t.na}`, { x: barX, y: 3.98, w: barW, h: 0.9, fontSize: 10, color: sub, valign: 'top' });
  }

  // ── 11 · Treasury ──
  {
    const s = baseSlide(11);
    addTitle(s, `${t.dBreakeven} — ${t.dBeT}`);
    const cum = snap.cashRows.map(r => Math.round(r.cumulative / 1e5) / 10);
    try {
      const CT = pres.ChartType;
      s.addChart(CT.line, [
        { name: x.dTreasury, labels: snap.cashRows.map(r => `${r.m}`), values: cum },
      ], {
        x: 0.6, y: 1.15, w: W - 1.2, h: 2.9,
        chartColors: [primary], lineSize: 2.5, lineDataSymbol: 'circle', lineDataSymbolSize: 5,
        catAxisLabelColor: faint, valAxisLabelColor: faint, catAxisLabelFontSize: 9, valAxisLabelFontSize: 9,
        catAxisLabelFontFace: font, valAxisLabelFontFace: font,
        showLegend: false, showTitle: false, valGridLine: { style: 'solid', size: 0.5, color: line },
      });
    } catch { /* chart fallback: numbers only */ }
    txt(s, x.dTreasury + (lang === 'ar' ? ' (مليون دج)' : lang === 'fr' ? ' (M DA)' : ' (M DZD)'), { x: 0.6, y: 4.02, w: W - 1.2, h: 0.3, fontSize: 9.5, color: faint, align: 'center' });
    kpiCard(s, 0, 3, 1, t.indMinTreasury, money(snap.minCash), snap.minCash >= 0 ? green : red);
    kpiCard(s, 1, 3, 1, t.kpiBreakEven, snap.be.breakEvenMonths > 0 ? `${snap.be.breakEvenMonths.toFixed(1)} ${t.monthUnit}` : t.na);
    const cashGap = Math.max(0, Math.abs(Math.min(...snap.cashRows.map(r => r.cumulative), 0)));
    kpiCard(s, 2, 3, 1, t.cashGapRows[4], money(cashGap), cashGap > 0 ? amber : green);
  }

  // ── 12 · 5-year growth ──
  {
    const s = baseSlide(12);
    addTitle(s, `${x.dGrowth} — ${x.dGrowthT}`);
    const years = [1, 2, 3, 4, 5].map(y => {
      const sy = buildScfYear(p, y, p.market.growthReal / 100);
      return { y, rev: sy.rev, net: sy.net, ebe: sy.ebe, va: sy.va };
    });
    const yLabels = years.map(yy => (lang === 'ar' ? `س${yy.y}` : lang === 'fr' ? `A${yy.y}` : `Y${yy.y}`));
    const revM = years.map(yy => Math.round(yy.rev / 1e5) / 10);
    const netM = years.map(yy => Math.round(yy.net / 1e5) / 10);
    try {
      const CT = pres.ChartType;
      s.addChart(CT.bar, [{ name: x.dRev5y, labels: yLabels, values: revM }], {
        x: 0.6, y: 1.15, w: (W - 1.2) / 2 - 0.1, h: 2.8,
        chartColors: [primary], barGapWidthPct: 60,
        catAxisLabelColor: faint, valAxisLabelColor: faint, catAxisLabelFontSize: 9, valAxisLabelFontSize: 9,
        catAxisLabelFontFace: font, valAxisLabelFontFace: font, showLegend: false, showTitle: false,
      });
      s.addChart(CT.bar, [{ name: x.dNet5y, labels: yLabels, values: netM }], {
        x: W / 2 + 0.1, y: 1.15, w: (W - 1.2) / 2 - 0.1, h: 2.8,
        chartColors: [green], barGapWidthPct: 60,
        catAxisLabelColor: faint, valAxisLabelColor: faint, catAxisLabelFontSize: 9, valAxisLabelFontSize: 9,
        catAxisLabelFontFace: font, valAxisLabelFontFace: font, showLegend: false, showTitle: false,
      });
    } catch { /* ignore */ }
    txt(s, `${x.dRev5y}${lang === 'ar' ? ' (مليون دج)' : lang === 'fr' ? ' (M DA)' : ' (M DZD)'}`, { x: 0.6, y: 3.95, w: (W - 1.2) / 2 - 0.1, h: 0.3, fontSize: 9.5, color: faint, align: 'center' });
    txt(s, x.dNet5y, { x: W / 2 + 0.1, y: 3.95, w: (W - 1.2) / 2 - 0.1, h: 0.3, fontSize: 9.5, color: faint, align: 'center' });
    kpiCard(s, 0, 3, 1, `EBE — ${yLabels[2]}`, md(years[2].ebe));
    kpiCard(s, 1, 3, 1, `${t.indVa} — ${yLabels[2]}`, md(years[2].va));
    kpiCard(s, 2, 3, 1, `${t.kpiNetMonthly} — ${yLabels[4]}`, md(years[4].net), years[4].net >= 0 ? green : red);
  }

  // ── 13 · Team & contact ──
  {
    const s = baseSlide(13);
    addTitle(s, `${t.dTeam} — ${t.dTeamT}`);
    const tiles: [string, string][] = [
      [t.ownerName, p.info.ownerName || t.na],
      [t.phone, p.info.phone || t.na],
      [t.wilaya, p.info.wilaya || t.na],
      [t.incubator, p.info.incubator || orgName],
      [x.dLegal, legalLabel],
      [x.dCompletion, `${comp.percent}%`],
    ];
    tiles.forEach(([k, v], i) => {
      const cw = (W - 1.2) / 3;
      const cx = 0.6 + (i % 3) * cw + 0.05, cy = 1.1 + Math.floor(i / 3) * 0.95;
      s.addShape('roundRect', { x: cx, y: cy, w: cw - 0.1, h: 0.82, fill: { color: panel }, line: { color: line }, rectRadius: 0.06 });
      s.addText(k, { x: cx + 0.1, y: cy + 0.08, w: cw - 0.2, h: 0.25, fontSize: 8.5, color: faint, fontFace: font, align, rtlMode: rtl });
      s.addText(v, { x: cx + 0.1, y: cy + 0.34, w: cw - 0.2, h: 0.42, fontSize: 12.5, bold: true, color: ink, fontFace: font, align, rtlMode: rtl });
    });
    s.addShape('roundRect', { x: 0.6, y: 3.2, w: (W - 1.2) / 2 - 0.1, h: 1.7, fill: { color: panel }, line: { color: line }, rectRadius: 0.08 });
    s.addText(bullets(lines(p.market.valueProp).slice(0, 3)) as never, { x: 0.75, y: 3.32, w: (W - 1.2) / 2 - 0.4, h: 1.5, fontSize: 11, color: sub, ...bulletOpts });
    s.addShape('roundRect', { x: W / 2 + 0.1, y: 3.2, w: (W - 1.2) / 2 - 0.1, h: 1.7, fill: { color: primary, transparency: 93 }, line: { color: primary, transparency: 72 }, rectRadius: 0.08 });
    txt(s, `${x.dContact}\n${p.info.ownerName || t.na} — ${p.info.phone || t.na}\n${p.info.wilaya || t.na} · ${p.info.incubator || orgName}`, { x: W / 2 + 0.25, y: 3.32, w: (W - 1.2) / 2 - 0.4, h: 1.5, fontSize: 11.5, bold: true, color: primary, valign: 'top' });
  }

  // ── 14 · Closing ──
  {
    const s = pres.addSlide();
    s.background = { color: primary };
    s.addShape('ellipse', { x: -1, y: -1.2, w: 3.2, h: 3.2, fill: { color: 'FFFFFF', transparency: 94 } });
    s.addText(x.dClosingAsk.toUpperCase(), { x: 0.5, y: 1.15, w: W - 1, h: 0.35, fontSize: 11, bold: true, color: 'BFD5E0', align: 'center', fontFace: font, charSpacing: 2 });
    s.addText(money(need), { x: 0.5, y: 1.5, w: W - 1, h: 0.9, fontSize: 40, bold: true, color: 'FFFFFF', align: 'center', fontFace: font });
    s.addText(t.dClosingT, { x: 0.5, y: 2.75, w: W - 1, h: 0.6, fontSize: 24, bold: true, color: 'FFFFFF', align: 'center', fontFace: font });
    const meta = [p.info.ownerName, p.info.phone, p.info.wilaya].filter(Boolean).join('   ·   ');
    s.addText(meta, { x: 0.5, y: 3.55, w: W - 1, h: 0.4, fontSize: 13, color: 'EAF2F6', align: 'center', fontFace: font });
    s.addText(orgName, { x: 0.5, y: 4.6, w: W - 1, h: 0.35, fontSize: 10.5, color: 'BFD5E0', align: 'center', fontFace: font });
  }

  await pres.writeFile({ fileName: `pitch-deck-${(p.name || 'project').replace(/\s+/g, '-').slice(0, 30)}.pptx` });
}
