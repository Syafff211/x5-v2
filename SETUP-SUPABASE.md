# 🗄️ Panduan Setup Supabase — X-5 SMAN 1 Purbalingga

Panduan lengkap dari nol sampai aplikasi live. Perkiraan waktu: **10–15 menit**.

---

## 📋 Ringkasan Akun

| Peran | Email | Password |
|---|---|---|
| **Siswa** (36 akun) | `namadepan@x5-sman1.web.id` | `ganesha123` |
| **Admin / Wali Kelas** | `admin@x5-sman1.web.id` | `ganesha123` |

> ⚠️ **Penting:** `ganesha123` adalah password sementara. Minta setiap siswa menggantinya lewat
> **Pengaturan → Ubah Password** setelah login pertama, dan ganti password admin segera.

---

## Langkah 1 — Buat Project Supabase

1. Buka [supabase.com](https://supabase.com) → **Sign in** → **New Project**.
2. Isi:
   - **Name:** `x5-sman1-purbalingga`
   - **Database Password:** buat password kuat, **simpan baik-baik**
   - **Region:** `Southeast Asia (Singapore)` ← terdekat dari Indonesia, paling cepat
3. Klik **Create new project**, tunggu ±2 menit sampai status hijau.

---

## Langkah 2 — Jalankan Skema Database

1. Di sidebar Supabase klik **SQL Editor** → **New query**.
2. Buka file **`supabase/schema.sql`** dari project ini, **salin seluruh isinya**.
3. Paste ke editor → klik **Run** (atau `Ctrl/Cmd + Enter`).
4. Tunggu sampai muncul **Success. No rows returned**.

Skema ini membuat:
- ✅ 12 tabel (`profiles`, `attendance`, `assignments`, `grades`, dst.)
- ✅ Semua index untuk performa
- ✅ **Row Level Security** aktif di seluruh tabel
- ✅ Trigger otomatis pembuat profil saat user mendaftar
- ✅ 5 storage bucket (`avatars`, `assignments`, `submissions`, `materials`, `gallery`)
- ✅ Realtime untuk fitur chat

> 💡 Muncul pesan `NOTICE: policy ... does not exist, skipping`? **Itu normal** — artinya
> script aman dijalankan berulang kali.

---

## Langkah 3 — Import 36 Siswa + Admin

1. **SQL Editor** → **New query** lagi.
2. Buka file **`supabase/import-students.sql`**, salin seluruh isinya.
3. Paste → **Run**.

Script ini otomatis:
- Membuat **36 akun login** di `auth.users` dengan password `ganesha123` (ter-hash bcrypt)
- Membuat entri `auth.identities` supaya login email/password berfungsi
- Menandai semua email **sudah terverifikasi** (siswa tidak perlu klik email konfirmasi)
- Mengisi tabel `profiles` lengkap dengan **nama + NISN**
- Membuat **1 akun admin**

Di akhir akan tampil tabel verifikasi:

```
 role    | jumlah
---------+--------
 admin   |      1
 student |     36
```

> ✅ Script bersifat **idempotent** — kalau dijalankan dua kali, data tidak akan dobel.

---

## Langkah 4 — Ambil API Keys

1. Sidebar → **Project Settings** (ikon gerigi) → **API**.
2. Salin dua nilai ini:

| Field di Supabase | Dipakai sebagai |
|---|---|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon / public** key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role** key | `SUPABASE_SERVICE_ROLE_KEY` (rahasia!) |

---

## Langkah 5 — Isi Environment Variables

### Untuk development lokal

Edit file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Lalu jalankan:

```bash
npm install
npm run dev
```

### Untuk deploy di Vercel

**Project Settings → Environment Variables**, tambahkan keempat variabel di atas
(`NEXT_PUBLIC_SITE_URL` diisi domain production, mis. `https://x5-sman1.vercel.app`),
lalu **Redeploy**.

---

## Langkah 6 — Atur Redirect URL Auth

Supaya fitur **Lupa Password** berfungsi:

1. **Authentication → URL Configuration**
2. **Site URL:** `https://domain-anda.vercel.app`
3. **Redirect URLs**, tambahkan:
   ```
   http://localhost:3000/auth/reset-password
   https://domain-anda.vercel.app/auth/reset-password
   ```

---

## Langkah 7 — Tes Login

| Tes | Email | Password | Harus masuk ke |
|---|---|---|---|
| Siswa | `alisha@x5-sman1.web.id` | `ganesha123` | `/dashboard` |
| Admin | `admin@x5-sman1.web.id` | `ganesha123` | `/admin` |

Kalau siswa mencoba login di halaman admin (atau sebaliknya), sistem menolak dan
memberi pesan yang jelas — ini memang sudah dirancang begitu.

---

## 📧 Daftar Lengkap Email Siswa

| # | Nama | Email |
|---:|---|---|
| 1 | Alisha Azaria Harviyani | `alisha@x5-sman1.web.id` |
| 2 | Anindya Putri Palupi | `anindya@x5-sman1.web.id` |
| 3 | Ardian Yusuf Firdaus | `ardian@x5-sman1.web.id` |
| 4 | Auryn Nila Oktaviani | `auryn@x5-sman1.web.id` |
| 5 | Ayesha Safarrina Triono | `ayesha@x5-sman1.web.id` |
| 6 | Cahyaningtyas Ridho P | `cahyaningtyas@x5-sman1.web.id` |
| 7 | Callista Keisya Nathania | `callista@x5-sman1.web.id` |
| 8 | Defan Dwi Valdian | `defan@x5-sman1.web.id` |
| 9 | Erlangga Dwi Revanda | `erlangga@x5-sman1.web.id` |
| 10 | Faidah Qurrota Aini | `faidah@x5-sman1.web.id` |
| 11 | Farah Noviana | `farah@x5-sman1.web.id` |
| 12 | Hafidz Fadillah | `hafidz@x5-sman1.web.id` |
| 13 | Halwa Qasdina Zalmya | `halwa@x5-sman1.web.id` |
| 14 | Hanyfa Trias Maharani | `hanyfa@x5-sman1.web.id` |
| 15 | Harjuna Ilham Kesatria Utomo | `harjuna@x5-sman1.web.id` |
| 16 | Humam Asyrafi Zada | `humam@x5-sman1.web.id` |
| 17 | Khalisha Rizqina Salsabila | `khalisha@x5-sman1.web.id` |
| 18 | Maheswari Wangi Azyyati Ramadhani | `maheswari@x5-sman1.web.id` |
| 19 | Marhaeni | `marhaeni@x5-sman1.web.id` |
| 20 | Medina Rahma | `medina@x5-sman1.web.id` |
| 21 | Muh Bani Safi | `muh@x5-sman1.web.id` |
| 22 | Muhammad Alva Pratama | `muhammad.alva@x5-sman1.web.id` |
| 23 | Muhammad Syafiq | `muhammad.syafiq@x5-sman1.web.id` |
| 24 | Nabil Pratama | `nabil@x5-sman1.web.id` |
| 25 | Natalia Aprilia Rahmawati | `natalia@x5-sman1.web.id` |
| 26 | Nizrina Wafaa Darma | `nizrina@x5-sman1.web.id` |
| 27 | Panji Pamungkas | `panji@x5-sman1.web.id` |
| 28 | Ringgo Prasetyo | `ringgo@x5-sman1.web.id` |
| 29 | Safitri Kurnia Sari | `safitri@x5-sman1.web.id` |
| 30 | Syafa Putri Nabila | `syafa@x5-sman1.web.id` |
| 31 | Timur Damar Langga | `timur@x5-sman1.web.id` |
| 32 | Ufairah Hana Sakhi | `ufairah@x5-sman1.web.id` |
| 33 | Yogi Febrian | `yogi@x5-sman1.web.id` |
| 34 | Yulita Nur Andini | `yulita@x5-sman1.web.id` |
| 35 | Zahra Anggraeny | `zahra.anggraeny@x5-sman1.web.id` |
| 36 | Zahra Dewi Adha | `zahra.dewi@x5-sman1.web.id` |

> Nama depan yang kembar (Muhammad, Zahra) otomatis ditambah nama kedua agar unik.

---

## 🔧 Operasi Umum

### Ganti domain email
Sebelum menjalankan `import-students.sql`, cari-ganti `@x5-sman1.web.id`
dengan domain yang diinginkan (mis. `@student.sman1purbalingga.sch.id`).

### Reset password satu siswa
```sql
update auth.users
set encrypted_password = crypt('passwordbaru', gen_salt('bf'))
where email = 'alisha@x5-sman1.web.id';
```

### Reset password SEMUA siswa kembali ke ganesha123
```sql
update auth.users u
set encrypted_password = crypt('ganesha123', gen_salt('bf'))
from public.profiles p
where p.user_id = u.id and p.role = 'student';
```

### Tambah siswa baru
Gunakan menu **Admin → Kelola Siswa → Tambah Siswa**, atau jalankan
`import-students.sql` lagi setelah menambahkan barisnya di daftar `values`.

### Jadikan seseorang admin
```sql
update public.profiles set role = 'admin' where email = 'nama@x5-sman1.web.id';
```

### Hapus semua data transaksional (mulai ulang semester)
```sql
truncate public.attendance, public.grades, public.assignment_submissions,
         public.assignments, public.materials, public.announcements,
         public.gallery, public.messages, public.events restart identity cascade;
```

---

## 🛟 Troubleshooting

| Masalah | Penyebab & Solusi |
|---|---|
| Banner **"Mode Demo"** masih muncul | Env var belum terbaca. Pastikan `.env.local` benar lalu **restart** `npm run dev`. Di Vercel: redeploy setelah menyimpan env. |
| `Invalid login credentials` | Email salah ketik, atau `import-students.sql` belum dijalankan. Cek: `select email from auth.users;` |
| `Profil tidak ditemukan` | Baris `profiles` tidak ada. Jalankan ulang `import-students.sql` (aman diulang). |
| Siswa melihat data siswa lain | RLS belum aktif. Jalankan ulang `schema.sql`. |
| Chat tidak real-time | **Database → Replication** → pastikan tabel `messages` aktif di publication `supabase_realtime`. |
| Upload file gagal | Cek **Storage** — 5 bucket harus ada. Jalankan ulang bagian storage di `schema.sql`. |

---

## ✅ Checklist Akhir

- [ ] Project Supabase dibuat (region Singapore)
- [ ] `schema.sql` dijalankan — sukses
- [ ] `import-students.sql` dijalankan — muncul `student: 36`, `admin: 1`
- [ ] Environment variables diisi (lokal + Vercel)
- [ ] Redirect URL auth dikonfigurasi
- [ ] Login siswa berhasil → `/dashboard`
- [ ] Login admin berhasil → `/admin`
- [ ] Password admin sudah diganti
- [ ] Siswa diminta mengganti password masing-masing
