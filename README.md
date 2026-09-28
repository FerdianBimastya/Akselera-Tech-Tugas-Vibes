# Akselera Tech - Internal Messaging Application

Aplikasi obrolan pesan instan internal tim **Akselera.Tech** yang cepat, responsif, elegan, dan aman dengan dukungan real-time sync, pengunggahan foto profil custom, penanda status baca, serta opsi Dark/Light mode.

---

## 🛠️ 1. Stack & Infrastruktur yang Dipakai beserta Alasan Memilihnya

- **Next.js 16 (App Router & Turbopack)**: Memungkinkan rendering cepat di sisi server (SSR), arsitektur modular berbasis komponen, serta integrasi route handler & middleware yang aman.
- **TypeScript**: Memberikan *type-safety* ketat, mencegah error saat runtime, serta memudahkan maintenance kode secara presisi.
- **Tailwind CSS & Modern CSS**: Menyediakan penataan gaya UI fleksibel, modern, konsisten, serta dukungan sistem tema Dark/Light mode secara instan.
- **Supabase (PostgreSQL & Auth)**: Backend-as-a-Service (BaaS) terpilih untuk autentikasi user terenkripsi, manajemen relasi data PostgreSQL, serta kebijakan akses keamanan *Row Level Security* (RLS).
- **HTML5 Canvas & LocalStorage Caching**:
  - *HTML5 Canvas*: Digunakan untuk pengompresan gambar foto profil secara otomatis (hingga 256x256 pixel) guna mencegah batas kuota memori browser (`QuotaExceededError`).
  - *LocalStorage (Stale-While-Revalidate)*: Menyediakan pemuatan percakapan instan (0 ms) saat pengguna masuk, lalu menyinkronkan data terbaru di latar belakang secara *non-blocking*.

---

## 🚀 2. Cara Menjalankan Secara Lokal

### Prasyarat
- **Node.js**: versi `18.x` atau lebih baru.
- **npm** atau **yarn** / **pnpm**.

### Langkah-langkah
1. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd "TUGAS_VIBES PROGRAMMER"
   ```

2. **Install Dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable**:
   Buat file `.env.local` di direktori utama dan isi dengan kredensial Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Eksekusi Database Schema / Migration**:
   Jalankan file script SQL yang telah disediakan pada Supabase SQL Editor Anda:
   - `supabase/schema.sql` (atau `supabase/migrations/20260927000000_initial_chat_schema.sql`)

5. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```

6. **Buka di Browser**:
   Buka `http://localhost:3000` di peramban web Anda.

---

## 🗄️ 3. Struktur Tabel Database

Database PostgreSQL menggunakan 3 tabel utama yang saling terelasi:

### `profiles`
Menyimpan informasi identitas anggota tim.
- `id` (`UUID`, Primary Key, Foreign Key -> `auth.users.id`)
- `email` (`TEXT`, Unique, Not Null)
- `name` (`TEXT`, Not Null)
- `avatar_url` (`TEXT`, Optional)
- `created_at` (`TIMESTAMPTZ`, Default: `NOW()`)

### `conversations`
Menyimpan relasi pasangan percakapan 1-on-1 antar dua pengguna.
- `id` (`UUID`, Primary Key)
- `user1_id` (`UUID`, Foreign Key -> `profiles.id`)
- `user2_id` (`UUID`, Foreign Key -> `profiles.id`)
- `created_at` (`TIMESTAMPTZ`, Default: `NOW()`)
- *Unique Constraint*: `idx_unique_conversation_pair` untuk memastikan tidak ada duplikasi ruang chat antara 2 pengguna yang sama.

### `messages`
Menyimpan riwayat pesan teks dan lampiran file/gambar.
- `id` (`UUID`, Primary Key)
- `conversation_id` (`UUID`, Foreign Key -> `conversations.id`)
- `sender_id` (`UUID`, Foreign Key -> `profiles.id`)
- `message` (`TEXT`, Not Null)
- `is_read` (`BOOLEAN`, Default: `FALSE`)
- `created_at` (`TIMESTAMPTZ`, Default: `NOW()`)

---

## 🤖 4. AI Tools yang Dipakai

- **Google Antigravity (AGY / Antigravity Agentic Coding Assistant)**:
  - Digunakan sebagai *AI pair-programming assistant* untuk membantu perancangan arsitektur antarmuka, pembuatan komponen UI responsif, optimasi strategi caching SWR, penyelesaian linting/TypeScript error, serta penulisan dokumentasi teknis ini.

---

## 📌 5. Hal yang Belum Selesai & Rencana Pengembangan (Future Roadmap)

- [ ] **Panggilan Suara & Video (*Voice & Video Call 1-on-1*)**: Integrasi WebRTC untuk komunikasi langsung antar pengguna.
- [ ] **Percakapan Grup (*Group Chat*)**: Dukungan pembuatan ruang obrolan grup dengan lebih dari 2 anggota tim.
- [ ] **Reaksi Pesan (*Emoji Reactions*)**: Fitur memberikan tanggapan emoji pada pesan tertentu.
- [ ] **Notifikasi Web Push (*Web Push Notifications*)**: Pemberitahuan pesan masuk secara *real-time* saat tab atau browser ditutup.
