# Akselera.Tech Chat - Security & RLS Access Control Audit

Dokumen ini menjelaskan arsitektur otorisasi dan **Row Level Security (RLS)** pada database PostgreSQL Supabase untuk aplikasi chat internal **Akselera.Tech**.

---

## 🔒 Ringkasan Pengujian 10 Skenario Keamanan Data

| # | Skenario Keamanan | Lapisan Proteksi | Status Penanganan |
|---|---|---|---|
| **1** | User A hanya dapat membaca conversation yang melibatkan User A | RLS `conversations` (SELECT) | **TERPROTEKSI** (`auth.uid() = user1_id OR auth.uid() = user2_id`) |
| **2** | User B hanya dapat membaca conversation yang melibatkan User B | RLS `conversations` (SELECT) | **TERPROTEKSI** (`auth.uid() = user1_id OR auth.uid() = user2_id`) |
| **3** | User C tidak dapat membaca conversation antara User A dan User B | PostgreSQL RLS Engine | **TERPROTEKSI** (Mengembalikan 0 baris/Access Denied) |
| **4** | User tidak dapat membaca messages dari conversation yang bukan miliknya | RLS `messages` (SELECT) | **TERPROTEKSI** (`EXISTS conversation WHERE user1_id/user2_id = auth.uid()`) |
| **5** | User tidak dapat mengirim message ke conversation yang bukan miliknya | RLS `messages` (INSERT) | **TERPROTEKSI** (`sender_id = auth.uid() AND EXISTS conversation`) |
| **6** | User tidak dapat mengubah/menghapus conversation/message milik user lain | RLS DELETE/UPDATE | **TERPROTEKSI** (Hanya `sender_id = auth.uid()` & `UPDATE` ditolak) |
| **7** | User tidak dapat memanipulasi user ID pada API request untuk membaca data user lain | JWT Validation + `auth.uid()` | **TERPROTEKSI** (`auth.uid()` dievaluasi dari token terenkripsi) |
| **8** | Tidak mengandalkan filtering/pengecekan di frontend saja | Server-side RLS | **TERPROTEKSI** (Kueri PostgreSQL menolak request di level DB) |
| **9** | Otorisasi diterapkan di level database via RLS Policies | Supabase RLS | **TERPROTEKSI** (Aktif di tabel `profiles`, `conversations`, `messages`) |
| **10** | Service_role key tidak pernah digunakan di client/browser | Frontend Architecture | **TERPROTEKSI** (Hanya `NEXT_PUBLIC_SUPABASE_ANON_KEY` yang dipakai) |

---

## 🛡️ Bagaimana RLS Mencegah User A Mengakses Conversation milik User B & C?

1. **Otentikasi Kriptografik (JWT)**:
   Saat user login ke aplikasi, Supabase menerbitkan token JWT terenkripsi yang berisi klaim `sub` (User ID). Setiap request ke Supabase selalu menyertakan token ini di header `Authorization: Bearer <token>`.

2. **Evaluasi Fungsi `auth.uid()` di PostgreSQL**:
   Setiap kali kueri `SELECT`, `INSERT`, `UPDATE`, atau `DELETE` dijalankan, PostgreSQL mengevaluasi nilai `auth.uid()` secara independen dari token terenkripsi tersebut. **User di frontend tidak dapat memalsukan nilai `auth.uid()`** melalui kueri REST/GraphQL.

3. **Mekanisme Penolakan Akses Pada Tabel `conversations`**:
   Policy SELECT pada tabel `conversations` adalah:
   ```sql
   CREATE POLICY "Users can view their own conversations"
     ON public.conversations FOR SELECT TO authenticated
     USING ((select auth.uid()) = user1_id OR (select auth.uid()) = user2_id);
   ```
   Jika **User C** memanggil endpoint API untuk mengambil percakapan antara **User A** (`user1_id`) dan **User B** (`user2_id`), klaim `auth.uid()` milik User C tidak cocok dengan `user1_id` maupun `user2_id`. PostgreSQL **secara langsung membuang baris data tersebut sebelum dikirimkan kembali ke browser**, sehingga User C menerima `0 baris` (kosong) atau error otorisasi.

4. **Mekanisme Penolakan Akses Pada Tabel `messages`**:
   Policy SELECT dan INSERT pada tabel `messages` menggunakan klausa `EXISTS`:
   ```sql
   CREATE POLICY "Users can read messages from their conversations"
     ON public.messages FOR SELECT TO authenticated
     USING (
       EXISTS (
         SELECT 1 FROM public.conversations c
         WHERE c.id = messages.conversation_id
           AND (c.user1_id = (select auth.uid()) OR c.user2_id = (select auth.uid()))
       )
     );
   ```
   Bahkan jika **User C** mengetahui UUID spesifik dari `conversation_id` milik User A & B dan mencoba melakukan kueri `SELECT * FROM messages WHERE conversation_id = 'xxx'`, subquery `EXISTS` akan bernilai `FALSE` karena User C bukan merupakan partisipan percakapan tersebut. Request pengiriman pesan (`INSERT`) oleh User C ke `conversation_id` milik A & B juga akan langsung digagalkan oleh PostgreSQL dengan error `new row violates row-level security policy`.

---

## 🔒 Kesimpulan Keamanan

Arsitektur aplikasi Akselera.Tech menerapkan **Defense in Depth**:
- Frontend hanya meminta data yang relevan.
- Next.js Server Components & Middleware melindungi rute aplikasi.
- PostgreSQL Row Level Security (RLS) menjamin otorisasi data **secara absolut di level basis data**.
