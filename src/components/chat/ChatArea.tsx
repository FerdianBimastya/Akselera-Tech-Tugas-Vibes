"use client";

import React, { useRef, useEffect } from "react";
import { EmptyState } from "@/components/chat/EmptyState";
import { MessageInput } from "@/components/chat/MessageInput";
import { ConversationItemData } from "@/components/chat/ConversationItem";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Message } from "@/types/database";

interface ChatAreaProps {
  activeConversation: ConversationItemData | null;
  messages: Message[];
  currentUserId: string;
  currentUser?: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
  };
  loadingMessages?: boolean;
  errorMessage?: string | null;
  onSendMessage: (text: string) => Promise<void>;
  onDeleteForEveryone?: (messageId: string) => Promise<void> | void;
  onDeleteForMe?: (messageId: string) => Promise<void> | void;
  onNewChatClick?: () => void;
  onBackToList?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  activeConversation,
  messages = [],
  currentUserId,
  currentUser,
  loadingMessages = false,
  errorMessage = null,
  onSendMessage,
  onDeleteForEveryone,
  onDeleteForMe,
  onNewChatClick,
  onBackToList,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeMenuMsgId, setActiveMenuMsgId] = React.useState<string | null>(null);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingMessages]);

  // Close active dropdown menu when clicking anywhere outside
  useEffect(() => {
    const handleGlobalClick = () => setActiveMenuMsgId(null);
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  // Render EmptyState if no active conversation is selected
  if (!activeConversation) {
    return <EmptyState onNewChatClick={onNewChatClick} />;
  }

  // Helper to format ISO timestamp to HH:mm
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  // Helper to parse and render image/file attachment content
  const renderMessageContent = (messageText: string, isMe: boolean) => {
    // Regex for image attachment markdown: ![image:FILENAME](DATA_URL)
    const imageMatch = messageText.match(/^!\[image:(.*?)\]\((data:image\/.*?;base64,.*?)\)(\n[\s\S]*)?$/);
    if (imageMatch) {
      const fileName = imageMatch[1] || "Gambar";
      const dataUrl = imageMatch[2];
      const extraText = imageMatch[3] ? imageMatch[3].trim() : "";

      return (
        <div className="space-y-2">
          <div className="relative group/img rounded-xl overflow-hidden border border-black/10 dark:border-white/10 max-w-xs bg-neutral-900/5 dark:bg-black/20">
            <img
              src={dataUrl}
              alt={fileName}
              className="w-full max-h-64 object-cover rounded-xl transition-transform duration-200 group-hover/img:scale-[1.02] cursor-pointer"
              onClick={() => window.open(dataUrl, "_blank")}
            />
            <div className="absolute bottom-1 right-1 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white backdrop-blur-xs font-mono">
              {fileName}
            </div>
          </div>
          {extraText && <p className="leading-relaxed">{extraText}</p>}
        </div>
      );
    }

    // Regex for file attachment markdown: [file:FILENAME:SIZE](DATA_URL)
    const fileMatch = messageText.match(/^\[file:(.*?):(.*?)]\((data:.*?;base64,.*?)\)(\n[\s\S]*)?$/);
    if (fileMatch) {
      const fileName = fileMatch[1] || "Berkas";
      const fileSizeNum = parseInt(fileMatch[2] || "0", 10);
      const dataUrl = fileMatch[3];
      const extraText = fileMatch[4] ? fileMatch[4].trim() : "";

      const formattedSize = fileSizeNum < 1024
        ? fileSizeNum + " B"
        : fileSizeNum < 1024 * 1024
        ? (fileSizeNum / 1024).toFixed(1) + " KB"
        : (fileSizeNum / (1024 * 1024)).toFixed(1) + " MB";

      return (
        <div className="space-y-2">
          <a
            href={dataUrl}
            download={fileName}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              isMe
                ? "bg-white/15 border-white/20 text-white hover:bg-white/25"
                : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-200/80"
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-black/20 dark:bg-white/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-xs truncate">{fileName}</p>
              <p className="text-[10px] opacity-75 font-mono">{formattedSize}</p>
            </div>
            <svg className="w-4 h-4 shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
          {extraText && <p className="leading-relaxed">{extraText}</p>}
        </div>
      );
    }

    return messageText;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-950 transition-colors overflow-hidden relative">
      {/* 1. Recipient Header Bar */}
      <header className="h-16 px-4 sm:px-6 border-b border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between shrink-0 glass-panel z-10">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Mobile Back to Chat List Button */}
          {onBackToList && (
            <button
              type="button"
              onClick={onBackToList}
              className="md:hidden p-1.5 rounded-xl text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors shrink-0"
              title="Kembali ke Daftar Chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <UserAvatar
            name={activeConversation.recipientName}
            email={activeConversation.recipientEmail}
            avatarUrl={activeConversation.avatarUrl}
            size="sm"
            showOnline={true}
          />
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              <span>{activeConversation.recipientName}</span>
            </h3>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 font-mono truncate max-w-[140px] sm:max-w-none">
              {activeConversation.recipientEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-900/80 text-[11px] text-neutral-600 dark:text-neutral-300 font-mono shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">1-on-1 Encrypted</span>
            <span className="sm:hidden">Akselera</span>
          </div>
        </div>
      </header>

      {/* Error alert banner if fetch or send fails */}
      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900/50 text-xs text-red-800 dark:text-red-300 flex items-center gap-2 shrink-0 animate-fadeIn">
          <svg className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* 2. Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-neutral-50/50 dark:bg-neutral-950/50 bg-grid-pattern">
        {loadingMessages ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400">
            <svg className="animate-spin h-6 w-6 mb-3 text-neutral-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs font-mono">Memuat pesan...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400 select-none">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mb-3 shadow-xs">
              <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-foreground">Belum ada percakapan</p>
            <p className="text-[11px] text-neutral-500 mt-1 max-w-xs leading-relaxed">Tulis pesan pertama di bawah untuk memulai obrolan dengan {activeConversation.recipientName}.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            const isRead = Boolean(msg.is_read);

            return (
              <div
                key={msg.id}
                className={`flex flex-col animate-fadeIn group ${isMe ? "items-end" : "items-start"}`}
              >
                <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  <UserAvatar
                    name={isMe ? (currentUser?.name || "Saya") : activeConversation.recipientName}
                    email={isMe ? (currentUser?.email || "") : activeConversation.recipientEmail}
                    avatarUrl={isMe ? currentUser?.avatarUrl : activeConversation.avatarUrl}
                    size="xs"
                    className="mb-1 shrink-0"
                  />

                  <div
                    className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs break-words transition-all ${
                      isMe
                        ? "bg-black text-white dark:bg-white dark:text-neutral-950 rounded-br-xs font-normal"
                        : "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 border border-neutral-200/90 dark:border-neutral-800 rounded-bl-xs font-normal"
                    }`}
                  >
                    {renderMessageContent(msg.message, isMe)}
                  </div>

                  {/* Message Action Dropdown Button */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuMsgId(activeMenuMsgId === msg.id ? null : msg.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl hover:bg-neutral-200/80 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer"
                      title="Opsi pesan"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>

                    {/* Action Menu Box */}
                    {activeMenuMsgId === msg.id && (
                      <div
                        className={`absolute z-30 bottom-full mb-1.5 w-48 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-1.5 text-xs animate-scaleIn ${
                          isMe ? "right-0" : "left-0"
                        }`}
                      >
                        {isMe && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuMsgId(null);
                              onDeleteForEveryone?.(msg.id);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Hapus untuk Semua</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuMsgId(null);
                            onDeleteForMe?.(msg.id);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.05 10.05 0 012.122-.363c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                          </svg>
                          <span>Hapus untuk Saya</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={`flex items-center gap-1.5 mt-1 px-1 text-[10px] font-mono ${isMe ? "text-neutral-400 dark:text-neutral-500" : "text-neutral-400 dark:text-neutral-500"}`}>
                  <span>{formatTime(msg.created_at)}</span>
                  {isMe && (
                    <span title={isRead ? "Dibaca oleh penerima" : "Terkirim (Belum dibaca)"} className="inline-flex items-center">
                      {isRead ? (
                        <svg className="w-4 h-4 text-sky-400 dark:text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7M11 13l4 4L23 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 opacity-70 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Bottom Message Input Bar */}
      <MessageInput onSendMessage={onSendMessage} disabled={loadingMessages} />
    </div>
  );
};

