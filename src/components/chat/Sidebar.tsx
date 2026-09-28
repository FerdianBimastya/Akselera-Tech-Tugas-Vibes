"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AkseleraLogo } from "@/components/ui/AkseleraLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  ConversationItem,
  ConversationItemData,
} from "@/components/chat/ConversationItem";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  currentUser: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
  };
  conversations: ConversationItemData[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onOpenNewChatModal: () => void;
  onUpdateAvatar?: (newAvatarUrl: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  conversations,
  activeConversationId,
  onSelectConversation,
  onOpenNewChatModal,
  onUpdateAvatar,
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran foto profil maksimal adalah 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

      // Automatically compress & resize avatar image using HTML5 Canvas to 256x256
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          if (onUpdateAvatar) {
            onUpdateAvatar(compressedDataUrl);
          }
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Gagal logout:", e);
    } finally {
      setLoggingOut(false);
    }
  };

  // Sort conversations by updatedAt timestamp (Newest to Oldest)
  const sortedConversations = [...conversations].sort((a, b) => {
    const timeA = new Date(a.updatedAt).getTime();
    const timeB = new Date(b.updatedAt).getTime();
    return timeB - timeA;
  });

  // Filter conversations based on recipient name or email search query
  const filteredConversations = sortedConversations.filter(
    (item) =>
      item.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-full md:w-80 lg:w-96 h-full flex flex-col border-r border-neutral-200 dark:border-neutral-800/80 bg-white/95 dark:bg-neutral-950/95 transition-colors shrink-0">
      {/* Hidden Profile Avatar Input */}
      <input
        ref={avatarInputRef}
        type="file"
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
      />

      {/* 1. Header with Akselera.Tech Logo & Current Logged-in User Profile */}
      <div className="p-5 border-b border-neutral-200 dark:border-neutral-800/80 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <AkseleraLogo height={60} variant="auto" />
        </div>

        {/* Current Logged-in User Profile Capsule */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800/80 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 relative group">
          <div
            onClick={() => avatarInputRef.current?.click()}
            className="relative cursor-pointer group/avatar shrink-0"
            title="Klik untuk ubah foto profil"
          >
            <UserAvatar
              name={currentUser.name}
              email={currentUser.email}
              avatarUrl={currentUser.avatarUrl}
              size="md"
              showOnline={true}
            />
            {/* Camera Overlay Badge */}
            <div className="absolute inset-0 rounded-full bg-black/50 text-white opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity text-[10px] font-bold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h4 className="text-xs font-bold truncate text-foreground">
                {currentUser.name}
              </h4>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-black text-white dark:bg-white dark:text-black transition-all hover:scale-105 cursor-pointer shrink-0"
                title="Ubah foto profil Anda"
              >
                Ubah Foto
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono truncate mt-0.5">
              {currentUser.email}
            </p>
          </div>
        </div>

        {/* 2. "+ Chat Baru" Action Button */}
        <Button
          variant="primary"
          size="md"
          onClick={onOpenNewChatModal}
          className="w-full py-2.5 text-xs font-extrabold tracking-wider uppercase flex items-center justify-center gap-2 rounded-xl shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Chat Baru</span>
        </Button>

        {/* 3. Search Bar */}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lawan bicara..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-neutral-400 hover:text-black dark:hover:text-white"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 4. Section Label */}
      <div className="px-5 pt-3 pb-1 flex items-center justify-between text-[10px] font-extrabold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase font-mono">
        <span>Percakapan ({filteredConversations.length})</span>
        {conversations.length > 0 && (
          <span className="text-[9px] text-neutral-400 font-normal">Realtime Sync</span>
        )}
      </div>

      {/* 5. Conversation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {conversations.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-400 px-4">
            <p className="font-bold text-foreground mb-1">Belum ada percakapan</p>
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              Klik tombol "+ Chat Baru" di atas untuk memulai percakapan 1-on-1 dengan rekan tim.
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400 px-4">
            <p className="font-bold text-foreground mb-1">Pencarian tidak ditemukan</p>
            <p className="text-neutral-500 text-[11px]">
              Tidak ada percakapan dengan nama "<span className="font-mono">{searchQuery}</span>".
            </p>
          </div>
        ) : (
          filteredConversations.map((item) => (
            <ConversationItem
              key={item.id}
              conversation={item}
              isActive={item.id === activeConversationId}
              onClick={() => onSelectConversation(item.id)}
            />
          ))
        )}
      </div>

      {/* 6. Footer Controls */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between gap-2 shrink-0">
        <ThemeToggle />

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-xs font-bold hover:border-black dark:hover:border-white transition-all flex items-center gap-1.5 rounded-lg"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>{loggingOut ? "..." : "Keluar"}</span>
        </Button>
      </div>
    </aside>
  );
};

