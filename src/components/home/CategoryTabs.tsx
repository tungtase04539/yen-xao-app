'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import ProductCard from '@/components/shared/ProductCard';
import { supabase } from '@/lib/supabase';
import type { Category, ProductListItem } from '@/types';

export default function CategoryTabs() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>('');
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'product')
        .order('sort_order');
      if (data && data.length > 0) {
        // Kiểm tra song song xem danh mục nào có sản phẩm
        const checks = await Promise.all(
          data.map((cat) =>
            supabase.rpc('get_products_with_min_price', {
              p_category_slug: cat.slug,
              p_limit: 1,
              p_offset: 0,
              p_sort: 'popular',
            })
          )
        );
        const categoriesWithProducts = data.filter(
          (_, i) => checks[i].data && checks[i].data.length > 0
        );
        if (categoriesWithProducts.length > 0) {
          setCategories(categoriesWithProducts);
          setActiveSlug(categoriesWithProducts[0].slug);
        }
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!activeSlug) return;
    async function fetchProducts() {
      setLoading(true);
      const { data } = await supabase.rpc('get_products_with_min_price', {
        p_category_slug: activeSlug,
        p_limit: 4,
        p_offset: 0,
        p_sort: 'popular',
      });
      setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, [activeSlug]);

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Luxury Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="ornament-divider mb-6">
            <Sparkles className="w-4 h-4 text-gold" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-burgundy mb-4 tracking-tight">
            Danh Mục Yến Sào
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Khám phá bộ sưu tập yến sào đa dạng
          </p>
        </motion.div>

        {/* Elegant Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveSlug(cat.slug)}
              className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                ${activeSlug === cat.slug
                  ? 'bg-burgundy text-white shadow-lg shadow-burgundy/20'
                  : 'text-foreground/60 hover:text-burgundy border border-border/50 hover:border-gold/40'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="luxury-card rounded-2xl overflow-hidden">
                <div className="aspect-square bg-cream animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-cream rounded-full animate-pulse w-1/3" />
                  <div className="h-4 bg-cream rounded-full animate-pulse w-2/3" />
                  <div className="h-5 bg-cream rounded-full animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            key={activeSlug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {products.length === 0 && (
              <div className="col-span-4 text-center py-16 text-muted-foreground">
                Chưa có sản phẩm trong danh mục này
              </div>
            )}
          </motion.div>
        )}

        <div className="text-center mt-10">
          <Link
            href={`/danh-muc/${activeSlug}`}
            className="inline-flex items-center gap-2 text-burgundy font-semibold hover:text-gold-dark transition-colors text-sm group"
          >
            Xem thêm
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
