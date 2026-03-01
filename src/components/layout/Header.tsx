'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, ChevronDown, Globe } from 'lucide-react';
import { useCart } from '@/store/cart';

const productCategories = [
  { name: 'Yến Thô', slug: 'yen-tho', desc: 'Yến thô nguyên tổ chưa qua xử lý' },
  { name: 'Yến Tinh Chế', slug: 'yen-tinh-che', desc: 'Yến đã qua chế biến thủ công' },
  { name: 'Yến Chưng Sẵn', slug: 'yen-chung-san', desc: 'Yến chưng sẵn tiện lợi' },
  { name: 'Nước Yến', slug: 'nuoc-yen', desc: 'Nước yến sào đóng chai' },
  { name: 'Quà Tặng Yến', slug: 'qua-tang-yen', desc: 'Bộ quà tặng cao cấp' },
];

const navLinks = [
  { name: 'Trang Chủ', href: '/' },
  {
    name: 'Sản Phẩm',
    href: '#',
    megaMenu: true,
  },
  { name: 'Giới Thiệu', href: '/gioi-thieu' },
  { name: 'Blog', href: '/blog' },
  { name: 'Liên Hệ', href: '/lien-he' },
];

export default function Header() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [lang, setLang] = useState<'vi' | 'cn'>('vi');
  const { openCart, getTotalItems } = useCart();
  const megaMenuRef = useRef<HTMLDivElement>(null);

  const totalItems = getTotalItems();

  // Close mega menu on click outside
  useEffect(() => {
    if (!megaMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [megaMenuOpen]);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-burgundy text-white text-sm py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <p className="hidden sm:block">
            🕊️ Miễn phí vận chuyển đơn hàng từ 1.000.000₫
          </p>
          <p className="sm:hidden text-xs">
            🕊️ Freeship từ 1.000.000₫
          </p>
          <div className="flex items-center gap-4 text-xs">
            <a href="tel:0901234567" className="hover:text-gold transition-colors">
              📞 0901 234 567
            </a>
            <button
              onClick={() => setLang(lang === 'vi' ? 'cn' : 'vi')}
              className="flex items-center gap-1 hover:text-gold transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'vi' ? 'VI' : '中文'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-gold flex items-center justify-center text-burgundy font-bold text-lg md:text-xl font-serif shadow-md group-hover:scale-105 transition-transform">
                YS
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-bold text-burgundy font-serif leading-tight">
                  Yến Sào
                </h1>
                <p className="text-[10px] md:text-xs text-gold-dark tracking-widest uppercase">
                  Cao Cấp
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) =>
                link.megaMenu ? (
                  <div
                    key={link.name}
                    ref={megaMenuRef}
                    className="relative"
                  >
                    <button
                      onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                      className="flex items-center gap-1 px-4 py-2 text-lg font-semibold text-foreground/80 hover:text-burgundy transition-colors rounded-lg hover:bg-secondary"
                    >
                      {link.name}
                      <ChevronDown className={`w-4 h-4 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {megaMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[500px] bg-white rounded-xl shadow-xl border border-border p-6 grid grid-cols-2 gap-3"
                        >
                          {productCategories.map((cat) => (
                            <Link
                              key={cat.slug}
                              href={`/danh-muc/${cat.slug}`}
                              className="group flex flex-col p-3 rounded-lg hover:bg-cream transition-colors"
                              onClick={() => setMegaMenuOpen(false)}
                            >
                              <span className="font-semibold text-sm text-burgundy group-hover:text-burgundy-light">
                                {cat.name}
                              </span>
                              <span className="text-xs text-muted-foreground mt-1">
                                {cat.desc}
                              </span>
                            </Link>
                          ))}
                          <Link
                            href="/san-pham"
                            className="col-span-2 flex items-center justify-center p-3 rounded-lg bg-gradient-gold text-burgundy font-semibold text-sm hover:opacity-90 transition-opacity"
                            onClick={() => setMegaMenuOpen(false)}
                          >
                            Xem tất cả sản phẩm →
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="px-4 py-2 text-lg font-semibold text-foreground/80 hover:text-burgundy transition-colors rounded-lg hover:bg-secondary"
                  >
                    {link.name}
                  </Link>
                )
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Cart Button */}
              <button
                onClick={openCart}
                className="relative p-2.5 rounded-lg hover:bg-secondary transition-colors group"
                aria-label="Giỏ hàng"
              >
                <ShoppingBag className="w-5 h-5 text-foreground/70 group-hover:text-burgundy transition-colors" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-burgundy text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </motion.span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-lg hover:bg-secondary transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden border-t border-border"
            >
              <div className="container mx-auto px-4 py-4 space-y-1">
                <Link
                  href="/"
                  className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Trang Chủ
                </Link>

                <div className="px-4 py-2">
                  <button
                    onClick={() => {
                      if (megaMenuOpen) {
                        setMobileOpen(false);
                        setMegaMenuOpen(false);
                        router.push('/san-pham');
                      } else {
                        setMegaMenuOpen(true);
                      }
                    }}
                    className="flex items-center justify-between w-full text-sm font-bold text-gold uppercase tracking-wider mb-2"
                  >
                    Sản Phẩm
                    <ChevronDown className={`w-4 h-4 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {megaMenuOpen && (
                    <div className="space-y-1 pl-2">
                      {productCategories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/danh-muc/${cat.slug}`}
                          className="block px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/gioi-thieu"
                  className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Giới Thiệu
                </Link>
                <Link
                  href="/blog"
                  className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Blog
                </Link>
                <Link
                  href="/lien-he"
                  className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Liên Hệ
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
