"use client";

import React, { useState } from "react";

interface UserAvatarProps {
  name: string;
  email: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showOnline?: boolean;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  email,
  avatarUrl,
  size = "md",
  showOnline = false,
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);

  const initials = (name || email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Generate a consistent high-res avatar URL from DiceBear or UI-Avatars if no avatarUrl provided
  const fallbackAvatarUrl = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email || name)}`;

  const sizeClasses = {
    xs: "w-7 h-7 text-[10px]",
    sm: "w-9 h-9 text-xs",
    md: "w-11 h-11 text-xs",
    lg: "w-14 h-14 text-sm",
    xl: "w-20 h-20 text-lg",
  };

  const onlineDotSizes = {
    xs: "w-2 h-2",
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
    xl: "w-4 h-4",
  };

  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center font-bold tracking-wider transition-all shadow-2xs border border-neutral-200 dark:border-neutral-800 bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white`}
      >
        {!imgError && fallbackAvatarUrl ? (
          <img
            src={fallbackAvatarUrl}
            alt={name || email}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {showOnline && (
        <span
          className={`absolute bottom-0 right-0 ${onlineDotSizes[size]} rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-950`}
        />
      )}
    </div>
  );
};
