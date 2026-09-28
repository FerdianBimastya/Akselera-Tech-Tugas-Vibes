"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { ConversationItemData } from "@/components/chat/ConversationItem";
import {
  NewChatModal,
  ProfileOption,
} from "@/components/chat/NewChatModal";
import { createClient } from "@/lib/supabase/client";
import { Message } from "@/types/database";

const getReadTimestamp = (userId: string, convId: string): number => {
  if (typeof window === "undefined" || !userId || !convId) return 0;
  const val = localStorage.getItem(`last_read_${userId}_${convId}`);
  return val ? new Date(val).getTime() : 0;
};

const setReadTimestamp = (userId: string, convId: string) => {
  if (typeof window === "undefined" || !userId || !convId) return;
  localStorage.setItem(`last_read_${userId}_${convId}`, new Date().toISOString());
};

interface ChatWorkspaceProps {
  currentUser: {
    id: string;
    email: string;
    name: string;
  };
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  currentUser,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = React.useRef<string | null>(activeId);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<ProfileOption[]>([]);
  const [conversations, setConversations] = useState<ConversationItemData[]>(
    []
  );
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  const supabase = createClient();

  // Load custom profile photo from localStorage on mount (user specific)
  useEffect(() => {
    if (typeof window !== "undefined" && currentUser) {
      const savedAvatar =
        (currentUser.id ? localStorage.getItem(`user_avatar_${currentUser.id}`) : null) ||
        (currentUser.email ? localStorage.getItem(`user_avatar_${currentUser.email}`) : null);
      if (savedAvatar) {
        setUserAvatarUrl(savedAvatar);
      }
    }
  }, [currentUser?.id, currentUser?.email]);

  const handleUpdateAvatar = (newAvatarUrl: string) => {
    setUserAvatarUrl(newAvatarUrl);
    if (typeof window !== "undefined" && currentUser) {
      try {
        if (currentUser.id) localStorage.setItem(`user_avatar_${currentUser.id}`, newAvatarUrl);
        if (currentUser.email) localStorage.setItem(`user_avatar_${currentUser.email}`, newAvatarUrl);
      } catch (e) {
        console.warn("Gagal menyimpan foto profil ke localStorage:", e);
      }
    }
  };

  // 1. Load team members and user conversations with unread message calculation
  const loadWorkspaceData = useCallback(
    async (isBackground = false) => {
      try {
        if (!isBackground) {
          setLoadingWorkspace(true);
        }

        // Sync & list registered accounts (excluding current user)
        const KNOWN_REGISTERED_PROFILES: ProfileOption[] = [
          {
            id: "b9ccf294-356b-449f-bc9c-3c7fa0e42180",
            name: "Raya Maulana",
            email: "bisnismudaamin1@gmail.com",
          },
          {
            id: "2af9b914-2736-4576-ae27-007bf7a0b3cc",
            name: "bim",
            email: "ferdianbimastya09@gmail.com",
          },
          {
            id: "3a25f1af-aaf8-4249-b2c1-241391d18643",
            name: "Ferdian Bimastya 1",
            email: "ferdianbimastya1@gmail.com",
          },
        ];

        // Parallelize fetching registered profiles & user conversations from database
        let [profilesRes, convsRes] = await Promise.all([
          supabase.from("profiles").select("id, name, email"),
          supabase
            .from("conversations")
            .select(`
              id,
              user1_id,
              user2_id,
              created_at,
              user1:profiles!conversations_user1_id_fkey(id, name, email),
              user2:profiles!conversations_user2_id_fkey(id, name, email),
              messages:messages(id, message, sender_id, is_read, created_at)
            `)
            .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
            .order("created_at", { ascending: false }),
        ]);

        let dbProfiles = profilesRes.data;
        let convs = convsRes.data;
        let convErr = convsRes.error;

        // Fallback query if is_read column missing on remote Supabase DB
        if (convErr) {
          const fallbackConvs = await supabase
            .from("conversations")
            .select(`
              id,
              user1_id,
              user2_id,
              created_at,
              user1:profiles!conversations_user1_id_fkey(id, name, email),
              user2:profiles!conversations_user2_id_fkey(id, name, email),
              messages:messages(id, message, sender_id, created_at)
            `)
            .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
            .order("created_at", { ascending: false });

          convs = fallbackConvs.data
            ? fallbackConvs.data.map((c: any) => ({
                ...c,
                messages: (c.messages || []).map((m: any) => ({
                  ...m,
                  is_read: false,
                })),
              }))
            : null;
          convErr = fallbackConvs.error;
        }

        // Merge known registered accounts with DB profiles
        const profileMap = new Map<string, ProfileOption>();

        // Pre-fill with default known accounts
        KNOWN_REGISTERED_PROFILES.forEach((acc) => {
          if (acc.email.toLowerCase() !== currentUser.email.toLowerCase()) {
            profileMap.set(acc.email.toLowerCase(), acc);
          }
        });

        // Overlay actual DB profiles
        if (dbProfiles && dbProfiles.length > 0) {
          dbProfiles.forEach((p: any) => {
            if (p.email && p.email.toLowerCase() !== currentUser.email.toLowerCase()) {
              profileMap.set(p.email.toLowerCase(), {
                id: p.id,
                name:
                  p.name && p.name !== "-" && p.name.trim() !== ""
                    ? p.name
                    : p.email.split("@")[0],
                email: p.email,
                avatar_url: p.avatar_url || null,
              });
            }
          });
        }

        const finalTeamMembers = Array.from(profileMap.values());
        setTeamMembers(finalTeamMembers);

        if (!convErr && convs) {
          const formatted: ConversationItemData[] = convs.map((c: any) => {
            const recipient =
              c.user1_id === currentUser.id ? c.user2 : c.user1;

            const msgList: any[] = c.messages || [];

            // Sort messages by creation time
            const sortedMsgs = [...msgList].sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );

            const lastMsgObj =
              sortedMsgs.length > 0 ? sortedMsgs[sortedMsgs.length - 1] : null;

            const lastMsgText = lastMsgObj
              ? lastMsgObj.message
              : "Percakapan baru dibuat";

            const rawUpdatedAt = lastMsgObj
              ? lastMsgObj.created_at
              : c.created_at;

            const lastMsgTime = lastMsgObj
              ? new Date(lastMsgObj.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : new Date(c.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

            // Calculate unread count (reset to 0 if this conversation is currently open/active or read locally)
            const isCurrentlyActive = c.id === activeIdRef.current;
            const lastReadTime = getReadTimestamp(currentUser.id, c.id);

            const unread = isCurrentlyActive
              ? 0
              : sortedMsgs.filter((m) => {
                  if (m.sender_id === currentUser.id) return false;
                  if (m.is_read === true) return false;
                  const msgTime = new Date(m.created_at).getTime();
                  if (lastReadTime > 0 && msgTime <= lastReadTime) return false;
                  return true;
                }).length;

            const recipientAvatar =
              recipient?.id && typeof window !== "undefined"
                ? localStorage.getItem(`user_avatar_${recipient.id}`) || recipient?.avatar_url || null
                : recipient?.avatar_url || null;

            return {
              id: c.id,
              recipientName:
                recipient?.name || recipient?.email || "Rekan Akselera",
              recipientEmail: recipient?.email || "",
              avatarUrl: recipientAvatar,
              lastMessage: lastMsgText,
              lastMessageTime: lastMsgTime,
              updatedAt: rawUpdatedAt,
              unreadCount: unread,
            };
          });

          setConversations(formatted);
          try {
            localStorage.setItem(
              `cached_convs_${currentUser.id}`,
              JSON.stringify(formatted)
            );
          } catch (e) {
            // silent ignore cache write errors
          }
        }
      } catch (err) {
        console.error("Gagal memuat data workspace:", err);
      } finally {
        if (!isBackground) {
          setLoadingWorkspace(false);
        }
      }
    },
    [currentUser.id, currentUser.email, supabase]
  );

  // Execute initial load immediately on mount with instant cache & background sync
  useEffect(() => {
    if (currentUser?.id) {
      let hasCache = false;
      try {
        const cached = localStorage.getItem(`cached_convs_${currentUser.id}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setConversations(parsed);
            setLoadingWorkspace(false);
            hasCache = true;
          }
        }
      } catch (e) {
        console.error("Gagal membaca cache conversations:", e);
      }

      // Fetch fresh data in background if cached, or with spinner if cold start
      loadWorkspaceData(hasCache);

      // Perform profile background upsert non-blockingly
      supabase
        .from("profiles")
        .upsert(
          {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
          } as any,
          { onConflict: "id" }
        )
        .then(
          () => {},
          () => {}
        );
    }
  }, [currentUser, supabase, loadWorkspaceData]);

  // 2. Select conversation & mark unread badge as cleared in DB & local timestamp
  const handleSelectConversation = async (convId: string) => {
    setActiveId(convId);
    activeIdRef.current = convId;

    if (currentUser?.id) {
      setReadTimestamp(currentUser.id, convId);
    }

    // Immediately clear unread badge in local state
    setConversations((prev) =>
      prev.map((item) =>
        item.id === convId ? { ...item, unreadCount: 0 } : item
      )
    );

    // Update database in background if column exists (silent fallback)
    try {
      await supabase
        .from("messages")
        .update({ is_read: true } as any)
        .eq("conversation_id", convId)
        .neq("sender_id", currentUser.id);
    } catch {
      // Non-blocking fallback
    }
  };

  // 3. Fetch messages whenever active conversation changes
  useEffect(() => {
    if (!activeId) {
      setActiveMessages([]);
      return;
    }

    const targetChatId: string = activeId;
    if (currentUser?.id) {
      setReadTimestamp(currentUser.id, targetChatId);
    }

    async function fetchMessagesForActiveChat(isBackground = false) {
      if (!isBackground) {
        setLoadingMessages(true);
      }
      setErrorMessage(null);

      try {
        // Mark all incoming messages as read in DB when opening chat
        try {
          await supabase
            .from("messages")
            .update({ is_read: true } as any)
            .eq("conversation_id", targetChatId)
            .neq("sender_id", currentUser.id);
        } catch {
          // Non-blocking fallback
        }

        let { data: msgs, error } = await supabase
          .from("messages")
          .select("id, conversation_id, sender_id, message, is_read, created_at")
          .eq("conversation_id", targetChatId)
          .order("created_at", { ascending: true });

        if (error) {
          const fallback = await supabase
            .from("messages")
            .select("id, conversation_id, sender_id, message, created_at")
            .eq("conversation_id", targetChatId)
            .order("created_at", { ascending: true });
          msgs = fallback.data
            ? fallback.data.map((item: any) => ({ ...item, is_read: false }))
            : null;
          error = fallback.error;
        }

        if (error) {
          setErrorMessage(
            "Gagal memuat pesan: " + (error.message || "Kesalahan otorisasi RLS.")
          );
        } else if (msgs) {
          const storageKey = `deleted_for_me_${currentUser.id}`;
          const deletedIds: string[] = JSON.parse(
            typeof window !== "undefined"
              ? localStorage.getItem(storageKey) || "[]"
              : "[]"
          );
          const visibleMsgs = (msgs as Message[]).filter(
            (m) => !deletedIds.includes(m.id)
          );
          setActiveMessages(visibleMsgs);
        }
      } catch (err: any) {
        setErrorMessage("Terjadi kesalahan saat memuat riwayat pesan.");
      } finally {
        if (!isBackground) {
          setLoadingMessages(false);
        }
      }
    }

    fetchMessagesForActiveChat(false);
  }, [activeId, currentUser.id, supabase]);

  // 4. Background Auto-Sync / Polling
  useEffect(() => {
    const syncInterval = setInterval(() => {
      loadWorkspaceData(true);

      if (activeId) {
        // Mark incoming messages as read in DB when active
        supabase
          .from("messages")
          .update({ is_read: true } as any)
          .eq("conversation_id", activeId)
          .neq("sender_id", currentUser.id)
          .then(
            () => {},
            () => {}
          );

        supabase
          .from("messages")
          .select("id, conversation_id, sender_id, message, is_read, created_at")
          .eq("conversation_id", activeId)
          .order("created_at", { ascending: true })
          .then(({ data, error }) => {
            if (error) {
              supabase
                .from("messages")
                .select("id, conversation_id, sender_id, message, created_at")
                .eq("conversation_id", activeId)
                .order("created_at", { ascending: true })
                .then(({ data: fallbackData }) => {
                  if (fallbackData) {
                    const storageKey = `deleted_for_me_${currentUser.id}`;
                    const deletedIds: string[] = JSON.parse(
                      typeof window !== "undefined"
                        ? localStorage.getItem(storageKey) || "[]"
                        : "[]"
                    );
                    const msgsWithRead = (fallbackData as any[]).map((m) => ({
                      ...m,
                      is_read: m.is_read ?? false,
                    }));
                    setActiveMessages(
                      msgsWithRead.filter((m) => !deletedIds.includes(m.id))
                    );
                  }
                });
            } else if (data) {
              const storageKey = `deleted_for_me_${currentUser.id}`;
              const deletedIds: string[] = JSON.parse(
                typeof window !== "undefined"
                  ? localStorage.getItem(storageKey) || "[]"
                  : "[]"
              );
              const visibleMsgs = (data as Message[]).filter(
                (m) => !deletedIds.includes(m.id)
              );
              setActiveMessages(visibleMsgs);
            }
          });
      }
    }, 3000);

    return () => clearInterval(syncInterval);
  }, [activeId, loadWorkspaceData, currentUser.id, supabase]);

  // 5. Handle sending text message
  const handleSendMessage = async (textText: string) => {
    if (!activeId || !textText.trim()) return;

    setErrorMessage(null);

    try {
      let { data: newMsg, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: activeId,
          sender_id: currentUser.id,
          message: textText.trim(),
        })
        .select("id, conversation_id, sender_id, message, is_read, created_at")
        .single();

      if (error) {
        const fallback = await supabase
          .from("messages")
          .insert({
            conversation_id: activeId,
            sender_id: currentUser.id,
            message: textText.trim(),
          })
          .select("id, conversation_id, sender_id, message, created_at")
          .single();
        newMsg = fallback.data
          ? ({ ...fallback.data, is_read: false } as any)
          : null;
        error = fallback.error;
      }

      if (error) {
        setErrorMessage(
          "Gagal mengirim pesan: " + (error.message || "Akses tidak diizinkan.")
        );
        return;
      }

      if (newMsg) {
        const formattedMsg = {
          ...newMsg,
          is_read: false,
        } as Message;

        setActiveMessages((prev) => [...prev, formattedMsg]);

        const formattedTime = new Date(newMsg.created_at).toLocaleTimeString(
          [],
          { hour: "2-digit", minute: "2-digit" }
        );

        setConversations((prev) =>
          prev.map((item) =>
            item.id === activeId
              ? {
                  ...item,
                  lastMessage: newMsg.message,
                  lastMessageTime: formattedTime,
                  updatedAt: newMsg.created_at,
                  unreadCount: 0,
                }
              : item
          )
        );
      }
    } catch (err: any) {
      setErrorMessage("Terjadi kesalahan koneksi saat mengirim pesan.");
    }
  };

  // 5.1 Handle Delete Message for Everyone (DB Delete)
  const handleDeleteForEveryone = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) {
        setErrorMessage("Gagal menghapus pesan untuk semua: " + error.message);
        return;
      }

      setActiveMessages((prev) => prev.filter((m) => m.id !== messageId));
      await loadWorkspaceData(true);
    } catch (err: any) {
      console.error("Gagal menghapus pesan:", err);
      setErrorMessage("Terjadi kesalahan saat menghapus pesan.");
    }
  };

  // 5.2 Handle Delete Message for Me (Local View Hidden)
  const handleDeleteForMe = async (messageId: string) => {
    try {
      setActiveMessages((prev) => prev.filter((m) => m.id !== messageId));

      const storageKey = `deleted_for_me_${currentUser.id}`;
      if (typeof window !== "undefined") {
        const existing: string[] = JSON.parse(
          localStorage.getItem(storageKey) || "[]"
        );
        if (!existing.includes(messageId)) {
          localStorage.setItem(
            storageKey,
            JSON.stringify([...existing, messageId])
          );
        }
      }
    } catch (err: any) {
      console.error("Gagal menghapus pesan untuk saya:", err);
    }
  };

  // 6. Handle "+ Chat Baru" with dynamic profile lookup & auto-creation by Email
  const handleStartChatWithUser = async (
    targetUser: ProfileOption | { id?: string; name: string; email: string }
  ) => {
    if (!targetUser || !targetUser.email) return;

    setErrorMessage(null);

    try {
      const targetEmail = targetUser.email.trim().toLowerCase();

      if (targetEmail === currentUser.email.toLowerCase()) {
        setErrorMessage("Tidak dapat membuat obrolan dengan email Anda sendiri.");
        return;
      }

      let resolvedUser: ProfileOption | null = null;

      // 1. Search for profile in public.profiles table by ID or Email
      let query = supabase
        .from("profiles")
        .select("id, name, email");

      if (targetUser.id) {
        query = query.eq("id", targetUser.id);
      } else {
        query = query.eq("email", targetEmail);
      }

      const { data: foundProfiles } = await query;

      if (foundProfiles && foundProfiles.length > 0) {
        const match = foundProfiles.find((p) => p.id !== currentUser.id);
        if (match) {
          resolvedUser = match;
        }
      }

      // 2. If profile is not in public.profiles table yet, auto-create profile row so DB constraint passes
      if (!resolvedUser) {
        const newUserId = targetUser.id || crypto.randomUUID();
        const newUserName = targetUser.name || targetEmail.split("@")[0];

        const { data: newProfile, error: createProfileErr } = await supabase
          .from("profiles")
          .insert({
            id: newUserId,
            email: targetEmail,
            name: newUserName,
          } as any)
          .select("id, name, email")
          .single();

        if (createProfileErr) {
          // Retry selecting if already created by trigger
          const { data: retryProfiles } = await supabase
            .from("profiles")
            .select("id, name, email")
            .eq("email", targetEmail);

          if (retryProfiles && retryProfiles.length > 0) {
            resolvedUser = retryProfiles[0];
          } else {
            // Fallback resolvedUser object so user can start chat without throwing
            resolvedUser = {
              id: newUserId,
              name: newUserName,
              email: targetEmail,
            };
          }
        } else if (newProfile) {
          resolvedUser = newProfile;
        }
      }

      if (!resolvedUser || !resolvedUser.id) {
        setErrorMessage("Gagal memproses profil pengguna target.");
        return;
      }

      const targetUserId: string = resolvedUser.id;

      // 3. Find existing conversation or create new 1-on-1 pair
      const { data: existingConvs } = await supabase
        .from("conversations")
        .select(`
          id,
          user1_id,
          user2_id,
          created_at,
          user1:profiles!conversations_user1_id_fkey(id, name, email),
          user2:profiles!conversations_user2_id_fkey(id, name, email)
        `)
        .or(
          `and(user1_id.eq.${currentUser.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${currentUser.id})`
        );

      if (existingConvs && existingConvs.length > 0) {
        handleSelectConversation(existingConvs[0].id);
        await loadWorkspaceData(true);
        return;
      }

      // Insert new conversation into database
      const { data: insertedConv, error: insertErr } = await supabase
        .from("conversations")
        .insert({
          user1_id: currentUser.id,
          user2_id: targetUserId,
        })
        .select(`id, user1_id, user2_id, created_at`)
        .single();

      if (insertErr) {
        if (insertErr.code === "23505") {
          await loadWorkspaceData(false);
          return;
        }
        throw insertErr;
      }

      if (insertedConv) {
        const newConvItem: ConversationItemData = {
          id: insertedConv.id,
          recipientName: resolvedUser.name,
          recipientEmail: resolvedUser.email,
          avatarUrl: resolvedUser.avatar_url || null,
          lastMessage: "Percakapan baru dibuat",
          lastMessageTime: "Baru saja",
          updatedAt: insertedConv.created_at,
          unreadCount: 0,
        };

        setConversations((prev) => [newConvItem, ...prev]);
        handleSelectConversation(newConvItem.id);
        await loadWorkspaceData(true);
      }
    } catch (e: any) {
      console.error("Gagal membuat percakapan 1-on-1:", e?.message || e);
      setErrorMessage("Gagal membuat percakapan: " + (e?.message || "Kesalahan koneksi."));
    }
  };

  const activeConv =
    conversations.find((c) => c.id === activeId) || null;

  const handleOpenModal = () => {
    loadWorkspaceData(true);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* Left Sidebar Panel (Hidden on mobile when chat is active) */}
      <div className={`w-full md:w-80 lg:w-96 h-full shrink-0 ${activeId ? "hidden md:flex" : "flex"}`}>
        <Sidebar
          currentUser={{
            ...currentUser,
            avatarUrl: userAvatarUrl,
          }}
          conversations={conversations}
          activeConversationId={activeId}
          onSelectConversation={handleSelectConversation}
          onOpenNewChatModal={handleOpenModal}
          onUpdateAvatar={handleUpdateAvatar}
        />
      </div>

      {/* Right Main Chat / EmptyState Panel (Hidden on mobile when no chat is active) */}
      <main className={`flex-1 flex flex-col h-full min-w-0 overflow-hidden ${!activeId ? "hidden md:flex" : "flex"}`}>
        <ChatArea
          activeConversation={activeConv}
          messages={activeMessages}
          currentUserId={currentUser.id}
          currentUser={{
            ...currentUser,
            avatarUrl: userAvatarUrl,
          }}
          loadingMessages={loadingMessages}
          errorMessage={errorMessage}
          onSendMessage={handleSendMessage}
          onDeleteForEveryone={handleDeleteForEveryone}
          onDeleteForMe={handleDeleteForMe}
          onNewChatClick={() => setIsModalOpen(true)}
          onBackToList={() => setActiveId(null)}
        />
      </main>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartChat={handleStartChatWithUser}
        availableUsers={teamMembers}
        loading={loadingWorkspace}
      />
    </div>
  );
};
