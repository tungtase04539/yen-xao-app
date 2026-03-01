'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/shared/ProductCard';
import type { Category, ProductListItem, SortOption } from '@/types';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Phổ biến' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
];

interface Props {
  category: Category | null;
  products: ProductListItem[];
  currentPage: number;
  totalPages: number;
  currentSort: string;
  slug: string;
}

export default function CategoryPageClient({
  category,
  products,
  currentPage,
  totalPages,
  currentSort,
  slug,
}: Props) {
  const router = useRouter();

  const handleSortChange = (sort: string) => {
    router.push(`/danh-muc/${slug}?sort=${sort}&page=1`);
  };

  const handlePageChange = (page: number) => {
    router.push(`/danh-muc/${slug}?sort=${currentSort}&page=${page}`);
  };

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero Banner */}
      <section className="bg-gradient-hero text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-3">
            {category?.name || 'Sản Phẩm'}
          </h1>
          {category?.description && (
            <p className="text-white/70 max-w-xl">{category.description}</p>
          )}
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mt-4 text-sm text-white/50">
            <Link href="/" className="hover:text-gold transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gold">{category?.name || 'Danh mục'}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <p className="text-sm text-muted-foreground">
            Hiển thị {products.length} sản phẩm
          </p>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sắp xếp:</span>
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
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
        {products.length > 0 ? (
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
              Chưa có sản phẩm trong danh mục này
            </p>
            <Link
              href="/"
              className="text-burgundy font-semibold hover:text-burgundy-light transition-colors"
            >
              ← Về trang chủ
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:border-gold hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-10 h-10 text-sm rounded-lg font-medium transition-all ${
                  p === currentPage
                    ? 'bg-burgundy text-white shadow-md'
                    : 'border border-border hover:border-gold hover:text-gold'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:border-gold hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sau →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
