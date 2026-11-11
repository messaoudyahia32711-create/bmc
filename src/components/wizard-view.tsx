'use client';
// ─── Wizard: the 8-step project editor ───────────────────────────────────────
import React, { useMemo, useState } from 'react';
import { useApp } from './app-context';
import { Project, Lang, newProduct, newAsset, newPersona, newCompetitor, Product, Asset } from '@/lib/types';
import {
  computeSnapshot, estimateFirstSalesMonth, suggestAssetsByProjectType, defaultYears,
  defaultAccount, getStartupBudget, getSmartFunding, autoLoanSettings,
  getSuggestedExemptionInfo, calculateTax, assetTotals,
} from '@/lib/engine';
import { coach } from '@/lib/coach';
import { completeness, indicators, personaCheck } from '@/lib/analytics';
import { matchPrograms, LEGAL_ROWS, legalRecommendation } from '@/lib/knowledge';
import { bmcHint } from '@/lib/bmc-hints';
import { money as fmtMoney, todayStr } from '@/lib/format';
import { Field, NumField, TextField, AreaField, SectionCard, AlertCalm, KpiCard, CompletenessMeter, PopHint } from './wizard-parts';
import { MonthlyResultsChart, AppendixBreakEven, AppendixScenario, AppendixDetailedRevenue, AppendixAssets, AppendixFinancing, AppendixLoan, AppendixCashflow, AppendixCashGap, AppendixTax, AppendixSCF, AppendixBMC, AppendixBMCFinance } from './appendices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ChevronRight, ChevronLeft, Info, Tag, Package, Wallet, Factory, Landmark,
  Users2, Gauge, ShieldCheck, Bot, FileText, Presentation, Save, Trash2, Plus,
  Lightbulb, Scale, HandCoins, CircleHelp, ListChecks, MessagesSquare, UserRound,
} from 'lucide-react';

export type View = 'home' | 'wizard' | 'report' | 'deck' | 'settings';

export function WizardView({ p, update, saving, onHome, onReport, onDeck }: {
  p: Project;
  update: (fn: (draft: Project) => void) => void;
  saving: boolean;
  onHome: () => void;
  onReport: () => void;
  onDeck: () => void;
}) {
  const { t, lang, branding } = useApp();
  const [step, setStep] = useState(0);
  const m = (n: number) => fmtMoney(n, lang);
  const snap = useMemo(() => computeSnapshot(p), [p]);
  const comp = useMemo(() => completeness(p), [p]);
  const c = coach(p, lang, m);
  const icons = [Info, Tag, Package, Wallet, Factory, Landmark, Users2, Gauge];
  const StepIcon = icons[step];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="sm" onClick={onHome} className="gap-1 shrink-0">{lang === 'ar' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}{t.backToApp}</Button>
          <div className="min-w-0">
            <div className="truncate font-bold font-heading">{p.name || t.untitled}</div>
            <div className="flex items-center gap-1 text-[11.5px] text-muted-foreground">
              {saving ? <><Save className="h-3 w-3 animate-pulse" />{t.saving}</> : <><Save className="h-3 w-3 text-ok" />{t.autosaved}</>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={onDeck}><Presentation className="h-4 w-4" />{t.deckTitle.split(' ')[0]}</Button>
          <Button size="sm" className="gap-1.5" onClick={onReport}><FileText className="h-4 w-4" />{t.exportReport}</Button>
        </div>
      </div>

      {/* steps nav */}
      <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {t.steps.map((s, i) => {
          const Icon = icons[i];
          return (
            <button key={i} onClick={() => setStep(i)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition ${i === step ? 'border-primary bg-primary text-primary-foreground shadow-sm' : i < step ? 'border-primary/30 bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/40'}`}>
              <Icon className="h-3.5 w-3.5" />{i + 1}. {s}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="min-w-0">
          {step === 0 && <StepInfo p={p} update={update} />}
          {step === 1 && <StepType p={p} update={update} />}
          {step === 2 && <StepProducts p={p} update={update} />}
          {step === 3 && <StepFixed p={p} update={update} />}
          {step === 4 && <StepAssets p={p} update={update} />}
          {step === 5 && <StepFunding p={p} update={update} />}
          {step === 6 && <StepMarket p={p} update={update} />}
          {step === 7 && <StepOutput p={p} snap={snap} coach={c} comp={comp} update={update} onReport={onReport} onDeck={onDeck} />}
        </div>

        {/* sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-4 self-start">
          <SectionCard title={t.completenessTitle} icon={<ListChecks className="h-4.5 w-4.5" />}>
            <CompletenessMeter percent={comp.percent} />
            <div className="mt-3 space-y-1.5">
              {comp.checks.map(chk => (
                <div key={chk.key} className="flex items-start gap-1.5 text-[12px]">
                  <span className={chk.done ? 'text-ok' : 'text-muted-foreground/50'}>{chk.done ? '✓' : '○'}</span>
                  <span className={chk.done ? 'text-muted-foreground line-through decoration-border' : ''}>{(t as unknown as Record<string, string>)[chk.key]}</span>
                </div>
              ))}
            </div>
            {comp.percent >= 100 && <AlertCalm tone="ok"><span className="text-[12.5px]">{t.complete}</span></AlertCalm>}
          </SectionCard>

          <SectionCard title={t.kpiScore} icon={<Bot className="h-4.5 w-4.5" />}>
            <div className="flex items-center gap-3">
              <div className={`rounded-xl px-3 py-2 text-2xl font-extrabold font-heading num ${c.tone === 'ok' ? 'bg-[var(--ok-bg)] text-[var(--ok)]' : c.tone === 'warn' ? 'bg-[var(--warn-bg)] text-[var(--warn)]' : 'bg-[var(--bad-bg)] text-[var(--bad)]'}`}>
                {snap.score.toFixed(1)}<span className="text-sm opacity-70">/10</span>
              </div>
              <div className="text-[12px] leading-snug text-muted-foreground">{c.statusText}</div>
            </div>
          </SectionCard>

          <div className="rounded-xl border border-border/70 bg-secondary/50 p-3.5 text-[12px] leading-relaxed text-muted-foreground flex gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-ok mt-0.5" />
            <span>{t.privacyLines[1]} {t.privacyLines[2]}</span>
          </div>
        </aside>
      </div>

      {/* footer nav */}
      <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)} className="gap-1">
          {lang === 'ar' ? <><ChevronRight className="h-4 w-4" />{t.prev}</> : <><ChevronLeft className="h-4 w-4" />{t.prev}</>}
        </Button>
        <span className="text-[12px] text-muted-foreground">{step + 1} / {t.steps.length}</span>
        {step < 7 ? (
          <Button onClick={() => setStep(s => s + 1)} className="gap-1">
            {t.next}{lang === 'ar' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <Button onClick={onReport} className="gap-1.5"><FileText className="h-4 w-4" />{t.generateBtn}</Button>
        )}
      </div>
    </div>
  );
}

// ── Step 1: project info ─────────────────────────────────────────────────────
function StepInfo({ p, update }: { p: Project; update: (fn: (d: Project) => void) => void }) {
  const { t, branding } = useApp();
  return (
    <div className="space-y-4">
      <SectionCard title={t.infoTitle} icon={<Info className="h-5 w-5" />} desc={branding.orgName ? `${t.incubator}: ${branding.orgName}` : undefined}>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <TextField label={t.projectName} value={p.name} onChange={v => update(d => { d.name = v; })} />
          <TextField label={t.projectTitleAr} value={p.info.projectTitleAr} onChange={v => update(d => { d.info.projectTitleAr = v; })} />
          <TextField label={t.projectTitleEn} value={p.info.projectTitleEn} onChange={v => update(d => { d.info.projectTitleEn = v; })} />
          <TextField label={t.tradeName} value={p.info.tradeName} onChange={v => update(d => { d.info.tradeName = v; })} />
          <Field label={t.legal}>
            <Select value={p.info.legal} onValueChange={v => update(d => { d.info.legal = v as Project['info']['legal']; })}>
              <SelectTrigger className="bg-white/80 dark:bg-card"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="micro">{t.legalMicro}</SelectItem>
                <SelectItem value="startup">{t.legalStartup}</SelectItem>
                <SelectItem value="patent">{t.legalPatent}</SelectItem>
                <SelectItem value="other">{t.legalOther}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <TextField label={t.ownerName} value={p.info.ownerName} onChange={v => update(d => { d.info.ownerName = v; })} />
          <TextField label={t.phone} value={p.info.phone} onChange={v => update(d => { d.info.phone = v; })} />
          <TextField label={t.wilaya} value={p.info.wilaya} onChange={v => update(d => { d.info.wilaya = v; })} />
          <TextField label={t.incubator} value={p.info.incubator} onChange={v => update(d => { d.info.incubator = v; })} hint={t.pg1275} />
          <TextField label={t.preparedDate} value={p.info.preparedDate} placeholder={todayStr('ar')} onChange={v => update(d => { d.info.preparedDate = v; })} />
          <AreaField className="sm:col-span-2" label={t.description} rows={3} value={p.info.description} onChange={v => update(d => { d.info.description = v; })} />
        </div>
      </SectionCard>
    </div>
  );
}

// ── Step 2: type & tax + legal advisor ───────────────────────────────────────
function StepType({ p, update }: { p: Project; update: (fn: (d: Project) => void) => void }) {
  const { t, lang } = useApp();
  const rec = legalRecommendation(p);
  const recName = { micro: t.legalMicro, startup: t.legalStartup, patent: t.legalPatent, other: t.legalOther }[rec.key as never];
  return (
    <div className="space-y-4">
      <SectionCard title={t.typeTitle} icon={<Tag className="h-5 w-5" />}>
        <div className="space-y-4">
          <div>
            <div className="text-[13px] font-medium text-muted-foreground mb-2">{t.projectNature}</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(['service', 'industrial', 'commercial', 'digital'] as const).map(k => {
                const checked = p.type.types.includes(k);
                const label = { service: t.tService, industrial: t.tIndustrial, commercial: t.tCommercial, digital: t.tDigital }[k];
                return (
                  <label key={k} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-medium transition ${checked ? 'border-primary bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/40'}`}>
                    <Checkbox checked={checked} onCheckedChange={v => update(d => {
                      const set = new Set(d.type.types);
                      if (v) set.add(k); else { set.delete(k); if (!set.size) set.add(k); }
                      d.type.types = [...set];
                    })} />
                    {label}
                  </label>
                );
              })}
            </div>
          </div>
          <Field label={t.fiscalNature}>
            <Select value={p.type.fiscalActivity} onValueChange={v => update(d => { d.type.fiscalActivity = v as Project['type']['fiscalActivity']; })}>
              <SelectTrigger className="bg-white/80 dark:bg-card"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="commercial">{t.faCommercial}</SelectItem>
                <SelectItem value="services">{t.faServices}</SelectItem>
                <SelectItem value="production">{t.faProduction}</SelectItem>
                <SelectItem value="mixed">{t.faMixed}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <AlertCalm tone="warn"><span className="text-[12.5px]">{t.ifuNote}</span></AlertCalm>
        </div>
      </SectionCard>

      <SectionCard title={t.legalAdvisor} icon={<Scale className="h-5 w-5" />} desc={t.legalCompare}>
        <AlertCalm tone="ok">
          <div className="text-[13px]"><strong>{t.yourRecommendation}: {recName}</strong> — {rec.why[lang]}</div>
        </AlertCalm>
        <div className="mt-3 overflow-x-auto rounded-xl border border-border/70">
          <table className="fin-table">
            <thead><tr><th>{t.tableForm}</th><th>{t.tableTax}</th><th>{t.tableSocial}</th><th>{t.tableBest}</th></tr></thead>
            <tbody>
              {LEGAL_ROWS.map(r => (
                <tr key={r.id} className={r.id === rec.key ? 'subtotal-row' : ''}>
                  <td className="font-semibold">{({ micro: t.legalMicro, startup: t.legalStartup, patent: t.legalPatent, other: t.legalOther } as Record<string, string>)[r.id]}</td>
                  <td className="text-muted-foreground">{r.tax[lang]}</td>
                  <td className="text-muted-foreground">{r.social[lang]}</td>
                  <td className="text-muted-foreground">{r.best[lang]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Step 3: products ─────────────────────────────────────────────────────────
function StepProducts({ p, update }: { p: Project; update: (fn: (d: Project) => void) => void }) {
  const { t } = useApp();
  const hintOf = (cat: string) => ({ service: t.hintService, trade: t.hintTrade, industrial: t.hintIndustrial, digital: t.hintDigital }[cat as never] || '');
  return (
    <div className="space-y-4">
      <SectionCard title={t.productsTitle} icon={<Package className="h-5 w-5" />} desc={t.productsNote}>
        <div className="space-y-4">
          {p.products.map((prod, idx) => <ProductCard key={prod.id} prod={prod} p={p} update={update} idx={idx} hint={hintOf(prod.category)} />)}
          <Button variant="outline" className="gap-1.5" onClick={() => update(d => { d.products.push(newProduct()); })}><Plus className="h-4 w-4" />{t.addProduct}</Button>
        </div>
      </SectionCard>
    </div>
  );
}

function ProductCard({ prod, p, update, idx, hint }: { prod: Product; p: Project; update: (fn: (d: Project) => void) => void; idx: number; hint: string }) {
  const { t, lang } = useApp();
  const set = (fn: (x: Product) => void) => update(d => fn(d.products[idx]));
  const ue = (() => {
    if (prod.model === 'fixed') return { margin: prod.price - prod.variable, rate: prod.price > 0 ? (prod.price - prod.variable) / prod.price : 0, rev: prod.price * prod.qty, mrev: (prod.price - prod.variable) * prod.qty };
    if (prod.model === 'commission') return { margin: prod.deal * prod.commission / 100 - prod.dealCost, rate: prod.deal * prod.commission / 100 > 0 ? (prod.deal * prod.commission / 100 - prod.dealCost) / (prod.deal * prod.commission / 100) : 0, rev: prod.deal * (prod.commission / 100) * prod.deals, mrev: (prod.deal * prod.commission / 100 - prod.dealCost) * prod.deals };
    return { margin: prod.sub - prod.subCost, rate: prod.sub > 0 ? (prod.sub - prod.subCost) / prod.sub : 0, rev: prod.sub * prod.subs, mrev: (prod.sub - prod.subCost) * prod.subs };
  })();
  const money = (n: number) => fmtMoney(n, lang);
  return (
    <div className="rounded-xl border border-border/70 bg-white/60 dark:bg-card p-4">
      <div className="grid gap-3.5 sm:grid-cols-4">
        <TextField label={t.productName} value={prod.name} onChange={v => set(x => { x.name = v; })} />
        <Field label={t.revenueModel}>
          <Select value={prod.model} onValueChange={v => set(x => { x.model = v as Product['model']; })}>
            <SelectTrigger className="bg-white/80 dark:bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">{t.rmFixed}</SelectItem>
              <SelectItem value="commission">{t.rmCommission}</SelectItem>
              <SelectItem value="subscription">{t.rmSubscription}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label={t.category}>
          <Select value={prod.category} onValueChange={v => set(x => { x.category = v as Product['category']; })}>
            <SelectTrigger className="bg-white/80 dark:bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="service">{t.catService}</SelectItem>
              <SelectItem value="trade">{t.catTrade}</SelectItem>
              <SelectItem value="industrial">{t.catIndustrial}</SelectItem>
              <SelectItem value="digital">{t.catDigital}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <div className="flex items-end">
          <Button size="sm" variant="ghost" className="gap-1 text-destructive hover:text-destructive" onClick={() => update(d => { d.products = d.products.filter(x => x.id !== prod.id); if (!d.products.length) d.products.push(newProduct()); })}>
            <Trash2 className="h-3.5 w-3.5" />{t.delProduct}
          </Button>
        </div>
      </div>
      {prod.model === 'fixed' && (
        <div className="mt-3 grid gap-3.5 sm:grid-cols-4">
          <NumField label={t.pPrice} value={prod.price} onChange={v => set(x => { x.price = v; })} />
          <NumField label={t.pVariable} value={prod.variable} onChange={v => set(x => { x.variable = v; })} />
          <NumField label={t.pQty} value={prod.qty} onChange={v => set(x => { x.qty = v; })} />
          <NumField label={t.pGrowth} value={prod.growth} onChange={v => set(x => { x.growth = v; })} />
        </div>
      )}
      {prod.model === 'commission' && (
        <div className="mt-3 grid gap-3.5 sm:grid-cols-4">
          <NumField label={t.pDeal} value={prod.deal} onChange={v => set(x => { x.deal = v; })} />
          <NumField label={t.pCommission} value={prod.commission} onChange={v => set(x => { x.commission = v; })} />
          <NumField label={t.pDeals} value={prod.deals} onChange={v => set(x => { x.deals = v; })} />
          <NumField label={t.pDealCost} value={prod.dealCost} onChange={v => set(x => { x.dealCost = v; })} />
        </div>
      )}
      {prod.model === 'subscription' && (
        <div className="mt-3 grid gap-3.5 sm:grid-cols-4">
          <NumField label={t.pSub} value={prod.sub} onChange={v => set(x => { x.sub = v; })} />
          <NumField label={t.pSubs} value={prod.subs} onChange={v => set(x => { x.subs = v; })} />
          <NumField label={t.pSubGrowth} value={prod.subGrowth} onChange={v => set(x => { x.subGrowth = v; })} />
          <NumField label={t.pSubCost} value={prod.subCost} onChange={v => set(x => { x.subCost = v; })} />
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <AlertCalm tone="ok"><span className="text-[12px]">{hint}</span></AlertCalm>
        {prod.model === 'fixed' && prod.price > 0 && prod.price <= prod.variable && <AlertCalm tone="bad"><span className="text-[12px]">⚠ {t.warnPriceBelowCost}</span></AlertCalm>}
        {prod.model === 'fixed' && prod.qty <= 0 && prod.price > 0 && <AlertCalm tone="warn"><span className="text-[12px]">⚠ {t.warnQtyZero}</span></AlertCalm>}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <KpiCard label={t.ueMargin} value={money(ue.margin)} />
        <KpiCard label={t.ueMarginRate} value={`${(ue.rate * 100).toFixed(1)}%`} tone={ue.rate >= 0.3 ? 'ok' : ue.rate >= 0.15 ? 'warn' : 'bad'} />
        <KpiCard label={t.ueMonthlyRev} value={money(ue.rev)} />
        <KpiCard label={t.ueMonthlyMargin} value={money(ue.mrev)} tone={ue.mrev > 0 ? 'ok' : 'bad'} />
      </div>
    </div>
  );
}

// ── Step 4: fixed costs + social charges simulator ───────────────────────────
function StepFixed({ p, update }: { p: Project; update: (fn: (d: Project) => void) => void }) {
  const { t, lang } = useApp();
  const [gross, setGross] = useState(30000);
  const [empRate, setEmpRate] = useState(26);
  const [empSelfRate, setEmpSelfRate] = useState(9);
  const [casnos, setCasnos] = useState(15);
  const employerCost = gross * (1 + empRate / 100);
  const employeeNet = gross * (1 - empSelfRate / 100);
  const money = (n: number) => fmtMoney(n, lang);
  return (
    <div className="space-y-4">
      <SectionCard title={t.fixedTitle} icon={<Wallet className="h-5 w-5" />}>
        <div className="grid gap-3.5 sm:grid-cols-3">
          <NumField label={t.fRent} value={p.fixed.rent} onChange={v => update(d => { d.fixed.rent = v; })} />
          <NumField label={t.fUtilities} value={p.fixed.utilities} onChange={v => update(d => { d.fixed.utilities = v; })} />
          <NumField label={t.fInternet} value={p.fixed.internet} onChange={v => update(d => { d.fixed.internet = v; })} />
          <NumField label={t.fSalaries} value={p.fixed.salaries} onChange={v => update(d => { d.fixed.salaries = v; })} />
          <NumField label={t.fMarketing} value={p.fixed.marketing} onChange={v => update(d => { d.fixed.marketing = v; })} />
          <NumField label={t.fMaintenance} value={p.fixed.maintenance} onChange={v => update(d => { d.fixed.maintenance = v; })} />
          <NumField label={t.fAdmin} value={p.fixed.adminCosts} onChange={v => update(d => { d.fixed.adminCosts = v; })} />
          <NumField label={t.fOther} value={p.fixed.otherCosts} onChange={v => update(d => { d.fixed.otherCosts = v; })} />
          <NumField label={t.fGrowth} value={p.fixed.fixedGrowth} onChange={v => update(d => { d.fixed.fixedGrowth = v; })} />
        </div>
        <div className="mt-4"><KpiCard label={t.fixedMonthlyTotal} value={money(p.fixed.rent + p.fixed.utilities + p.fixed.internet + p.fixed.salaries + p.fixed.marketing + p.fixed.maintenance + p.fixed.adminCosts + p.fixed.otherCosts)} /></div>
      </SectionCard>

      <SectionCard title={t.socialSim} icon={<HandCoins className="h-5 w-5" />} desc={t.socialSimDesc}>
        <div className="grid gap-3.5 sm:grid-cols-4">
          <NumField label={t.grossSalary} value={gross} onChange={setGross} />
          <NumField label={t.cnasEmployerRate} value={empRate} onChange={setEmpRate} />
          <NumField label={t.cnasEmployeeRate} value={empSelfRate} onChange={setEmpSelfRate} />
          <NumField label={t.casnosRate} value={casnos} onChange={setCasnos} />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <KpiCard label={t.firstEmployeeCost} value={money(employerCost)} tone="warn" />
          <KpiCard label={t.employeeNet} value={money(employeeNet)} />
          <KpiCard label={t.casnosMonthly} value={money(gross * casnos / 100)} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => update(d => { d.fixed.salaries = Math.round(employerCost); })}>{t.applySalaries}</Button>
          <span className="text-[12px] text-muted-foreground">{t.socialNote}</span>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Step 5: assets ───────────────────────────────────────────────────────────
function StepAssets({ p, update }: { p: Project; update: (fn: (d: Project) => void) => void }) {
  const { t, lang } = useApp();
  const [custom, setCustom] = useState('');
  const suggested = suggestAssetsByProjectType(p.type.types);
  const has = (n: string) => p.assets.some(a => a.name === n);
  const money = (n: number) => fmtMoney(n, lang);
  const a = assetTotals(p);
  return (
    <div className="space-y-4">
      <SectionCard title={t.templatesTitle} icon={<Factory className="h-5 w-5" />}>
        <div className="flex flex-wrap gap-2">
          {suggested.map(n => (
            <button key={n} disabled={has(n)}
              onClick={() => update(d => { d.assets.push(newAsset({ name: n, account: defaultAccount(n), years: defaultYears(n) })); })}
              className={`rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition ${has(n) ? 'border-primary/30 bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary'}`}>
              {has(n) ? '✓ ' : '+ '}{n}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="w-56"><TextField label={t.customAssetName} value={custom} onChange={setCustom} /></div>
          <Button variant="outline" className="gap-1.5" onClick={() => { if (!custom.trim()) return; update(d => { d.assets.push(newAsset({ name: custom.trim(), account: defaultAccount(custom.trim()), years: defaultYears(custom.trim()) })); }); setCustom(''); }}>{t.addCustomAsset}</Button>
        </div>
      </SectionCard>

      <SectionCard title={t.selectedInvest} desc={`${t.assetValue}: ${money(a.invest)}`}>
        {p.assets.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">{t.noProjects === '' ? '' : t.assetsTitle}: —</p>
        ) : (
          <div className="space-y-3">
            {p.assets.map((ast, idx) => <AssetRow key={ast.id} ast={ast} idx={idx} update={update} />)}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <KpiCard label={t.finInvest} value={money(a.invest)} />
              <KpiCard label={`${t.assetYears} / ${t.monthUnit}`} value={money(a.dep / 12)} />
              <KpiCard label={t.assetHeaders[4]} value={money(a.dep)} />
            </div>
          </div>
        )}
        <Button variant="outline" className="mt-3 gap-1.5" onClick={() => update(d => { d.assets.push(newAsset()); })}><Plus className="h-4 w-4" />{t.addAsset}</Button>
      </SectionCard>
    </div>
  );
}

function AssetRow({ ast, idx, update }: { ast: Asset; idx: number; update: (fn: (d: Project) => void) => void }) {
  const { t, lang } = useApp();
  const set = (fn: (x: Asset) => void) => update(d => fn(d.assets[idx]));
  return (
    <div className="grid gap-3 rounded-xl border border-border/70 bg-white/60 dark:bg-card p-3.5 sm:grid-cols-[2fr_2fr_1fr_1fr_auto]">
      <TextField label={t.assetName} value={ast.name} onChange={v => set(x => { x.name = v; })} />
      <TextField label={t.assetAccount} value={ast.account} onChange={v => set(x => { x.account = v; })} />
      <NumField label={t.assetValue} value={ast.value} onChange={v => set(x => { x.value = v; })} />
      <NumField label={t.assetYears} value={ast.years} onChange={v => set(x => { x.years = v; })} />
      <div className="flex items-end pb-1">
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => update(d => { d.assets = d.assets.filter(x => x.id !== ast.id); })}><Trash2 className="h-4 w-4" /></Button>
      </div>
      <div className="text-[12px] text-muted-foreground sm:col-span-5">{t.assetHeaders[4]}: {fmtMoney(ast.years > 0 ? ast.value / ast.years : 0, lang)}</div>
    </div>
  );
}

// ── Step 6: funding & tax + programs advisor ─────────────────────────────────
function StepFunding({ p, update }: { p: Project; update: (fn: (d: Project) => void) => void }) {
  const { t, lang } = useApp();
  const budget = getStartupBudget(p);
  const smart = getSmartFunding(p);
  const money = (n: number) => fmtMoney(n, lang);
  const auto = autoLoanSettings(p);
  const applySmart = () => update(d => {
    d.funding.selfFunding = Math.round(smart.self);
    d.funding.grantAmount = Math.round(smart.grant);
    d.funding.otherFunding = 0;
    d.funding.hasLoan = smart.loan > 0 ? 'yes' : 'no';
    d.funding.loanAmount = Math.round(smart.loan);
    d.funding.interestRate = auto.rate;
    d.funding.loanYears = auto.years;
    d.funding.firstSalesMonth = estimateFirstSalesMonth(d);
  });
  const ex = getSuggestedExemptionInfo(p);
  const exTitle = ({ exNoAuto: t.exNoAuto, exStartup: t.exStartup, exMicro: t.exMicro, exPatent: t.exPatent, exAapi: t.exAapi } as Record<string, string>)[ex.titleKey];
  const exReason = ({ exNoAuto: t.exNoAutoReason, exStartup: t.exStartupReason, exMicro: t.exMicroReason, exPatent: t.exPatentReason, exAapi: t.exAapiReason } as Record<string, string>)[ex.reasonKey];
  const exIbs = ({ ibs19: t.ibs19, ibs23: t.ibs23, ibs26: t.ibs26 } as Record<string, string>)[ex.ibsKey];
  const programs = matchPrograms(p);
  const fitBadge = (f: string) => f === 'good'
    ? <Badge className="bg-[var(--ok-bg)] text-[var(--ok)] border-[var(--ok-border)]" variant="outline">{t.goodFit}</Badge>
    : f === 'mid' ? <Badge className="bg-[var(--warn-bg)] text-[var(--warn)] border-[var(--warn-border)]" variant="outline">{t.midFit}</Badge>
    : <Badge className="bg-muted text-muted-foreground" variant="outline">{t.lowFit}</Badge>;
  return (
    <div className="space-y-4">
      <SectionCard title={t.fundingMethod} icon={<Landmark className="h-5 w-5" />} desc={t.autoPlanNote}>
        <div className="grid gap-3.5 sm:grid-cols-4">
          <NumField label={t.selfPercent} value={p.funding.selfPercent} onChange={v => update(d => { d.funding.selfPercent = v; })} />
          <NumField label={t.loanPercent} value={p.funding.loanPercent} onChange={v => update(d => { d.funding.loanPercent = v; })} />
          <NumField label={t.grantPercent} value={p.funding.grantPercent} onChange={v => update(d => { d.funding.grantPercent = v; })} />
          <KpiCard label={t.startupBudget} value={money(budget.total)} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`text-[12.5px] font-semibold ${p.funding.selfPercent + p.funding.loanPercent + p.funding.grantPercent > 100 ? 'text-bad' : 'text-muted-foreground'}`}>{t.percentTotal}: {p.funding.selfPercent + p.funding.loanPercent + p.funding.grantPercent}%</span>
          {p.funding.selfPercent + p.funding.loanPercent + p.funding.grantPercent > 100 && <AlertCalm tone="bad"><span className="text-[12px]">{t.percentWarn}</span></AlertCalm>}
          <Button size="sm" className="gap-1.5" onClick={applySmart}><Lightbulb className="h-3.5 w-3.5" />{t.applyPlan}</Button>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3.5 sm:grid-cols-3">
          <NumField label={t.selfFundingAmt} value={p.funding.selfFunding} onChange={v => update(d => { d.funding.selfFunding = v; })} />
          <NumField label={t.grantAmt} value={p.funding.grantAmount} onChange={v => update(d => { d.funding.grantAmount = v; })} />
          <NumField label={t.otherFunding} value={p.funding.otherFunding} onChange={v => update(d => { d.funding.otherFunding = v; })} />
          <NumField label={t.preStart} value={p.funding.preStartCosts} onChange={v => update(d => { d.funding.preStartCosts = v; })} />
          <NumField label={t.firstSalesMonth} value={p.funding.firstSalesMonth} onChange={v => update(d => { d.funding.firstSalesMonth = Math.max(1, Math.min(12, v)); })} hint={t.aNoRev} />
          <NumField label={t.monthlyGrowth} value={p.funding.monthlyGrowth} onChange={v => update(d => { d.funding.monthlyGrowth = v; })} />
        </div>
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          <Field label={t.hasLoan}>
            <Select value={p.funding.hasLoan} onValueChange={v => update(d => { d.funding.hasLoan = v as 'yes' | 'no'; if (v === 'no') { d.funding.loanAmount = 0; } })}>
              <SelectTrigger className="bg-white/80 dark:bg-card"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="yes">{t.yes}</SelectItem><SelectItem value="no">{t.no}</SelectItem></SelectContent>
            </Select>
          </Field>
          {p.funding.hasLoan === 'yes' && (
            <div className="grid gap-3.5 sm:grid-cols-3">
              <NumField label={t.loanAmount} value={p.funding.loanAmount} onChange={v => update(d => { d.funding.loanAmount = v; })} />
              <NumField label={t.interestRate} value={p.funding.interestRate} onChange={v => update(d => { d.funding.interestRate = v; })} />
              <NumField label={t.loanYears} value={p.funding.loanYears} onChange={v => update(d => { d.funding.loanYears = v; })} />
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title={t.taxAdvisor} icon={<ShieldCheck className="h-5 w-5" />}>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label={t.hasStartupLabel}>
            <Select value={p.funding.hasStartupLabel} onValueChange={v => update(d => { d.funding.hasStartupLabel = v as 'yes' | 'no'; })}>
              <SelectTrigger className="bg-white/80 dark:bg-card"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="yes">{t.yes}</SelectItem><SelectItem value="no">{t.no}</SelectItem></SelectContent>
            </Select>
          </Field>
          <NumField label={t.exemptionYears} value={p.funding.exemptionYears} onChange={v => update(d => { d.funding.exemptionYears = v; })} />
        </div>
        <AlertCalm tone="ok">
          <div className="text-[13px] space-y-1">
            <div><strong>{exTitle}</strong></div>
            <div>{t.suggestedExemption}: <strong>{ex.years} {lang === 'ar' ? 'سنوات' : lang === 'fr' ? 'ans' : 'years'}</strong> — {exReason}</div>
            <div>{t.afterExemption}: <strong>{exIbs}</strong></div>
            <div className="opacity-80">{t.reinvestNote}</div>
          </div>
        </AlertCalm>
        <Button size="sm" variant="outline" className="mt-2" onClick={() => update(d => { d.funding.exemptionYears = ex.years; })}>{t.applyExemption}</Button>
      </SectionCard>

      <SectionCard title={t.programsAdvisor} icon={<HandCoins className="h-5 w-5" />} desc={t.programsIntro}>
        <div className="space-y-2.5">
          {programs.map(prog => (
            <div key={prog.id} className="rounded-xl border border-border/70 bg-white/60 dark:bg-card p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold text-[14px]">{(t as unknown as Record<string, string>)[prog.nameKey]}</div>
                {fitBadge(prog.fit)}
              </div>
              <div className="mt-1.5 text-[12.5px] text-muted-foreground"><strong className="text-foreground/80">{t.pgWho}:</strong> {prog.who[lang]}</div>
              <div className="mt-1 text-[12.5px] text-muted-foreground"><strong className="text-foreground/80">{t.pgAmount}:</strong> {prog.amount[lang]}</div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="ghost" className="mt-1.5 h-7 gap-1 text-[12px] text-primary"><CircleHelp className="h-3.5 w-3.5" />{t.docsBtn}</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 text-[12.5px]">
                  <div className="font-semibold mb-1.5">{t.pgDocs}</div>
                  <ul className="list-disc space-y-1 ps-4">{prog.docs[lang].map((d, i) => <li key={i}>{d}</li>)}</ul>
                </PopoverContent>
              </Popover>
            </div>
          ))}
        </div>
        <AlertCalm tone="warn"><span className="text-[12px]">{t.programsDisclaimer}</span></AlertCalm>
      </SectionCard>
    </div>
  );
}

// ── Step 7: market & BMC + competitors + SWOT + personas ─────────────────────
function StepMarket({ p, update }: { p: Project; update: (fn: (d: Project) => void) => void }) {
  const { t, lang } = useApp();
  const money = (n: number) => fmtMoney(n, lang);
  const persona = personaCheck(p);
  const swotSuggest = swotSuggestions(p, t);
  return (
    <div className="space-y-4">
      <SectionCard title={t.marketTitle} icon={<Users2 className="h-5 w-5" />} desc={t.bmcHints}>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <AreaField label={t.bmcCustomers} rows={3} value={p.market.customers} onChange={v => update(d => { d.market.customers = v; })} hint={<HintBlock h={bmcHint('customers', lang)} t={t} />} />
          <AreaField label={t.bmcValue} rows={3} value={p.market.valueProp} onChange={v => update(d => { d.market.valueProp = v; })} hint={<HintBlock h={bmcHint('valueProp', lang)} t={t} />} />
          <AreaField label={t.bmcChannels} rows={3} value={p.market.channels} onChange={v => update(d => { d.market.channels = v; })} hint={<HintBlock h={bmcHint('channels', lang)} t={t} />} />
          <AreaField label={t.bmcPartners} rows={3} value={p.market.partners} onChange={v => update(d => { d.market.partners = v; })} hint={<HintBlock h={bmcHint('partners', lang)} t={t} />} />
          <AreaField label={t.bmcActivities} rows={3} value={p.market.activities} onChange={v => update(d => { d.market.activities = v; })} hint={<HintBlock h={bmcHint('activities', lang)} t={t} />} />
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3.5 sm:grid-cols-3">
          <NumField label={t.gOpt} value={p.market.growthOpt} onChange={v => update(d => { d.market.growthOpt = v; })} />
          <NumField label={t.gReal} value={p.market.growthReal} onChange={v => update(d => { d.market.growthReal = v; })} />
          <NumField label={t.gPes} value={p.market.growthPes} onChange={v => update(d => { d.market.growthPes = v; })} />
        </div>
      </SectionCard>

      {/* Personas */}
      <SectionCard title={t.personaTitle} icon={<UserRound className="h-5 w-5" />} desc={t.personaDesc}>
        {p.market.personas.map((pe, idx) => (
          <div key={pe.id} className="mb-3 rounded-xl border border-border/70 bg-white/60 dark:bg-card p-3.5">
            <div className="grid gap-3 sm:grid-cols-5">
              <TextField label={t.peName} value={pe.name} onChange={v => update(d => { d.market.personas[idx].name = v; })} />
              <TextField label={t.peAge} value={pe.ageRange} onChange={v => update(d => { d.market.personas[idx].ageRange = v; })} />
              <TextField label={t.peLocation} value={pe.location} onChange={v => update(d => { d.market.personas[idx].location = v; })} />
              <TextField label={t.pePower} value={pe.purchasingPower} onChange={v => update(d => { d.market.personas[idx].purchasingPower = v; })} />
              <NumField label={t.peMonthly} value={pe.monthlyBuyers} onChange={v => update(d => { d.market.personas[idx].monthlyBuyers = v; })} />
              <AreaField className="sm:col-span-4" label={t.peDesc} rows={2} value={pe.description} onChange={v => update(d => { d.market.personas[idx].description = v; })} />
              <div className="flex items-end pb-1.5">
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => update(d => { d.market.personas = d.market.personas.filter(x => x.id !== pe.id); })}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
        <Button variant="outline" className="gap-1.5" onClick={() => update(d => { d.market.personas.push(newPersona()); })}><Plus className="h-4 w-4" />{t.addPersona}</Button>
        <div className="mt-3">
          <div className="text-[13px] font-semibold text-primary mb-1.5">{t.personaLinkTitle}</div>
          {persona.state === 'none' ? (
            <AlertCalm tone="warn"><span className="text-[12.5px]">{t.personaNo}</span></AlertCalm>
          ) : persona.state === 'ok' ? (
            <AlertCalm tone="ok"><span className="text-[12.5px]">{t.personaOk.replace('{q}', String(Math.round(persona.sold))).replace('{b}', String(Math.round(persona.buyers))).replace('{avg}', persona.avg.toFixed(1))}</span></AlertCalm>
          ) : (
            <AlertCalm tone="warn"><span className="text-[12.5px]">{t.personaHigh.replace('{q}', String(Math.round(persona.sold))).replace('{b}', String(Math.round(persona.buyers))).replace('{avg}', persona.avg.toFixed(1))}</span></AlertCalm>
          )}
        </div>
      </SectionCard>

      {/* Competitors */}
      <SectionCard title={t.competitorsTitle} icon={<Scale className="h-5 w-5" />} desc={t.competitorsDesc}>
        {p.market.competitors.map((cp, idx) => (
          <div key={cp.id} className="mb-3 rounded-xl border border-border/70 bg-white/60 dark:bg-card p-3.5">
            <div className="grid gap-3 sm:grid-cols-4">
              <TextField label={t.compName} value={cp.name} onChange={v => update(d => { d.market.competitors[idx].name = v; })} />
              <TextField label={t.compOffer} value={cp.offer} onChange={v => update(d => { d.market.competitors[idx].offer = v; })} />
              <Field label={t.compPrice}>
                <Select value={cp.priceLevel} onValueChange={v => update(d => { d.market.competitors[idx].priceLevel = v; })}>
                  <SelectTrigger className="bg-white/80 dark:bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="low">{t.priceLow}</SelectItem><SelectItem value="mid">{t.priceMid}</SelectItem><SelectItem value="high">{t.priceHigh}</SelectItem></SelectContent>
                </Select>
              </Field>
              <div className="flex items-end pb-1.5">
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => update(d => { d.market.competitors = d.market.competitors.filter(x => x.id !== cp.id); })}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <TextField label={t.compStrengths} value={cp.strengths} onChange={v => update(d => { d.market.competitors[idx].strengths = v; })} />
              <TextField label={t.compWeaknesses} value={cp.weaknesses} onChange={v => update(d => { d.market.competitors[idx].weaknesses = v; })} />
              <TextField className="sm:col-span-2" label={t.compEdge} value={cp.edge} onChange={v => update(d => { d.market.competitors[idx].edge = v; })} />
            </div>
          </div>
        ))}
        <Button variant="outline" className="gap-1.5" onClick={() => update(d => { d.market.competitors.push(newCompetitor()); })}><Plus className="h-4 w-4" />{t.addCompetitor}</Button>
      </SectionCard>

      {/* SWOT */}
      <SectionCard title={t.swotTitle} icon={<Gauge className="h-5 w-5" />} desc={t.swotDesc}>
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            ['strengths', t.swotS, t.addS, 'ok', swotSuggest.strengths],
            ['weaknesses', t.swotW, t.addW, 'bad', swotSuggest.weaknesses],
            ['opportunities', t.swotO, t.addO, 'ok', swotSuggest.opportunities],
            ['threats', t.swotT, t.addT, 'bad', swotSuggest.threats],
          ] as const).map(([key, label, addLabel, tone, suggestions]) => (
            <div key={key} className={`rounded-xl border p-3.5 ${tone === 'ok' ? 'border-[var(--ok-border)]/60 bg-[color-mix(in_srgb,var(--ok-bg)_45%,transparent)]' : 'border-[var(--bad-border)]/60 bg-[color-mix(in_srgb,var(--bad-bg)_40%,transparent)]'}`}>
              <div className="mb-2 text-[13.5px] font-bold font-heading">{label}</div>
              {(p.market.swot[key] as string[]).map((it, i) => (
                <div key={i} className="mb-1.5 flex gap-1.5">
                  <Input className="h-8 text-[13px] bg-white/85 dark:bg-card" value={it}
                    onChange={e => update(d => { (d.market.swot[key] as string[])[i] = e.target.value; })} />
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground" onClick={() => update(d => { const arr = d.market.swot[key] as string[]; arr.splice(i, 1); })}>×</Button>
                </div>
              ))}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Button size="sm" variant="outline" className="h-7 gap-1 text-[12px]" onClick={() => update(d => { (d.market.swot[key] as string[]).push(''); })}><Plus className="h-3 w-3" />{addLabel}</Button>
                {suggestions.filter(sg => !(p.market.swot[key] as string[]).includes(sg)).slice(0, 2).map((sg, i) => (
                  <button key={i} className="rounded-full border border-dashed border-current px-2.5 py-1 text-[11.5px] opacity-80 hover:opacity-100" title={t.autoSuggest}
                    onClick={() => update(d => { (d.market.swot[key] as string[]).push(sg); })}>
                    + {sg.length > 42 ? sg.slice(0, 42) + '…' : sg}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function HintBlock({ h, t }: { h: { what: string; good: string; bad: string }; t: Record<string, unknown> }) {
  return (
    <div className="space-y-1.5 text-[12.5px] leading-relaxed">
      <div><strong>{String(t.hint)}:</strong> {h.what}</div>
      <div className="text-ok"><strong>✓ {String(t.goodExample)}:</strong> {h.good}</div>
      <div className="text-bad"><strong>✗ {String(t.badExample)}:</strong> {h.bad}</div>
    </div>
  );
}

import { Dict } from '@/lib/i18n';
function swotSuggestions(p: Project, t: Dict): { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] } {
  const snap = computeSnapshot(p);
  const marginRate = snap.base.rev > 0 ? (snap.base.rev - snap.base.varCost) / snap.base.rev : 0;
  const ar = t.dir === 'rtl';
  const s: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] } = {
    strengths: [], weaknesses: [], opportunities: [], threats: [],
  };
  if (marginRate >= 0.3) s.strengths.push(ar ? 'هامش ربح إجمالي مرتفع يسمح بالمنافسة بالسعر' : 'Marge brute élevée permettant de jouer sur les prix');
  if (p.products.length > 1) s.strengths.push(ar ? 'تنويع في المنتجات/الخدمات يقلل مخاطر الإيراد' : 'Diversification des produits réduisant le risque de revenus');
  if (p.funding.selfPercent >= 30) s.strengths.push(ar ? 'مساهمة شخصية مريحة تعكس الالتزام أمام الممولين' : 'Apport personnel confortable, gage d’engagement');
  if (marginRate > 0 && marginRate < 0.25) s.weaknesses.push(ar ? 'هامش ربح منخفض يحدد القدرة على التغطية' : 'Marge faible limitant la capacité de couverture');
  if (snap.fixed > snap.base.rev * 0.5 && snap.base.rev > 0) s.weaknesses.push(ar ? 'تكاليف ثابتة مرتفعة مقارنة برقم الأعمال' : 'Charges fixes élevées par rapport au CA');
  if (snap.loanShare > 0.6) s.weaknesses.push(ar ? 'اعتماد كبير على القرض يرفع المخاطر المالية' : 'Forte dépendance au prêt augmentant le risque financier');
  if (!p.market.competitors.length) s.weaknesses.push(ar ? 'دراسة المنافسة غير مكتملة بعد' : 'Analyse de la concurrence non finalisée');
  s.opportunities.push(ar ? 'برامج الدعم الجزائرية (ANADE، النواشئ…) قابلة للاستثمار في النمو' : 'Dispositifs algériens d’appui mobilisables pour la croissance');
  if (p.info.wilaya) s.opportunities.push(ar ? `توسيع الطلب محلياً في ${p.info.wilaya} عبر الشراكات` : 'Expansion de la demande locale via des partenariats');
  s.threats.push(ar ? 'ارتفاع أسعار المدخلات (مواد أولية، طاقة، نقل)' : 'Hausse des coûts des intrants (matières, énergie, transport)');
  if (p.type.types.includes('commercial')) s.threats.push(ar ? 'دخول منافس جديد قريب بنفس العرض' : 'Arrivée d’un concurrent proche avec la même offre');
  if (p.funding.hasLoan === 'yes') s.threats.push(ar ? 'ضغط سداد القرض في الأشهر الأولى الضعيفة' : 'Pression du remboursement durant les premiers mois faibles');
  return s;
}

// ── Step 8: output (KPIs, chart, coach, indicators, committee, appendices) ───
function StepOutput({ p, snap, coach: c, comp, update, onReport, onDeck }: {
  p: Project;
  snap: ReturnType<typeof computeSnapshot>;
  coach: ReturnType<typeof coach>;
  comp: ReturnType<typeof completeness>;
  update: (fn: (d: Project) => void) => void;
  onReport: () => void;
  onDeck: () => void;
}) {
  const { t, lang } = useApp();
  const money = (n: number) => fmtMoney(n, lang);
  const inds = indicators(p, lang, money);
  const toneCls = (v: string) => v === 'good' ? 'text-ok' : v === 'mid' ? 'text-warn' : 'text-bad';
  const beUnit = snap.be.breakEvenUnits > 0
    ? `${Math.ceil(snap.be.breakEvenUnits).toLocaleString('fr-DZ')} ${t.unit} / ${snap.be.breakEvenMonths.toFixed(1)} ${t.monthUnit}`
    : snap.be.breakEvenMonths > 0 ? `${money(snap.be.breakEvenRevenue)} / ${snap.be.breakEvenMonths.toFixed(1)} ${t.monthUnit}` : t.na;
  const committeeQs = committeeQuestionsSafe(p, lang);
  return (
    <div className="space-y-4">
      <SectionCard title={t.outputTitle} icon={<Gauge className="h-5 w-5" />} desc={t.mindset}>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
          <KpiCard label={t.kpiMonthlyRev} value={money(snap.base.rev)} />
          <KpiCard label={t.kpiNetMonthly} value={money(snap.netMonthly)} tone={snap.netMonthly > 0 ? 'ok' : snap.netMonthly < 0 ? 'bad' : undefined} />
          <KpiCard label={t.kpiFixed} value={money(snap.fixed)} />
          <KpiCard label={t.kpiBreakEven} value={beUnit} />
          <KpiCard label={t.kpiBudget} value={money(snap.budget.total)} />
          <KpiCard label={t.kpiScore} value={`${snap.score.toFixed(1)}/10`} tone={snap.score >= 7 ? 'ok' : snap.score >= 4 ? 'warn' : 'bad'} />
        </div>
        <div className="mt-4">
          <MonthlyResultsChart p={p} lang={lang} />
        </div>
        <div className={`mt-4 alert-calm alert-${c.tone}`}>
          <strong>{t.coachDecision}: {c.statusText}</strong>
          <div className="mt-1 text-[13px]">{c.decisionText}</div>
        </div>
      </SectionCard>

      {/* interpreted indicators */}
      <SectionCard title={t.indicatorsTitle} icon={<Gauge className="h-5 w-5" />}>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {inds.map(ind => (
            <div key={ind.key} className="rounded-xl border border-border/70 bg-card p-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[12px] text-muted-foreground font-medium">{(t as unknown as Record<string, string>)[ind.key]}</div>
                <VerdictMini v={ind.verdict} t={t} />
              </div>
              <div className={`mt-1 text-lg font-bold font-heading num ${toneCls(ind.verdict)}`}>{ind.value}</div>
              <div className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{(t as unknown as Record<string, string>)[ind.explain]}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* committee simulation */}
      <SectionCard title={t.committeeTitle} icon={<MessagesSquare className="h-5 w-5" />} desc={t.committeeDesc}>
        {committeeQs.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">{t.committeeEmpty}</p>
        ) : (
          <div className="space-y-3">
            {committeeQs.map((q, i) => {
              const stored = p.committee.find(x => x.q === q.q);
              return (
                <div key={i} className="rounded-xl border border-border/70 bg-white/60 dark:bg-card p-3.5">
                  <div className="flex items-start gap-2 text-[13px] font-medium">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary num">{i + 1}</span>
                    <span>{q.q}</span>
                  </div>
                  <TextareaAnswers
                    value={stored?.a || ''}
                    onChange={v => update(d => {
                      const found = d.committee.find(x => x.q === q.q);
                      if (found) found.a = v;
                      else d.committee.push({ q: q.q, a: v });
                    })}
                    placeholder={t.committeePlaceholder}
                  />
                </div>
              );
            })}
            <div className="text-[11.5px] text-muted-foreground flex items-center gap-1"><Save className="h-3 w-3 text-ok" />{t.answerSaved}</div>
          </div>
        )}
      </SectionCard>

      {/* appendices */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={onReport} className="gap-1.5"><FileText className="h-4 w-4" />{t.exportReport}</Button>
        <Button variant="outline" onClick={onDeck} className="gap-1.5"><Presentation className="h-4 w-4" />{t.deckTitle}</Button>
      </div>
      <Accordion type="multiple" className="rounded-xl border border-border/70 bg-card px-4" defaultValue={['appx-0', 'appx-8']}>
        {[
          { id: 'appx-0', title: t.appendices[0], el: <AppendixBreakEven p={p} lang={lang} /> },
          { id: 'appx-1', title: t.appendices[1], el: <AppendixScenario p={p} lang={lang} /> },
          { id: 'appx-2', title: t.appendices[2], el: <AppendixDetailedRevenue p={p} lang={lang} /> },
          { id: 'appx-3', title: t.appendices[3], el: <AppendixAssets p={p} lang={lang} /> },
          { id: 'appx-4', title: t.appendices[4], el: <AppendixFinancing p={p} lang={lang} /> },
          { id: 'appx-5', title: t.appendices[5], el: <AppendixLoan p={p} lang={lang} /> },
          { id: 'appx-6', title: t.appendices[6], el: <AppendixCashflow p={p} lang={lang} /> },
          { id: 'appx-7', title: t.appendices[7], el: <AppendixCashGap p={p} lang={lang} /> },
          { id: 'appx-8', title: t.appendices[8], el: <AppendixTax p={p} lang={lang} /> },
          { id: 'appx-9', title: t.appendices[9], el: <AppendixSCF p={p} lang={lang} /> },
          { id: 'appx-10', title: t.appendices[10], el: <AppendixBMC p={p} lang={lang} /> },
          { id: 'appx-11', title: t.appendices[11], el: <AppendixBMCFinance p={p} lang={lang} /> },
        ].map(a => (
          <AccordionItem key={a.id} value={a.id}>
            <AccordionTrigger className="text-[14px] font-semibold text-primary">{a.title}</AccordionTrigger>
            <AccordionContent className="overflow-x-auto">{a.el}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {comp.missingKeys.length > 0 && (
        <AlertCalm tone="warn">
          <div className="text-[12.5px]"><strong>{t.missingList}</strong> {comp.missingKeys.map(k => (t as unknown as Record<string, string>)[k]).join(' · ')}</div>
        </AlertCalm>
      )}
    </div>
  );
}

function VerdictMini({ v, t }: { v: 'good' | 'mid' | 'weak'; t: Record<string, unknown> }) {
  const label = v === 'good' ? t.indGood : v === 'mid' ? t.indMid : t.indWeak;
  const cls = v === 'good' ? 'bg-[var(--ok-bg)] text-[var(--ok)]' : v === 'mid' ? 'bg-[var(--warn-bg)] text-[var(--warn)]' : 'bg-[var(--bad-bg)] text-[var(--bad)]';
  return <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${cls}`}>{String(label)}</span>;
}

import { committeeQuestions } from '@/lib/analytics';
function committeeQuestionsSafe(p: Project, lang: Lang) {
  try { return committeeQuestions(p, lang); } catch { return []; }
}

import { Textarea } from '@/components/ui/textarea';
function TextareaAnswers({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return <Textarea rows={2} className="mt-2 bg-white/85 dark:bg-card text-[13px]" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />;
}

// PopHint helper re-export (unused direct import avoidance)
export { PopHint };
