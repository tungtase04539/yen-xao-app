'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Zap,
  Truck,
  Shield,
  RefreshCw,
  X,
  ZoomIn,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/lib/format';
import ProductCard from '@/components/shared/ProductCard';
import type { Product, ProductVariant, ProductListItem } from '@/types';

interface Props {
  product: Product;
  relatedProducts: ProductListItem[];
}

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const router = useRouter();
  const { addItem } = useCart();

  const variants = product.variants || [];
  const isVariable = product.type === 'variable' && variants.length > 0;
  const activeVariants = variants.filter((v) => v.is_active);

  // State
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    isVariable ? activeVariants[0] || null : null
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [mainImage, setMainImage] = useState(0);

  // Build image gallery — variant image replaces thumbnail when selected
  const baseImages = [
    product.thumbnail,
    ...(product.image_gallery || []),
  ].filter(Boolean) as string[];

  const galleryImages = selectedVariant?.image
    ? [selectedVariant.image, ...baseImages.filter(img => img !== selectedVariant.image)]
    : baseImages;

  // Current price
  const currentPrice = isVariable
    ? (selectedVariant?.sale_price || selectedVariant?.price || 0)
    : (product.sale_price || product.price || 0);

  const originalPrice = isVariable
    ? (selectedVariant?.price || 0)
    : (product.price || 0);

  const hasDiscount = isVariable
    ? (selectedVariant?.sale_price && selectedVariant.sale_price < selectedVariant.price)
    : (product.sale_price && product.sale_price < product.price);

  const discountPercent = hasDiscount && originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // Stock
  const currentStock = isVariable
    ? (selectedVariant?.stock || 0)
    : (product.stock || 0);

  // Quantity controls
  const decreaseQty = useCallback(() => {
    setQuantity((q) => Math.max(1, q - 1));
  }, []);

  const increaseQty = useCallback(() => {
    setQuantity((q) => Math.min(currentStock || 999, q + 1));
  }, [currentStock]);

  // Add to cart
  const handleAddToCart = useCallback(() => {
    addItem({
      product_id: product.id,
      variant_id: selectedVariant?.id,
      product_name: product.name,
      variant_title: selectedVariant?.title,
      thumbnail: selectedVariant?.image || product.thumbnail || undefined,
      price: currentPrice,
      quantity,
      slug: product.slug,
    });
    toast.success('Đã thêm vào giỏ hàng!', {
      description: `${product.name}${selectedVariant ? ` - ${selectedVariant.title}` : ''} x${quantity}`,
    });
  }, [addItem, product, selectedVariant, currentPrice, quantity]);

  // Buy now
  const handleBuyNow = useCallback(() => {
    addItem({
      product_id: product.id,
      variant_id: selectedVariant?.id,
      product_name: product.name,
      variant_title: selectedVariant?.title,
      thumbnail: selectedVariant?.image || product.thumbnail || undefined,
      price: currentPrice,
      quantity,
      slug: product.slug,
    });
    router.push('/checkout');
  }, [addItem, product, selectedVariant, currentPrice, quantity, router]);

  // Lightbox navigation
  const lightboxNext = () => setLightboxIndex((i) => (i + 1) % galleryImages.length);
  const lightboxPrev = () => setLightboxIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);

  return (
    <div className="min-h-screen bg-gradient-luxury">
      {/* Breadcrumbs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gold/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-burgundy transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gold/40" />
            {product.category && (
              <>
                <Link
                  href={`/danh-muc/${product.category.slug}`}
                  className="hover:text-burgundy transition-colors"
                >
                  {product.category.name}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gold/40" />
              </>
            )}
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* LEFT: Image Gallery */}
          <div>
            {/* Main Image with Zoom */}
            <div
              className="relative rounded-3xl overflow-hidden luxury-card cursor-zoom-in group"
              onClick={() => {
                if (galleryImages.length > 0) {
                  setLightboxIndex(mainImage);
                  setLightboxOpen(true);
                }
              }}
            >
              {galleryImages.length > 0 ? (
                <div className="relative w-full aspect-square md:aspect-[4/3]">
                  <Image
                    src={galleryImages[mainImage]}
                    alt={product.name}
                    fill
                    priority
                    className="object-contain transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ background: 'linear-gradient(135deg, #faf9f7 0%, #f5f0eb 100%)' }}
                  />
                </div>
              ) : (
                <div className="w-full aspect-square md:aspect-[4/3] flex items-center justify-center text-9xl bg-cream">
                  🕊️
                </div>
              )}

              {/* Zoom icon */}
              <div className="absolute top-5 right-5 w-11 h-11 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                <ZoomIn className="w-5 h-5 text-foreground/50" />
              </div>

              {/* Discount badge */}
              {discountPercent > 0 && (
                <div className="absolute top-5 left-5 px-3.5 py-1.5 bg-burgundy text-white text-sm font-bold rounded-full shadow-lg">
                  -{discountPercent}%
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 mt-5 overflow-x-auto pb-2">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(i)}
                    className={`relative w-18 h-18 md:w-22 md:h-22 rounded-xl overflow-hidden shrink-0 transition-all duration-300 ${
                      i === mainImage
                        ? 'ring-2 ring-gold shadow-md shadow-gold/20'
                        : 'border border-border/50 hover:border-gold/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - ${i + 1}`}
                      fill
    
                      className="object-cover"
                      sizes="80px"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div>
            {/* Category */}
            {product.category && (
              <Link
                href={`/danh-muc/${product.category.slug}`}
                className="inline-flex items-center gap-1.5 text-[10px] text-gold-dark hover:text-gold uppercase tracking-[0.2em] font-medium"
              >
                <Sparkles className="w-3 h-3" />
                {product.category.name}
              </Link>
            )}

            {/* Name */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-foreground mt-3 mb-5 leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-foreground/60 leading-relaxed mb-8 text-sm md:text-base">
                {product.short_description}
              </p>
            )}

            {/* Gold divider */}
            <div className="ornament-line mb-8 !mx-0 !ml-0" />

            {/* Dynamic Price */}
            <div className="mb-8 gold-accent-bar">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-bold text-burgundy font-serif">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-muted-foreground/60 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="px-2.5 py-1 bg-gradient-gold text-burgundy text-xs font-bold rounded-full">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>
              {isVariable && (
                <p className="text-xs text-muted-foreground mt-2">
                  Giá thay đổi theo phân loại
                </p>
              )}
            </div>

            {/* Variant Selector */}
            {isVariable && activeVariants.length > 0 && (
              <div className="mb-8">
                <p className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider text-xs">
                  Phân loại:
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {activeVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariant(variant);
                        setQuantity(1);
                        setMainImage(0); // Reset to variant image
                      }}
                      className={`px-5 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-300 ${
                        selectedVariant?.id === variant.id
                          ? 'border-gold bg-gold/5 text-burgundy shadow-md shadow-gold/10'
                          : 'border-border/50 bg-white hover:border-gold/40 text-foreground'
                      }`}
                    >
                      {variant.title}
                      <span className="ml-2 text-xs opacity-70">
                        {formatPrice(variant.sale_price || variant.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Info */}
            <div className="flex items-center gap-2.5 mb-8 text-sm">
              {currentStock > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-700">Còn hàng ({currentStock} sản phẩm)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-red-600">Hết hàng</span>
                </>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-5 mb-8">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Số lượng:</p>
              <div className="flex items-center border-2 border-border/50 rounded-xl overflow-hidden">
                <button
                  onClick={decreaseQty}
                  disabled={quantity <= 1}
                  className="p-3 hover:bg-cream transition-colors disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-3 text-base font-semibold min-w-[70px] text-center border-x border-border/50 font-serif">
                  {quantity}
                </span>
                <button
                  onClick={increaseQty}
                  disabled={quantity >= currentStock && currentStock > 0}
                  className="p-3 hover:bg-cream transition-colors disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className="flex-1 py-7 text-base bg-burgundy hover:bg-burgundy-light text-white gap-2.5 rounded-2xl font-semibold transition-all hover:shadow-lg hover:shadow-burgundy/20"
              >
                <ShoppingBag className="w-5 h-5" />
                Thêm vào giỏ hàng
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className="flex-1 py-7 text-base bg-gradient-gold text-burgundy gap-2.5 rounded-2xl font-semibold hover:opacity-90 transition-all hover:shadow-lg hover:shadow-gold/20"
              >
                <Zap className="w-5 h-5" />
                Mua ngay
              </Button>
            </div>

            {/* Ornamental divider */}
            <div className="ornament-line mb-8 !mx-0 !ml-0" />

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Truck, label: 'Giao hàng toàn quốc' },
                { icon: Shield, label: 'Cam kết chính hãng' },
                { icon: RefreshCw, label: 'Đổi trả 7 ngày' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center text-center p-4 rounded-2xl luxury-card">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-2">
                    <item.icon className="w-4 h-4 text-gold" />
                  </div>
                  <span className="text-[10px] md:text-xs text-muted-foreground leading-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs: Description & Reviews */}
        <div className="mt-16 md:mt-20">
          <div className="flex border-b border-gold/10">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-8 py-4 text-sm font-semibold transition-all relative ${
                activeTab === 'description'
                  ? 'text-burgundy'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mô tả sản phẩm
              {activeTab === 'description' && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-8 py-4 text-sm font-semibold transition-all relative ${
                activeTab === 'reviews'
                  ? 'text-burgundy'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Đánh giá (0)
              {activeTab === 'reviews' && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
              )}
            </button>
          </div>

          <div className="py-10">
            {activeTab === 'description' ? (
              <div className="max-w-3xl">
                {product.content ? (
                  <div
                    className="prose-content"
                    dangerouslySetInnerHTML={{ __html: product.content }}
                  />
                ) : (
                  <p className="text-muted-foreground">Chưa có mô tả cho sản phẩm này.</p>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-muted-foreground mb-2">Chưa có đánh giá nào</p>
                <p className="text-sm text-muted-foreground/60">
                  Hãy là người đầu tiên đánh giá sản phẩm này
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 md:mt-20">
            <div className="flex items-center gap-4 mb-10">
              <div className="ornament-line !w-12 !mx-0" />
              <h2 className="text-2xl md:text-3xl font-bold font-serif text-burgundy">
                Sản Phẩm Tương Tự
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && galleryImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full glass-gold text-white flex items-center justify-center hover:bg-white/15 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Prev */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-gold text-white flex items-center justify-center hover:bg-white/15 transition-colors z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl max-h-[80vh] w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full aspect-[4/3] md:aspect-[16/10] rounded-2xl relative">
                <Image
                  src={galleryImages[lightboxIndex]}
                  alt={product.name}
                  fill
                  className="object-contain rounded-2xl"
                  sizes="(max-width: 1024px) 100vw, 896px"
                />
              </div>
            </motion.div>

            {/* Next */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-gold text-white flex items-center justify-center hover:bg-white/15 transition-colors z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Counter */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm tracking-widest">
              {lightboxIndex + 1} / {galleryImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
