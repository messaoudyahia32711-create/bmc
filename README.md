# أداة مخطط نموذج العمل التجاري والدراسة المالية (BMC Tool) 🚀

منصة متكاملة لتوليد وتحليل **نموذج العمل التجاري (Business Model Canvas)**، وإعداد دراسات الجدوى المالية، وتحليل التعادل، وتصدير التقارير والعروض التقديمية (وفق معايير القرار الوزاري 1275 لحاضنات ومسرعات الأعمال).

---

## 🌟 المميزات الرئيسية
- 📋 **مولد نموذج العمل التجاري (BMC):** بناء النموذج خطوة بخطوة مع إرشادات تفاعلية ذكية.
- 💰 **المحرك المالي المتطور:** حساب التكاليف الثابتة والمتغيرة، التوقعات الشهرية والسنوية، التدفقات النقدية ونقطة التعادل.
- 📊 **تحليل السوق والمنافسين:** بناء شخصيات المشترين (Personas)، تحليل SWOT، ومصفوفة المنافسة.
- 📑 **تصدير احترافي:** تصدير العروض التقديمية بصيغة PowerPoint (`.pptx`) والتقارير التفصيلية المطبوعة (`.pdf`).
- 🌐 **دعم متعدد اللغات:** واجهة كاملة باللغات العربية، الفرنسية، والإنجليزية مع مراعاة اتجاه النصوص (RTL/LTR).
- ☁️ **جاهز للنشر السحابي:** مهيأ بالكامل للنشر الفوري على **Vercel** والربط مع قاعدة بيانات **Supabase (PostgreSQL)**.

---

## 🛠️ التقنيات المستخدمة
- **الإطار البرمجي:** [Next.js](https://nextjs.org/) (App Router) & [React 19](https://react.dev/)
- **التصميم والواجهات:** [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **قاعدة البيانات وORM:** [Prisma ORM](https://www.prisma.io/) & [Supabase (PostgreSQL)](https://supabase.com/)
- **إدارة الحالة والتخزين:** Zustand & IndexedDB للتخزين السريع دون اتصال

---

## 🚀 دليل الإعداد والنشر (GitHub - Supabase - Vercel)

### أولاً: نقل وإعداد قاعدة البيانات على Supabase
1. سجل الدخول إلى [Supabase](https://supabase.com) وأنشئ مشروعاً جديداً (**New Project**).
2. افتح تبويب **SQL Editor** من القائمة الجانبية.
3. انسخ محتوى الملف [`supabase/schema.sql`](./supabase/schema.sql) والصقه في محرر SQL ثم اضغط **Run**.
4. من إعدادات المشروع (**Project Settings -> Database**):
   - انسخ رابط **Connection Pooling (Transaction - Port 6543)** ليكون قيمة `DATABASE_URL`.
   - انسخ رابط **Direct connection (Port 5432)** ليكون قيمة `DIRECT_URL`.
5. من (**Project Settings -> API**):
   - انسخ **Project URL** و **anon public key**.

---

### ثانياً: رفع المشروع على GitHub
المشروع تم تجهيزه بملف `.gitignore` محسّن لمنع تسريب أي ملفات حساسة. لرفع المشروع:
```bash
# التأكد من التجهيز وحفظ التعديلات
git add .
git commit -m "feat: prepare project for GitHub, Supabase and Vercel"

# ربط المستودع بالرابط الخاص بك على GitHub (استبدل الرابط برابط مستودعك)
git remote add origin https://github.com/USERNAME/REPOSITORY.git

# رفع الكود على الفرع الرئيسي
git branch -M main
git push -u origin main
```

---

### ثالثاً: النشر على Vercel
1. ادخل إلى [Vercel](https://vercel.com) واضغط **"Add New Project"**.
2. اختر مستودع الـ GitHub الذي قمت برفعه للتو.
3. في قسم **Environment Variables**، أضف المتغيرات التالية (مأخوذة من Supabase):
   - `DATABASE_URL`: رابط الاتصال المجمع (Port 6543 مع `?pgbouncer=true`).
   - `DIRECT_URL`: رابط الاتصال المباشر (Port 5432).
   - `NEXT_PUBLIC_SUPABASE_URL`: رابط مشروع Supabase.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: المفتاح العام `anon`.
4. اضغط **Deploy**.
5. سيقوم Vercel تلقائياً بتوليد Prisma Client وبناء تطبيق Next.js ونشره في ثوانٍ معدودة!

---

## 💻 التشغيل المحلي (Local Development)

```bash
# تثبيت الحزم
npm install

# إعداد ملف البيئة المحلي
cp .env.example .env.local

# تشغيل خادم التطوير
npm run dev
```

افتح المتصفح على: `http://localhost:3000`

---

## 📂 بنية المشروع
```
├── prisma/
│   └── schema.prisma         # مخطط Prisma مهيأ لـ PostgreSQL / Supabase
├── supabase/
│   ├── schema.sql            # كود SQL لإنشاء الجداول والفهارس في Supabase
│   ├── seed.sql              # بيانات تجريبية اختيارية
│   └── README.md             # دليل إعداد Supabase بالتفصيل
├── src/
│   ├── app/                  # Next.js App Router (الصفحات وAPI)
│   ├── components/           # مكونات واجهة المستخدم (BMC, Wizards, Reports)
│   ├── lib/                  # المحرك المالي، الدوال المساعدة، Supabase و Prisma
│   └── hooks/                # الخطافات المخصصة (Hooks)
├── .env.example              # نموذج متغيرات البيئة
├── vercel.json               # إعدادات النشر على Vercel
└── package.json              # تبعيات وأوامر المشروع
```

---
صُنع بعناية لتسهيل ريادة الأعمال وإعداد نماذج الأعمال الاحترافية.
