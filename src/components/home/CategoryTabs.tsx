'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
        setCategories(data);
        setActiveSlug(data[0].slug);
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
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-burgundy mb-3">
            Danh Mục Yến Sào
          </h2>
          <p className="text-muted-foreground">
            Khám phá bộ sưu tập yến sào đa dạng
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveSlug(cat.slug)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all
                ${activeSlug === cat.slug
                  ? 'bg-burgundy text-white shadow-lg shadow-burgundy/20'
                  : 'bg-secondary text-foreground/70 hover:bg-secondary/80'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
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
        ) : (
          <motion.div
            key={activeSlug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {products.length === 0 && (
              <div className="col-span-4 text-center py-12 text-muted-foreground">
                Chưa có sản phẩm trong danh mục này
              </div>
            )}
          </motion.div>
        )}

        <div className="text-center mt-8">
          <Link
            href={`/danh-muc/${activeSlug}`}
            className="inline-flex items-center gap-2 text-burgundy font-semibold hover:text-burgundy-light transition-colors"
          >
            Xem thêm →
          </Link>
        </div>
      </div>
    </section>
  );
}
