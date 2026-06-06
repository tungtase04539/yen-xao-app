import type { Metadata } from 'next';
import ExhibitionsPageClient from './TrienLamClient';

export const metadata: Metadata = {
  title: 'Hành Trình Triển Lãm',
  description: 'Dấu chân QiQi Yến Sào qua các sự kiện triển lãm lớn nhỏ trên khắp cả nước, giới thiệu sản phẩm yến sào thiên nhiên cao cấp.',
  openGraph: {
    title: 'Hành Trình Triển Lãm | QiQi Yến Sào',
    description: 'Dấu chân QiQi Yến Sào qua các sự kiện triển lãm lớn nhỏ trên khắp cả nước, giới thiệu sản phẩm yến sào thiên nhiên cao cấp.',
    type: 'website',
    url: 'https://qiqiyensao.com/trien-lam',
    images: [
      {
        url: '/tri-an-khach-hang.jpg',
        width: 1200,
        height: 630,
        alt: 'Hành Trình Triển Lãm - QiQi Yến Sào',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hành Trình Triển Lãm | QiQi Yến Sào',
    description: 'Dấu chân QiQi Yến Sào qua các sự kiện triển lãm lớn nhỏ trên khắp cả nước, giới thiệu sản phẩm yến sào thiên nhiên cao cấp.',
    images: ['/tri-an-khach-hang.jpg'],
  },
};

export default function TrienLamPage() {
  return <ExhibitionsPageClient />;
}
