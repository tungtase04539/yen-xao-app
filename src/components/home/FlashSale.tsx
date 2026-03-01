'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';
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
    <div className="flex gap-2 md:gap-3">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-white text-burgundy font-bold text-lg md:text-xl flex items-center justify-center shadow-md">
            {String(u.value).padStart(2, '0')}
          </div>
          <span className="text-[10px] text-white/70 mt-1">{u.label}</span>
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
    <section className="py-16 md:py-20 bg-burgundy relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-2 text-gold">
              <Zap className="w-5 h-5 fill-gold" />
              <span className="text-sm font-semibold uppercase tracking-wider">Flash Sale</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-white">
              Ưu Đãi Sốc
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            <Clock className="w-5 h-5 text-gold" />
            <span className="text-white/80 text-sm">Kết thúc sau:</span>
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
              className="bg-white rounded-xl overflow-hidden group hover:shadow-xl transition-shadow"
            >
              <Link href={`/san-pham/${product.slug}`}>
                <div className="relative aspect-square overflow-hidden bg-cream">
                  <div className="w-full h-full flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
                    🕊️
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-md animate-pulse">
                    HOT
                  </div>
                </div>
              </Link>
              <div className="p-3">
                <Link href={`/san-pham/${product.slug}`}>
                  <h3 className="text-sm font-semibold line-clamp-1 group-hover:text-burgundy transition-colors font-serif">
                    {product.name}
                  </h3>
                </Link>
                <div className="mt-1.5 flex items-baseline gap-2">
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
