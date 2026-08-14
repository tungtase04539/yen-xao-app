'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/lib/format';
import { getProductReviews, getProductRatingSummary, addProductReview, type Review } from '@/data/reviews';
import ProductCard from '@/components/shared/ProductCard';
import { sanitizeHtml, safeJsonLd } from '@/lib/sanitize';
import { SITE_URL } from '@/lib/og';
import type { Product, ProductVariant, ProductListItem } from '@/types';

interface Props {
  product: Product;
  relatedProducts: ProductListItem[];
}

// Avatar helper
function getInitials(name: string) {
  if (!name) return 'Q';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Avatar background color
const AVATAR_COLORS = [
  'bg-red-500/10 text-red-700',
  'bg-amber-500/10 text-amber-700',
  'bg-emerald-500/10 text-emerald-700',
  'bg-blue-500/10 text-blue-700',
  'bg-indigo-500/10 text-indigo-700',
  'bg-rose-500/10 text-rose-700',
  'bg-purple-500/10 text-purple-700',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
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

  const lightboxRef = useRef<HTMLDivElement>(null);
  const zoomTriggerRef = useRef<HTMLButtonElement>(null);

  // Reviews state
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  // Form state for writing a review
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  useEffect(() => {
    setReviewsList(getProductReviews(product.slug));
    setHasMounted(true);
  }, [product.slug]);

  const reviewCount = reviewsList.length;

  // Một lượt duyệt duy nhất cho cả điểm trung bình lẫn phân bố 5 mức sao — trước
  // đây là 1 reduce + 5 lần filter, chạy lại mỗi khi rê chuột qua hàng sao chấm điểm.
  const { averageRating, ratingCounts } = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // index 0 = 1 sao … index 4 = 5 sao
    let sum = 0;
    for (const r of reviewsList) {
      sum += r.rating;
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
    }
    return {
      averageRating: reviewsList.length > 0
        ? parseFloat((sum / reviewsList.length).toFixed(1))
        : 5.0,
      ratingCounts: counts,
    };
  }, [reviewsList]);

  const staticSummary = useMemo(() => getProductRatingSummary(product.slug), [product.slug]);
  const displayRating = hasMounted ? averageRating : staticSummary.rating;
  const displayCount = hasMounted ? reviewCount : staticSummary.count;

  // Danh sách 80-200 dòng, mỗi dòng 5 icon sao. Memo hoá theo reviewsList để việc rê
  // chuột qua ô chấm điểm bên dưới (state hoveredStar) không reconcile lại cả danh sách.
  const reviewItems = useMemo(
    () =>
      reviewsList.map((review) => (
        <div key={review.id} className="border-b border-border/40 pb-6 last:border-b-0 last:pb-0">
          <div className="flex items-start gap-4">
            {/* Initials Avatar */}
            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${getAvatarColor(review.name)}`}>
              {getInitials(review.name)}
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <h4 className="font-semibold text-foreground">{review.name}</h4>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
              <div className="flex text-amber-500 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-muted-foreground/20'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {review.content}
              </p>

              {/* Owner Response */}
              {review.reply && (
                <div className="mt-4 p-4 bg-cream/40 border-l-2 border-gold rounded-r-2xl text-xs space-y-1">
                  <p className="font-bold text-burgundy-light uppercase tracking-wider">
                    Phản hồi từ QiQi Yến Sào
                  </p>
                  <p className="text-foreground/70 leading-relaxed">
                    {review.reply}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )),
    [reviewsList]
  );

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim()) {
      toast.error('Vui lòng nhập tên của bạn');
      return;
    }
    if (!newReviewContent.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    addProductReview(product.slug, newReviewName.trim(), newReviewRating, newReviewContent.trim());
    setReviewsList(getProductReviews(product.slug));
    
    // Reset form
    setNewReviewName('');
    setNewReviewRating(5);
    setNewReviewContent('');
    
    // addProductReview chỉ ghi vào localStorage — chưa có bảng reviews trên Supabase
    // và cũng không có màn hình duyệt đánh giá trong /admin. Báo "gửi thành công" ở
    // đây là nói sai với khách: một lời khiếu nại đi qua form này sẽ mất trắng trong
    // khi khách tin là shop đã nhận. Nói đúng những gì thật sự xảy ra.
    toast.info('Đã lưu đánh giá của bạn', {
      description: 'Đánh giá hiện chỉ được lưu trên trình duyệt này và chưa gửi tới shop. Nếu bạn cần shop phản hồi, vui lòng liên hệ qua hotline hoặc Messenger.',
    });
  };

  // Video detection helper
  const isVideo = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url) || url.includes('/video/upload/');

  // Get video thumbnail from Cloudinary (extracts a frame as jpg)
  const getVideoThumb = (url: string) => {
    if (url.includes('res.cloudinary.com') && url.includes('/video/upload/')) {
      return url.replace('/video/upload/', '/video/upload/so_0,w_200,h_200,c_fill,f_jpg/');
    }
    return '';
  };

  // Build image gallery — variant image replaces thumbnail when selected.
  // useMemo để mảng giữ nguyên identity giữa các lần render — effect focus trap của
  // lightbox phụ thuộc vào nó.
  const galleryImages = useMemo(() => {
    const base = [
      product.thumbnail,
      ...(product.image_gallery || []),
    ].filter(Boolean) as string[];

    return selectedVariant?.image
      ? [selectedVariant.image, ...base.filter((img) => img !== selectedVariant.image)]
      : base;
  }, [product.thumbnail, product.image_gallery, selectedVariant]);

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
    // `currentStock || 999` cũ rơi về 999 khi hết hàng (0 là falsy), cho phép tăng
    // số lượng vượt tồn kho rồi bị server chặn ở bước đặt đơn.
    setQuantity((q) => (currentStock > 0 ? Math.min(currentStock, q + 1) : q));
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

  // Lightbox là overlay tự viết (không dùng Radix Dialog) nên phải tự lo phần a11y:
  // Escape để đóng, giữ focus bên trong, khoá scroll nền và trả focus về nút đã mở nó.
  useEffect(() => {
    if (!lightboxOpen) return;

    // Giữ lại nút đã mở lightbox để trả focus về đúng chỗ khi đóng.
    const triggerNode = zoomTriggerRef.current;

    const getFocusable = () =>
      Array.from(
        lightboxRef.current?.querySelectorAll<HTMLElement>('button, video[controls]') || []
      );

    getFocusable()[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
        return;
      }
      if (galleryImages.length > 1 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const step = e.key === 'ArrowRight' ? 1 : -1;
        setLightboxIndex((i) => (i + step + galleryImages.length) % galleryImages.length);
        return;
      }
      if (e.key !== 'Tab') return;

      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = !!lightboxRef.current?.contains(active);

      if (e.shiftKey && (!inside || active === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || active === last)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerNode?.focus();
    };
  }, [lightboxOpen, galleryImages]);

  // Structured data cho Google (rich result: giá, tiền tệ, tình trạng còn hàng).
  // KHÔNG khai aggregateRating: đánh giá hiển thị trên trang là dữ liệu sinh tự động,
  // gắn vào schema là vi phạm chính sách review spam của Google.
  const productJsonLd = useMemo(() => {
    const url = `${SITE_URL}/san-pham/${product.slug}`;
    const images = [product.thumbnail, ...(product.image_gallery || [])].filter(Boolean);

    // Giá lấy từ dữ liệu sản phẩm chứ không từ biến thể đang chọn, để schema không
    // đổi theo thao tác của khách.
    const variantPrices = activeVariants
      .map((v) => v.sale_price || v.price)
      .filter((p): p is number => typeof p === 'number' && p > 0);

    const offers = isVariable && variantPrices.length > 0
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'VND',
          lowPrice: Math.min(...variantPrices),
          highPrice: Math.max(...variantPrices),
          offerCount: activeVariants.length,
          availability: activeVariants.some((v) => v.stock > 0)
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url,
        }
      : {
          '@type': 'Offer',
          priceCurrency: 'VND',
          price: product.sale_price || product.price,
          availability: product.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url,
        };

    const breadcrumb = [
      { name: 'Trang chủ', item: SITE_URL },
      ...(product.category
        ? [{ name: product.category.name, item: `${SITE_URL}/danh-muc/${product.category.slug}` }]
        : []),
      { name: product.name, item: url },
    ];

    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        url,
        image: images,
        description: product.short_description || product.name,
        ...(product.sku ? { sku: product.sku } : {}),
        brand: { '@type': 'Brand', name: 'QiQi Yến Sào' },
        ...(product.category ? { category: product.category.name } : {}),
        offers,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumb.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: b.name,
          item: b.item,
        })),
      },
    ];
  }, [product, isVariable, activeVariants]);

  return (
    <div className="min-h-screen bg-gradient-luxury">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd) }}
      />

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
            {/* Main Image/Video */}
            <div className="relative rounded-3xl overflow-hidden luxury-card group">
              {galleryImages.length > 0 ? (
                isVideo(galleryImages[mainImage]) ? (
                  <div className="relative w-full aspect-square md:aspect-[4/3] bg-black rounded-3xl">
                    <video
                      key={galleryImages[mainImage]}
                      src={galleryImages[mainImage]}
                      controls
                      playsInline
                      className="w-full h-full object-contain rounded-3xl"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    ref={zoomTriggerRef}
                    aria-label={`Phóng to ảnh ${product.name}`}
                    className="relative block w-full aspect-square md:aspect-[4/3] cursor-zoom-in"
                    onClick={() => {
                      setLightboxIndex(mainImage);
                      setLightboxOpen(true);
                    }}
                  >
                    <Image
                      src={galleryImages[mainImage]}
                      alt={product.name}
                      fill
                      priority
                      className="object-contain transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ background: 'linear-gradient(135deg, #faf9f7 0%, #f5f0eb 100%)' }}
                    />
                    {/* Zoom icon */}
                    <div className="absolute top-5 right-5 w-11 h-11 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                      <ZoomIn className="w-5 h-5 text-foreground/50" />
                    </div>
                  </button>
                )
              ) : (
                <div className="w-full aspect-square md:aspect-[4/3] flex items-center justify-center text-9xl bg-cream">
                  🕊️
                </div>
              )}

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
                    aria-label={`Xem ảnh ${i + 1} của ${product.name}`}
                    aria-current={i === mainImage}
                    className={`relative w-18 h-18 md:w-22 md:h-22 rounded-xl overflow-hidden shrink-0 transition-all duration-300 ${
                      i === mainImage
                        ? 'ring-2 ring-gold shadow-md shadow-gold/20'
                        : 'border border-border/50 hover:border-gold/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {isVideo(img) ? (
                      <div className="w-full h-full bg-black/80 flex items-center justify-center relative">
                        {getVideoThumb(img) && (
                          <img src={getVideoThumb(img)} alt="Video" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                        )}
                        <svg className="w-7 h-7 text-white drop-shadow-lg relative z-10" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    ) : (
                      <Image
                        src={img}
                        alt={`${product.name} - ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                        loading="lazy"
                      />
                    )}
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
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-foreground mt-3 mb-2 leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Ratings Summary Mini */}
            <div 
              className="flex items-center gap-2 mb-5 cursor-pointer group"
              onClick={() => {
                setActiveTab('reviews');
                const reviewsTabElement = document.getElementById('product-tabs');
                if (reviewsTabElement) {
                  reviewsTabElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <div className="flex items-center text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => {
                  const isFilled = i < Math.round(displayRating);
                  return (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${isFilled ? 'fill-current' : 'text-muted-foreground/30'}`}
                    />
                  );
                })}
              </div>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                {displayRating} / 5
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-burgundy group-hover:underline transition-all font-medium">
                ({displayCount} đánh giá)
              </span>
            </div>

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
        <div className="mt-16 md:mt-20" id="product-tabs">
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
              Đánh giá ({displayCount})
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
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.content) }}
                  />
                ) : (
                  <p className="text-muted-foreground">Chưa có mô tả cho sản phẩm này.</p>
                )}
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-10">
                {/* Left Side: Summary & Distribution */}
                <div className="lg:col-span-1 bg-cream/30 border border-gold/10 p-6 md:p-8 rounded-3xl h-fit">
                  <h3 className="text-lg font-serif font-semibold text-burgundy mb-4">
                    Đánh giá khách hàng
                  </h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold font-serif text-foreground">
                      {displayRating}
                    </span>
                    <span className="text-base text-muted-foreground">/ 5</span>
                  </div>
                  <div className="flex text-amber-500 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.round(displayRating) ? 'fill-current' : 'text-muted-foreground/20'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Có tổng cộng {displayCount} đánh giá từ khách mua hàng
                  </p>

                  {/* Rating Distribution */}
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const starNum = 5 - idx;
                      const count = ratingCounts[starNum - 1];
                      const pct = displayCount > 0 ? (count / displayCount) * 100 : 0;

                      return (
                        <div key={starNum} className="flex items-center gap-3 text-sm">
                          <span className="w-3 text-right text-muted-foreground">{starNum}</span>
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />
                          <div className="flex-1 h-2 bg-muted-foreground/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-xs text-muted-foreground">
                            {Math.round(pct)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Review list and Form */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Reviews List */}
                  <div className="space-y-6">
                    {reviewsList.length > 0 ? (
                      reviewItems
                    ) : (
                      <div className="text-center py-10 bg-cream/10 border border-dashed border-gold/15 rounded-3xl">
                        <p className="text-muted-foreground">Chưa có đánh giá nào cho sản phẩm này.</p>
                      </div>
                    )}
                  </div>

                  {/* Write a Review Form */}
                  <div className="bg-warm-white border border-gold/10 p-6 md:p-8 rounded-3xl">
                    <h3 className="text-lg font-serif font-semibold text-burgundy mb-2">
                      Viết đánh giá của bạn
                    </h3>
                    <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                      Lưu ý: đánh giá viết ở đây hiện chỉ được lưu trên trình duyệt của bạn,
                      shop chưa nhận được. Nếu bạn cần shop phản hồi, vui lòng liên hệ qua
                      hotline hoặc Messenger.
                    </p>
                    <form onSubmit={handleAddReview} className="space-y-4">
                      {/* Interactive Stars Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Điểm số của bạn:
                        </label>
                        <div className="flex items-center gap-1.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const starValue = i + 1;
                            const isHighlighted = hoveredStar !== null ? starValue <= hoveredStar : starValue <= newReviewRating;
                            return (
                              <button
                                type="button"
                                key={i}
                                onClick={() => setNewReviewRating(starValue)}
                                onMouseEnter={() => setHoveredStar(starValue)}
                                onMouseLeave={() => setHoveredStar(null)}
                                className="p-0.5 hover:scale-125 transition-transform"
                              >
                                <Star
                                  className={`w-7 h-7 cursor-pointer ${isHighlighted ? 'fill-current' : 'text-muted-foreground/20'}`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <label htmlFor="reviewer-name" className="block text-sm font-semibold text-foreground mb-1">
                          Họ và tên của bạn:
                        </label>
                        <input
                          id="reviewer-name"
                          type="text"
                          required
                          value={newReviewName}
                          onChange={(e) => setNewReviewName(e.target.value)}
                          placeholder="Ví dụ: Nguyễn Văn A..."
                          className="w-full text-sm border border-border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                        />
                      </div>

                      {/* Content */}
                      <div>
                        <label htmlFor="reviewer-content" className="block text-sm font-semibold text-foreground mb-1">
                          Nội dung nhận xét:
                        </label>
                        <textarea
                          id="reviewer-content"
                          required
                          rows={4}
                          value={newReviewContent}
                          onChange={(e) => setNewReviewContent(e.target.value)}
                          placeholder="Chia sẻ trải nghiệm thực tế của bạn về sản phẩm (chất lượng, hương vị, đóng gói...)..."
                          className="w-full text-sm border border-border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-gold/50 resize-y"
                        />
                      </div>

                      {/* Submit */}
                      <Button
                        type="submit"
                        className="w-full sm:w-auto py-5 px-8 bg-burgundy hover:bg-burgundy-light text-white rounded-xl font-semibold transition-all"
                      >
                        Lưu Đánh Giá Của Bạn
                      </Button>
                    </form>
                  </div>
                </div>
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
            ref={lightboxRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Thư viện ảnh: ${product.name}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close */}
            <button
              onClick={() => setLightboxOpen(false)}
              aria-label="Đóng thư viện ảnh"
              className="absolute top-6 right-6 w-12 h-12 rounded-full glass-gold text-white flex items-center justify-center hover:bg-white/15 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Prev */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                aria-label="Ảnh trước"
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-gold text-white flex items-center justify-center hover:bg-white/15 transition-colors z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Image/Video */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl max-h-[80vh] w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {isVideo(galleryImages[lightboxIndex]) ? (
                <div className="w-full aspect-video rounded-2xl">
                  <video
                    key={galleryImages[lightboxIndex]}
                    src={galleryImages[lightboxIndex]}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain rounded-2xl"
                  />
                </div>
              ) : (
                <div className="w-full aspect-[4/3] md:aspect-[16/10] rounded-2xl relative">
                  <Image
                    src={galleryImages[lightboxIndex]}
                    alt={product.name}
                    fill
                    className="object-contain rounded-2xl"
                    sizes="(max-width: 1024px) 100vw, 896px"
                  />
                </div>
              )}
            </motion.div>

            {/* Next */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
                aria-label="Ảnh tiếp theo"
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
