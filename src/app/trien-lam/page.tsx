import type { Metadata } from 'next';
import ExhibitionsPageClient from './TrienLamClient';
import { ogImage } from '@/lib/og';

const OG_PAGE = ogImage('/tri-an-khach-hang.jpg', 'Hành Trình Triển Lãm - QiQi Yến Sào');

export const metadata: Metadata = {
  title: 'Hành Trình Triển Lãm',
  description: 'Dấu chân QiQi Yến Sào qua các sự kiện triển lãm lớn nhỏ trên khắp cả nước, giới thiệu sản phẩm yến sào thiên nhiên cao cấp.',
  openGraph: {
    title: 'Hành Trình Triển Lãm | QiQi Yến Sào',
    description: 'Dấu chân QiQi Yến Sào qua các sự kiện triển lãm lớn nhỏ trên khắp cả nước, giới thiệu sản phẩm yến sào thiên nhiên cao cấp.',
    type: 'website',
    url: 'https://qiqiyensao.com/trien-lam',
    images: [OG_PAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hành Trình Triển Lãm | QiQi Yến Sào',
    description: 'Dấu chân QiQi Yến Sào qua các sự kiện triển lãm lớn nhỏ trên khắp cả nước, giới thiệu sản phẩm yến sào thiên nhiên cao cấp.',
    images: [OG_PAGE.url],
  },
};

export default function TrienLamPage() {
  return <ExhibitionsPageClient />;
}
