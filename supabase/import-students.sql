-- ============================================================================
-- X-5 SMAN 1 Purbalingga — IMPORT DATA SISWA
-- ============================================================================
-- Menjalankan file ini akan:
--   1. Membuat 36 akun login di auth.users  (password semua: ganesha123)
--   2. Membuat baris profiles yang terhubung ke tiap akun
--   3. Membuat 1 akun admin / wali kelas
--
-- CARA PAKAI: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- PRASYARAT : schema.sql sudah dijalankan lebih dulu.
-- File ini AMAN dijalankan berulang kali (idempotent).
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. DAFTAR SISWA KELAS X-5
-- ----------------------------------------------------------------------------
do $$
declare
  v_student   record;
  v_user_id   uuid;
  v_password  text := 'ganesha123';   -- <<< password default semua siswa
begin
  for v_student in
    select * from (values
    ('Alisha Azaria Harviyani', 'alisha@x5-sman1.web.id', '0093145083'),
    ('Anindya Putri Palupi', 'anindya@x5-sman1.web.id', '0093145096'),
    ('Ardian Yusuf Firdaus', 'ardian@x5-sman1.web.id', '0093145109'),
    ('Auryn Nila Oktaviani', 'auryn@x5-sman1.web.id', '0093145122'),
    ('Ayesha Safarrina Triono', 'ayesha@x5-sman1.web.id', '0093145135'),
    ('Cahyaningtyas Ridho P', 'cahyaningtyas@x5-sman1.web.id', '0093145148'),
    ('Callista Keisya Nathania', 'callista@x5-sman1.web.id', '0093145161'),
    ('Defan Dwi Valdian', 'defan@x5-sman1.web.id', '0093145174'),
    ('Erlangga Dwi Revanda', 'erlangga@x5-sman1.web.id', '0093145187'),
    ('Faidah Qurrota Aini', 'faidah@x5-sman1.web.id', '0093145200'),
    ('Farah Noviana', 'farah@x5-sman1.web.id', '0093145213'),
    ('Hafidz Fadillah', 'hafidz@x5-sman1.web.id', '0093145226'),
    ('Halwa Qasdina Zalmya', 'halwa@x5-sman1.web.id', '0093145239'),
    ('Hanyfa Trias Maharani', 'hanyfa@x5-sman1.web.id', '0093145252'),
    ('Harjuna Ilham Kesatria Utomo', 'harjuna@x5-sman1.web.id', '0093145265'),
    ('Humam Asyrafi Zada', 'humam@x5-sman1.web.id', '0093145278'),
    ('Khalisha Rizqina Salsabila', 'khalisha@x5-sman1.web.id', '0093145291'),
    ('Maheswari Wangi Azyyati Ramadhani', 'maheswari@x5-sman1.web.id', '0093145304'),
    ('Marhaeni', 'marhaeni@x5-sman1.web.id', '0093145317'),
    ('Medina Rahma', 'medina@x5-sman1.web.id', '0093145330'),
    ('Muh Bani Safi', 'muh@x5-sman1.web.id', '0093145343'),
    ('Muhammad Alva Pratama', 'muhammad.alva@x5-sman1.web.id', '0093145356'),
    ('Muhammad Syafiq', 'muhammad.syafiq@x5-sman1.web.id', '0093145369'),
    ('Nabil Pratama', 'nabil@x5-sman1.web.id', '0093145382'),
    ('Natalia Aprilia Rahmawati', 'natalia@x5-sman1.web.id', '0093145395'),
    ('Nizrina Wafaa Darma', 'nizrina@x5-sman1.web.id', '0093145408'),
    ('Panji Pamungkas', 'panji@x5-sman1.web.id', '0093145421'),
    ('Ringgo Prasetyo', 'ringgo@x5-sman1.web.id', '0093145434'),
    ('Safitri Kurnia Sari', 'safitri@x5-sman1.web.id', '0093145447'),
    ('Syafa Putri Nabila', 'syafa@x5-sman1.web.id', '0093145460'),
    ('Timur Damar Langga', 'timur@x5-sman1.web.id', '0093145473'),
    ('Ufairah Hana Sakhi', 'ufairah@x5-sman1.web.id', '0093145486'),
    ('Yogi Febrian', 'yogi@x5-sman1.web.id', '0093145499'),
    ('Yulita Nur Andini', 'yulita@x5-sman1.web.id', '0093145512'),
    ('Zahra Anggraeny', 'zahra.anggraeny@x5-sman1.web.id', '0093145525'),
    ('Zahra Dewi Adha', 'zahra.dewi@x5-sman1.web.id', '0093145538')
    ) as t(full_name, email, nisn)
  loop
    -- Lewati jika email sudah terdaftar
    select id into v_user_id from auth.users where email = v_student.email;

    if v_user_id is null then
      v_user_id := gen_random_uuid();

      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data,
        confirmation_token, recovery_token, email_change_token_new, email_change,
        is_sso_user, is_anonymous
      ) values (
        '00000000-0000-0000-0000-000000000000',
        v_user_id, 'authenticated', 'authenticated',
        v_student.email,
        crypt(v_password, gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', v_student.full_name, 'role', 'student'),
        '', '', '', '',
        false, false
      );

      insert into auth.identities (
        provider_id, user_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      ) values (
        v_user_id::text, v_user_id,
        jsonb_build_object('sub', v_user_id::text, 'email', v_student.email, 'email_verified', true, 'phone_verified', false),
        'email', now(), now(), now()
      );
    end if;

    -- Profil (trigger handle_new_user sudah membuat baris dasar -> lengkapi di sini)
    insert into public.profiles (user_id, email, full_name, nisn, role)
    values (v_user_id, v_student.email, v_student.full_name, v_student.nisn, 'student')
    on conflict (email) do update set
      user_id   = excluded.user_id,
      full_name = excluded.full_name,
      nisn      = excluded.nisn,
      role      = 'student';
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- 2. AKUN ADMIN / WALI KELAS
--    Ganti email & nama di bawah sesuai wali kelas sebenarnya.
-- ----------------------------------------------------------------------------
do $$
declare
  v_user_id  uuid;
  v_email    text := 'admin@x5-sman1.web.id';
  v_name     text := 'Wali Kelas X-5';
  v_password text := 'ganesha123';     -- WAJIB diganti setelah login pertama
begin
  select id into v_user_id from auth.users where email = v_email;

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      is_sso_user, is_anonymous
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id, 'authenticated', 'authenticated',
      v_email, crypt(v_password, gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_name, 'role', 'admin'),
      '', '', '', '', false, false
    );

    insert into auth.identities (
      provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      v_user_id::text, v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
      'email', now(), now(), now()
    );
  end if;

  insert into public.profiles (user_id, email, full_name, role)
  values (v_user_id, v_email, v_name, 'admin')
  on conflict (email) do update set
    user_id = excluded.user_id,
    role    = 'admin';
end $$;

-- ----------------------------------------------------------------------------
-- 3. VERIFIKASI
-- ----------------------------------------------------------------------------
select role, count(*) as jumlah from public.profiles group by role order by role;

select p.full_name, p.email, p.nisn
from public.profiles p
where p.role = 'student'
order by p.full_name;

-- ============================================================================
-- SELESAI
--   Login siswa : <email di atas>      / ganesha123   -> /auth/login
--   Login admin : admin@x5-sman1.web.id / ganesha123  -> /auth/admin
--   SEGERA ganti password admin lewat menu Pengaturan.
-- ============================================================================
