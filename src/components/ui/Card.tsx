import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hoverEffect = true,
}) => {
  return (
    <div
      className={`rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm transition-all duration-300 ${
        hoverEffect
          ? "hover:border-neutral-400 dark:hover:border-neutral-700 hover:shadow-md"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};
