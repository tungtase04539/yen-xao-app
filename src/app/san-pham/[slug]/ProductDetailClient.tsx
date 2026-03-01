'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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

  // Build image gallery
  const images = [
    product.thumbnail,
    ...(product.image_gallery || []),
  ].filter(Boolean) as string[];
  // If no images, use placeholder
  const galleryImages = images.length > 0 ? images : [];

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
      thumbnail: product.thumbnail || undefined,
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
      thumbnail: product.thumbnail || undefined,
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
    <div className="min-h-screen bg-warm-white">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-burgundy transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            {product.category && (
              <>
                <Link
                  href={`/danh-muc/${product.category.slug}`}
                  className="hover:text-burgundy transition-colors"
                >
                  {product.category.name}
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
            <span className="text-foreground font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT: Image Gallery */}
          <div>
            {/* Main Image with Zoom */}
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-border/50 cursor-zoom-in group"
              onClick={() => {
                if (galleryImages.length > 0) {
                  setLightboxIndex(mainImage);
                  setLightboxOpen(true);
                }
              }}
            >
              {galleryImages.length > 0 ? (
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-150"
                  style={{ backgroundImage: `url(${galleryImages[mainImage]})` }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl bg-cream group-hover:scale-110 transition-transform duration-500">
                  🕊️
                </div>
              )}

              {/* Zoom icon */}
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-5 h-5 text-foreground/60" />
              </div>

              {/* Discount badge */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-burgundy text-white text-sm font-bold rounded-full">
                  -{discountPercent}%
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(i)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      i === mainImage
                        ? 'border-gold shadow-md'
                        : 'border-transparent hover:border-border'
                    }`}
                  >
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${img})` }}
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
                className="text-xs text-gold-dark hover:text-gold uppercase tracking-widest font-medium"
              >
                {product.category.name}
              </Link>
            )}

            {/* Name */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-serif text-foreground mt-2 mb-4">
              {product.name}
            </h1>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-foreground/70 leading-relaxed mb-6">
                {product.short_description}
              </p>
            )}

            <Separator className="mb-6" />

            {/* Dynamic Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl md:text-4xl font-bold text-burgundy">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="px-2 py-0.5 bg-burgundy/10 text-burgundy text-sm font-semibold rounded">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>
              {isVariable && (
                <p className="text-xs text-muted-foreground mt-1">
                  Giá thay đổi theo phân loại
                </p>
              )}
            </div>

            {/* Variant Selector */}
            {isVariable && activeVariants.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-foreground mb-3">
                  Phân loại:
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariant(variant);
                        setQuantity(1);
                      }}
                      className={`px-5 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                        selectedVariant?.id === variant.id
                          ? 'border-burgundy bg-burgundy text-white shadow-md'
                          : 'border-border bg-white hover:border-gold text-foreground'
                      }`}
                    >
                      {variant.title}
                      <span className="ml-2 text-xs opacity-80">
                        {formatPrice(variant.sale_price || variant.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Info */}
            <div className="flex items-center gap-2 mb-6 text-sm">
              {currentStock > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-green-700">Còn hàng ({currentStock} sản phẩm)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-red-600">Hết hàng</span>
                </>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <p className="text-sm font-semibold text-foreground">Số lượng:</p>
              <div className="flex items-center border-2 border-border rounded-lg">
                <button
                  onClick={decreaseQty}
                  disabled={quantity <= 1}
                  className="p-2.5 hover:bg-secondary transition-colors disabled:opacity-40 rounded-l-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 py-2 text-base font-semibold min-w-[60px] text-center border-x border-border">
                  {quantity}
                </span>
                <button
                  onClick={increaseQty}
                  disabled={quantity >= currentStock && currentStock > 0}
                  className="p-2.5 hover:bg-secondary transition-colors disabled:opacity-40 rounded-r-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className="flex-1 py-6 text-base bg-burgundy hover:bg-burgundy-light text-white gap-2 rounded-xl font-semibold"
              >
                <ShoppingBag className="w-5 h-5" />
                Thêm vào giỏ hàng
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className="flex-1 py-6 text-base bg-gradient-gold text-burgundy gap-2 rounded-xl font-semibold hover:opacity-90"
              >
                <Zap className="w-5 h-5" />
                Mua ngay
              </Button>
            </div>

            <Separator className="mb-6" />

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-cream">
                <Truck className="w-5 h-5 text-gold mb-1.5" />
                <span className="text-[10px] md:text-xs text-muted-foreground">Giao hàng toàn quốc</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-cream">
                <Shield className="w-5 h-5 text-gold mb-1.5" />
                <span className="text-[10px] md:text-xs text-muted-foreground">Cam kết chính hãng</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-cream">
                <RefreshCw className="w-5 h-5 text-gold mb-1.5" />
                <span className="text-[10px] md:text-xs text-muted-foreground">Đổi trả 7 ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description & Reviews */}
        <div className="mt-12 md:mt-16">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'description'
                  ? 'border-burgundy text-burgundy'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Mô tả sản phẩm
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'reviews'
                  ? 'border-burgundy text-burgundy'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Đánh giá (0)
            </button>
          </div>

          <div className="py-8">
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
              <div className="text-center py-12">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-muted-foreground mb-2">Chưa có đánh giá nào</p>
                <p className="text-sm text-muted-foreground/70">
                  Hãy là người đầu tiên đánh giá sản phẩm này
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-burgundy mb-8">
              Sản Phẩm Tương Tự
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6" />
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
              <div
                className="w-full aspect-square bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${galleryImages[lightboxIndex]})` }}
              />
            </motion.div>

            {/* Next */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {lightboxIndex + 1} / {galleryImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
