"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";

export interface ProfileOption {
  id?: string;
  name: string;
  email: string;
  avatar_url?: string | null;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (user: ProfileOption) => Promise<void> | void;
  availableUsers: ProfileOption[];
  loading?: boolean;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onStartChat,
  availableUsers,
  loading = false,
}) => {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<ProfileOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedUser(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredUsers = availableUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmStartChat = async (userToStart?: ProfileOption) => {
    const target = userToStart || selectedUser;
    if (!target || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onStartChat(target);
      onClose();
    } catch (e) {
      console.error("Gagal memulai chat:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <Card className="w-full max-w-md p-6 shadow-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-3xl animate-scaleIn">
        {/* Header - WhatsApp Style Obrolan Baru */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              title="Kembali"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight text-neutral-900 dark:text-white">
                Obrolan Baru
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                {availableUsers.length} Kontak Terdaftar
              </p>
            </div>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="mt-4 mb-3">
          <div className="relative">
            <svg
              className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau @email pengguna..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Section Title */}
        <div className="px-1 py-1 text-[10px] font-extrabold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase font-mono">
          <span>Kontak Terdaftar Akselera ({filteredUsers.length})</span>
        </div>

        {/* Contact Users List */}
        <div className="max-h-72 overflow-y-auto space-y-1.5 py-1 pr-1 custom-scrollbar">
          {loading ? (
            <div className="py-12 text-center text-xs text-neutral-400 animate-pulse font-mono flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-neutral-300 dark:border-neutral-700 border-t-black dark:border-t-white rounded-full animate-spin"></div>
              Memuat daftar kontak terdaftar...
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isSelected = selectedUser?.email === user.email;

              return (
                <button
                  key={user.id || user.email}
                  type="button"
                  onClick={() => {
                    setSelectedUser(user);
                    handleConfirmStartChat(user);
                  }}
                  className={`w-full p-3.5 rounded-2xl text-left flex items-center justify-between transition-all duration-150 border group cursor-pointer ${
                    isSelected
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md scale-[1.01]"
                      : "border-neutral-100 dark:border-neutral-900 hover:border-neutral-200 dark:hover:border-neutral-800 hover:bg-neutral-100/80 dark:hover:bg-neutral-900/90 text-neutral-800 dark:text-neutral-200"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <UserAvatar
                      name={user.name}
                      email={user.email}
                      avatarUrl={user.avatar_url}
                      size="md"
                      showOnline={true}
                    />
                    <div className="min-w-0">
                      <h4
                        className={`text-xs font-bold truncate ${
                          isSelected ? "text-white dark:text-black" : "text-neutral-900 dark:text-white"
                        }`}
                      >
                        {user.name}
                      </h4>
                      <p
                        className={`text-[11px] truncate font-mono ${
                          isSelected
                            ? "text-neutral-300 dark:text-neutral-700"
                            : "text-neutral-500 dark:text-neutral-400"
                        }`}
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <div className="ml-2 shrink-0">
                    <span className="text-[11px] font-bold tracking-wide uppercase px-3 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black group-hover:scale-105 transition-all shadow-xs flex items-center gap-1">
                      <span>Chat</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-neutral-400 px-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
              <p className="font-bold text-neutral-900 dark:text-white mb-1">
                {search ? "Pencarian tidak ditemukan" : "Tidak ada kontak lain"}
              </p>
              <p className="text-neutral-500 text-[11px] leading-relaxed">
                {search
                  ? `Tidak ada kontak registered dengan kata kunci "${search}".`
                  : "Semua akun terdaftar sudah ada di daftar percakapan Anda."}
              </p>
            </div>
          )}
        </div>

        {/* Dynamic Email Option (Only shown if user types a new email in search bar that is NOT in contacts list) */}
        {search.trim().length > 3 && !filteredUsers.some(u => u.email.toLowerCase() === search.trim().toLowerCase()) && (
          <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 animate-fadeIn">
            <button
              type="button"
              onClick={() =>
                handleConfirmStartChat({
                  name: search.trim().split("@")[0],
                  email: search.trim().toLowerCase(),
                })
              }
              disabled={isSubmitting}
              className="w-full p-3 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-between hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-white/20 dark:bg-black/20 font-bold text-xs flex items-center justify-center shrink-0">
                  +
                </div>
                <span className="truncate">Chat dengan email: {search.trim()}</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/20 dark:bg-black/20 shrink-0 font-bold">
                Mulai
              </span>
            </button>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
            Klik kontak terdaftar di atas untuk memulai chat.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl font-semibold text-xs"
          >
            Tutup
          </Button>
        </div>
      </Card>
    </div>
  );
};




