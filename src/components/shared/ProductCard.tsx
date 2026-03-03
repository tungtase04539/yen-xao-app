'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import type { ProductListItem } from '@/types';

interface ProductCardProps {
  product: ProductListItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const displayPrice = product.type === 'variable'
    ? product.min_variant_sale_price || product.min_variant_price
    : product.sale_price || product.price;

  const originalPrice = product.type === 'variable'
    ? product.min_variant_price
    : product.price;

  const hasDiscount = product.type === 'variable'
    ? (product.min_variant_sale_price && product.min_variant_sale_price < (product.min_variant_price || 0))
    : (product.sale_price && product.sale_price < product.price);

  const discountPercent = hasDiscount && originalPrice
    ? Math.round(((originalPrice - (displayPrice || 0)) / originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl"
      style={{
        border: '1px solid rgba(232,223,208,0.5)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      }}
      whileHover={{
        borderColor: 'rgba(212,175,55,0.3)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(212,175,55,0.15), 0 0 40px rgba(212,175,55,0.05)',
        y: -4,
      }}
    >
      {/* Image */}
      <Link href={`/san-pham/${product.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-cream">
        {product.thumbnail ? (
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
            style={{ backgroundImage: `url(${product.thumbnail})` }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl transition-transform duration-700 group-hover:scale-110">
            🕊️
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_featured && (
            <span className="px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #d4af37, #e8d48b, #d4af37)',
                color: '#7c000a',
              }}
            >
              ✦ Nổi bật
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-3 py-1.5 bg-burgundy text-white text-xs font-bold rounded-full shadow-lg">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Quick Actions — slide up from bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center gap-3 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
          <button className="w-11 h-11 rounded-full bg-white shadow-xl flex items-center justify-center hover:bg-gold hover:text-burgundy transition-all text-foreground/60">
            <Eye className="w-4 h-4" />
          </button>
          <button className="w-11 h-11 rounded-full bg-white shadow-xl flex items-center justify-center hover:bg-gold hover:text-burgundy transition-all text-foreground/60">
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-5 md:p-6">
        {product.category_name && (
          <Link
            href={`/danh-muc/${product.category_slug}`}
            className="text-xs font-semibold uppercase tracking-[0.15em]"
            style={{ color: '#b8960f' }}
          >
            {product.category_name}
          </Link>
        )}
        <Link href={`/san-pham/${product.slug}`}>
          <h3 className="text-base md:text-lg font-semibold text-foreground mt-2 line-clamp-2 group-hover:text-burgundy transition-colors font-serif leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Price with gold underline */}
        <div className="mt-3 pt-3 flex items-baseline gap-2" style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
          <span className="text-xl font-bold text-burgundy font-serif">
            {product.type === 'variable' ? 'Từ ' : ''}
            {formatPrice(displayPrice || 0)}
          </span>
          {hasDiscount && originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
