'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Zap, Sparkles } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import type { ProductListItem } from '@/types';

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: 'Ngày', value: timeLeft.days },
    { label: 'Giờ', value: timeLeft.hours },
    { label: 'Phút', value: timeLeft.minutes },
    { label: 'Giây', value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-2.5 md:gap-3">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-2.5">
          <div className="flex flex-col items-center">
            <div className="w-13 h-13 md:w-15 md:h-15 rounded-xl bg-white/10 backdrop-blur-sm border border-gold/20 text-white font-bold text-lg md:text-xl flex items-center justify-center shadow-lg">
              {String(u.value).padStart(2, '0')}
            </div>
            <span className="text-[9px] text-gold/60 mt-1.5 uppercase tracking-wider">{u.label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="text-gold/40 font-bold text-lg mb-4">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FlashSale() {
  const [products, setProducts] = useState<ProductListItem[]>([]);

  // Flash sale ends 7 days from now
  const saleEndDate = new Date();
  saleEndDate.setDate(saleEndDate.getDate() + 7);

  useEffect(() => {
    async function fetchSaleProducts() {
      const { data } = await supabase.rpc('get_products_with_min_price', {
        p_limit: 4,
        p_offset: 0,
        p_sort: 'popular',
      });
      setProducts(data || []);
    }
    fetchSaleProducts();
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-gradient-dark-luxury relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/[0.04] rounded-full blur-[120px]" />
        {/* Gold accent lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-14">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <Zap className="w-5 h-5 text-gold fill-gold" />
              <span className="text-gold text-xs font-semibold uppercase tracking-[0.2em]">Flash Sale</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-white">
              Ưu Đãi <span className="text-gradient-gold">Đặc Biệt</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2 text-gold/60">
              <Clock className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Kết thúc sau</span>
            </div>
            <CountdownTimer targetDate={saleEndDate} />
          </motion.div>
        </div>

        {/* Sale Products */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 4).map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl overflow-hidden group hover:shadow-2xl hover:shadow-gold/10 transition-all duration-500 border border-transparent hover:border-gold/20"
            >
              <Link href={`/san-pham/${product.slug}`}>
                <div className="relative aspect-square overflow-hidden bg-cream">
                  {product.thumbnail ? (
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                      style={{ backgroundImage: `url(${product.thumbnail})` }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-700">
                      🕊️
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-gradient-gold text-burgundy text-[10px] font-bold rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    HOT
                  </div>
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/san-pham/${product.slug}`}>
                  <h3 className="text-sm font-semibold line-clamp-1 group-hover:text-burgundy transition-colors font-serif">
                    {product.name}
                  </h3>
                </Link>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-bold text-burgundy">
                    {formatPrice(
                      product.sale_price || product.min_variant_sale_price || product.price || product.min_variant_price || 0
                    )}
                  </span>
                  {(product.sale_price || product.min_variant_sale_price) && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.price || product.min_variant_price || 0)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
