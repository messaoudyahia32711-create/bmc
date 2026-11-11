// ─── Guided hints for BMC blocks (AR/FR/EN) ──────────────────────────────────
import { Lang } from './types';

export interface BmcHint {
  what: string;
  good: string;
  bad: string;
}

const H = (what: string, good: string, bad: string): BmcHint => ({ what, good, bad });

const HINTS: Record<string, Record<Lang, BmcHint>> = {
  customers: {
    ar: H(
      'من يدفع لك بالضبط؟ حدّد فئات واضحة: العمر، الموقع، الاحتياج. لا تكتب «الجميع».',
      '«طلبة الجامعة (18-25 سنة) في محيط 2 كلم يبحثون عن وجبة سريعة أقل من 300 دج» + «عائلات الحي للطلبات الكبيرة».',
      '«كل الناس» أو «كل من يحب الجودة» — فئة غير محددة لا تُبرر الكميات المبيعة.',
    ),
    fr: H(
      'Qui paie exactement ? Définissez des segments clairs : âge, localisation, besoin. Évitez « tout le monde ».',
      '« Étudiants (18-25 ans) dans un rayon de 2 km cherchant un repas rapide à moins de 300 DA » + « familles du quartier pour les grandes commandes ».',
      '« Tout le monde » ou « tous ceux qui aiment la qualité » — segment flou qui ne justifie pas les quantités.',
    ),
    en: H(
      'Who exactly pays you? Define clear segments: age, location, need. Avoid “everyone”.',
      '“Students (18–25) within 2 km looking for a quick meal under 300 DZD” + “families of the neighborhood for bulk orders”.',
      '“Everyone” or “anyone who likes quality” — a vague segment that justifies no quantities.',
    ),
  },
  valueProp: {
    ar: H(
      'ما الحل الذي تقدمه وما الذي يميزه؟ اربطه بمشكلة حقيقية للشريحة، وبأرقام إن أمكن (أسرع، أرخص، أطزج).',
      '«خبز طازج خلال 10 دقائق من الفرن للطلبة بسعر أقل 15% من المنافس، مع توصيل للطلبات فوق 2000 دج».',
      '«جودة عالية وأسعار منافسة» — عبارة عامة يكتبها الجميع ولا تميزك عن أحد.',
    ),
    fr: H(
      'Quelle solution offrez-vous et en quoi se distingue-t-elle ? Liez-la à un vrai problème, avec des chiffres si possible.',
      '« Pain chaud en 10 minutes pour les étudiants, 15% moins cher que le concurrent, livraison dès 2 000 DA ».',
      '« Haute qualité et prix compétitifs » — phrase générique qui ne vous distingue pas.',
    ),
    en: H(
      'What solution do you offer and what makes it different? Tie it to a real problem, with numbers when possible.',
      '“Fresh bread within 10 minutes for students, 15% cheaper than the competitor, delivery from 2,000 DZD”.',
      '“High quality and competitive prices” — a generic phrase that differentiates nothing.',
    ),
  },
  channels: {
    ar: H(
      'كيف يصل المنتج للزبون فعلياً؟ اذكر القناة ومن يتحمل كلفتها، وركّز على قناتين أو ثلاث قابلة للتنفيذ.',
      '«بيع مباشر في المحل + طلبيات واتساب بتوصيل على محيط 3 كلم + اتفاقيات جملة مع 3 مقاهي قريبة».',
      '«التسويق الرقمي والتواصل الاجتماعي» بدون تحديد كيف يشتري الزبون فعلاً.',
    ),
    fr: H(
      'Comment le produit atteint-il réellement le client ? Précisez la canal et son coût ; deux à trois canaux réalisables.',
      '« Vente en boutique + commandes WhatsApp livrées dans un rayon de 3 km + accords en gros avec 3 cafés proches ».',
      '« Le marketing digital et les réseaux sociaux » sans dire comment le client achète réellement.',
    ),
    en: H(
      'How does the product actually reach the customer? Name the channel and who bears its cost; two to three feasible channels.',
      '“Direct shop sales + WhatsApp orders delivered within 3 km + bulk agreements with 3 nearby cafés”.',
      '“Digital marketing and social media” without saying how the customer actually buys.',
    ),
  },
  partners: {
    ar: H(
      'من تحتاجه كي يعمل المشروع؟ موردون أساسيون، جهات دعم وتمويل، خدمات خارجية (محاسبة، صيانة…).',
      '«مورد دقيق ثابت بالأجل 15 يوماً + حاضنة الأعمال (مرافقة وتمويل) + محاسب شهري».',
      '«الجميع شريك» أو سرد جهات بلا دور واضح في تشغيل المشروع.',
    ),
    fr: H(
      'De qui avez-vous besoin pour opérer ? Fournisseurs clés, structures d’appui, services externalisés.',
      '« Fournisseur de farine à 15 jours d’échéance + incubateur (accompagnement et financement) + comptable mensuel ».',
      '« Tout le monde est partenaire » ou une liste sans rôle clair dans l’exploitation.',
    ),
    en: H(
      'Who do you need to operate? Key suppliers, support bodies, outsourced services (accounting, maintenance…).',
      '“Flour supplier on 15-day terms + the business incubator (support and financing) + monthly accountant”.',
      '“Everyone is a partner” or a list with no clear operating role.',
    ),
  },
  activities: {
    ar: H(
      'ما الأنشطة اليومية التي يجب تنفيذها بنفسك لتوليد الإيراد؟ رتّبها من الأهم.',
      '«الإنتاج اليومي (فجراً) + استلام الطلبيات وتوصيلها + تسويق أسبوعي محلي».',
      '«الإدارة والتخطيط والتنظيم» — كلمات بلا نشاط يبيع أو ينتج فعلاً.',
    ),
    fr: H(
      'Quelles activités quotidiennes générent le revenu ? Classez-les par importance.',
      '« Production quotidienne (tôt le matin) + réception et livraison des commandes + marketing local hebdomadaire ».',
      '« Gestion, planification, organisation » — des mots sans activité productive réelle.',
    ),
    en: H(
      'Which daily activities must you do to generate revenue? Rank them by importance.',
      '“Daily production (early morning) + receiving and delivering orders + weekly local marketing”.',
      '“Management, planning, organization” — words with no real producing or selling activity.',
    ),
  },
};

export function bmcHint(key: string, lang: Lang): BmcHint {
  return HINTS[key][lang];
}
