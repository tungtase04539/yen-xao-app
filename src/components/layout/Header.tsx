'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, ChevronDown, Globe, Phone, Sparkles } from 'lucide-react';
import { useCart } from '@/store/cart';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const navLinks = [
  { name: 'Trang Chủ', href: '/' },
  {
    name: 'Sản Phẩm',
    href: '#',
    megaMenu: true,
  },
  { name: 'Giới Thiệu', href: '/gioi-thieu' },
  { name: 'Triển Lãm', href: '/trien-lam' },
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
  const [footerVisible, setFooterVisible] = useState(false);
  const [videoHeroVisible, setVideoHeroVisible] = useState(false);
  const [productCategories, setProductCategories] = useState<Category[]>([]);

  const totalItems = getTotalItems();

  // Fetch product categories from Supabase
  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, slug')
      .eq('type', 'product')
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) setProductCategories(data);
      });
  }, []);

  // Track scroll for header style change
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fade header logo when footer logo is visible
  useEffect(() => {
    const footerLogo = document.getElementById('footer-logo');
    if (!footerLogo) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(footerLogo);
    return () => observer.disconnect();
  }, []);

  // Hide logo when video-hero section is visible (mobile about page)
  useEffect(() => {
    const videoHero = document.getElementById('video-hero');
    if (!videoHero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVideoHeroVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(videoHero);
    return () => observer.disconnect();
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
      {/* Luxury Top Bar — desktop only, scrolls away */}
      <div className="hidden md:block bg-burgundy-dark/30 text-white text-sm py-2 relative overflow-hidden" style={{ background: 'linear-gradient(to right, #5a0e1a, #4a0c16)' }}>
        <div className="absolute inset-0 animate-gold-shimmer pointer-events-none" />
        <div className="container mx-auto px-4 flex justify-between items-center relative">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <p className="text-gold-light text-xs tracking-wider">
              Miễn phí vận chuyển đơn hàng từ 1.000.000₫
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a href="tel:0843623986" className="flex items-center gap-1.5 text-white/80 hover:text-gold transition-colors">
              <Phone className="w-3 h-3" />
              <span className="tracking-wide">0843.623986</span>
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

      {/* Main Header — sticky */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'shadow-lg shadow-black/20'
          : ''
      }`} style={{ background: 'linear-gradient(to right, #8B1A2B, #6E1222)' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-18 md:h-22">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <div className={`relative h-20 md:h-24 shrink-0 transition-opacity duration-500 ${footerVisible || videoHeroVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <Image src="/logo-transparent.png" alt="QiQi Yến" width={200} height={96} className="h-full w-auto object-contain" priority />
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
                      className="relative flex items-center gap-1.5 px-5 py-2.5 text-xl font-bold text-metallic-gold transition-all rounded-lg group"
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
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[300px] rounded-2xl overflow-hidden"
                          style={{
                            background: 'linear-gradient(160deg, #5a1020 0%, #7a1a2e 60%, #5a1020 100%)',
                            border: '1px solid rgba(201,165,90,0.35)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(201,165,90,0.2)',
                          }}
                        >
                          {/* Top shimmer */}
                          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, #C9A55A 40%, #f0dc9a 50%, #C9A55A 60%, transparent)' }} />

                          {/* Items list */}
                          <div className="py-3">
                            {productCategories.map((cat, i) => (
                              <Link
                                key={cat.slug}
                                href={`/danh-muc/${cat.slug}`}
                                className="group/item relative flex items-center justify-between px-6 py-3.5 transition-all duration-200"
                                onMouseEnter={e => {
                                  (e.currentTarget as HTMLElement).style.background = 'rgba(201,165,90,0.12)';
                                }}
                                onMouseLeave={e => {
                                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                                }}
                                onClick={() => setMegaMenuOpen(false)}
                              >
                                {/* Hover left border */}
                                <span
                                  className="absolute left-0 top-[20%] bottom-[20%] w-[2px] rounded-full transition-all duration-300 scale-y-0 group-hover/item:scale-y-100 origin-center"
                                  style={{ background: 'linear-gradient(to bottom, transparent, #C9A55A, transparent)' }}
                                />

                                {/* Name */}
                                <span
                                  className="text-[17px] font-bold tracking-wide transition-all duration-200 group-hover/item:text-[#f0dc9a]"
                                  style={{
                                    fontFamily: 'var(--font-heading)',
                                    color: '#e8c97a',
                                  }}
                                >
                                  {cat.name}
                                </span>

                                {/* Arrow */}
                                <svg
                                  className="w-4 h-4 text-gold/40 group-hover/item:text-gold group-hover/item:translate-x-1 transition-all duration-200"
                                  fill="none" stroke="currentColor" strokeWidth={1.5}
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                              </Link>
                            ))}
                          </div>

                          {/* Divider */}
                          <div className="mx-6 h-px" style={{ background: 'rgba(201,165,90,0.2)' }} />

                          {/* View all */}
                          <div className="px-4 py-3">
                            <Link
                              href="/san-pham"
                              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 hover:brightness-110"
                              style={{
                                background: 'linear-gradient(135deg, #b8922a, #C9A55A 40%, #e8d48b 60%, #C9A55A 80%, #b8922a)',
                                color: '#2e0810',
                                boxShadow: '0 4px 20px rgba(201,165,90,0.25)',
                              }}
                              onClick={() => setMegaMenuOpen(false)}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Xem tất cả sản phẩm
                            </Link>
                          </div>

                          {/* Bottom shimmer */}
                          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,165,90,0.2) 50%, transparent)' }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="relative px-5 py-2.5 text-xl font-bold text-metallic-gold transition-all rounded-lg group"
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
                <ShoppingBag className="w-5 h-5 text-[#C9A55A] transition-colors" />
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
                          className="flex items-center px-3 py-2.5 rounded-lg text-base text-white/70 hover:bg-white/10 hover:text-[#C9A55A] transition-colors"
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
                  className="block px-4 py-3 rounded-xl text-lg font-medium text-white/80 hover:bg-white/10 hover:text-[#C9A55A] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Giới Thiệu
                </Link>
                <Link
                  href="/trien-lam"
                  className="block px-4 py-3 rounded-xl text-lg font-medium text-white/80 hover:bg-white/10 hover:text-[#C9A55A] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Triển Lãm
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
