import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatWorkspace } from "@/components/chat/ChatWorkspace";

export const dynamic = "force-dynamic";

export default async function Home() {
  let user = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error("Gagal mendapatkan session user:", error);
  }

  // Server-side Route Protection:
  // Hanya user yang sudah login yang boleh mengakses halaman ini.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isEnvPlaceholder =
    !supabaseUrl || supabaseUrl.includes("your-project-id");

  if (!isEnvPlaceholder && !user) {
    redirect("/login");
  }

  // Demo user data fallback if testing locally without active env credentials
  const currentUserData = {
    id: user?.id || "demo-user-id",
    email: user?.email || "tim@akselera.tech",
    name:
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "Anggota Tim Akselera",
  };

  return <ChatWorkspace currentUser={currentUserData} />;
}
