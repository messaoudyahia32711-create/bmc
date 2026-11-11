// ─── Demo project: a complete realistic Algerian example ─────────────────────
import { Project, newProject, newProduct, newAsset, newPersona, newCompetitor } from './types';
import { buildOperationalCashRows } from './engine';

export function buildDemoProject(): Project {
  const p = newProject({
    name: 'مخبزة وعصائر «أصيل» — مشروع تجريبي',
    demo: true,
    info: {
      projectTitleAr: 'مخبزة وعصائر «أصيل»',
      projectTitleEn: 'Aseel Bakery & Fresh Juices',
      tradeName: 'أصيل',
      legal: 'micro',
      ownerName: 'محمد أمين بلعابد',
      phone: '0555 00 00 00',
      wilaya: 'سوق أهراس',
      incubator: 'حاضنة الأعمال الجامعية',
      preparedDate: '',
      description: 'مشروع مخبزة حديثة تنتج الخبز والمعجنات الطازجة وتقدم عصائر طبيعية 100% بالفواكه الموسمية، موجّهة للطلبة والعائلات في محيط جامعي، مع خدمة توصيل للطلبات الكبيرة.',
    },
    type: { types: ['commercial', 'service'], fiscalActivity: 'production' },
    products: [
      newProduct({ name: 'خبز خاص وعادي', model: 'fixed', category: 'industrial', price: 35, variable: 14, qty: 3000, growth: 6 }),
      newProduct({ name: 'معجنات مالحة وحلوة', model: 'fixed', category: 'industrial', price: 90, variable: 40, qty: 1500, growth: 8 }),
      newProduct({ name: 'عصائر طبيعية', model: 'fixed', category: 'trade', price: 130, variable: 60, qty: 1200, growth: 10 }),
    ],
    fixed: {
      rent: 25000, utilities: 12000, internet: 2000, salaries: 60000,
      marketing: 5000, maintenance: 3000, adminCosts: 4000, otherCosts: 2000,
      fixedGrowth: 5,
    },
    assets: [
      newAsset({ name: 'فرن خبز احترافي', account: 'حـ/215 - معدات وأدوات', value: 1200000, years: 10 }),
      newAsset({ name: 'عجانة وقطّاعة', account: 'حـ/215 - معدات وأدوات', value: 450000, years: 10 }),
      newAsset({ name: 'ثلاجة عرض ومجوّفات', account: 'حـ/218 - تثبيتات عينية أخرى', value: 380000, years: 10 }),
      newAsset({ name: 'تهيئة المحل', account: 'حـ/218 - تثبيتات عينية أخرى', value: 300000, years: 10 }),
      newAsset({ name: 'رأس المال العامل', account: 'BFR - رأس مال عامل', value: 200000, years: 1 }),
    ],
    funding: {
      selfPercent: 20, loanPercent: 55, grantPercent: 25,
      preStartCosts: 45000, firstSalesMonth: 2, monthlyGrowth: 4,
      selfFunding: 0, grantAmount: 0, otherFunding: 0,
      hasLoan: 'yes', loanAmount: 0, interestRate: 5, loanYears: 5,
      hasStartupLabel: 'no', exemptionYears: 0,
    },
    market: {
      customers: '• طلبة الجامعة والعائلات في محيط 3 كلم\n• مقاهي ومطاعم صغيرة (طلبات بالجملة)\n• السكان في المنطقة الصناعية عند التوقيت الصباحي',
      valueProp: '• خبز ومعجنات طازجة طوال اليوم بسعر عادل\n• عصائر طبيعية 100% بدون مواد حافظة\n• توصيل مجاني للطلبات فوق 3000 دج',
      channels: '• بيع مباشر في المحل\n• طلبيات عبر الهاتف وواتساب\n• اتفاقيات مع المقاهي والمطاعم',
      partners: '• موردون للدقيق والفواكه بالجملة\n• حاضنة الأعمال (مرافقة وتمويل)\n• CNAS والتأمينات',
      activities: '• الإنتاج اليومي للخبز والمعجنات\n• تحضير العصائر الطازجة\n• التسويق المحلي وإدارة الطلبيات',
      growthOpt: 20, growthReal: 10, growthPes: 5,
      personas: [
        newPersona({
          name: 'الطالب الجامعي', ageRange: '18–25', location: 'حي الجامعة والمحيط', purchasingPower: 'منخفضة إلى متوسطة (3000–8000 دج شهرياً للوجبات)',
          description: 'يشتري الخبز والعصير يومياً قبل أو بعد المحاضرات، حساس للسعر لكنه يقدّر الطزاجة.', monthlyBuyers: 1500,
        }),
        newPersona({
          name: 'العائلات المجاورة', ageRange: '28–50', location: 'الأحياء السكنية المجاورة', purchasingPower: 'متوسطة',
          description: 'تسوق أسبوعياً للمعجنات والخبز بكميات أكبر، خاصة أيام نهاية الأسبوع والمناسبات.', monthlyBuyers: 350,
        }),
        newPersona({
          name: 'مقاهي ومطاعم (جملة)', ageRange: '—', location: 'المحيط الجامعي', purchasingPower: 'طلبات شهرية 20,000–60,000 دج',
          description: 'تطلب المعجنات والعصائر بالجملة أسبوعياً بعقود بسيطة.', monthlyBuyers: 12,
        }),
      ],
      competitors: [
        newCompetitor({
          name: 'مخبزة الحي التقليدية', offer: 'خبز فقط، بلا معجنات أو عصائر', priceLevel: 'low',
          strengths: 'سعر منخفض وعملاء وفون', weaknesses: 'جودة متذبذبة، خدمة بطيئة، لا توصيل',
          edge: 'تنويع المنتجات + طزاجة مضمونة + خدمة توصيل',
        }),
        newCompetitor({
          name: 'عصائر سريعة (عربة)', offer: 'عصائر فقط في المواسم', priceLevel: 'mid',
          strengths: 'سرعة ومرونة الموقع', weaknesses: 'بدون ترخيص، جودة متفاوتة، لا تبريد',
          edge: 'محل مرخص بتبريد صحي ومواصفات ثابتة',
        }),
      ],
      swot: {
        strengths: ['منتجات طازجة يومياً بجودة ثابتة', 'موقع قرب الجامعة بحركة مستمرة', 'تنويع ثلاثي: خبز + معجنات + عصائر'],
        weaknesses: ['مشروع جديد بلا ولاء سابق للعلامة', 'اعتماد على مورد واحد للدقيق مبدئياً'],
        opportunities: ['طلبات بالجملة من المقاهي والمطاعم', 'مناسبات وأعراس في المنطقة', 'توسعة لاحقة نحو التوصيل عبر تطبيق'],
        threats: ['ارتفاع أسعار المواد الأولية (دقيق، سكر)', 'دخول منافس جديد كبير في المحيط', 'موسمية العطلة الجامعية'],
      },
    },
    committee: [],
  });
  // funding amounts computed to cover investment + pre-start + working capital (2-pass convergence)
  const invest = 1200000 + 450000 + 380000 + 300000 + 200000;
  const preStart = 45000;
  let wc = 150000;
  for (let i = 0; i < 4; i++) {
    const need = invest + preStart + wc;
    p.funding.selfFunding = Math.round(need * p.funding.selfPercent / 100);
    p.funding.grantAmount = Math.round(need * p.funding.grantPercent / 100);
    p.funding.loanAmount = Math.round(need * p.funding.loanPercent / 100);
    const rows = buildOperationalCashRows(p);
    const minOp = Math.min(...rows.map(r => r.cumulative), 0);
    wc = Math.abs(Math.min(minOp, 0));
  }
  return p;
}
