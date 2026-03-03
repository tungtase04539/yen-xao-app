'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/shared/ProductCard';
import { supabase } from '@/lib/supabase';
import type { ProductListItem } from '@/types';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const { data, error } = await supabase.rpc('get_products_with_min_price', {
          p_is_featured: true,
          p_limit: 4,
          p_offset: 0,
          p_sort: 'newest',
        });

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <section className="py-20 md:py-28 relative" style={{
      background: 'linear-gradient(180deg, #fffdf8 0%, #f8f4ec 50%, #fffdf8 100%)',
    }}>
      <div className="container mx-auto px-4">
        {/* BIG Luxury Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          {/* Gold divider with star */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, #d4af37)' }} />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#d4af37">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <div className="w-16 h-[1px]" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold font-serif text-burgundy mb-5 tracking-tight leading-tight">
            Sản Phẩm Nổi Bật
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Tuyển chọn những sản phẩm yến sào cao cấp nhất, được hàng ngàn khách hàng tin dùng
          </p>
        </motion.div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-border/30">
                <div className="aspect-square bg-cream animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-cream rounded-full animate-pulse w-1/3" />
                  <div className="h-4 bg-cream rounded-full animate-pulse w-2/3" />
                  <div className="h-5 bg-cream rounded-full animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>Chưa có sản phẩm nổi bật</p>
          </div>
        )}

        {/* View All — Gold bordered button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link
            href="/san-pham"
            className="group inline-flex items-center gap-2.5 px-10 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-[1.03]"
            style={{
              border: '2px solid rgba(212,175,55,0.4)',
              color: '#7c000a',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #d4af37, #e8d48b, #d4af37)';
              e.currentTarget.style.borderColor = '#d4af37';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(212,175,55,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Xem tất cả sản phẩm
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
