import type { Metadata } from "next";
import { Cormorant_Garamond, Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import LayoutShell from "@/components/layout/LayoutShell";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Footer from "@/components/layout/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";

const heading = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  weight: ["400", "600", "700"], // Reduced from 5 to 3 weights
});

const body = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  weight: ["400", "500", "700"], // Reduced from 5 to 3 weights
});

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  weight: ["400", "700"], // Reduced from 6 to 2 weights
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
    "QiQi Yến Hải Phòng",
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
        {/* Preconnect to Cloudinary CDN + Supabase for data */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://grwkaavwpylykedykadv.supabase.co" />
        <link rel="dns-prefetch" href="https://grwkaavwpylykedykadv.supabase.co" />
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
        <GoogleAnalytics gaId="G-R1VFGXSMCQ" />
      </body>
    </html>
  );
}

