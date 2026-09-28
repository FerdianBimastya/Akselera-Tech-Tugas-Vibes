"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AkseleraLogo } from "@/components/ui/AkseleraLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!newPassword || !confirmPassword) {
      setErrorMsg("Harap isi kedua kolom kata sandi.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Kata sandi baru harus minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMsg(error.message || "Gagal memperbarui kata sandi.");
      } else {
        setSuccessMsg(
          "Kata sandi Anda berhasil diperbarui! Mengalihkan ke halaman login..."
        );
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg("Terjadi kesalahan: " + (err?.message || "Gagal memproses."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-background text-foreground transition-colors duration-200">
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <AkseleraLogo width={200} height={52} variant="auto" />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <Card className="p-8 shadow-xl border-neutral-200 dark:border-neutral-800 backdrop-blur-md bg-white/95 dark:bg-neutral-950/95">
            <div className="text-center mb-8">
              <Badge
                variant="subtle"
                className="mb-3 px-3 py-1 font-mono text-[11px] uppercase tracking-wider"
              >
                Akselera.Tech Security
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Buat Kata Sandi Baru
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                Masukkan kata sandi baru untuk akun Akselera.Tech Anda.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 border-l-4 border-black dark:border-white text-xs text-neutral-800 dark:text-neutral-200 animate-fadeIn flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black text-xs font-medium animate-fadeIn flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5"
                >
                  Kata Sandi Baru
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5"
                >
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="w-full py-3 text-sm font-bold tracking-wide uppercase"
                >
                  {loading ? "Memperbarui..." : "Simpan Kata Sandi Baru"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} Akselera.Tech. All rights reserved.</p>
      </footer>
    </div>
  );
}
