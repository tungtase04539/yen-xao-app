import type { Metadata } from "next";
import { Cormorant_Garamond, Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import LayoutShell from "@/components/layout/LayoutShell";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Footer from "@/components/layout/Footer";

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
    default: "QiQi Yến Sào - Trao sức khỏe, gửi trọn yêu thương",
    template: "%s | QiQi Yến Sào",
  },
  description:
    "QIQI Yến (thuộc Công ty TNHH TM ĐT PT Phúc Thịnh) chuyên cung cấp các sản phẩm yến sào thiên nhiên nguyên chất và yến chưng chăm sóc sức khỏe toàn diện, cam kết an toàn, chất lượng.",
  keywords: [
    "yến sào",
    "yến sào cao cấp",
    "yến sào Khánh Hòa",
    "yến tinh chế",
    "yến chưng sẵn",
    "nước yến",
    "mua yến sào",
  ],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://qiqiyensao.com',
    siteName: 'QiQi Yến Sào',
    title: 'QiQi Yến Sào - Trao sức khỏe, gửi trọn yêu thương',
    description: 'QIQI Yến (thuộc Công ty TNHH TM ĐT PT Phúc Thịnh) chuyên cung cấp các sản phẩm yến sào thiên nhiên nguyên chất và yến chưng chăm sóc sức khỏe toàn diện, cam kết an toàn, chất lượng.',
    images: [
      {
        url: '/zalo-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'QiQi Yến Sào',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QiQi Yến Sào - Trao sức khỏe, gửi trọn yêu thương',
    description: 'QIQI Yến (thuộc Công ty TNHH TM ĐT PT Phúc Thịnh) chuyên cung cấp các sản phẩm yến sào thiên nhiên nguyên chất và yến chưng chăm sóc sức khỏe toàn diện, cam kết an toàn, chất lượng.',
    images: ['/zalo-banner.jpg'],
  },
  icons: {
    icon: '/a.png',
    apple: '/a.png',
    shortcut: '/a.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        {/* Preconnect to Supabase for faster image/video loading */}
        <link rel="preconnect" href="https://dxrogturyjgaxyiqpxhs.supabase.co" />
        <link rel="dns-prefetch" href="https://dxrogturyjgaxyiqpxhs.supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${heading.variable} ${body.variable} ${display.variable} antialiased min-h-screen flex flex-col`}
      >
        <SmoothScroll>
          <LayoutShell>{children}</LayoutShell>
          <Footer />
        </SmoothScroll>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

