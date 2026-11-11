// ─── Algerian funding programs knowledge base + smart matching ───────────────
// Figures are indicative ranges — always confirm with the agency.
import { Project } from './types';
import { getStartupBudget } from './engine';
import { Lang } from './types';

export type Fit = 'good' | 'mid' | 'low';

export interface FundingProgram {
  id: string;
  nameKey: string;
  fit: Fit;
  who: Record<Lang, string>;
  amount: Record<Lang, string>;
  docs: Record<Lang, string[]>;
}

const L = (ar: string, fr: string, en: string): Record<Lang, string> => ({ ar, fr, en });
const LD = (ar: string[], fr: string[], en: string[]): Record<Lang, string[]> => ({ ar, fr, en });

export function matchPrograms(p: Project): FundingProgram[] {
  const budget = getStartupBudget(p).total;
  const legal = p.info.legal;
  const types = p.type.types;
  const hasIncubator = !!p.info.incubator?.trim();
  const hasLabel = p.funding.hasStartupLabel === 'yes';
  const digital = types.includes('digital');

  const anade: FundingProgram = {
    id: 'anade', nameKey: 'pgAnade',
    fit: legal === 'micro' ? 'good' : (budget >= 1000000 && budget <= 10000000 ? 'mid' : 'low'),
    who: L(
      'رواد الأعمال من 19 إلى 40 سنة للأنشطة الإنتاجية والخدمية والتجارية (مؤسسة مصغرة).',
      'Porteurs de projets de 19 à 40 ans pour des activités de production, services ou commerce (micro-entreprise).',
      'Entrepreneurs aged 19–40 for production, service or commercial activities (micro-enterprise).',
    ),
    amount: L(
      'تمويل ثلاثي: مساهمة شخصية رمادية (~1–2%)، قرض بنكي بفائدة مدعومة، وهبة من الوكالة — للمشاريع من ~1 إلى 10 ملايين دج حسب الصفة.',
      'Financement tripartite : apport personnel modique (~1–2%), crédit bancaire à taux bonifié et subvention de l’Agence — pour des projets d’environ 1 à 10 M DA selon la catégorie.',
      'Tripartite financing: minimal personal contribution (~1–2%), subsidized bank loan and agency grant — for projects of roughly 1–10 M DZD depending on category.',
    ),
    docs: LD(
      ['طلب التمويل + بطاقة التعريف الوطنية', 'شهادة الإقامة', 'شهادة عدم الملاحقة القضائية', 'خطة أعمال (تحصل عليها من هذه الأداة)', 'المؤهلات / الشهادات الدراسية'],
      ['Demande de financement, pièce d’identité nationale', 'Certificat de résidence', 'Certificat de non-condamnation', 'Business plan (obtenu via cet outil)', 'Diplômes / qualifications'],
      ['Financing application, national ID card', 'Residence certificate', 'Criminal record certificate', 'Business plan (produced by this tool)', 'Diplomas / qualifications'],
    ),
  };

  const startup1m: FundingProgram = {
    id: 'startup', nameKey: 'pgStartup',
    fit: legal === 'startup' ? 'good' : (digital ? 'mid' : 'low'),
    who: L(
      'المؤسسات الناشئة المسجلة ذات النموذج القائم على الابتكار، وخصوصاً الرقمية.',
      'Startups enregistrées à modèle fondé sur l’innovation, notamment numériques.',
      'Registered startups with an innovation-based model, especially digital ones.',
    ),
    amount: L(
      'منحة غير قابلة للاسترداد قد تصل إلى 1,000,000 دج لتغطية مرحلة التأسيس والتطوير (وفق البرنامج المعمول به).',
      'Subvention non remboursable pouvant atteindre 1 000 000 DA pour couvrir la phase de création et de développement (selon le programme en vigueur).',
      'Non-repayable grant of up to 1,000,000 DZD to cover the creation and development phase (per the current program).',
    ),
    docs: LD(
      ['تسجيل المؤسسة في سجل المؤسسات الناشئة', 'عرض المشروع (Pitch) وخطة الأعمال', 'إثبات نموذج الابتكار أو النموذج الأولي'],
      ['Enregistrement de la startup au registre dédié', 'Pitch et business plan', 'Preuve d’innovation ou prototype'],
      ['Startup registry registration', 'Pitch and business plan', 'Proof of innovation or prototype'],
    ),
  };

  const asf: FundingProgram = {
    id: 'asf', nameKey: 'pgAsf',
    fit: legal === 'startup' ? (hasLabel ? 'good' : 'mid') : (digital ? 'mid' : 'low'),
    who: L(
      'المؤسسات الناشئة الحاصلة على العلامة (Label) وتحتاج تمويل نمو بعد التأسيس.',
      'Startups labellisées nécessitant un financement de croissance après la création.',
      'Labeled startups needing growth financing after incorporation.',
    ),
    amount: L(
      'استثمار بأسهم أو تمويل مالي من صندوق النواشئ حسب قيمة الشركة وحاجاتها (قابل للتفاوض).',
      'Investissement en capital ou financement du fonds selon la valorisation et les besoins (négociable).',
      'Equity investment or fund financing based on valuation and needs (negotiable).',
    ),
    docs: LD(
      ['العلامة (Label Startup)', 'خطة التوسع والتقارير المالية', 'درجة تقييم الشركة'],
      ['Label Startup', 'Plan de croissance et états financiers', 'Valorisation de la société'],
      ['Startup Label', 'Growth plan and financial statements', 'Company valuation'],
    ),
  };

  const angem: FundingProgram = {
    id: 'angem', nameKey: 'pgAngem',
    fit: budget <= 2000000 ? 'good' : (budget <= 3500000 ? 'mid' : 'low'),
    who: L(
      'أصحاب المشاريع المصغرة جداً والأنشطة الحرفية والخدمية بمبالغ محدودة.',
      'Porteurs de très petits projets, activités artisanales et de services avec des montants limités.',
      'Very small project holders, craft and service activities with limited amounts.',
    ),
    amount: L(
      'قرض مصغر مع هبة (نسبة من المبلغ دون استرداد) — عادة ضمن حدود مليونين دج تقريباً حسب الجيل الحالي من البرنامج.',
      'Micro-crédit avec subvention (part non remboursable) — généralement dans la limite d’environ 2 M DA selon la génération actuelle du programme.',
      'Micro-credit with a grant portion — usually within roughly 2 M DZD depending on the current program.',
    ),
    docs: LD(
      ['طلب قرض', 'بطاقة التعريف والشهادة الإقامة', 'دراسة مبسطة للمشروع', 'شهادة عدم العمل'],
      ['Demande de crédit', 'Carte d’identité et certificat de résidence', 'Étude simplifiée du projet', 'Attestation de non-emploi'],
      ['Credit application', 'ID card and residence certificate', 'Simplified project study', 'Non-employment certificate'],
    ),
  };

  const cnac: FundingProgram = {
    id: 'cnac', nameKey: 'pgCnac',
    fit: legal === 'micro' ? 'mid' : (budget >= 500000 && budget <= 5000000 ? 'mid' : 'low'),
    who: L(
      'المواطنون الباحثون عن عمل ضمن شرائح عمرية محددة، لإنشاء نشاط منظم (تأكد من الشروط العمرية الحالية).',
      'Demandeurs d’emploi dans des tranches d’âge définies, pour créer une activité organisée (vérifiez les conditions d’âge en vigueur).',
      'Jobseekers within defined age brackets, to create an organized activity (check current age conditions).',
    ),
    amount: L(
      'تمويل مختلط: دعم شخصي + قرض بدون فائدة/بفائدة مدعومة + هبة من الصندوق حسب حجم المشروع.',
      'Financement mixte : apport personnel + crédit à taux zéro/bonifié + subvention du fonds selon la taille du projet.',
      'Mixed financing: personal contribution + zero-interest/subsidized loan + fund grant depending on project size.',
    ),
    docs: LD(
      ['شهادة عدم العمل', 'خطة أعمال مفصلة', 'الوثائق الإدارية للنشاط', 'التأهيل المهني عند الحاجة'],
      ['Attestation de non-emploi', 'Business plan détaillé', 'Documents administratifs de l’activité', 'Qualification professionnelle si requise'],
      ['Non-employment certificate', 'Detailed business plan', 'Administrative documents of the activity', 'Professional qualification if required'],
    ),
  };

  const d1275: FundingProgram = {
    id: 'd1275', nameKey: 'pg1275',
    fit: hasIncubator && budget <= 1500000 ? 'good' : (hasIncubator ? 'mid' : 'low'),
    who: L(
      'رواد الأعمال الطلبة/الخريجون المستفيدون من حاضنات الأعمال الجامعية (القرار 1275 المعدل والمتمم).',
      'Porteurs de projets étudiants/diplômés hébergés dans les incubateurs universitaires (Décision 1275 modifiée et complétée).',
      'Student/graduate entrepreneurs hosted by university incubators (Decision 1275, amended and supplemented).',
    ),
    amount: L(
      'منحة أولية غير قابلة للاسترداد للمشاريع المبتكرة المستقبِلة في الحاضنات (تُحدد وفق العرض المتاح بالحاضنة).',
      'Subvention initiale non remboursable pour les projets innovants hébergés en incubateur (selon l’offre disponible de l’incubateur).',
      'Initial non-repayable grant for innovative projects hosted by incubators (per the incubator’s available offer).',
    ),
    docs: LD(
      ['ملف التسجيل بالحاضنة', 'مذكرة وصف المشروع', 'عرض أمام لجنة الحاضنة (التقرير الاحترافي من هذه الأداة يكفي عادة)'],
      ['Dossier d’inscription à l’incubateur', 'Note de description du projet', 'Présentation devant le comité de l’incubateur (le rapport professionnel de cet outil convient généralement)'],
      ['Incubator registration file', 'Project description note', 'Presentation before the incubator committee (this tool’s professional report usually suffices)'],
    ),
  };

  const bank: FundingProgram = {
    id: 'bank', nameKey: 'pgBank',
    fit: budget > 5000000 ? 'good' : 'mid',
    who: L(
      'كل المشاريع المقدمة بضمانات أو عبر صندوق الضمان FGAR لتغطية جزء من القرض.',
      'Tous les projets avec garanties ou via le fonds de garantie FGAR couvrant une partie du crédit.',
      'All projects with guarantees or through the FGAR guarantee fund covering part of the loan.',
    ),
    amount: L(
      'قرض استثماري حسب الهيكل التمويلي المقترح في أداتك (النسبة المخصصة للقرض) — يمكن تعميقه عبر برامج الدعم.',
      'Crédit d’investissement selon la structure de financement proposée dans votre outil (part du prêt) — bonifiable via les dispositifs d’appui.',
      'Investment loan per the financing structure proposed in your tool (loan share) — can be subsidized through support schemes.',
    ),
    docs: LD(
      ['خطة أعمال كاملة (تصدّرها من هذه الأداة)', 'جدول الاستثمار وسداد القرض', 'الضمانات / ملف FGAR'],
      ['Business plan complet (exporté depuis cet outil)', 'Tableaux d’investissement et de remboursement', 'Garanties / dossier FGAR'],
      ['Full business plan (exported from this tool)', 'Investment and repayment tables', 'Guarantees / FGAR file'],
    ),
  };

  const order: Record<Fit, number> = { good: 0, mid: 1, low: 2 };
  return [anade, startup1m, asf, angem, cnac, d1275, bank].sort((a, b) => order[a.fit] - order[b.fit]);
}

// ─── Legal form advisor ──────────────────────────────────────────────────────
export interface LegalRow { id: string; tax: Record<Lang, string>; social: Record<Lang, string>; liability: Record<Lang, string>; best: Record<Lang, string> }

export const LEGAL_ROWS: LegalRow[] = [
  {
    id: 'micro',
    tax: L('إعفاءات ANADE في مرحلة الاستغلال (تعليمياً حتى 5 سنوات) ثم IBS/IFU حسب النشاط', 'Exonérations ANADE en phase d’exploitation (jusqu’à 5 ans, à titre pédagogique) puis IBS/IFU selon l’activité', 'ANADE exemptions in the operating phase (up to 5 years, educationally) then IBS/IFU per activity'),
    social: L('CASNOS للمستقل، CNAS عند التوظيف', 'CASNOS pour l’indépendant, CNAS lors des embauches', 'CASNOS for the self-employed, CNAS when hiring'),
    liability: L('مسؤولية مرتبطة بصيغة التأسيس (شخص طبيعي غالباً)', 'Responsabilité liée à la forme de constitution (personne physique généralement)', 'Liability tied to the incorporation form (usually a natural person)'),
    best: L('مشاريع إنتاج وخدمات صغيرة بميزانية 1–10 ملايين دج ضمن برنامج ANADE', 'Petits projets de production et services avec 1–10 M DA dans le programme ANADE', 'Small production & service projects with 1–10 M DZD under the ANADE program'),
  },
  {
    id: 'startup',
    tax: L('إعفاءات مرتبطة بالعلامة (مبدئياً حتى 4 سنوات حسب الإطار) ونظام موثّق للابتكار', 'Exonérations liées au Label (jusqu’à 4 ans initialement selon le cadre) et régime documenté pour l’innovation', 'Label-linked exemptions (initially up to 4 years per the framework) and a documented innovation regime'),
    social: L('نظام CNAS كصاحب عمل، ومنظومة خاصة للموظفين حسب العقود', 'CNAS en tant qu’employeur, dispositifs spécifiques selon les contrats', 'CNAS as employer, specific schemes per contracts'),
    liability: L('مسؤولية محدودة بمقدار رأس المال (شخص معنوي)', 'Responsabilité limitée au capital (personne morale)', 'Liability limited to capital (legal entity)'),
    best: L('مشاريع رقمية ومبتكرة قابلة للتوسع بشراكات مستثمرين', 'Projets numériques et innovants évolutifs avec des investisseurs', 'Scalable digital and innovative projects with investors'),
  },
  {
    id: 'patent',
    tax: L('تعامل جبائي كمؤسسة عادية + مزايا ملف الابتكار (براءة) عند طلب الإعفاء', 'Traitement fiscal d’entreprise classique + avantages du dossier d’innovation (brevet) pour les demandes d’exonération', 'Classic corporate tax treatment + innovation dossier (patent) advantages for exemption requests'),
    social: L('حسب صيغة التأسيس المختارة', 'Selon la forme juridique choisie', 'Per the chosen incorporation form'),
    liability: L('حسب الصيغة (شخص طبيعي أو معنوي)', 'Selon la forme (personne physique ou morale)', 'Per the form (natural or legal person)'),
    best: L('مشاريع تقنية بمنتج محمي ببراءة اختراع', 'Projets technologiques avec un produit protégé par brevet', 'Tech projects with a patent-protected product'),
  },
  {
    id: 'other',
    tax: L('IFU حتى 30 مليون دج ثم النظام الحقيقي IBS (19/23/26% حسب النشاط)', 'IFU jusqu’à 30 M DA puis régime réel IBS (19/23/26% selon l’activité)', 'IFU up to 30 M DZD then real regime IBS (19/23/26% per activity)'),
    social: L('CASNOS للمستقل أو CNAS للمؤسسة', 'CASNOS pour l’indépendant ou CNAS pour l’entreprise', 'CASNOS for self-employed or CNAS for the company'),
    liability: L('حسب الصيغة المختارة مع الموثق', 'Selon la forme choisie avec le notaire', 'Per the form chosen with a notary'),
    best: L('أنشطة تجارية وخدمية كلاسيكية بدون برنامج دعم', 'Activités commerciales et de services classiques sans dispositif d’appui', 'Classic commercial and service activities without a support scheme'),
  },
];

export function legalRecommendation(p: Project): { key: string; why: Record<Lang, string> } {
  const types = p.type.types;
  const budget = getStartupBudget(p).total;
  if (p.info.legal === 'startup' || (types.includes('digital') && budget <= 3000000)) {
    return {
      key: 'startup',
      why: L(
        'مشروعك رقمي/مبتكر: صيغة المؤسسة الناشئة تفتح لك منحة المليون دج وصندوق النواشئ وإعفاءات العلامة.',
        'Votre projet est numérique/innovant : la forme startup ouvre la subvention d’1M DA, le fonds ASF et les exonérations du Label.',
        'Your project is digital/innovative: the startup form opens the 1M DZD grant, the ASF fund and Label exemptions.',
      ),
    };
  }
  if (budget >= 1000000 && budget <= 10000000 && !types.includes('digital')) {
    return {
      key: 'micro',
      why: L(
        'حجم استثمارك يقع في نطاق ANADE: صيغة المؤسسة المصغرة تعطيك تمويلاً ثلاثياً بمساهمة شخصية رمزية وإعفاءات.',
        'Votre investissement est dans le périmètre ANADE : la micro-entreprise donne un financement tripartite à apport symbolique et des exonérations.',
        'Your investment is in the ANADE range: the micro-enterprise form gives tripartite financing with a symbolic contribution and exemptions.',
      ),
    };
  }
  return {
    key: 'other',
    why: L(
      'بدون برنامج دعم واضح: الصيغة الكلاسيكية (مؤسسة عادية) أسهل إدارياً، ويمكنك التقدم لاحقاً لبرامج الدعم عند استيفاء الشروط.',
      'Sans dispositif d’appui clair : la forme classique est plus simple administrativement ; vous pourrez postuler plus tard aux programmes d’appui.',
      'No clear support scheme: the classic form is administratively simpler; you can apply later to support programs.',
    ),
  };
}
