import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const infoLinks = [
  { name: 'Giới Thiệu', href: '/gioi-thieu' },
  { name: 'Blog', href: '/blog' },
  { name: 'Chính sách bảo hành', href: '/chinh-sach-bao-hanh' },
  { name: 'Chính sách giao hàng', href: '/chinh-sach-giao-hang' },
  { name: 'Liên Hệ', href: '/lien-he' },
];

export default async function Footer() {
  // Fetch product categories dynamically
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('type', 'product')
    .order('sort_order');

  const productLinks = (categories || []).map((c) => ({
    name: c.name,
    href: `/danh-muc/${c.slug}`,
  }));

  return (
    <footer style={{ background: 'linear-gradient(to right, #8B1A2B, #6E1222)' }} className="text-white relative overflow-hidden">
      {/* Top gold line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/[0.03] blur-[120px] pointer-events-none" />

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10 md:py-14 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center mb-5">
              <div id="footer-logo" className="h-28 shrink-0">
                <Image src="/logo-transparent.png" alt="QiQi Yến" width={224} height={224} className="h-full w-auto object-contain" loading="lazy" />
              </div>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed mb-3">
              Chuyên cung cấp các sản phẩm yến sào nguyên chất, tinh chế cao cấp từ đảo yến thiên nhiên của QiQi Yến.
            </p>
            <p className="text-xs text-white/40 mb-5">
              Mã số doanh nghiệp: <span className="text-gold/70 font-medium">0202247835</span>
            </p>
            <div className="flex gap-3">
              {[
                { label: 'Facebook', href: 'https://www.facebook.com/qiqiyensao', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                { label: 'TikTok', href: 'https://www.tiktok.com/@yensaoqiqi', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
                { label: 'Douyin', href: 'https://www.douyin.com/user/58483434306', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.label}
                  className="w-9 h-9 rounded-full border border-gold/20 flex items-center justify-center text-white/50 hover:border-gold hover:text-gold hover:bg-gold/10 transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Products — dynamic */}
          <div className="lg:col-span-1">
            <h4 className="font-serif font-bold text-xl mb-4 flex items-center gap-2" style={{ color: '#C9A55A' }}>
              <Sparkles className="w-3 h-3" style={{ color: 'rgba(201,165,90,0.6)' }} />
              Sản Phẩm
            </h4>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-[#C9A55A] transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 group-hover:bg-[#C9A55A] transition-colors" style={{ background: 'rgba(201,165,90,0.3)' }} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="lg:col-span-1">
            <h4 className="font-serif font-bold text-xl mb-4 flex items-center gap-2" style={{ color: '#C9A55A' }}>
              <Sparkles className="w-3 h-3" style={{ color: 'rgba(201,165,90,0.6)' }} />
              Thông Tin
            </h4>
            <ul className="space-y-2.5">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-[#C9A55A] transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 group-hover:bg-[#C9A55A] transition-colors" style={{ background: 'rgba(201,165,90,0.3)' }} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — 2 cols wide */}
          <div className="lg:col-span-2">
            <h4 className="font-serif font-bold text-xl mb-4 flex items-center gap-2" style={{ color: '#C9A55A' }}>
              <Sparkles className="w-3 h-3 text-gold/60" />
              Liên Hệ
            </h4>
            {/* Addresses in 2-col grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 mb-4">
              {[
                { label: 'Cơ sở 1', addr: 'Số 10/20/98 Khúc Thừa Dụ, P. An Biên, Hải Phòng', map: 'Số+10/20/98+Khúc+Thừa+Dụ,+Phường+An+Biên,+Hải+Phòng' },
                { label: 'Cơ sở 2', addr: '50 Phạm Ngọc Đa, TT. Tiên Lãng, Hải Phòng', map: '50+Phạm+Ngọc+Đa,+Thị+Trấn+Tiên+Lãng,+Hải+Phòng' },
                { label: 'Cơ sở 3', addr: 'Khu đường tàu, TT. Hà Khẩu, Trung Quốc', map: 'Khu+đường+tàu,+Thị+Trấn+Hà+Khẩu,+Hà+Khẩu,+Vân+Nam,+Trung+Quốc' },
                { label: 'Cơ sở 4', addr: 'Phố 114 Bạch Đằng, P. Thủy Nguyên, Hải Phòng', map: 'Phố+114+Bạch+Đằng,+Phường+Thủy+Nguyên,+Hải+Phòng' },
                { label: 'Cơ sở 5', addr: '37A Mê Linh, P. Gia Viên, Tp. Hải Phòng', map: '37A+Mê+Linh,+Phường+Gia+Viên,+Hải+Phòng' },
              ].map(({ label, addr, map }) => (
                <a
                  key={label}
                  href={`https://www.google.com/maps/search/?api=1&query=${map}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 group"
                >
                  <MapPin className="w-3.5 h-3.5 mt-0.5 text-gold/60 shrink-0 group-hover:text-gold transition-colors" />
                  <span className="text-xs text-white/50 leading-snug group-hover:text-white/80 transition-colors">
                    <span className="text-gold/70 font-medium group-hover:text-gold transition-colors">{label}:</span> {addr}
                  </span>
                </a>
              ))}
            </div>
            {/* Phone & Email */}
            <div className="flex flex-col gap-2.5 pt-3 border-t border-white/10">
              <a
                href="tel:0843623986"
                className="flex items-center gap-2.5 text-sm text-white/55 hover:text-gold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-gold/60 shrink-0" />
                0843.623986
              </a>
              <a
                href="mailto:tp.phucthinh.co@gmail.com"
                className="flex items-center gap-2.5 text-sm text-white/55 hover:text-gold transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-gold/60 shrink-0" />
                tp.phucthinh.co@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/[0.06]">
        <div className="container mx-auto px-4 py-5 flex justify-center items-center text-xs text-white/30">
          <p>© 2026 QiQi Yến Sào - Trao Sức Khỏe, Gửi Trọn Yêu Thương</p>
        </div>
      </div>
    </footer>
  );
}
