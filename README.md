# Akselera Tech - Internal Chat

Aplikasi pesan instan 1-on-1 internal tim **Akselera.Tech** yang cepat, responsif, dan aman.

---

## 🛠️ Stack & Infrastruktur
- **Next.js 16 (App Router)** & **React 19**: Performa SSR tinggi & arsitektur komponen modular.
- **TypeScript**: Memastikan *type-safety* dan mencegah error runtime.
- **Tailwind CSS**: Desain UI modern dengan dukungan Dark/Light mode instan.
- **Supabase (PostgreSQL & Auth)**: Autentikasi terenkripsi & database relasional berkeamanan RLS.
- **HTML5 Canvas & LocalStorage**: Pengompresan avatar otomatis & caching percakapan instan (SWR).

---

## 🚀 Cara Menjalankan Secara Lokal

```bash
# 1. Clone & install
git clone <repository-url>
cd "TUGAS_VIBES PROGRAMMER"
npm install

# 2. Setup .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 3. Import schema (jalankan query di supabase/schema.sql)

# 4. Jalankan dev server
npm run dev
# Buka http://localhost:3000
```

---

## 🗄️ Struktur Tabel Database
- **`profiles`**: `id` (PK), `email` (Unique), `name`, `avatar_url`, `created_at`
- **`conversations`**: `id` (PK), `user1_id` (FK), `user2_id` (FK), `created_at`
- **`messages`**: `id` (PK), `conversation_id` (FK), `sender_id` (FK), `message`, `is_read`, `created_at`

---

## 🤖 AI Tools
- **Google Antigravity (AGY)**: AI pair-programming assistant untuk perancangan arsitektur UI, pengompresan gambar, optimasi SWR, dan debugging.

---

## 📌 Hal yang Belum Selesai (Roadmap)
- [ ] Panggilan Suara & Video 1-on-1 (WebRTC)
- [ ] Obrolan Grup (*Group Chat*)
- [ ] Reaksi Emoji pada Pesan
- [ ] Notifikasi Web Push
