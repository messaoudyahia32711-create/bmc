// ─── Reference definitions & formulas for every annex/section ────────────────
// STATIC educational content: identical in every project — only the numbers,
// tables and charts change from one project to another. Formulas mirror 1:1
// what src/lib/engine.ts actually computes.
import { Lang } from './types';

export interface FormulaRow { label: string; expr: string }
export interface AnnexDoc {
  def: string;                 // full definition (report)
  short: string;               // one-line version (deck slide note)
  formulas: FormulaRow[];
  note?: string;               // legend / caveat
}

export type DocKey =
  | 'unitEconomics' | 'breakEven' | 'scenarios' | 'detailedRevenue' | 'assets'
  | 'financing' | 'loan' | 'cashflow' | 'cashGap' | 'tax' | 'scf'
  | 'bmc' | 'bmcFinance' | 'indicators';

const ar: Record<DocKey, AnnexDoc> = {
  unitEconomics: {
    def: 'يعرض هذا القسم اقتصاديات الوحدة لكل منتج أو خدمة. هامش الوحدة هو الفرق بين سعر البيع للوحدة وتكلفتها المتغيرة، وهو ما يتبقى من كل وحدة مبيعة لتغطية التكاليف الثابتة ثم توليد الربح؛ فإذا كان هامش الوحدة سالباً أو ضعيفاً فإن ازدياد الكميات يضخّم الخسارة بدل الربح.',
    short: 'هامش الوحدة = سعر البيع − التكلفة المتغيرة؛ ومنه تُبنى كل النتائج الشهرية.',
    formulas: [
      { label: 'هامش الوحدة', expr: 'MU = P − CVu' },
      { label: 'الإيراد الشهري', expr: 'CA = P × Q' },
      { label: 'الهامش الشهري', expr: 'M = MU × Q' },
      { label: 'نسبة الهامش', expr: 'Taux = (P − CVu) ÷ P × 100' },
    ],
    note: 'P سعر البيع للوحدة، CVu التكلفة المتغيرة للوحدة، Q الكمية المبيعة شهرياً.',
  },
  breakEven: {
    def: 'نقطة التعادل هي مستوى النشاط الذي تغطي فيه الإيرادات كامل التكاليف (الثابتة والمتغيرة) فلا ربح ولا خسارة. وهي من أهم المؤشرات التي تبحث عنها لجنة التقييم: كلما بلُغت نقطة التعادل مبكراً كان المشروع أقل عرضة للخطر. وتُقدَّم هنا بثلاث صيغ: بالقيمة، وبالكمية، وبالمدة الشهرية اللازمة لبلوغها.',
    short: 'نقطة التعادل: مستوى المبيعات الذي تُغطّى عنده كل التكاليف دون ربح أو خسارة.',
    formulas: [
      { label: 'هامش التكاليف المتغيرة', expr: 'M/CV = CA − CV' },
      { label: 'نسبة الهامش', expr: 'Taux M/CV = (CA − CV) ÷ CA' },
      { label: 'نقطة التعادل بالقيمة', expr: 'SR = CF ÷ Taux M/CV' },
      { label: 'نقطة التعادل بالكمية', expr: 'SRq = CF ÷ M/CV unitaire' },
      { label: 'نقطة التعادل بالمدة', expr: 'Durée (mois) = SR ÷ CA mensuel' },
    ],
    note: 'CF التكاليف الثابتة الشهرية، CV التكاليف المتغيرة، CA رقم الأعمال الشهري، M/CV unitaire = سعر البيع − التكلفة المتغيرة للوحدة.',
  },
  scenarios: {
    def: 'يُسقَط رقم الأعمال على خمس سنوات وفق ثلاثة سيناريوهات للنمو السنوي: متفائل وواقعي ومتحفظ. يُعتمد السيناريو الواقعي في باقي الحسابات، بينما يُستخدم التفاوت بين السيناريوهات لقياس حساسية المشروع لتطور السوق ولإثبات أن الجدوى ليست مبنية على فرضية واحدة مثالية.',
    short: 'رقم الأعمال يُسقَط على 5 سنوات بثلاثة سيناريوهات نمو: متفائل، واقعي، متحفظ.',
    formulas: [
      { label: 'رقم الأعمال في السنة t', expr: 'CA(t) = CA(1) × (1 + g)^(t−1)' },
      { label: 'معدل النمو السنوي المركب', expr: 'TCAM = (CA(5) ÷ CA(1))^(1/4) − 1' },
    ],
    note: 'g معدل النمو السنوي المفترض للكميات في السيناريو المعني.',
  },
  detailedRevenue: {
    def: 'تفصيل سنوي لرقم الأعمال في السيناريو الواقعي إلى تكاليف متغيرة وهامش إجمالي ونسبة هامش، لبيان قدرة النشاط على توليد الهامش الذي سيغطي التكاليف الثابتة. فإذا قلّت النسبة عن 20% وجب مراجعة التسعير أو هيكل التكاليف.',
    short: 'الهامش الإجمالي = رقم الأعمال − التكاليف المتغيرة؛ ونسبته مقياس قدرة التغطية.',
    formulas: [
      { label: 'الهامش الإجمالي', expr: 'Marge brute = CA − CV' },
      { label: 'النسبة', expr: 'Taux = Marge brute ÷ CA × 100' },
    ],
  },
  assets: {
    def: 'تُدرَج في هذا الملحق كل الاستثمارات الأولية وفق طبيعتها ومَرقمها المحاسبي في النظام المحاسبي المالي (SCF)، ويُحتسب اهتلاكها بطريقة الخط الثابت على مدى مدة الاستعمال المقدَّرة لكل أصل. والاهتلاك عبء محاسبي غير نقدي يُخصم من النتيجة قبل الضريبة ولا يخرج من الخزينة.',
    short: 'الاهتلاك الخطي = قيمة الأصل ÷ مدة استعماله؛ وهو عبء محاسبي غير نقدي.',
    formulas: [
      { label: 'قسط الاهتلاك السنوي (خطي)', expr: 'Dotation = Valeur ÷ Durée' },
      { label: 'إجمالي الاستثمار', expr: 'I = Σ Valeurs' },
      { label: 'مجموع الاهتلاكات السنوي', expr: 'Σ Dotations' },
    ],
    note: 'المدد المعتادة: سنة لمصاريف التأسيس، 3 سنوات للبرمجيات، 5 سنوات للعتاد الإعلامي والمكتبي، 10 سنوات للآلات والمعدات.',
  },
  financing: {
    def: 'يقارن هذا الملحق بين إجمالي الحاجة المالية للمشروع (الاستثمارات + رأس المال العامل) ومصادر التمويل المجمَّعة (مساهمة شخصية، هبة/دعم، قرض بنكي)، فيُظهر فجوة تمويلية يجب معالجتها أو اكتمالاً في التغطية. ويُحتسب رأس المال العامل انطلاقاً من أدنى رصيد خزينة متراكم متوقع خلال السنة الأولى.',
    short: 'الحاجة المالية = الاستثمارات + رأس المال العامل؛ والفجوة = الحاجة − التمويل المجمَّع.',
    formulas: [
      { label: 'الحاجة المالية', expr: 'Besoin = Investissements + BFR' },
      { label: 'رأس المال العامل', expr: 'BFR = | min(0 ; Trésorerie cumulée) |' },
      { label: 'الفجوة التمويلية', expr: 'Écart = Besoin − (Apport + Subvention + Crédit)' },
    ],
  },
  loan: {
    def: 'جدول سداد القرض بنظام الأقساط السنوية الثابتة: القسط ثابت عبر المدة، لكن تركيبته تتغير من سنة لأخرى؛ فالفوائد تُحتسب على الرصيد المتبقي فتتناقص حصتها عاماً بعد عام مقابل تزايد حصة أصل الدين المُسدَّد.',
    short: 'القسط الثابت يوزَّع بين فوائد على الرصيد المتبقي وأصل الدين المُسدَّد.',
    formulas: [
      { label: 'القسط السنوي الثابت', expr: 'A = C × i ÷ (1 − (1 + i)^−n)' },
      { label: 'فائدة السنة y', expr: 'Int(y) = Solde(y−1) × i' },
      { label: 'أصل المُسدَّد', expr: 'Principal(y) = A − Int(y)' },
      { label: 'القسط الشهري', expr: 'Mensualité = A ÷ 12' },
    ],
    note: 'C مبلغ القرض، i نسبة الفائدة السنوية، n المدة بالسنوات، Solde الرصيد المتبقي.',
  },
  cashflow: {
    def: 'خطة الخزينة الشهرية للسنة الأولى: يُقابل فيها كل شهر التحصيلات المتوقعة مع المدفوعات (تكاليف متغيرة، تكاليف ثابتة، قسط القرض)، ويُرحَّل الرصيد المتراكم من شهر لآخر انطلاقاً من رصيد البدء (التمويل المجمَّع − الاستثمارات − مصاريف ما قبل التشغيل). والخزينة أول ما تجفّ منه المشاريع؛ لذلك يُعد هذا الملحق من أدق الملاحق وأكثرها إقناعاً للجنة.',
    short: 'صافي كل شهر = التحصيلات − المدفوعات، ويُرحَّل المتراكم شهراً بعد شهر.',
    formulas: [
      { label: 'المدفوعات الشهرية', expr: 'Décaiss. = CV + CF + Échéance' },
      { label: 'الصافي الشهري', expr: 'Solde(m) = Encaiss.(m) − Décaiss.(m)' },
      { label: 'الرصيد المتراكم', expr: 'Cumul(m) = Cumul(m−1) + Solde(m)' },
      { label: 'رصيد البدء', expr: 'Cumul(0) = Financement − Invest. − Pré-démarrage' },
    ],
    note: 'الاهتلاك لا يدخل خطة الخزينة لأنه ليس تدفقاً نقدياً.',
  },
  cashGap: {
    def: 'يحدّد هذا الملحق الأشهر التي يغيب فيها الرصيد المتراكم عن الصفر، وأدنى نقطة تبلغها الخزينة، ومن ثمّ الحد الأدنى من التغطية النقدية اللازمة لضمان السيولة طوال السنة الأولى. فظهور رصيد موجب في نهاية السنة لا يغني عن تغطية العجز في أشهرها الأولى.',
    short: 'الحاجة النقدية = القيمة المطلقة لأدنى رصيد متراكم خلال 12 شهراً.',
    formulas: [
      { label: 'أدنى خزينة', expr: 'Trésorerie min = min (Cumul)' },
      { label: 'التغطية النقدية المطلوبة', expr: 'Couverture = | min(0 ; Cumul) |' },
    ],
  },
  tax: {
    def: 'محاكاة العبء الجبائي على خمس سنوات وفق الأنظمة الجزائرية المعمول بها: نظام الضريبة الثابتة IFU المبنية على رقم الأعمال إذا لم يتعدَّ 30 مليون دج (5% للتجارة والإنتاج، 12% للخدمات، 10% للنشاط المختلط)، ونظام الضريبة على أرباح الشركات IBS بعد ذلك بنسبة 19% للإنتاج و23% للنشاط المختلط و26% للخدمات، مع احتساب سنوات الإعفاء وفق الصيغة القانونية وعلامة المشروع الناشئ.',
    short: 'IFU على رقم الأعمال حتى 30 مليون دج، ثم IBS على الربح (19/23/26%).',
    formulas: [
      { label: 'الضريبة الثابتة', expr: 'IFU = CA × Taux (5% / 10% / 12%)' },
      { label: 'الضريبة على الأرباح', expr: 'IBS = Résultat avant impôt × (19% / 23% / 26%)' },
      { label: 'النتيجة الصافية', expr: 'RN = Résultat avant impôt − Impôt' },
    ],
    note: 'المحاكاة تعليمية؛ تُراجع مع محاسب معتمد وفق آخر التعديلات القانونية.',
  },
  scf: {
    def: 'جدول حسابات النتائج وفق النظام المحاسبي المالي الجزائري (SCF) لخمس سنوات: يبدأ من رقم الأعمال ويُخصم منه الاستهلاكات الوسيطة للوصول إلى القيمة المضافة، ثم أعباء الأجراء لبلوغ فائض التشغيل الإجمالي (EBE)، ثم الاهتلاكات للنتيجة التشغيلية، وأخيراً الضريبة للنتيجة الصافية. وترقيم الحسابات (70، 60-62، 63-64، 68، 69) وفق دليل الحسابات الوطني.',
    short: 'من رقم الأعمال إلى النتيجة الصافية عبر: القيمة المضافة، EBE، النتيجة التشغيلية، ثم الضريبة.',
    formulas: [
      { label: 'القيمة المضافة', expr: 'VA = 70 − (60 + 61 + 62)' },
      { label: 'فائض التشغيل الإجمالي', expr: 'EBE = VA − (63 + 64)' },
      { label: 'النتيجة التشغيلية', expr: 'RE = EBE − 68' },
      { label: 'النتيجة الصافية', expr: 'RN = RE − 69' },
    ],
    note: '70: رقم الأعمال — 60/61/62: استهلاكات وسيطة — 63/64: أعباء الأجراء — 68: اهتلاكات — 69: ضرائب ورسوم.',
  },
  bmc: {
    def: 'نموذج العمل التجاري (BMC) أداة تخطيط استراتيجية من تسع خانات متكاملة تُلخّص منطق خلق القيمة وتقديمها والتقاطها: الشركاء الرئيسيون، الأنشطة الأساسية، الموارد الأساسية، عرض القيمة، علاقات العملاء، القنوات، شرائح العملاء، هيكل التكاليف، وتدفقات الإيرادات. والخانات مترابطة؛ فأي تعديل في عرض القيمة أو الشرائح ينعكس مباشرة على هيكل التكاليف والإيرادات المفصَّل في الملحق الموالي.',
    short: 'تسع خانات تربط عرض القيمة بالسوق وبالهيكل المالي للمشروع.',
    formulas: [
      { label: 'النتيجة الشهرية قبل الضريبة', expr: 'R = CA − (CV + CF + D)' },
    ],
    note: 'CA الإيراد الشهري، CV التكاليف المتغيرة، CF التكاليف الثابتة، D الاهتلاك الشهري.',
  },
  bmcFinance: {
    def: 'يُترجم هذا الملحق خانات نموذج العمل إلى أرقام مالية مباشرة: كل شريحة من العملاء وكل عرض قيمة تقابلها كمية مبيعة وإيراد شهري، وكل نشاط ومورد يقابله بند تكلفة. ويُظهر الإجمالي الشهري والسنوي للتكاليف (متغيرة + ثابتة + اهتلاك) مقابل الإيراد، ليؤكد أن BMC ليس ملصقاً تسويقياً بل نظام اقتصادي قابل للقياس.',
    short: 'كل خانة في BMC لها ترجمة مالية: إيرادات مقابل تكاليف شهرية وسنوية.',
    formulas: [
      { label: 'التكلفة الشهرية الكلية', expr: 'CT = CV + CF + D' },
      { label: 'النتيجة الشهرية', expr: 'R = CA − CT' },
    ],
  },
  indicators: {
    def: 'تُترجم لوحة المؤشرات الأرقام الخام إلى قراءة تقييمية معيارية: يُقارن كل مؤشر بعتبات مرجعية (جيد / متوسط / ضعيف) لتُعطى لصاحب المشروع ولجنة التقييم رؤية فورية عن مواطن القوة ومواطن الخطر وترتيب الأولويات. فالعائد على الاستثمار يقيس مردودية كل دينار مُموَّل، ومدة الاسترداد تقيس السرعة التي يستعيد بها المشروع تمويله، مع احتساب الاهتلاكات لأنها تدفق نقدي محتجز داخل المؤسسة.',
    short: 'كل مؤشر يُقارن بعتبات مرجعية: جيد، متوسط، ضعيف — لقراءة وقرار واضحين.',
    formulas: [
      { label: 'العائد على الاستثمار', expr: 'ROI = RN (an 1) ÷ Financement × 100' },
      { label: 'مدة الاسترداد', expr: 'Payback = Financement ÷ (RN + Dotations)' },
      { label: 'نسبة القيمة المضافة', expr: 'VA ÷ CA' },
      { label: 'نسبة فائض التشغيل', expr: 'EBE ÷ CA' },
      { label: 'هامش التكاليف المتغيرة', expr: '(CA − CV) ÷ CA' },
    ],
  },
};

const fr: Record<DocKey, AnnexDoc> = {
  unitEconomics: {
    def: 'Cette section présente l’économie unitaire de chaque produit ou service. La marge unitaire est la différence entre le prix de vente unitaire et le coût variable unitaire : c’est ce qui reste de chaque unité vendue pour couvrir les charges fixes puis générer le profit. Une marge unitaire nulle ou négative fait que l’augmentation des volumes amplifie la perte au lieu du profit.',
    short: 'Marge unitaire = prix de vente − coût variable ; c’est d’elle que découlent les résultats mensuels.',
    formulas: [
      { label: 'Marge unitaire', expr: 'MU = P − CVu' },
      { label: 'CA mensuel', expr: 'CA = P × Q' },
      { label: 'Marge mensuelle', expr: 'M = MU × Q' },
      { label: 'Taux de marge', expr: 'Taux = (P − CVu) ÷ P × 100' },
    ],
    note: 'P prix de vente unitaire, CVu coût variable unitaire, Q quantité vendue par mois.',
  },
  breakEven: {
    def: 'Le seuil de rentabilité est le niveau d’activité auquel les recettes couvrent la totalité des charges (fixes et variables), sans bénéfice ni perte. C’est l’un des premiers points examinés par le comité : plus le seuil est atteint tôt, moins le projet est exposé au risque. Il est présenté ici en valeur, en quantité et en durée (mois).',
    short: 'Seuil de rentabilité : niveau de ventes où toutes les charges sont couvertes, sans profit ni perte.',
    formulas: [
      { label: 'Marge sur coûts variables', expr: 'M/CV = CA − CV' },
      { label: 'Taux de marge', expr: 'Taux M/CV = (CA − CV) ÷ CA' },
      { label: 'Seuil en valeur', expr: 'SR = CF ÷ Taux M/CV' },
      { label: 'Seuil en quantité', expr: 'SRq = CF ÷ M/CV unitaire' },
      { label: 'Seuil en durée', expr: 'Durée (mois) = SR ÷ CA mensuel' },
    ],
    note: 'CF charges fixes mensuelles, CV charges variables, CA chiffre d’affaires mensuel.',
  },
  scenarios: {
    def: 'Le chiffre d’affaires est projeté sur cinq ans selon trois scénarios de croissance annuelle : optimiste, réaliste et prudent. Le scénario réaliste alimente le reste des calculs ; l’écart entre scénarios mesure la sensibilité du projet et prouve que la rentabilité ne repose pas sur une hypothèse unique idéale.',
    short: 'CA projeté sur 5 ans selon trois scénarios : optimiste, réaliste, prudent.',
    formulas: [
      { label: 'CA de l’année t', expr: 'CA(t) = CA(1) × (1 + g)^(t−1)' },
      { label: 'Croissance annuelle moyenne', expr: 'TCAM = (CA(5) ÷ CA(1))^(1/4) − 1' },
    ],
    note: 'g taux de croissance annuel supposé des quantités.',
  },
  detailedRevenue: {
    def: 'Détail annuel du chiffre d’affaires du scénario réaliste en coûts variables, marge brute et taux de marge, afin de mesurer la capacité de l’activité à générer la marge qui couvrira les charges fixes. Un taux inférieur à 20 % appelle une révision du prix ou de la structure des coûts.',
    short: 'Marge brute = CA − coûts variables ; son taux mesure la capacité de couverture.',
    formulas: [
      { label: 'Marge brute', expr: 'Marge brute = CA − CV' },
      { label: 'Taux', expr: 'Taux = Marge brute ÷ CA × 100' },
    ],
  },
  assets: {
    def: 'Toutes les immobilisations sont listées selon leur nature et leur compte du Système Comptable Financier (SCF), et amorties en linéaire sur leur durée d’utilité estimée. L’amortissement est une charge calculée, non décaissée : il réduit le résultat imposable sans sortir de la trésorerie.',
    short: 'Amortissement linéaire = valeur ÷ durée d’utilité ; charge calculée, non décaissée.',
    formulas: [
      { label: 'Dotation annuelle (linéaire)', expr: 'Dotation = Valeur ÷ Durée' },
      { label: 'Investissement total', expr: 'I = Σ Valeurs' },
      { label: 'Total des dotations', expr: 'Σ Dotations' },
    ],
    note: 'Durées usuelles : 1 an frais d’établissement, 3 ans logiciels, 5 ans matériel informatique et bureau, 10 ans machines et équipements.',
  },
  financing: {
    def: 'Ce tableau compare le besoin financier total (investissements + fonds de roulement) aux ressources réunies (apport personnel, subvention, crédit bancaire) et fait apparaître un éventuel déficit à corriger. Le fonds de roulement est calculé à partir du plus bas cumul de trésorerie prévisible de l’année 1.',
    short: 'Besoin = investissements + fonds de roulement ; écart = besoin − financement réuni.',
    formulas: [
      { label: 'Besoin financier', expr: 'Besoin = Investissements + BFR' },
      { label: 'Fonds de roulement', expr: 'BFR = | min(0 ; Trésorerie cumulée) |' },
      { label: 'Écart de financement', expr: 'Écart = Besoin − (Apport + Subvention + Crédit)' },
    ],
  },
  loan: {
    def: 'Échéancier de remboursement à annuités constantes : le versement est fixe, mais sa composition évolue — les intérêts, calculés sur le solde restant dû, diminuent d’année en année au profit du capital remboursé.',
    short: 'L’annuité constante se répartit entre intérêts sur le solde et capital remboursé.',
    formulas: [
      { label: 'Annuité constante', expr: 'A = C × i ÷ (1 − (1 + i)^−n)' },
      { label: 'Intérêts de l’année y', expr: 'Int(y) = Solde(y−1) × i' },
      { label: 'Capital remboursé', expr: 'Principal(y) = A − Int(y)' },
      { label: 'Mensualité', expr: 'Mensualité = A ÷ 12' },
    ],
    note: 'C capital emprunté, i taux annuel, n durée en années, Solde capital restant dû.',
  },
  cashflow: {
    def: 'Plan de trésorerie mensuel de l’année 1 : chaque mois confronte les encaissements prévus aux décaissements (coûts variables, charges fixes, échéance de crédit), avec report du cumul à partir du solde de départ (financement − investissements − frais pré-démarrage). La trésorerie est la première cause d’échec des projets ; ce tableau est donc le plus scruté par le comité.',
    short: 'Solde du mois = encaissements − décaissements, avec cumul reporté de mois en mois.',
    formulas: [
      { label: 'Décaissements du mois', expr: 'Décaiss. = CV + CF + Échéance' },
      { label: 'Solde du mois', expr: 'Solde(m) = Encaiss.(m) − Décaiss.(m)' },
      { label: 'Cumul', expr: 'Cumul(m) = Cumul(m−1) + Solde(m)' },
      { label: 'Solde de départ', expr: 'Cumul(0) = Financement − Invest. − Pré-démarrage' },
    ],
    note: 'L’amortissement n’entre pas dans le plan de trésorerie : ce n’est pas un flux monétaire.',
  },
  cashGap: {
    def: 'Ce tableau identifie les mois où le cumul passe sous zéro, le point le plus bas de la trésorerie et, par conséquent, la couverture minimale nécessaire pour sécuriser la liquidité de l’année 1. Un cumul positif en fin d’année ne compense pas un déficit des premiers mois.',
    short: 'Couverture nécessaire = valeur absolue du plus bas cumul de trésorerie sur 12 mois.',
    formulas: [
      { label: 'Trésorerie minimale', expr: 'Trésorerie min = min (Cumul)' },
      { label: 'Couverture requise', expr: 'Couverture = | min(0 ; Cumul) |' },
    ],
  },
  tax: {
    def: 'Simulation de la charge fiscale sur cinq ans selon les dispositifs algériens : IFU (assise sur le chiffre d’affaires) si celui-ci n’excède pas 30 M DA (5 % commerce et production, 12 % services, 10 % mixte), puis IBS sur le bénéfice (19 % production, 23 % mixte, 26 % services), en tenant compte des années d’exonération selon la forme juridique et le label startup.',
    short: 'IFU sur le CA jusqu’à 30 M DA, puis IBS sur le résultat (19/23/26 %).',
    formulas: [
      { label: 'IFU', expr: 'IFU = CA × Taux (5% / 10% / 12%)' },
      { label: 'IBS', expr: 'IBS = Résultat avant impôt × (19% / 23% / 26%)' },
      { label: 'Résultat net', expr: 'RN = Résultat avant impôt − Impôt' },
    ],
    note: 'Simulation pédagogique, à faire valider par un comptable agréé.',
  },
  scf: {
    def: 'Comptes de résultat selon le Système Comptable Financier (SCF) sur cinq ans : du chiffre d’affaires on déduit les consommations intermédiaires pour obtenir la valeur ajoutée, puis les charges de personnel pour atteindre l’EBE, puis les dotations aux amortissements pour le résultat opérationnel, enfin l’impôt pour le résultat net. La numérotation suit le plan comptable national (70, 60-62, 63-64, 68, 69).',
    short: 'Du CA au résultat net : valeur ajoutée, EBE, résultat opérationnel, impôt.',
    formulas: [
      { label: 'Valeur ajoutée', expr: 'VA = 70 − (60 + 61 + 62)' },
      { label: 'Excédent brut d’exploitation', expr: 'EBE = VA − (63 + 64)' },
      { label: 'Résultat opérationnel', expr: 'RE = EBE − 68' },
      { label: 'Résultat net', expr: 'RN = RE − 69' },
    ],
    note: '70 : CA — 60/61/62 : consommations intermédiaires — 63/64 : charges de personnel — 68 : dotations — 69 : impôts et taxes.',
  },
  bmc: {
    def: 'Le Business Model Canvas (BMC) est une matrice stratégique de neuf blocs interdépendants qui résume la logique de création, de délivrance et de capture de valeur : partenaires, activités, ressources, proposition de valeur, relations clients, canaux, segments, structure de coûts et flux de revenus. Tout changement d’un bloc se répercute sur la traduction financière détaillée dans l’annexe suivante.',
    short: 'Neuf blocs qui relient la proposition de valeur au marché et à l’équilibre financier.',
    formulas: [
      { label: 'Résultat mensuel avant impôt', expr: 'R = CA − (CV + CF + D)' },
    ],
    note: 'CA revenu mensuel, CV coûts variables, CF charges fixes, D amortissement mensuel.',
  },
  bmcFinance: {
    def: 'Cette annexe traduit chaque bloc du BMC en données financières : à chaque segment et proposition de valeur correspondent des quantités vendues et un revenu mensuel ; à chaque activité et ressource correspond un poste de coût. Elle confirme que le BMC est un système économique mesurable, non un simple poster.',
    short: 'Chaque bloc du BMC a sa traduction financière : revenus contre coûts, mensuels et annuels.',
    formulas: [
      { label: 'Coût total mensuel', expr: 'CT = CV + CF + D' },
      { label: 'Résultat mensuel', expr: 'R = CA − CT' },
    ],
  },
  indicators: {
    def: 'Le tableau d’indicateurs traduit les chiffres bruts en lecture normative : chaque indicateur est comparé à des seuils (bon / moyen / faible) pour donner au porteur et au comité une vision immédiate des forces, des risques et des priorités. Le ROI mesure le rendement de chaque dinar investi ; le payback mesure la vitesse de récupération du financement, dotations incluses car ce sont des flux de trésorerie retenus.',
    short: 'Chaque indicateur est comparé à des seuils : bon, moyen, faible — pour une lecture et une décision claires.',
    formulas: [
      { label: 'Retour sur investissement', expr: 'ROI = RN (an 1) ÷ Financement × 100' },
      { label: 'Payback', expr: 'Payback = Financement ÷ (RN + Dotations)' },
      { label: 'Taux de valeur ajoutée', expr: 'VA ÷ CA' },
      { label: 'Taux d’EBE', expr: 'EBE ÷ CA' },
      { label: 'Taux de marge sur coûts variables', expr: '(CA − CV) ÷ CA' },
    ],
  },
};

const en: Record<DocKey, AnnexDoc> = {
  unitEconomics: {
    def: 'This section presents the unit economics of each product or service. The unit margin is the difference between the unit selling price and the unit variable cost: it is what each sold unit contributes toward fixed costs and then profit. A zero or negative unit margin means higher volumes amplify losses instead of profits.',
    short: 'Unit margin = selling price − variable cost; all monthly results build upon it.',
    formulas: [
      { label: 'Unit margin', expr: 'M = P − VC' },
      { label: 'Monthly revenue', expr: 'Rev = P × Q' },
      { label: 'Monthly margin', expr: 'Margin = M × Q' },
      { label: 'Margin rate', expr: 'Rate = (P − VC) ÷ P × 100' },
    ],
    note: 'P unit price, VC unit variable cost, Q quantity sold per month.',
  },
  breakEven: {
    def: 'The break-even point is the activity level at which revenues cover all costs (fixed and variable), with neither profit nor loss. It is among the first items a committee examines: the earlier the break-even is reached, the lower the project’s exposure to risk. It is shown here in value, in quantity and in time (months).',
    short: 'Break-even: the sales level where all costs are covered — no profit, no loss.',
    formulas: [
      { label: 'Contribution margin', expr: 'CM = Rev − VC' },
      { label: 'CM rate', expr: 'CM rate = (Rev − VC) ÷ Rev' },
      { label: 'Break-even (value)', expr: 'BE = FC ÷ CM rate' },
      { label: 'Break-even (units)', expr: 'BE units = FC ÷ unit CM' },
      { label: 'Break-even (time)', expr: 'BE months = BE ÷ monthly Rev' },
    ],
    note: 'FC fixed monthly costs, VC variable costs, Rev monthly revenue, unit CM = price − unit variable cost.',
  },
  scenarios: {
    def: 'Revenue is projected over five years under three annual-growth scenarios: optimistic, realistic and prudent. The realistic scenario feeds the rest of the calculations; the spread between scenarios measures the project’s sensitivity and shows that profitability does not rest on a single optimistic assumption.',
    short: 'Revenue projected over 5 years under three scenarios: optimistic, realistic, prudent.',
    formulas: [
      { label: 'Revenue of year t', expr: 'Rev(t) = Rev(1) × (1 + g)^(t−1)' },
      { label: 'Compound annual growth', expr: 'CAGR = (Rev(5) ÷ Rev(1))^(1/4) − 1' },
    ],
    note: 'g assumed annual growth rate of quantities.',
  },
  detailedRevenue: {
    def: 'Yearly breakdown of realistic-scenario revenue into variable costs, gross margin and margin rate, to measure the activity’s capacity to generate the margin that will cover fixed costs. A rate below 20% calls for a pricing or cost-structure review.',
    short: 'Gross margin = revenue − variable costs; its rate measures coverage capacity.',
    formulas: [
      { label: 'Gross margin', expr: 'Gross margin = Rev − VC' },
      { label: 'Rate', expr: 'Rate = Gross margin ÷ Rev × 100' },
    ],
  },
  assets: {
    def: 'All initial investments are listed by nature and by Financial Accounting System (SCF) account, and depreciated straight-line over their estimated useful life. Depreciation is a computed, non-cash expense: it reduces taxable income without leaving the treasury.',
    short: 'Straight-line depreciation = value ÷ useful life; a non-cash accounting charge.',
    formulas: [
      { label: 'Annual depreciation (straight-line)', expr: 'Dotation = Value ÷ Life' },
      { label: 'Total investment', expr: 'I = Σ Values' },
      { label: 'Total annual depreciation', expr: 'Σ Dotations' },
    ],
    note: 'Usual lives: 1 year setup costs, 3 years software, 5 years IT & office equipment, 10 years machinery & equipment.',
  },
  financing: {
    def: 'This table compares the total funding need (investments + working capital) with the resources raised (personal contribution, grant, bank loan), revealing any funding gap to fix. Working capital is computed from the lowest expected cumulative treasury of year 1.',
    short: 'Need = investments + working capital; gap = need − funding raised.',
    formulas: [
      { label: 'Funding need', expr: 'Need = Investments + WC' },
      { label: 'Working capital', expr: 'WC = | min(0 ; Cumulative treasury) |' },
      { label: 'Funding gap', expr: 'Gap = Need − (Contribution + Grant + Loan)' },
    ],
  },
  loan: {
    def: 'Repayment schedule with constant annuities: the yearly payment is fixed, but its composition shifts — interest, computed on the remaining balance, decreases year after year while the repaid principal share grows.',
    short: 'The constant annuity splits into interest on the balance and repaid principal.',
    formulas: [
      { label: 'Constant annual payment', expr: 'A = C × i ÷ (1 − (1 + i)^−n)' },
      { label: 'Interest of year y', expr: 'Int(y) = Balance(y−1) × i' },
      { label: 'Repaid principal', expr: 'Principal(y) = A − Int(y)' },
      { label: 'Monthly instalment', expr: 'Monthly = A ÷ 12' },
    ],
    note: 'C loan amount, i annual rate, n duration in years.',
  },
  cashflow: {
    def: 'Monthly treasury plan for year 1: each month confronts expected collections with disbursements (variable costs, fixed costs, loan instalment), the cumulative balance being carried forward from a starting balance (funding − investments − pre-start costs). Treasury is the first cause of project failure; this table is therefore the most closely examined.',
    short: 'Monthly balance = collections − disbursements, with the cumulative carried forward.',
    formulas: [
      { label: 'Monthly disbursements', expr: 'Disb. = VC + FC + Instalment' },
      { label: 'Monthly balance', expr: 'Balance(m) = Collections(m) − Disb.(m)' },
      { label: 'Cumulative balance', expr: 'Cumul(m) = Cumul(m−1) + Balance(m)' },
      { label: 'Starting balance', expr: 'Cumul(0) = Funding − Invest. − Pre-start' },
    ],
    note: 'Depreciation does not enter the treasury plan: it is not a cash flow.',
  },
  cashGap: {
    def: 'This table identifies the months where the cumulative balance falls below zero, the lowest treasury point, and therefore the minimum cash coverage required to secure liquidity through year 1. A positive year-end balance does not offset a deficit in the early months.',
    short: 'Required coverage = absolute value of the lowest cumulative treasury over 12 months.',
    formulas: [
      { label: 'Minimum treasury', expr: 'Treasury min = min (Cumul)' },
      { label: 'Required coverage', expr: 'Coverage = | min(0 ; Cumul) |' },
    ],
  },
  tax: {
    def: 'Five-year simulation of the tax burden under current Algerian rules: IFU (levied on revenue) while revenue stays under 30 M DZD (5% trade and production, 12% services, 10% mixed), then corporate profit tax IBS (19% production, 23% mixed, 26% services), accounting for exemption years based on the legal form and the startup label.',
    short: 'IFU on revenue up to 30 M DZD, then IBS on profit (19/23/26%).',
    formulas: [
      { label: 'Lump-sum tax', expr: 'IFU = Rev × Rate (5% / 10% / 12%)' },
      { label: 'Corporate profit tax', expr: 'IBS = Pre-tax result × (19% / 23% / 26%)' },
      { label: 'Net result', expr: 'Net = Pre-tax result − Tax' },
    ],
    note: 'Educational simulation; to be validated with a certified accountant.',
  },
  scf: {
    def: 'Income statement under the Algerian Financial Accounting System (SCF) over five years: from revenue, intermediate consumptions are deducted to reach value added, then personnel charges to reach gross operating surplus (EBE), then depreciation for operating result, finally tax for net result. Account numbering (70, 60-62, 63-64, 68, 69) follows the national chart of accounts.',
    short: 'From revenue to net result: value added, EBE, operating result, tax.',
    formulas: [
      { label: 'Value added', expr: 'VA = 70 − (60 + 61 + 62)' },
      { label: 'Gross operating surplus', expr: 'EBE = VA − (63 + 64)' },
      { label: 'Operating result', expr: 'RE = EBE − 68' },
      { label: 'Net result', expr: 'RN = RE − 69' },
    ],
    note: '70: revenue — 60/61/62: intermediate consumptions — 63/64: personnel — 68: depreciation — 69: taxes.',
  },
  bmc: {
    def: 'The Business Model Canvas (BMC) is a strategic matrix of nine interdependent blocks summarizing how value is created, delivered and captured: partners, activities, resources, value proposition, customer relations, channels, segments, cost structure and revenue streams. Any change in one block cascades into the financial translation detailed in the next appendix.',
    short: 'Nine blocks linking the value proposition to the market and to financial balance.',
    formulas: [
      { label: 'Monthly pre-tax result', expr: 'R = Rev − (VC + FC + D)' },
    ],
    note: 'Rev monthly revenue, VC variable costs, FC fixed costs, D monthly depreciation.',
  },
  bmcFinance: {
    def: 'This appendix translates each BMC block into direct financial figures: every segment and value proposition maps to sold quantities and monthly revenue; every activity and resource maps to a cost line. It confirms the BMC is a measurable economic system, not a marketing poster.',
    short: 'Every BMC block has a financial translation: revenues against costs, monthly and yearly.',
    formulas: [
      { label: 'Total monthly cost', expr: 'CT = VC + FC + D' },
      { label: 'Monthly result', expr: 'R = Rev − CT' },
    ],
  },
  indicators: {
    def: 'The dashboard turns raw numbers into a normative reading: each indicator is compared against reference thresholds (good / mid / weak), giving the founder and the committee an immediate view of strengths, risks and priorities. ROI measures the return on each dinar funded; payback measures how fast the project recovers its funding, depreciation included as it is retained cash flow.',
    short: 'Each indicator is compared to thresholds — good, mid, weak — for a clear reading and decision.',
    formulas: [
      { label: 'Return on investment', expr: 'ROI = Net result (Y1) ÷ Funding × 100' },
      { label: 'Payback period', expr: 'Payback = Funding ÷ (Net + Dotations)' },
      { label: 'Value-added rate', expr: 'VA ÷ Rev' },
      { label: 'EBE rate', expr: 'EBE ÷ Rev' },
      { label: 'Contribution margin rate', expr: '(Rev − VC) ÷ Rev' },
    ],
  },
};

export const ANNEX_DOCS: Record<Lang, Record<DocKey, AnnexDoc>> = { ar, fr, en };

export function getDoc(lang: Lang, k: DocKey): AnnexDoc {
  return (ANNEX_DOCS[lang] || ANNEX_DOCS.ar)[k];
}

/** Header label of the definition card. */
export const DOC_LABEL: Record<Lang, string> = {
  ar: 'الإطار المرجعي — التعريف والمعادلات',
  fr: 'Cadre de référence — définition et formules',
  en: 'Reference frame — definition & formulas',
};

/** Compact title of each reference doc (methodology slide & report section 9). */
export const DOC_TITLES: Record<DocKey, Record<Lang, string>> = {
  unitEconomics: { ar: 'اقتصاديات الوحدة', fr: 'Économie unitaire', en: 'Unit economics' },
  breakEven: { ar: 'نقطة التعادل', fr: 'Seuil de rentabilité', en: 'Break-even point' },
  scenarios: { ar: 'إسقاط رقم الأعمال', fr: 'Projection du CA', en: 'Revenue projection' },
  detailedRevenue: { ar: 'الهامش الإجمالي السنوي', fr: 'Marge brute annuelle', en: 'Annual gross margin' },
  assets: { ar: 'الاستثمار والاهتلاك', fr: 'Investissement et amortissement', en: 'Investment & depreciation' },
  financing: { ar: 'الهيكل التمويلي والحاجة المالية', fr: 'Structure de financement', en: 'Funding structure' },
  loan: { ar: 'جدول سداد القرض', fr: 'Échéancier du prêt', en: 'Loan repayment schedule' },
  cashflow: { ar: 'خطة الخزينة الشهرية', fr: 'Plan de trésorerie', en: 'Monthly cash plan' },
  cashGap: { ar: 'الحاجة النقدية الدنيا', fr: 'Besoin en trésorerie', en: 'Minimum cash requirement' },
  tax: { ar: 'النظام الجبائي (IFU / IBS)', fr: 'Cadre fiscal (IFU / IBS)', en: 'Tax framework (IFU / IBS)' },
  scf: { ar: 'جدول حسابات النتائج (SCF)', fr: 'Compte de résultat (SCF)', en: 'Income statement (SCF)' },
  bmc: { ar: 'نموذج العمل التجاري', fr: 'Business Model Canvas', en: 'Business Model Canvas' },
  bmcFinance: { ar: 'الترجمة المالية لنموذج العمل', fr: 'Traduction financière du BMC', en: 'Financial translation of the BMC' },
  indicators: { ar: 'لوحة المؤشرات المفسَّرة', fr: 'Tableau des indicateurs', en: 'Interpreted KPI dashboard' },
};
