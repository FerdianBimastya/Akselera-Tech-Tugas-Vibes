"use client";

import React from "react";
import { UserAvatar } from "@/components/ui/UserAvatar";

export interface ConversationItemData {
  id: string;
  recipientName: string;
  recipientEmail: string;
  avatarUrl?: string | null;
  lastMessage: string;
  lastMessageTime: string;
  updatedAt: string; // ISO string for sorting from newest to oldest
  unreadCount?: number;
}

interface ConversationItemProps {
  conversation: ConversationItemData;
  isActive?: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive = false,
  onClick,
}) => {
  const hasUnread = Boolean(conversation.unreadCount && conversation.unreadCount > 0);

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-xl text-left transition-all duration-200 flex items-center gap-3.5 group relative outline-none select-none ${
        isActive
          ? "bg-black text-white dark:bg-white dark:text-black shadow-md font-medium ring-1 ring-black/10 dark:ring-white/20"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-900/90 text-neutral-800 dark:text-neutral-200 border border-transparent"
      }`}
    >
      {/* Avatar Container */}
      <UserAvatar
        name={conversation.recipientName}
        email={conversation.recipientEmail}
        avatarUrl={conversation.avatarUrl}
        size="md"
        showOnline={true}
      />

      {/* Info Column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4
            className={`text-xs sm:text-sm font-bold truncate ${
              isActive ? "text-white dark:text-black" : "text-neutral-900 dark:text-neutral-100"
            }`}
          >
            {conversation.recipientName}
          </h4>
          <span
            className={`text-[10px] font-mono shrink-0 ml-2 ${
              isActive
                ? "text-neutral-300 dark:text-neutral-600"
                : "text-neutral-400 dark:text-neutral-500"
            }`}
          >
            {conversation.lastMessageTime}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1">
          <p
            className={`text-xs truncate ${
              isActive
                ? "text-neutral-300 dark:text-neutral-700 font-normal"
                : hasUnread
                ? "text-neutral-900 dark:text-white font-semibold"
                : "text-neutral-500 dark:text-neutral-400 font-normal"
            }`}
          >
            {conversation.lastMessage}
          </p>

          {/* Unread Badge Indicator */}
          {hasUnread ? (
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono shrink-0 transition-transform animate-scaleIn ${
                isActive
                  ? "bg-white text-black dark:bg-black dark:text-white"
                  : "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              }`}
            >
              {conversation.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
};

