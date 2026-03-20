'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, SlidersHorizontal, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/shared/ProductCard';

const sortOptions = [
  { value: 'popular', label: 'Phổ biến' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
];

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  sale_price?: number;
  thumbnail?: string;
  category_id?: string;
  is_featured: boolean;
  type: 'simple' | 'variable';
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AllProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'popular';
  const currentCat = searchParams.get('cat') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch categories
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('type', 'product')
        .order('sort_order');
      setCategories(cats || []);

      // Build product query
      let query = supabase
        .from('products')
        .select('*');

      if (currentCat) {
        query = query.eq('category_id', currentCat);
      }

      if (currentSort === 'newest') query = query.order('created_at', { ascending: false });
      else if (currentSort === 'price_asc') query = query.order('price', { ascending: true });
      else if (currentSort === 'price_desc') query = query.order('price', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) console.error('Products fetch error:', error);
      // Map price fields for variable products so ProductCard can display correctly
      const mapped = (data || []).map((p: Record<string, unknown>) => ({
        ...p,
        min_variant_price: p.type === 'variable' ? p.price : undefined,
        min_variant_sale_price: p.type === 'variable' ? p.sale_price : undefined,
      }));
      setProducts(mapped as unknown as Product[]);
      setLoading(false);
    };
    fetchData();
  }, [currentSort, currentCat]);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    router.push(`/san-pham?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero Banner */}
      <section className="bg-gradient-hero text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-3">
            Tất Cả Sản Phẩm
          </h1>
          <p className="text-white/70 max-w-xl">
            Khám phá bộ sưu tập yến sào cao cấp — từ yến thô nguyên tổ đến yến chưng sẵn tiện lợi
          </p>
          <div className="flex items-center gap-2 mt-4 text-sm text-white/50">
            <Link href="/" className="hover:text-gold transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gold">Tất cả sản phẩm</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => updateParams('cat', '')}
              className={`px-4 py-2 text-sm rounded-full border transition-all ${
                !currentCat
                  ? 'bg-burgundy text-white border-burgundy'
                  : 'border-border hover:border-gold hover:text-gold bg-white'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateParams('cat', cat.id)}
                className={`px-4 py-2 text-sm rounded-full border transition-all ${
                  currentCat === cat.id
                    ? 'bg-burgundy text-white border-burgundy'
                    : 'border-border hover:border-gold hover:text-gold bg-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sắp xếp:</span>
            <select
              value={currentSort}
              onChange={(e) => updateParams('sort', e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold/50"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
          </div>
        ) : products.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto rounded-full bg-cream flex items-center justify-center text-5xl mb-4">
              🕊️
            </div>
            <p className="text-muted-foreground font-medium mb-2">
              Chưa có sản phẩm nào
            </p>
            <Link
              href="/"
              className="text-burgundy font-semibold hover:text-burgundy-light transition-colors"
            >
              ← Về trang chủ
            </Link>
          </div>
        )}

        {/* Total count */}
        {!loading && products.length > 0 && (
          <p className="text-center text-sm text-muted-foreground mt-8">
            Hiển thị {products.length} sản phẩm
          </p>
        )}
      </section>
    </div>
  );
}
