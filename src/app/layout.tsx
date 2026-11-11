import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import localFont from "next/font/local";

// Tajawal & Cairo are the ONLY fonts used across the app (per project identity).
const tajawal = localFont({
  src: [
    { path: "../../node_modules/@fontsource/tajawal/files/tajawal-arabic-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/tajawal/files/tajawal-arabic-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../node_modules/@fontsource/tajawal/files/tajawal-arabic-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../node_modules/@fontsource/tajawal/files/tajawal-arabic-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-tajawal",
  display: "swap",
});

const cairo = localFont({
  src: [
    { path: "../../node_modules/@fontsource/cairo/files/cairo-arabic-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/cairo/files/cairo-arabic-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../node_modules/@fontsource/cairo/files/cairo-arabic-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../node_modules/@fontsource/cairo/files/cairo-arabic-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "أداة BMC للأعمال — مولّد الجداول المالية ونموذج الأعمال",
  description: "أداة شاملة لرواد الأعمال في الحاضنات الجزائرية: الملاحق المالية، نموذج الأعمال BMC، مدرب ذكي، تقرير احترافي وعرض تقديمي — تعمل محلياً في المتصفح.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${tajawal.variable} ${cairo.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
