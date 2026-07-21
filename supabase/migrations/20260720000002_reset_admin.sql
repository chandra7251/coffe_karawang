-- Reset admin user
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@kopikarawang.test';

-- Atau buat user admin baru jika belum ada
INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@kopikarawang.test',
  'Admin KopiKarawang',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;