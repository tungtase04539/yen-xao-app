import Link from 'next/link';
import { Phone, Mail, MapPin, Sparkles } from 'lucide-react';

const productLinks = [
  { name: 'Yến Thô', href: '/danh-muc/yen-tho' },
  { name: 'Yến Tinh Chế', href: '/danh-muc/yen-tinh-che' },
  { name: 'Yến Chưng Sẵn', href: '/danh-muc/yen-chung-san' },
  { name: 'Nước Yến', href: '/danh-muc/nuoc-yen' },
  { name: 'Quà Tặng Yến', href: '/danh-muc/qua-tang-yen' },
];

const infoLinks = [
  { name: 'Giới Thiệu', href: '/gioi-thieu' },
  { name: 'Blog', href: '/blog' },
  { name: 'Chính sách bảo hành', href: '/chinh-sach-bao-hanh' },
  { name: 'Chính sách giao hàng', href: '/chinh-sach-giao-hang' },
  { name: 'Liên Hệ', href: '/lien-he' },
];

export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(to left, #9B1B30 0%, #7C1424 40%, #5A0E1A 100%)' }} className="text-white relative overflow-hidden">
      {/* Top gold line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/[0.03] blur-[120px] pointer-events-none" />

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16 md:py-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center mb-6">
              <div className="h-14 shrink-0">
                <img src="/logo-transparent.png" alt="QiQi Yến" className="h-full w-auto object-contain" />
              </div>
            </Link>
            <p className="text-lg text-white/50 leading-relaxed mb-6">
              Chuyên cung cấp các sản phẩm yến sào nguyên chất, tinh chế cao cấp từ đảo yến thiên nhiên Khánh Hòa.
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
                  className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-white/50 hover:border-gold hover:text-gold hover:bg-gold/10 transition-all text-sm"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-serif font-bold text-2xl mb-5 flex items-center gap-2" style={{ color: '#C9A55A' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'rgba(201,165,90,0.6)' }} />
              Sản Phẩm
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-lg text-white/60 hover:text-[#C9A55A] transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full group-hover:bg-[#C9A55A] transition-colors" style={{ background: 'rgba(201,165,90,0.3)' }} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-serif font-bold text-2xl mb-5 flex items-center gap-2" style={{ color: '#C9A55A' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'rgba(201,165,90,0.6)' }} />
              Thông Tin
            </h4>
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-lg text-white/60 hover:text-[#C9A55A] transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full group-hover:bg-[#C9A55A] transition-colors" style={{ background: 'rgba(201,165,90,0.3)' }} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-bold text-2xl mb-5 flex items-center gap-2" style={{ color: '#C9A55A' }}>
              <Sparkles className="w-3.5 h-3.5 text-gold/60" />
              Liên Hệ
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-lg text-white/45">
                <MapPin className="w-4 h-4 mt-0.5 text-gold/60 shrink-0" />
                <span>123 Đường Yến Sào, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li>
                <a
                  href="tel:0901234567"
                  className="flex items-center gap-3 text-lg text-white/45 hover:text-gold transition-colors"
                >
                  <Phone className="w-4 h-4 text-gold/60 shrink-0" />
                  0901 234 567
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@yensaocaocap.vn"
                  className="flex items-center gap-3 text-lg text-white/45 hover:text-gold transition-colors"
                >
                  <Mail className="w-4 h-4 text-gold/60 shrink-0" />
                  info@yensaocaocap.vn
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/[0.06]">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/30">
          <p>© 2026 Yến Sào Cao Cấp. Tất cả quyền được bảo lưu.</p>
          <p className="flex items-center gap-1.5">
            Crafted with <span className="text-gold">✦</span> passion
          </p>
        </div>
      </div>
    </footer>
  );
}
