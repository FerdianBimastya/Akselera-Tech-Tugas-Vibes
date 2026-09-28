"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { User } from "@supabase/supabase-js";

export const UserMenu: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        setUser(currentUser);
      } catch (e) {
        console.error("Gagal mendapatkan data user:", e);
      } finally {
        setLoading(false);
      }
    }

    getUser();

    // Listen to Auth changes (sign in / sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Gagal keluar:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="h-9 w-24 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/login")}
        className="font-semibold text-xs"
      >
        Masuk
      </Button>
    );
  }

  const userDisplayName =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User";

  return (
    <div className="flex items-center gap-3">
      {/* User Info Capsule */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-xs">
        <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white" />
        <span className="font-semibold max-w-[140px] truncate">
          {userDisplayName}
        </span>
      </div>

      {/* Logout Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        disabled={loggingOut}
        className="text-xs font-semibold hover:border-black dark:hover:border-white transition-all"
      >
        {loggingOut ? "Keluar..." : "Keluar"}
      </Button>
    </div>
  );
};
