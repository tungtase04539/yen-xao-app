'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
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
    <section className="py-16 md:py-20 bg-warm-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-12 h-[1px] bg-gold" />
            <Star className="w-5 h-5 text-gold fill-gold" />
            <div className="w-12 h-[1px] bg-gold" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-burgundy mb-3">
            Sản Phẩm Nổi Bật
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tuyển chọn những sản phẩm yến sào cao cấp nhất, được khách hàng tin dùng
          </p>
        </motion.div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-border/50">
                <div className="aspect-square bg-cream animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-cream rounded animate-pulse w-1/3" />
                  <div className="h-4 bg-cream rounded animate-pulse w-2/3" />
                  <div className="h-5 bg-cream rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Chưa có sản phẩm nổi bật</p>
          </div>
        )}

        {/* View All */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-burgundy text-burgundy font-semibold rounded-full hover:bg-burgundy hover:text-white transition-all"
          >
            Xem tất cả sản phẩm
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
