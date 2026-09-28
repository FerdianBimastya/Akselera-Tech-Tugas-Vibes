import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database";

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rawUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase URL dan Anon Key belum dikonfigurasi di environment variable."
    );
  }

  // Sanitize URL: hapus akhiran /rest/v1 atau garis miring berlebih
  const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
