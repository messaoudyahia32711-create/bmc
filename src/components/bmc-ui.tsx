'use client';
// ─── Shared UI kit for the BMC tool ──────────────────────────────────────────
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function Field({ label, hint, children, className = '' }: { label: string; hint?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center gap-1.5">
        <Label className="text-[13px] font-medium text-muted-foreground">{label}</Label>
        {hint && (
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" aria-label={label} className="text-muted-foreground/70 hover:text-primary transition-colors">
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 text-[13px] leading-relaxed" side="top">
              {hint}
            </PopoverContent>
          </Popover>
        )}
      </div>
      {children}
    </div>
  );
}

export function NumField({ label, value, onChange, hint, step = '1', min = '0', className = '' }: {
  label: string; value: number; onChange: (v: number) => void; hint?: React.ReactNode; step?: string; min?: string; className?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      <Input type="number" step={step} min={min} className="num text-start bg-white/80 dark:bg-card" value={Number.isFinite(value) ? value : 0}
        onChange={e => onChange(Number(e.target.value) || 0)} />
    </Field>
  );
}

export function TextField({ label, value, onChange, hint, placeholder, className = '' }: {
  label: string; value: string; onChange: (v: string) => void; hint?: React.ReactNode; placeholder?: string; className?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      <Input className="bg-white/80 dark:bg-card" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    </Field>
  );
}

export function AreaField({ label, value, onChange, hint, placeholder, rows = 3, className = '' }: {
  label: string; value: string; onChange: (v: string) => void; hint?: React.ReactNode; placeholder?: string; rows?: number; className?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      <Textarea rows={rows} className="bg-white/80 dark:bg-card leading-relaxed" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    </Field>
  );
}

export function SectionCard({ icon, title, desc, children, className = '' }: {
  icon?: React.ReactNode; title: string; desc?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <Card className={`border-border/70 shadow-sm ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          {icon}{title}
        </CardTitle>
        {desc && <p className="text-[13px] text-muted-foreground leading-relaxed">{desc}</p>}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

export function AlertCalm({ tone, children }: { tone: 'ok' | 'warn' | 'bad'; children: React.ReactNode }) {
  return <div className={`alert-calm alert-${tone}`}>{children}</div>;
}

export function KpiCard({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'ok' | 'warn' | 'bad' }) {
  const toneCls = tone === 'ok' ? 'text-ok' : tone === 'warn' ? 'text-warn' : tone === 'bad' ? 'text-bad' : 'text-foreground';
  return (
    <div className="rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm">
      <div className="text-[12px] text-muted-foreground font-medium">{label}</div>
      <div className={`mt-1 text-lg font-bold font-heading ${toneCls}`}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

export function VerdictBadge({ tone, children }: { tone: Verdict; children: React.ReactNode }) {
  const cls = tone === 'good' ? 'bg-[var(--ok-bg)] text-[var(--ok)] border-[var(--ok-border)]'
    : tone === 'mid' ? 'bg-[var(--warn-bg)] text-[var(--warn)] border-[var(--warn-border)]'
    : 'bg-[var(--bad-bg)] text-[var(--bad)] border-[var(--bad-border)]';
  return <Badge variant="outline" className={`${cls} gap-1`}>{children}</Badge>;
}
export type Verdict = 'good' | 'mid' | 'weak';

export function VerdictIcon({ v }: { v: Verdict }) {
  return v === 'good' ? <TrendingUp className="h-3.5 w-3.5" /> : v === 'mid' ? <Minus className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />;
}

export function CompletenessMeter({ percent, label }: { percent: number; label?: string }) {
  return (
    <div>
      <div className="flex justify-between text-[12px] text-muted-foreground mb-1">
        <span>{label}</span>
        <span className="font-bold num">{percent}%</span>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  );
}

// ─── SVG charts (crisp in print) ─────────────────────────────────────────────
export function BarChartSvg({ data, format }: { data: { label: string; value: number; color: string }[]; format: (n: number) => string }) {
  const max = Math.max(...data.map(d => Math.abs(d.value)), 1);
  const W = 640, H = 260, padB = 42, padT = 24, padX = 12;
  const bw = (W - padX * 2) / data.length;
  const baseY = H - padB;
  const chartH = baseY - padT;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img">
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const y = baseY - chartH * f;
        return (
          <g key={i}>
            <line x1={padX} x2={W - padX} y1={y} y2={y} stroke="#DCE4EA" strokeWidth="1" />
            <text x={W - padX + 2} y={y + 3} fontSize="9.5" fill="#7C8FA0" textAnchor="end" dx={-2}>{format(max * f)}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = Math.max(3, Math.abs(d.value) / max * chartH);
        const x = padX + i * bw + bw * 0.18;
        const y = baseY - h;
        const neg = d.value < 0;
        return (
          <g key={i}>
            <rect x={x} y={neg ? baseY : y} width={bw * 0.64} height={h} rx="4" fill={d.color} opacity="0.92" />
            <text x={x + bw * 0.32} y={neg ? baseY + h + 12 < H ? baseY + h + 12 : H - 4 : y - 5} fontSize="10" fill="#3A4A56" textAnchor="middle" fontWeight="600">{format(d.value)}</text>
            <text x={x + bw * 0.32} y={H - 10} fontSize="10.5" fill="#4A5B68" textAnchor="middle">{d.label}</text>
          </g>
        );
      })}
      <line x1={padX} x2={W - padX} y1={baseY} y2={baseY} stroke="#9FB2BF" strokeWidth="1.4" />
    </svg>
  );
}

export function LineChartSvg({ values, labels, format }: { values: number[]; labels: string[]; format: (n: number) => string }) {
  const W = 640, H = 240, padL = 8, padR = 76, padT = 16, padB = 30;
  const min = Math.min(...values, 0), max = Math.max(...values, 0);
  const span = max - min || 1;
  const x = (i: number) => padL + (i * (W - padL - padR)) / Math.max(values.length - 1, 1);
  const y = (v: number) => padT + (max - v) * ((H - padT - padB) / span);
  const zeroY = y(0);
  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `${path} L${x(values.length - 1).toFixed(1)},${zeroY.toFixed(1)} L${x(0).toFixed(1)},${zeroY.toFixed(1)} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img">
      {[max, min + span / 2, min].map((v, i) => (
        <g key={i}>
          <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="#DCE4EA" strokeWidth="1" />
          <text x={W - padR + 4} y={y(v) + 3} fontSize="9.5" fill="#7C8FA0">{format(v)}</text>
        </g>
      ))}
      <rect x={padL} y={padT} width={W - padL - padR} height={zeroY - padT} fill="#EAF4F0" opacity="0.65" />
      <rect x={padL} y={zeroY} width={W - padL - padR} height={H - padB - zeroY} fill="#F9EEEC" opacity="0.65" />
      <line x1={padL} x2={W - padR} y1={zeroY} y2={zeroY} stroke="#9FB2BF" strokeWidth="1.2" />
      <path d={area} fill="#2E5E73" opacity="0.10" />
      <path d={path} fill="none" stroke="#2E5E73" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(v)} r="3" fill="#2E5E73" />
          {i % 1 === 0 && <text x={x(i)} y={H - 10} fontSize="9.5" fill="#4A5B68" textAnchor="middle">{labels[i]}</text>}
        </g>
      ))}
    </svg>
  );
}
