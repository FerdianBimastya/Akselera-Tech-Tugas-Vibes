export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  statusTag?: string;
}

export type ThemeMode = "light" | "dark" | "system";
