"use client";

import React, { useState, useRef } from "react";

interface AttachmentData {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<void> | void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<AttachmentData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran berkas maksimal adalah 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAttachment({
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: dataUrl,
        });
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = text.trim();
    if ((!trimmedText && !attachment) || disabled || sending) return;

    setSending(true);
    try {
      let finalMessage = trimmedText;

      if (attachment) {
        if (attachment.type.startsWith("image/")) {
          const imgMarkdown = `![image:${attachment.name}](${attachment.dataUrl})`;
          finalMessage = trimmedText ? `${imgMarkdown}\n${trimmedText}` : imgMarkdown;
        } else {
          const fileMarkdown = `[file:${attachment.name}:${attachment.size}](${attachment.dataUrl})`;
          finalMessage = trimmedText ? `${fileMarkdown}\n${trimmedText}` : fileMarkdown;
        }
      }

      await onSendMessage(finalMessage);
      setText("");
      setAttachment(null);
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 bg-white/90 dark:bg-neutral-950/90 border-t border-neutral-200 dark:border-neutral-800/80 transition-colors shrink-0 glass-panel">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.png,.jpg,.jpeg,.gif"
        className="hidden"
      />

      {/* Attachment Preview Box */}
      {attachment && (
        <div className="mb-3 max-w-5xl mx-auto flex items-center gap-3 p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 animate-fadeIn">
          {attachment.type.startsWith("image/") ? (
            <img
              src={attachment.dataUrl}
              alt={attachment.name}
              className="w-12 h-12 object-cover rounded-xl border border-neutral-300 dark:border-neutral-700 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0 font-bold text-xs uppercase font-mono">
              FILE
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h5 className="text-xs font-bold truncate text-neutral-900 dark:text-white">
              {attachment.name}
            </h5>
            <p className="text-[11px] text-neutral-500 font-mono">
              {formatFileSize(attachment.size)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors shrink-0"
            title="Hapus lampiran"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-5xl mx-auto">
        {/* Attachment Icon Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || sending}
          className="p-2.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
          title="Lampirkan berkas atau gambar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>

        {/* Text Input Field */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          placeholder={attachment ? "Tambahkan keterangan (opsional)..." : "Tulis pesan internal Akselera.Tech..."}
          className="flex-1 px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all disabled:opacity-60 shadow-2xs placeholder:text-neutral-400"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!text.trim() && !attachment) || disabled || sending}
          className="p-3 rounded-2xl bg-black text-white dark:bg-white dark:text-neutral-950 font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-xs flex items-center justify-center min-w-[44px] min-h-[44px] hover:scale-105 active:scale-95 cursor-pointer"
          title="Kirim Pesan"
        >
          {sending ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
              />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

