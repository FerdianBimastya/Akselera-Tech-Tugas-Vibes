"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AkseleraLogo } from "@/components/ui/AkseleraLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isEnvPlaceholder =
    !supabaseUrl || supabaseUrl.includes("your-project-id");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (isEnvPlaceholder) {
      setErrorMsg(
        "Kredensial Supabase belum diisi. Ganti NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di file .env.local dengan URL & Anon Key dari Supabase Dashboard Anda."
      );
      return;
    }

    if (!email) {
      setErrorMsg("Harap masukkan alamat email Anda.");
      return;
    }

    if (mode !== "forgot" && !password) {
      setErrorMsg("Harap masukkan kata sandi Anda.");
      return;
    }

    if (mode === "register" && !name) {
      setErrorMsg("Harap masukkan nama lengkap Anda untuk pendaftaran.");
      return;
    }

    if (mode !== "forgot" && password.length < 6) {
      setErrorMsg("Kata sandi harus terdiri dari minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (
            error.message.includes("Invalid login credentials") ||
            error.message.includes("invalid_credentials")
          ) {
            setErrorMsg(
              "Email atau kata sandi tidak valid. Silakan periksa kembali data Anda."
            );
          } else if (error.message.includes("Email not confirmed")) {
            setErrorMsg(
              "Email Anda belum dikonfirmasi. Di Supabase Dashboard, Anda dapat mematikan opsi 'Confirm email' (Auth -> Providers -> Email) atau klik 'Confirm Email' pada user di menu Auth -> Users."
            );
          } else if (error.message.includes("Failed to fetch")) {
            setErrorMsg(
              "Gagal terhubung ke Supabase (Failed to fetch). Mohon pastikan URL dan Anon Key di .env.local sudah sesuai dengan Supabase Dashboard."
            );
          } else {
            setErrorMsg(
              error.message || "Gagal masuk. Silakan coba beberapa saat lagi."
            );
          }
        } else {
          // Upsert logged in user's profile to public.profiles table
          try {
            const { data: authData } = await supabase.auth.getUser();
            if (authData?.user) {
              await supabase.from("profiles").upsert({
                id: authData.user.id,
                email: authData.user.email!,
                name:
                  authData.user.user_metadata?.name ||
                  authData.user.user_metadata?.full_name ||
                  authData.user.email!.split("@")[0],
              } as any, { onConflict: "id" });
            }
          } catch (e) {
            console.error("Gagal menyinkronkan profil:", e);
          }

          setSuccessMsg("Autentikasi berhasil! Mengalihkan ke aplikasi...");
          router.push("/");
          router.refresh();
        }
      } else if (mode === "register") {
        // Register Mode
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              full_name: name,
            },
          },
        });

        if (error) {
          if (error.message.includes("Email rate limit exceeded")) {
            setErrorMsg(
              "Batas pengiriman email Supabase terlampaui. Untuk pengujian lokal, silakan matikan 'Confirm email' di Supabase Dashboard (Auth -> Providers -> Email) agar pendaftaran tidak perlu verifikasi email."
            );
          } else if (error.message.includes("Failed to fetch")) {
            setErrorMsg(
              "Gagal terhubung ke Supabase (Failed to fetch). Mohon pastikan URL dan Anon Key di .env.local sudah sesuai dengan Supabase Dashboard."
            );
          } else {
            setErrorMsg(error.message || "Gagal mendaftar akun baru.");
          }
        } else {
          // Upsert newly registered user's profile
          if (signUpData?.user) {
            try {
              await supabase.from("profiles").upsert({
                id: signUpData.user.id,
                email: signUpData.user.email!,
                name: name || signUpData.user.email!.split("@")[0],
              } as any, { onConflict: "id" });
            } catch (e) {
              console.error("Gagal mendaftarkan profil:", e);
            }
          }

          setSuccessMsg(
            "Pendaftaran berhasil! Silakan login menggunakan akun Anda."
          );
          setMode("login");
          setPassword("");
        }
      } else if (mode === "forgot") {
        // Reset Password Request Mode
        const redirectUrl = `${window.location.origin}/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });

        if (error) {
          if (error.message.includes("Email rate limit exceeded")) {
            setErrorMsg(
              "Batas pengiriman email Supabase terlampaui. Sebagai pengembang, Anda dapat langsung mengubah kata sandi akun di Supabase Dashboard (Auth -> Users -> Edit User) tanpa perlu kirim email."
            );
          } else {
            setErrorMsg(
              error.message || "Gagal mengirimkan instruksi reset kata sandi."
            );
          }
        } else {
          setSuccessMsg(
            `Tautan reset kata sandi telah dikirim ke ${email}. Silakan periksa kotak masuk (inbox/spam) email Anda.`
          );
        }
      }
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("Failed to fetch") || err?.name === "TypeError") {
        setErrorMsg(
          "Gagal terhubung ke server Supabase (Failed to fetch). Pastikan file .env.local berisi URL & Anon Key yang valid dari Supabase Dashboard."
        );
      } else {
        setErrorMsg(
          "Terjadi kesalahan: " + (msg || "Koneksi ke Supabase gagal.")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-background text-foreground transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <AkseleraLogo width={200} height={52} variant="auto" />
        <ThemeToggle />
      </header>

      {/* Main Form Center Box */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <Card className="p-8 shadow-xl border-neutral-200 dark:border-neutral-800 backdrop-blur-md bg-white/95 dark:bg-neutral-950/95">
            {/* Header Title */}
            <div className="text-center mb-8">
              <Badge
                variant="subtle"
                className="mb-3 px-3 py-1 font-mono text-[11px] uppercase tracking-wider"
              >
                Akselera.Tech Internal
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {mode === "login"
                  ? "Login"
                  : mode === "register"
                  ? "Daftar Akun Baru"
                  : "Reset Kata Sandi"}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                {mode === "login"
                  ? "Masukkan email dan kata sandi untuk mengakses workspace."
                  : mode === "register"
                  ? "Lengkapi data untuk mendaftarkan akun tim baru."
                  : "Masukkan email terdaftar Anda untuk menerima tautan reset kata sandi."}
              </p>
            </div>

            {/* Placeholder Env Alert Warning */}
            {isEnvPlaceholder && (
              <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="text-base shrink-0">⚠️</span>
                  <div>
                    <strong className="font-bold block mb-1">
                      Kredensial Supabase Belum Dikonfigurasi
                    </strong>
                    Pesan <code className="font-mono bg-amber-500/20 px-1 rounded">Failed to fetch</code> terjadi karena file <code className="font-mono bg-amber-500/20 px-1 rounded">.env.local</code> masih menggunakan URL dummy. Silakan ganti dengan URL dan Anon Key dari Supabase Dashboard Anda.
                  </div>
                </div>
              </div>
            )}

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 mb-6 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 rounded-md transition-all ${
                  mode === "login"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 rounded-md transition-all ${
                  mode === "register"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Daftar
              </button>
            </div>

            {/* Error Notification Banner */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 border-l-4 border-black dark:border-white text-xs text-neutral-800 dark:text-neutral-200 animate-fadeIn">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
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
              </div>
            )}

            {/* Success Notification Banner */}
            {successMsg && (
              <div className="mb-6 p-4 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black text-xs font-medium animate-fadeIn flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
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

            {/* Form inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5"
                  >
                    Nama Lengkap
                  </label>
                  <input
                    id="name"
                    type="text"
                    required={mode === "register"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Alex Pratama"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5"
                >
                  Alamat Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@akselera.tech"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                />
              </div>

              {mode !== "forgot" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider"
                    >
                      Kata Sandi
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white underline"
                      >
                        Lupa Kata Sandi?
                      </button>
                    )}
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  />
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="w-full py-3 text-sm font-bold tracking-wide uppercase"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Memproses...
                    </span>
                  ) : mode === "login" ? (
                    "Login"
                  ) : mode === "register" ? (
                    "Daftarkan Akun"
                  ) : (
                    "Kirim Tautan Reset"
                  )}
                </Button>
              </div>

              {mode === "forgot" && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                  >
                    ← Kembali ke Halaman Login
                  </button>
                </div>
              )}
            </form>

            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-900 text-center">
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                Sistem Otentikasi Terenkripsi • Akselera.Tech Security
              </p>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} Akselera.Tech. All rights reserved.</p>
      </footer>
    </div>
  );
}
