import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

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
    <footer className="bg-burgundy-dark text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center text-burgundy font-bold text-xl font-serif shadow-md">
                YS
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-gold">Yến Sào</h3>
                <p className="text-[10px] text-gold-light tracking-widest uppercase">Cao Cấp</p>
              </div>
            </Link>
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              Chuyên cung cấp các sản phẩm yến sào nguyên chất, tinh chế cao cấp từ đảo yến thiên nhiên Khánh Hòa.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-burgundy transition-all text-sm font-bold"
              >
                f
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-burgundy transition-all text-sm"
              >
                📷
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-burgundy transition-all text-sm"
              >
                ▶
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-gold font-serif font-bold text-lg mb-4">Sản Phẩm</h4>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-gold font-serif font-bold text-lg mb-4">Thông Tin</h4>
            <ul className="space-y-2.5">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gold font-serif font-bold text-lg mb-4">Liên Hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <MapPin className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                <span>123 Đường Yến Sào, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li>
                <a
                  href="tel:0901234567"
                  className="flex items-center gap-2.5 text-sm text-white/70 hover:text-gold transition-colors"
                >
                  <Phone className="w-4 h-4 text-gold shrink-0" />
                  0901 234 567
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@yensaocaocap.vn"
                  className="flex items-center gap-2.5 text-sm text-white/70 hover:text-gold transition-colors"
                >
                  <Mail className="w-4 h-4 text-gold shrink-0" />
                  info@yensaocaocap.vn
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/50">
          <p>© 2026 Yến Sào Cao Cấp. Tất cả quyền được bảo lưu.</p>
          <p>Thiết kế bởi ❤️ với tâm huyết</p>
        </div>
      </div>
    </footer>
  );
}
