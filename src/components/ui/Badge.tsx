import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "subtle";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  const variantStyles = {
    default: "bg-black text-white dark:bg-white dark:text-black font-semibold",
    outline:
      "border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200",
    subtle:
      "bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 font-medium",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs transition-colors ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
