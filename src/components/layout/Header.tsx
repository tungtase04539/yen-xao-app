'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, ChevronDown, Globe, Phone, Sparkles } from 'lucide-react';
import { useCart } from '@/store/cart';

const productCategories = [
  { name: 'Yến Thô', slug: 'yen-tho', desc: 'Yến thô nguyên tổ chưa qua xử lý', icon: '🏔️' },
  { name: 'Yến Tinh Chế', slug: 'yen-tinh-che', desc: 'Yến đã qua chế biến thủ công', icon: '✨' },
  { name: 'Yến Chưng Sẵn', slug: 'yen-chung-san', desc: 'Yến chưng sẵn tiện lợi', icon: '🍯' },
  { name: 'Nước Yến', slug: 'nuoc-yen', desc: 'Nước yến sào đóng chai', icon: '🥤' },
  { name: 'Quà Tặng Yến', slug: 'qua-tang-yen', desc: 'Bộ quà tặng cao cấp', icon: '🎁' },
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
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<'vi' | 'cn'>('vi');
  const { openCart, getTotalItems } = useCart();
  const megaMenuRef = useRef<HTMLDivElement>(null);

  const totalItems = getTotalItems();

  // Track scroll for header style change
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      {/* Luxury Top Bar */}
      <div className="bg-gradient-to-r from-burgundy-dark via-burgundy to-burgundy-dark text-white text-sm py-2.5 relative overflow-hidden">
        {/* Shimmer effect */}
        <div className="absolute inset-0 animate-gold-shimmer pointer-events-none" />
        <div className="container mx-auto px-4 flex justify-between items-center relative">
          <div className="hidden sm:flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <p className="text-gold-light text-xs tracking-wider">
              Miễn phí vận chuyển đơn hàng từ 1.000.000₫
            </p>
          </div>
          <p className="sm:hidden text-xs text-gold-light tracking-wide">
            ✦ Freeship từ 1.000.000₫
          </p>
          <div className="flex items-center gap-4 text-xs">
            <a href="tel:0901234567" className="flex items-center gap-1.5 text-white/80 hover:text-gold transition-colors">
              <Phone className="w-3 h-3" />
              <span className="tracking-wide">0901 234 567</span>
            </a>
            <div className="w-px h-3 bg-white/20" />
            <button
              onClick={() => setLang(lang === 'vi' ? 'cn' : 'vi')}
              className="flex items-center gap-1.5 text-white/80 hover:text-gold transition-colors"
            >
              <Globe className="w-3 h-3" />
              {lang === 'vi' ? 'VI' : '中文'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'shadow-lg shadow-black/20'
          : ''
      }`} style={{ background: 'radial-gradient(ellipse at 50% 50%, #9B1B30 0%, #7C1424 50%, #5A0E1A 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-18 md:h-22">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0">
                <img src="/logo.jpg" alt="QiQi Yến" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-3xl md:text-4xl font-bold font-serif leading-tight tracking-tight" style={{ color: '#C9A55A' }}>
                  QiQi Yến
                </h1>
                <p className="text-xs md:text-sm tracking-[0.2em] uppercase font-medium" style={{ color: 'rgba(201,165,90,0.7)' }}>
                  Yến Sào Cao Cấp
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) =>
                link.megaMenu ? (
                  <div
                    key={link.name}
                    ref={megaMenuRef}
                    className="relative"
                  >
                    <button
                      onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                      className="relative flex items-center gap-1.5 px-5 py-2.5 text-lg font-medium text-white/80 hover:text-[#C9A55A] transition-all rounded-lg group"
                    >
                      {link.name}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${megaMenuOpen ? 'rotate-180' : ''}`} />
                      {/* Gold underline on hover */}
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#C9A55A] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </button>

                    <AnimatePresence>
                      {megaMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] bg-white rounded-2xl shadow-2xl border border-gold/15 p-6 grid grid-cols-2 gap-2"
                        >
                          {/* Gold top border */}
                          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

                          {productCategories.map((cat) => (
                            <Link
                              key={cat.slug}
                              href={`/danh-muc/${cat.slug}`}
                              className="group/item flex items-start gap-3 p-3.5 rounded-xl hover:bg-cream transition-all"
                              onClick={() => setMegaMenuOpen(false)}
                            >
                              <span className="text-lg mt-0.5">{cat.icon}</span>
                              <div>
                                <span className="font-semibold text-sm text-foreground group-hover/item:text-burgundy transition-colors">
                                  {cat.name}
                                </span>
                                <span className="block text-xs text-muted-foreground mt-0.5">
                                  {cat.desc}
                                </span>
                              </div>
                            </Link>
                          ))}
                          <Link
                            href="/san-pham"
                            className="col-span-2 flex items-center justify-center p-3.5 rounded-xl bg-gradient-gold text-burgundy font-semibold text-sm hover:opacity-90 transition-all mt-1 gap-2"
                            onClick={() => setMegaMenuOpen(false)}
                          >
                            <Sparkles className="w-4 h-4" />
                            Xem tất cả sản phẩm
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="relative px-5 py-2.5 text-lg font-medium text-white/80 hover:text-[#C9A55A] transition-all rounded-lg group"
                  >
                    {link.name}
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#C9A55A] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </Link>
                )
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Cart Button */}
              <button
                onClick={openCart}
                className="relative p-2.5 rounded-xl hover:bg-white/10 transition-all group"
                aria-label="Giỏ hàng"
              >
                <ShoppingBag className="w-5 h-5 text-white/80 group-hover:text-[#C9A55A] transition-colors" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-gold text-burgundy text-[10px] font-bold rounded-full flex items-center justify-center shadow-md"
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </motion.span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-white/10 transition-all text-white"
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
              className="lg:hidden overflow-hidden border-t border-white/10"
              style={{ background: '#8B1A2B' }}
            >
              <div className="container mx-auto px-4 py-4 space-y-1">
                <Link
                  href="/"
                  className="block px-4 py-3 rounded-xl text-lg font-medium text-white/80 hover:bg-white/10 hover:text-[#C9A55A] transition-colors"
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
                    className="flex items-center justify-between w-full text-lg font-bold text-[#C9A55A] uppercase tracking-wider mb-2"
                  >
                    Sản Phẩm
                    <ChevronDown className={`w-4 h-4 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {megaMenuOpen && (
                    <div className="space-y-0.5 pl-2">
                      {productCategories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/danh-muc/${cat.slug}`}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base text-white/70 hover:bg-white/10 hover:text-[#C9A55A] transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          <span>{cat.icon}</span>
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/gioi-thieu"
                  className="block px-4 py-3 rounded-xl text-lg font-medium text-white/80 hover:bg-white/10 hover:text-[#C9A55A] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Giới Thiệu
                </Link>
                <Link
                  href="/blog"
                  className="block px-4 py-3 rounded-xl text-lg font-medium text-white/80 hover:bg-white/10 hover:text-[#C9A55A] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Blog
                </Link>
                <Link
                  href="/lien-he"
                  className="block px-4 py-3 rounded-xl text-lg font-medium text-white/80 hover:bg-white/10 hover:text-[#C9A55A] transition-colors"
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
