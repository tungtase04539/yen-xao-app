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
      className="group bg-white rounded-xl overflow-hidden border border-border/50 hover:border-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-gold/10"
    >
      {/* Image */}
      <Link href={`/san-pham/${product.slug}`} className="block relative aspect-square overflow-hidden bg-cream">
        {product.thumbnail ? (
          <div
            className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
            style={{ backgroundImage: `url(${product.thumbnail})` }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
            🕊️
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_featured && (
            <span className="px-2.5 py-1 bg-gold text-burgundy text-[10px] font-bold rounded-full uppercase tracking-wider">
              Nổi bật
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-2.5 py-1 bg-burgundy text-white text-[10px] font-bold rounded-full">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gold hover:text-burgundy transition-colors cursor-pointer">
            <Eye className="w-4 h-4" />
          </div>
          <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gold hover:text-burgundy transition-colors cursor-pointer">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        {product.category_name && (
          <Link
            href={`/danh-muc/${product.category_slug}`}
            className="text-xs text-gold-dark hover:text-gold font-medium uppercase tracking-wider"
          >
            {product.category_name}
          </Link>
        )}
        <Link href={`/san-pham/${product.slug}`}>
          <h3 className="text-sm md:text-base font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-burgundy transition-colors font-serif">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-lg font-bold text-burgundy">
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
