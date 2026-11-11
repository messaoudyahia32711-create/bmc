# خطوات ربط ونقل قاعدة البيانات إلى Supabase

هذا الدليل يشرح كيفية إعداد قاعدة البيانات على **Supabase** وربطها بالمشروع سواء عبر **Prisma ORM** أو عبر **Supabase Client**.

---

## 1. إنشاء مشروع جديد على Supabase
1. ادخل إلى [supabase.com](https://supabase.com) وسجّل الدخول.
2. اضغط على **"New Project"**.
3. اختر اسم للمشروع وكلمة مرور قوية لقاعدة البيانات (`Database Password`).
4. اختر أقرب منطقة جغرافية (Region) لك (مثل `eu-central-1` فرانكفورت أو `me-central-1`).

---

## 2. إنشاء الجداول وتشغيل Schema في Supabase
1. من القائمة الجانبية في لوحة تحكم Supabase، اذهب إلى **SQL Editor**.
2. افتح الملف الموجود في هذا المجلد: `supabase/schema.sql`.
3. انسخ كامل المحتوى والصقه في الـ **SQL Editor**.
4. اضغط على زر **RUN**.
5. ستظهر لك رسالة نجاح `Success. No rows returned`.
6. (اختياري) يمكنك تشغيل محتوى `supabase/seed.sql` لإضافة بيانات تجريبية.

الجداول المُنشأة:
- `"User"`: جدول المستخدمين
- `"Post"`: جدول المقالات / المنشورات
- `"Project"`: جدول مشاريع BMC (Business Model Canvas) مع حقل `data` بتنسيق JSONB وفهارس عالية الأداء.

---

## 3. الحصول على روابط الاتصال (Connection Strings)
من لوحة تحكم المشروع في Supabase:
1. اذهب إلى **Project Settings** (أيقونة الترس في الأسفل) ثم **Database**.
2. ابحث عن قسم **Connection string**:
   - **Connection Pooling (Transaction Mode - Port 6543):**
     استخدم هذا الرابط لـ `DATABASE_URL` (ضروري للبيئة السحابية وVercel لمنع استنزاف الاتصالات):
     ```env
     DATABASE_URL="postgres://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
     ```
   - **Direct Connection (Session Mode - Port 5432):**
     استخدم هذا الرابط لـ `DIRECT_URL` (ضروري لتشغيل migrations):
     ```env
     DIRECT_URL="postgres://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
     ```

---

## 4. الحصول على مفاتيح API (للعميل واجهة المستخدم)
1. اذهب إلى **Project Settings** -> **API**.
2. انسخ:
   - **Project URL**: ضعه في `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key**: ضعه في `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 5. مزامنة Prisma مع Supabase
بعد وضع الروابط في ملف `.env`، يمكنك في أي وقت تشغيل:
```bash
npx prisma db push
```
أو
```bash
npm run db:deploy
```
وسيتم التأكد من تطابق قاعدة البيانات مع ملف `prisma/schema.prisma` بنجاح!
