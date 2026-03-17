import Link from 'next/link';
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
                <img src="/logo-transparent.png" alt="QiQi Yến" className="h-full w-auto object-contain" />
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
                { label: 'f', href: 'https://facebook.com' },
                { label: '📷', href: 'https://instagram.com' },
                { label: '▶', href: 'https://youtube.com' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-gold/20 flex items-center justify-center text-white/50 hover:border-gold hover:text-gold hover:bg-gold/10 transition-all text-sm"
                >
                  {social.label}
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
                { label: 'Cơ sở 1', addr: 'Số 10/20/98 Khúc Thừa Dụ, P. An Biên, Hải Phòng' },
                { label: 'Cơ sở 2', addr: '50 Phạm Ngọc Đa, TT. Tiên Lãng, Hải Phòng' },
                { label: 'Cơ sở 3', addr: 'Khu đường tàu, TT. Hà Khẩu, Trung Quốc' },
                { label: 'Cơ sở 4', addr: 'Phố 114 Bạch Đằng, P. Thủy Nguyên, Hải Phòng' },
                { label: 'Cơ sở 5', addr: '37A Mê Linh, P. Gia Viên, Tp. Hải Phòng' },
              ].map(({ label, addr }) => (
                <div key={label} className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 text-gold/60 shrink-0" />
                  <span className="text-xs text-white/50 leading-snug">
                    <span className="text-gold/70 font-medium">{label}:</span> {addr}
                  </span>
                </div>
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
