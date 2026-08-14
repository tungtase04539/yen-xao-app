import type { Metadata } from "next";
import { Cormorant_Garamond, Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import LayoutShell from "@/components/layout/LayoutShell";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Footer from "@/components/layout/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SITE_URL, ogImage } from "@/lib/og";
import { safeJsonLd } from "@/lib/sanitize";

const OG_HOME = ogImage('/zalo-banner.jpg', 'QiQi Yến Sào');

// Suy ra từ env thay vì hardcode: trước đây preconnect trỏ vào project Supabase cũ
// đã migrate đi, tức mỗi lần tải trang tốn một handshake DNS+TLS không dùng tới.
const SUPABASE_ORIGIN = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin;

const HOTLINE = '+84843623986';
const EMAIL = 'tp.phucthinh.co@gmail.com';
const SOCIAL_LINKS = [
  'https://www.facebook.com/qiqiyensao/',
  'https://www.tiktok.com/@yensaoqiqi',
  'https://www.douyin.com/user/58483434306',
];

// Danh sách cơ sở giữ trùng khớp với /lien-he và Footer (hai nơi đó đang hardcode
// cùng dữ liệu này). Mỗi cơ sở là một entity Store để đủ điều kiện vào local pack.
const BRANCHES = [
  { label: 'Cơ sở 1', street: 'Số 10/20/98 Khúc Thừa Dụ, P. An Biên', locality: 'Hải Phòng', region: 'Hải Phòng', country: 'VN' },
  { label: 'Cơ sở 2', street: '50 Phạm Ngọc Đa, TT. Tiên Lãng', locality: 'Hải Phòng', region: 'Hải Phòng', country: 'VN' },
  { label: 'Cơ sở 3', street: 'Khu đường tàu, TT. Hà Khẩu', locality: 'Hà Khẩu', region: 'Vân Nam', country: 'CN' },
  { label: 'Cơ sở 4', street: 'Phố 114 Bạch Đằng, P. Thủy Nguyên', locality: 'Hải Phòng', region: 'Hải Phòng', country: 'VN' },
  { label: 'Cơ sở 5', street: '37A Mê Linh, P. Gia Viên', locality: 'Hải Phòng', region: 'Hải Phòng', country: 'VN' },
];

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

// KHÔNG thêm aggregateRating ở bất kỳ node nào: đánh giá hiện là dữ liệu sinh tự động,
// khai báo thành rating thật là vi phạm chính sách rich result của Google.
const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: 'QiQi Yến Sào',
      legalName: 'Công ty TNHH TM ĐT PT Phúc Thịnh',
      url: SITE_URL,
      logo: `${SITE_URL}/logo-transparent.png`,
      image: OG_HOME.url,
      description:
        'QIQI Yến (thuộc Công ty TNHH TM ĐT PT Phúc Thịnh) chuyên cung cấp các sản phẩm yến sào thiên nhiên nguyên chất và yến chưng chăm sóc sức khỏe toàn diện.',
      taxID: '0202247835',
      email: EMAIL,
      telephone: HOTLINE,
      sameAs: SOCIAL_LINKS,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: HOTLINE,
        email: EMAIL,
        areaServed: 'VN',
        availableLanguage: ['Vietnamese'],
      },
    },
    ...BRANCHES.map(({ label, street, locality, region, country }, i) => ({
      '@type': 'Store',
      '@id': `${SITE_URL}/#store-${i + 1}`,
      name: `QiQi Yến Sào - ${label}`,
      parentOrganization: { '@id': ORGANIZATION_ID },
      url: `${SITE_URL}/lien-he`,
      image: OG_HOME.url,
      telephone: HOTLINE,
      email: EMAIL,
      priceRange: '₫₫',
      openingHours: 'Mo-Su 08:00-21:00',
      address: {
        '@type': 'PostalAddress',
        streetAddress: street,
        addressLocality: locality,
        addressRegion: region,
        addressCountry: country,
      },
    })),
  ],
};

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
  metadataBase: new URL(SITE_URL),
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
    url: SITE_URL,
    siteName: 'QiQi Yến Sào',
    title: 'QiQi Yến Sào - Trao sức khỏe, gửi trọn yêu thương',
    description: 'QIQI Yến (thuộc Công ty TNHH TM ĐT PT Phúc Thịnh) chuyên cung cấp các sản phẩm yến sào thiên nhiên nguyên chất và yến chưng chăm sóc sức khỏe toàn diện, cam kết an toàn, chất lượng.',
    images: [OG_HOME],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QiQi Yến Sào - Trao sức khỏe, gửi trọn yêu thương',
    description: 'QIQI Yến (thuộc Công ty TNHH TM ĐT PT Phúc Thịnh) chuyên cung cấp các sản phẩm yến sào thiên nhiên nguyên chất và yến chưng chăm sóc sức khỏe toàn diện, cam kết an toàn, chất lượng.',
    images: [OG_HOME.url],
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
        <link rel="preconnect" href={SUPABASE_ORIGIN} />
        <link rel="dns-prefetch" href={SUPABASE_ORIGIN} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${heading.variable} ${body.variable} ${display.variable} antialiased min-h-screen flex flex-col`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(ORGANIZATION_JSON_LD) }}
        />
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

