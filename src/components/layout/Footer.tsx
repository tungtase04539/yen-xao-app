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
    <footer style={{ background: 'linear-gradient(to right, #8B1A2B, #6E1222)' }} className="text-white relative overflow-hidden">
      {/* Top gold line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/[0.03] blur-[120px] pointer-events-none" />

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10 md:py-14 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center mb-6">
              <div id="footer-logo" className="h-32 shrink-0">
                <img src="/logo-transparent.png" alt="QiQi Yến" className="h-full w-auto object-contain" />
              </div>
            </Link>
            <p className="text-lg text-white/50 leading-relaxed mb-3">
              Chuyên cung cấp các sản phẩm yến sào thiên nhiên nguyên chất và yến chưng chăm sóc sức khỏe toàn diện, cam kết an toàn, chất lượng.
            </p>
            <p className="text-sm text-white/40 mb-6">
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
                <span>Số 10/20/98 Khúc Thừa Dụ, Phường An Biên, Hải Phòng</span>
              </li>
              <li>
                <a
                  href="tel:0984234669"
                  className="flex items-center gap-3 text-lg text-white/45 hover:text-gold transition-colors"
                >
                  <Phone className="w-4 h-4 text-gold/60 shrink-0" />
                  0984 234 669
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
        <div className="container mx-auto px-4 py-5 flex justify-center items-center text-xs text-white/30">
          <p>© 2026 QiQi Yến Sào - Trao Sức Khỏe, Gửi Trọn Yêu Thương</p>
        </div>
      </div>
    </footer>
  );
}
