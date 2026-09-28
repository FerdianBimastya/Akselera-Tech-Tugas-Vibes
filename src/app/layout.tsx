import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Akselera.Tech — Platform Kolaborasi Internal",
  description:
    "Portal ruang kerja internal profesional untuk tim teknis dan operasional Akselera.Tech.",
  keywords: ["Akselera.Tech", "Internal Portal", "Workspace"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${nunito.variable} h-full antialiased`} suppressHydrationWarning>
      <body className={`${nunito.className} min-h-full flex flex-col bg-background text-foreground transition-colors duration-200`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
