// ─── BMC TOOL v2 — Data schema ────────────────────────────────────────────────
// Ported 1:1 from the original BMC-TOOL (Decision 1275 financial generator)

export type Lang = 'ar' | 'fr' | 'en';

export type ProjectType = 'service' | 'industrial' | 'commercial' | 'digital';
export type FiscalActivity = 'commercial' | 'services' | 'production' | 'mixed';
export type LegalForm = 'micro' | 'startup' | 'patent' | 'other';
export type RevenueModel = 'fixed' | 'commission' | 'subscription';
export type ProductCategory = 'service' | 'trade' | 'industrial' | 'digital';
export type YesNo = 'yes' | 'no';

export interface Product {
  id: string;
  name: string;
  model: RevenueModel;
  category: ProductCategory;
  // fixed price model
  price: number;
  variable: number;
  qty: number;
  growth: number; // annual qty growth %
  // commission model
  deal: number;
  commission: number; // %
  deals: number;
  dealCost: number;
  // subscription model
  sub: number;
  subs: number;
  subGrowth: number; // monthly %
  subCost: number;
}

export interface Asset {
  id: string;
  name: string;
  account: string;
  value: number;
  years: number;
}

export interface FixedCosts {
  rent: number;
  utilities: number;
  internet: number;
  salaries: number;
  marketing: number;
  maintenance: number;
  adminCosts: number;
  otherCosts: number;
  fixedGrowth: number; // annual %
}

export interface Funding {
  selfPercent: number;
  loanPercent: number;
  grantPercent: number;
  preStartCosts: number;
  firstSalesMonth: number; // 1..12
  monthlyGrowth: number; // year-1 monthly growth %
  selfFunding: number;
  grantAmount: number;
  otherFunding: number;
  hasLoan: YesNo;
  loanAmount: number;
  interestRate: number;
  loanYears: number;
  hasStartupLabel: YesNo;
  exemptionYears: number;
}

export interface ProjectInfo {
  projectTitleAr: string;
  projectTitleEn: string;
  tradeName: string;
  legal: LegalForm;
  ownerName: string;
  phone: string;
  wilaya: string;
  incubator: string;
  preparedDate: string;
  description: string;
}

export interface ProjectTypeState {
  types: ProjectType[];
  fiscalActivity: FiscalActivity;
}

export interface Persona {
  id: string;
  name: string;
  ageRange: string;
  location: string;
  purchasingPower: string;
  description: string;
  monthlyBuyers: number; // expected buyers/clients per month — linked to sales assumptions
}

export interface Competitor {
  id: string;
  name: string;
  offer: string;
  priceLevel: string;
  strengths: string;
  weaknesses: string;
  edge: string; // our advantage over them
}

export interface Swot {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CommitteeAnswer {
  q: string;
  a: string;
}

export interface Market {
  customers: string;
  valueProp: string;
  channels: string;
  partners: string;
  activities: string;
  growthOpt: number;
  growthReal: number;
  growthPes: number;
  personas: Persona[];
  competitors: Competitor[];
  swot: Swot;
}

export interface Project {
  id: string;
  schemaVersion: number;
  name: string;
  createdAt: number;
  updatedAt: number;
  info: ProjectInfo;
  type: ProjectTypeState;
  products: Product[];
  fixed: FixedCosts;
  assets: Asset[];
  funding: Funding;
  market: Market;
  committee: CommitteeAnswer[];
  demo?: boolean;
}

export interface Branding {
  orgName: string;
  tagline: string;
  logo: string | null; // data URL
  primary: string; // hex
  footerNote: string;
  reportCoverNote: string;
}

export const SCHEMA_VERSION = 2;

export const PROJECT_TYPE_KEYS: ProjectType[] = ['service', 'industrial', 'commercial', 'digital'];
export const LEGAL_FORMS: LegalForm[] = ['micro', 'startup', 'patent', 'other'];
export const FISCAL_ACTIVITIES: FiscalActivity[] = ['commercial', 'services', 'production', 'mixed'];
export const REVENUE_MODELS: RevenueModel[] = ['fixed', 'commission', 'subscription'];
export const PRODUCT_CATEGORIES: ProductCategory[] = ['service', 'trade', 'industrial', 'digital'];

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function newProduct(d: Partial<Product> = {}): Product {
  return {
    id: uid(), name: '', model: 'fixed', category: 'service',
    price: 0, variable: 0, qty: 0, growth: 0,
    deal: 0, commission: 0, deals: 0, dealCost: 0,
    sub: 0, subs: 0, subGrowth: 0, subCost: 0,
    ...d,
  };
}

export function newAsset(d: Partial<Asset> = {}): Asset {
  return { id: uid(), name: '', account: '', value: 0, years: 5, ...d };
}

export function newPersona(d: Partial<Persona> = {}): Persona {
  return { id: uid(), name: '', ageRange: '', location: '', purchasingPower: '', description: '', monthlyBuyers: 0, ...d };
}

export function newCompetitor(d: Partial<Competitor> = {}): Competitor {
  return { id: uid(), name: '', offer: '', priceLevel: '', strengths: '', weaknesses: '', edge: '', ...d };
}

export function newProject(d: Partial<Project> = {}): Project {
  const now = Date.now();
  return {
    id: uid(),
    schemaVersion: SCHEMA_VERSION,
    name: '',
    createdAt: now,
    updatedAt: now,
    info: {
      projectTitleAr: '', projectTitleEn: '', tradeName: '', legal: 'micro',
      ownerName: '', phone: '', wilaya: '', incubator: '', preparedDate: '', description: '',
    },
    type: { types: ['service'], fiscalActivity: 'services' },
    products: [newProduct()],
    fixed: {
      rent: 0, utilities: 0, internet: 0, salaries: 0, marketing: 0,
      maintenance: 0, adminCosts: 0, otherCosts: 0, fixedGrowth: 5,
    },
    assets: [],
    funding: {
      selfPercent: 35, loanPercent: 35, grantPercent: 30,
      preStartCosts: 0, firstSalesMonth: 1, monthlyGrowth: 0,
      selfFunding: 0, grantAmount: 0, otherFunding: 0,
      hasLoan: 'no', loanAmount: 0, interestRate: 5, loanYears: 3,
      hasStartupLabel: 'no', exemptionYears: 0,
    },
    market: {
      customers: '', valueProp: '', channels: '', partners: '', activities: '',
      growthOpt: 20, growthReal: 10, growthPes: 5,
      personas: [], competitors: [],
      swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
    },
    committee: [],
    ...d,
  };
}
