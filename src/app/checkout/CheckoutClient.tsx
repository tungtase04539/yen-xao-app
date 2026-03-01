'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Truck,
  CreditCard,
  Loader2,
  Tag,
  X,
  CheckCircle,
  Banknote,
  QrCode,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/lib/format';
import { checkoutSchema, type CheckoutFormData } from '@/lib/checkout-schema';
import { placeOrder, validateCoupon } from './actions';

// VN Address API
const VN_API_BASE = 'https://provinces.open-api.vn/api';

interface Province { code: number; name: string }
interface District { code: number; name: string }
interface Ward { code: number; name: string }

const SHIPPING_FEE = 30000;
const FREE_SHIPPING_THRESHOLD = 1000000;

export default function CheckoutClient() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const subtotal = getTotalPrice();

  // Address state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    amount: number;
    type: 'percent' | 'fixed';
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Submit
  const [submitting, setSubmitting] = useState(false);

  // Calculate amounts
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  let discountAmount = 0;
  if (couponApplied) {
    if (couponApplied.type === 'percent') {
      discountAmount = Math.round(subtotal * (couponApplied.amount / 100));
    } else {
      discountAmount = couponApplied.amount;
    }
  }
  const totalAmount = subtotal - discountAmount + shippingFee;

  // Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      payment_method: 'COD',
    },
  });

  const paymentMethod = watch('payment_method');

  // Fetch provinces
  useEffect(() => {
    fetch(`${VN_API_BASE}/p/`)
      .then((r) => r.json())
      .then((data) => setProvinces(data || []))
      .catch(() => setProvinces([]));
  }, []);

  // Fetch districts when province changes
  const handleProvinceChange = useCallback(
    async (code: string) => {
      setSelectedProvince(code);
      setSelectedDistrict('');
      setDistricts([]);
      setWards([]);
      setValue('district', '');
      setValue('ward', '');

      if (!code) {
        setValue('province', '');
        return;
      }

      const province = provinces.find((p) => String(p.code) === code);
      setValue('province', province?.name || '');

      try {
        const res = await fetch(`${VN_API_BASE}/p/${code}?depth=2`);
        const data = await res.json();
        setDistricts(data.districts || []);
      } catch {
        setDistricts([]);
      }
    },
    [provinces, setValue]
  );

  // Fetch wards when district changes
  const handleDistrictChange = useCallback(
    async (code: string) => {
      setSelectedDistrict(code);
      setWards([]);
      setValue('ward', '');

      if (!code) {
        setValue('district', '');
        return;
      }

      const district = districts.find((d) => String(d.code) === code);
      setValue('district', district?.name || '');

      try {
        const res = await fetch(`${VN_API_BASE}/d/${code}?depth=2`);
        const data = await res.json();
        setWards(data.wards || []);
      } catch {
        setWards([]);
      }
    },
    [districts, setValue]
  );

  const handleWardChange = useCallback(
    (code: string) => {
      const ward = wards.find((w) => String(w.code) === code);
      setValue('ward', ward?.name || '');
    },
    [wards, setValue]
  );

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const result = await validateCoupon(couponCode.trim());
      if (result.valid) {
        setCouponApplied({
          code: couponCode.trim().toUpperCase(),
          amount: result.discount_amount,
          type: result.discount_type,
        });
        toast.success('Áp dụng mã giảm giá thành công!');
      } else {
        toast.error(result.message || 'Mã giảm giá không hợp lệ');
      }
    } catch {
      toast.error('Không thể kiểm tra mã giảm giá');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
  };

  // Submit order
  const onSubmit = async (formData: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error('Giỏ hàng trống!');
      return;
    }

    setSubmitting(true);
    try {
      const result = await placeOrder({
        ...formData,
        email: formData.email || undefined,
        order_notes: formData.order_notes || undefined,
        subtotal,
        discount_amount: discountAmount,
        shipping_fee: shippingFee,
        total_amount: totalAmount,
        coupon_code: couponApplied?.code,
        items: items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.product_name,
          variant_title: item.variant_title,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      if (result.success) {
        clearCart();
        router.push(`/thank-you?order=${result.order_number}`);
      } else {
        toast.error(result.error || 'Đặt hàng thất bại');
      }
    } catch {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Redirect if cart empty (client only)
  if (typeof window !== 'undefined' && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold font-serif text-burgundy mb-2">
            Giỏ hàng trống
          </h1>
          <p className="text-muted-foreground mb-6">
            Hãy thêm sản phẩm vào giỏ hàng trước khi thanh toán
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-burgundy text-white rounded-full font-semibold hover:bg-burgundy-light transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-burgundy transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">Thanh toán</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-burgundy mb-8">
          Thanh Toán
        </h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT: Billing Info (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm">
                <h2 className="text-lg font-semibold font-serif text-burgundy mb-5 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Thông tin thanh toán
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Họ và tên <span className="text-destructive">*</span>
                    </label>
                    <Input
                      {...register('customer_name')}
                      placeholder="Nguyễn Văn A"
                      className={errors.customer_name ? 'border-destructive' : ''}
                    />
                    {errors.customer_name && (
                      <p className="text-xs text-destructive mt-1">{errors.customer_name.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Số điện thoại <span className="text-destructive">*</span>
                    </label>
                    <Input
                      {...register('phone')}
                      placeholder="0901234567"
                      className={errors.phone ? 'border-destructive' : ''}
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">
                      Email (không bắt buộc)
                    </label>
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="email@example.com"
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm">
                <h2 className="text-lg font-semibold font-serif text-burgundy mb-5 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Địa chỉ giao hàng
                </h2>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  {/* Province */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Tỉnh/Thành phố <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className={`w-full h-10 rounded-md border px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring ${
                        errors.province ? 'border-destructive' : 'border-input'
                      }`}
                    >
                      <option value="">-- Chọn Tỉnh/TP --</option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <input type="hidden" {...register('province')} />
                    {errors.province && (
                      <p className="text-xs text-destructive mt-1">{errors.province.message}</p>
                    )}
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Quận/Huyện <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      disabled={!selectedProvince}
                      className={`w-full h-10 rounded-md border px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${
                        errors.district ? 'border-destructive' : 'border-input'
                      }`}
                    >
                      <option value="">-- Chọn Quận/Huyện --</option>
                      {districts.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <input type="hidden" {...register('district')} />
                    {errors.district && (
                      <p className="text-xs text-destructive mt-1">{errors.district.message}</p>
                    )}
                  </div>

                  {/* Ward */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Phường/Xã <span className="text-destructive">*</span>
                    </label>
                    <select
                      onChange={(e) => handleWardChange(e.target.value)}
                      disabled={!selectedDistrict}
                      className={`w-full h-10 rounded-md border px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${
                        errors.ward ? 'border-destructive' : 'border-input'
                      }`}
                    >
                      <option value="">-- Chọn Phường/Xã --</option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                    <input type="hidden" {...register('ward')} />
                    {errors.ward && (
                      <p className="text-xs text-destructive mt-1">{errors.ward.message}</p>
                    )}
                  </div>
                </div>

                {/* Exact Address */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Địa chỉ chi tiết <span className="text-destructive">*</span>
                  </label>
                  <Input
                    {...register('exact_address')}
                    placeholder="Số nhà, tên đường, tòa nhà..."
                    className={errors.exact_address ? 'border-destructive' : ''}
                  />
                  {errors.exact_address && (
                    <p className="text-xs text-destructive mt-1">{errors.exact_address.message}</p>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm">
                <label className="block text-sm font-medium mb-1.5">
                  Ghi chú đơn hàng
                </label>
                <textarea
                  {...register('order_notes')}
                  rows={3}
                  placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)..."
                  className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm">
                <h2 className="text-lg font-semibold font-serif text-burgundy mb-5 flex items-center gap-2">
                  <Banknote className="w-5 h-5" />
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  {/* COD */}
                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-burgundy bg-burgundy/5'
                        : 'border-border hover:border-gold/50'
                    }`}
                  >
                    <input
                      type="radio"
                      value="COD"
                      {...register('payment_method')}
                      className="w-4 h-4 accent-burgundy"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">💰 Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Thanh toán bằng tiền mặt khi nhận được hàng
                      </p>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'border-burgundy bg-burgundy/5'
                        : 'border-border hover:border-gold/50'
                    }`}
                  >
                    <input
                      type="radio"
                      value="BANK_TRANSFER"
                      {...register('payment_method')}
                      className="w-4 h-4 accent-burgundy"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">🏦 Chuyển khoản ngân hàng</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Chuyển khoản và gửi ảnh xác nhận
                      </p>
                    </div>
                  </label>
                </div>

                {errors.payment_method && (
                  <p className="text-xs text-destructive mt-2">{errors.payment_method.message}</p>
                )}

                {/* Bank Transfer Details */}
                {paymentMethod === 'BANK_TRANSFER' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 rounded-lg bg-cream border border-border/50"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-burgundy mb-3">
                          Thông tin chuyển khoản
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ngân hàng:</span>
                            <span className="font-semibold">Vietcombank</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Số tài khoản:</span>
                            <span className="font-semibold font-mono">1234567890</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Chủ tài khoản:</span>
                            <span className="font-semibold">NGUYEN VAN YEN SAO</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Nội dung CK:</span>
                            <span className="font-semibold text-burgundy">YS [SĐT]</span>
                          </div>
                        </div>
                      </div>

                      {/* VietQR placeholder */}
                      <div className="hidden sm:flex flex-col items-center">
                        <div className="w-32 h-32 rounded-lg bg-white border-2 border-border flex items-center justify-center">
                          <QrCode className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Quét mã VietQR
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3 italic">
                      * Vui lòng chuyển khoản đúng số tiền và nội dung. Đơn hàng sẽ được xử lý sau khi xác nhận thanh toán.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* RIGHT: Order Summary (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm">
                  <h2 className="text-lg font-semibold font-serif text-burgundy mb-5">
                    Đơn hàng của bạn
                  </h2>

                  {/* Cart Items */}
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={`${item.product_id}-${item.variant_id || 'default'}`}
                        className="flex gap-3 pb-3 border-b border-border/50 last:border-0"
                      >
                        <div className="w-14 h-14 rounded-lg bg-cream flex items-center justify-center text-2xl shrink-0">
                          {item.thumbnail ? (
                            <div
                              className="w-full h-full rounded-lg bg-cover bg-center"
                              style={{ backgroundImage: `url(${item.thumbnail})` }}
                            />
                          ) : (
                            '🕊️'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{item.product_name}</p>
                          {item.variant_title && (
                            <p className="text-xs text-muted-foreground">{item.variant_title}</p>
                          )}
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                            <span className="text-sm font-semibold text-burgundy">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Coupon */}
                  <div className="mb-4">
                    {couponApplied ? (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-700">
                            {couponApplied.code}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Mã giảm giá"
                            className="pl-9 uppercase"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="border-gold text-gold hover:bg-gold hover:text-burgundy shrink-0"
                        >
                          {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Áp dụng'}
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  {/* Totals */}
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tạm tính:</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phí giao hàng:</span>
                      <span className="font-medium">
                        {shippingFee === 0 ? (
                          <span className="text-green-600">Miễn phí</span>
                        ) : (
                          formatPrice(shippingFee)
                        )}
                      </span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá:</span>
                        <span className="font-medium">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-base font-semibold">Tổng cộng:</span>
                      <span className="text-xl font-bold text-burgundy">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Free Shipping Notice */}
                  {subtotal < FREE_SHIPPING_THRESHOLD && (
                    <div className="mt-4 p-3 rounded-lg bg-gold/10 text-xs text-gold-dark">
                      🚚 Mua thêm {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} để được <strong>miễn phí giao hàng</strong>
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={submitting || items.length === 0}
                    className="w-full mt-6 py-6 text-base bg-burgundy hover:bg-burgundy-light text-white font-semibold rounded-xl gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        Đặt Hàng · {formatPrice(totalAmount)}
                      </>
                    )}
                  </Button>

                  <p className="text-[10px] text-center text-muted-foreground mt-3">
                    Bằng việc đặt hàng, bạn đồng ý với các điều khoản & chính sách của chúng tôi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
