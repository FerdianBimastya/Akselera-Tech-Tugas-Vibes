"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantStyles = {
    // Primary: Contrast pop (Black background in light mode, White background in dark mode)
    primary:
      "bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black focus:ring-black dark:focus:ring-white shadow-sm",
    
    // Secondary: Dark neutral background
    secondary:
      "bg-neutral-200 hover:bg-neutral-300 text-black dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white focus:ring-neutral-400",
    
    // Outline: Border only
    outline:
      "border border-neutral-300 hover:bg-neutral-100 text-black dark:border-neutral-700 dark:hover:bg-neutral-900 dark:text-white focus:ring-neutral-500",
    
    // Ghost: Subtle hover
    ghost:
      "text-neutral-700 hover:bg-neutral-100 hover:text-black dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
