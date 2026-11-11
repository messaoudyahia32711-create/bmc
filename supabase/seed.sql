-- Optional Demo / Seed Data for Supabase
-- Can be run in Supabase SQL Editor if you want initial test data

INSERT INTO "User" ("id", "email", "name")
VALUES ('demo-user-1', 'admin@example.com', 'مدير النظام')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Project" ("id", "name", "schemaVersion", "data", "userId")
VALUES (
    'demo-project-1',
    'مشروع تجريبي - نموذج عمل تجاري',
    2,
    '{
        "info": {
            "projectTitleAr": "مشروع تجريبي للابتكار",
            "ownerName": "مؤسس المشروع",
            "legal": "startup"
        },
        "products": [
            {
                "id": "p-1",
                "name": "الخدمة السحابية الأساسية",
                "model": "subscription",
                "sub": 5000,
                "subs": 50
            }
        ],
        "funding": {
            "hasStartupLabel": "yes"
        }
    }'::jsonb,
    'demo-user-1'
)
ON CONFLICT ("id") DO NOTHING;
