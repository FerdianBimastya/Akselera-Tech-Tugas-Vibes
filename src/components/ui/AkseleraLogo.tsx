"use client";

import React from "react";

interface AkseleraLogoProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: "auto" | "light" | "dark";
  showText?: boolean;
}

export const AkseleraLogo: React.FC<AkseleraLogoProps> = ({
  className = "",
  width,
  height = 64,
  variant = "auto",
}) => {
  const darkLogoPath = "/Akselera Tech dark logo.png"; // Black logo for light backgrounds
  const whiteLogoPath = "/Akselera Tech white logo.png"; // White logo for dark backgrounds

  // Use height and proportional width scaling so logo is bold, crisp, and never letterboxed
  const styleObj: React.CSSProperties = {
    height: height ? `${height}px` : "64px",
    width: width ? `${width}px` : "auto",
    objectFit: "contain",
  };

  if (variant === "dark") {
    return (
      <img
        src={whiteLogoPath}
        alt="Akselera.Tech Logo"
        style={styleObj}
        className={`select-none max-w-full ${className}`}
      />
    );
  }

  if (variant === "light") {
    return (
      <img
        src={darkLogoPath}
        alt="Akselera.Tech Logo"
        style={styleObj}
        className={`select-none max-w-full ${className}`}
      />
    );
  }

  // Variant 'auto': switches automatically based on theme (Light vs Dark)
  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      {/* Dark Logo (Black Text) for Light Theme */}
      <img
        src={darkLogoPath}
        alt="Akselera.Tech Logo"
        style={styleObj}
        className="block dark:hidden max-w-full"
      />
      {/* White Logo for Dark Theme */}
      <img
        src={whiteLogoPath}
        alt="Akselera.Tech Logo"
        style={styleObj}
        className="hidden dark:block max-w-full"
      />
    </div>
  );
};
