import type { Metadata } from "next";
import { Cormorant_Garamond, Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import LayoutShell from "@/components/layout/LayoutShell";
import SmoothScroll from "@/components/layout/SmoothScroll";

const heading = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const body = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Yến Sào Cao Cấp - Yến Sào Nguyên Chất Khánh Hòa",
    template: "%s | Yến Sào Cao Cấp",
  },
  description:
    "Chuyên cung cấp yến sào nguyên chất, tinh chế cao cấp từ đảo yến thiên nhiên Khánh Hòa. Cam kết chất lượng, giao hàng toàn quốc.",
  keywords: [
    "yến sào",
    "yến sào cao cấp",
    "yến sào Khánh Hòa",
    "yến tinh chế",
    "yến chưng sẵn",
    "nước yến",
    "mua yến sào",
  ],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${heading.variable} ${body.variable} ${display.variable} antialiased min-h-screen flex flex-col`}
      >
        <SmoothScroll>
          <LayoutShell>{children}</LayoutShell>
        </SmoothScroll>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

