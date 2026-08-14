'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, type FieldErrors } from 'react-hook-form';
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
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/lib/format';
import {
  calcDiscount,
  calcShippingFee,
  checkoutSchema,
  FREE_SHIPPING_THRESHOLD,
  type CheckoutFormData,
  type CouponRule,
} from '@/lib/checkout-schema';
import { getCurrentCartPrices, placeOrder, validateCoupon } from './actions';

// VN Address API
const VN_API_BASE = 'https://provinces.open-api.vn/api';

interface Province { code: number; name: string }
interface District { code: number; name: string }
interface Ward { code: number; name: string }

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
  const [provincesLoading, setProvincesLoading] = useState(true);
  // API địa chỉ là dịch vụ bên thứ ba: khi nó lỗi thì cho khách nhập tay
  // thay vì khóa cứng toàn bộ checkout
  const [manualAddress, setManualAddress] = useState(false);

  // Đối chiếu giá giỏ hàng với DB
  const [priceNotices, setPriceNotices] = useState<string[]>([]);
  const [cartIssues, setCartIssues] = useState<string[]>([]);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<(CouponRule & { code: string }) | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Submit
  const [submitting, setSubmitting] = useState(false);

  // Calculate amounts
  const shippingFee = calcShippingFee(subtotal);
  const discountAmount = calcDiscount(subtotal, couponApplied);
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
  const loadProvinces = useCallback(async () => {
    setProvincesLoading(true);
    try {
      const res = await fetch(`${VN_API_BASE}/p/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error('Empty province list');
      setProvinces(data);
      return true;
    } catch {
      setProvinces([]);
      setManualAddress(true);
      return false;
    } finally {
      setProvincesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProvinces();
  }, [loadProvinces]);

  const retryAddressApi = async () => {
    const ok = await loadProvinces();
    if (ok) {
      setManualAddress(false);
    } else {
      toast.error('Vẫn chưa tải được danh sách địa chỉ, bạn vui lòng nhập tay giúp shop.');
    }
  };

  // Đối chiếu giá và tồn kho của giỏ hàng với DB khi vào trang thanh toán:
  // giá trong localStorage có thể đã cũ hàng tuần (xem #22)
  useEffect(() => {
    const cartItems = items;
    if (cartItems.length === 0) return;

    // Giỏ đổi liên tục (side cart) nên có thể có nhiều request chồng nhau —
    // bỏ qua kết quả cũ để nó không ghi đè tình trạng giỏ mới nhất
    let stale = false;

    getCurrentCartPrices(
      cartItems.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
      }))
    ).then((res) => {
      if (stale || 'error' in res) return;

      const notices: string[] = [];
      const issues: string[] = [];
      const updates: { product_id: string; variant_id?: string; price: number }[] = [];

      res.lines.forEach((line, index) => {
        const item = cartItems[index];
        if (!item) return;
        const label = item.variant_title
          ? `${item.product_name} (${item.variant_title})`
          : item.product_name;

        if (!line.available) {
          issues.push(`"${label}" hiện không còn được bán, vui lòng xóa khỏi giỏ hàng.`);
          return;
        }
        if (item.quantity > line.stock) {
          issues.push(
            line.stock > 0
              ? `"${label}" chỉ còn ${line.stock} sản phẩm, vui lòng giảm số lượng.`
              : `"${label}" đã hết hàng, vui lòng xóa khỏi giỏ hàng.`
          );
        }
        if (line.price !== item.price) {
          notices.push(
            `"${label}": ${formatPrice(item.price)} → ${formatPrice(line.price)}`
          );
          updates.push({
            product_id: item.product_id,
            variant_id: item.variant_id,
            price: line.price,
          });
        }
      });

      if (updates.length > 0) {
        useCart.getState().syncPrices(updates);
      }
      // Giữ lại thông báo đổi giá qua các lần chạy lại: sau khi syncPrices cập nhật
      // giỏ, vòng kiểm tra kế tiếp không còn thấy chênh lệch nữa
      setPriceNotices((prev) =>
        notices.length > 0 ? [...prev, ...notices.filter((n) => !prev.includes(n))] : prev
      );
      setCartIssues(issues);
    });

    return () => {
      stale = true;
    };
  }, [items]);

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
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.districts?.length) throw new Error('Empty district list');
        setDistricts(data.districts);
      } catch {
        setDistricts([]);
        setManualAddress(true);
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
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.wards?.length) throw new Error('Empty ward list');
        setWards(data.wards);
      } catch {
        setWards([]);
        setManualAddress(true);
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
      if (!result.valid) {
        toast.error(result.message || 'Mã giảm giá không hợp lệ');
        return;
      }

      const rule: CouponRule = {
        amount: result.discount_amount ?? 0,
        type: result.discount_type ?? 'fixed',
        min_order_amount: result.min_order_amount ?? 0,
        max_discount: result.max_discount ?? 0,
      };

      if (subtotal < rule.min_order_amount) {
        toast.error(
          `Mã này chỉ áp dụng cho đơn hàng từ ${formatPrice(rule.min_order_amount)}`
        );
        return;
      }

      setCouponApplied({ code: couponCode.trim().toUpperCase(), ...rule });
      toast.success('Áp dụng mã giảm giá thành công!');
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

    if (cartIssues.length > 0) {
      toast.error(cartIssues[0]);
      return;
    }

    setSubmitting(true);
    try {
      // Chỉ gửi id + số lượng: giá và tổng tiền do server tự tính lại từ DB
      const result = await placeOrder({
        ...formData,
        email: formData.email || undefined,
        order_notes: formData.order_notes || undefined,
        total_amount: totalAmount,
        // Mã chưa đạt đơn tối thiểu thì không gửi lên: tổng tiền hiển thị vốn đã
        // không có giảm giá, gửi lên chỉ khiến server từ chối cả đơn hàng
        coupon_code: discountAmount > 0 ? couponApplied?.code : undefined,
        items: items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
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

  // Submit không hợp lệ: trước đây hoàn toàn im lặng vì nút Đặt Hàng nằm ở cột
  // sticky bên phải còn thông báo lỗi nằm ở cột trái
  const onInvalid = (formErrors: FieldErrors<CheckoutFormData>) => {
    toast.error('Vui lòng kiểm tra lại thông tin đơn hàng');
    const firstField = Object.keys(formErrors)[0];
    const el = firstField ? document.getElementById(firstField) : null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus({ preventScroll: true });
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

        {(priceNotices.length > 0 || cartIssues.length > 0) && (
          <div className="mb-6 rounded-xl border border-gold/40 bg-gold/10 p-4">
            <div className="flex items-start gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-gold-dark" />
              <div className="space-y-1">
                {priceNotices.length > 0 && (
                  <>
                    <p className="font-semibold text-gold-dark">
                      Giá một số sản phẩm đã thay đổi so với lúc bạn thêm vào giỏ:
                    </p>
                    <ul className="list-disc pl-5 text-muted-foreground">
                      {priceNotices.map((notice) => (
                        <li key={notice}>{notice}</li>
                      ))}
                    </ul>
                  </>
                )}
                {cartIssues.length > 0 && (
                  <ul className="list-disc pl-5 text-destructive font-medium">
                    {cartIssues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
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
                    <label htmlFor="customer_name" className="block text-sm font-medium mb-1.5">
                      Họ và tên <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="customer_name"
                      {...register('customer_name')}
                      placeholder="Nguyễn Văn A"
                      aria-invalid={!!errors.customer_name}
                      aria-describedby={errors.customer_name ? 'customer_name-error' : undefined}
                      className={errors.customer_name ? 'border-destructive' : ''}
                    />
                    {errors.customer_name && (
                      <p id="customer_name-error" className="text-xs text-destructive mt-1">{errors.customer_name.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                      Số điện thoại <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="0901234567"
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                      className={errors.phone ? 'border-destructive' : ''}
                    />
                    {errors.phone && (
                      <p id="phone-error" className="text-xs text-destructive mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                      Email (không bắt buộc)
                    </label>
                    <Input
                      id="email"
                      {...register('email')}
                      type="email"
                      placeholder="email@example.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-xs text-destructive mt-1">{errors.email.message}</p>
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

                {manualAddress && (
                  <div className="mb-4 flex items-start justify-between gap-3 rounded-lg bg-gold/10 p-3 text-xs text-gold-dark">
                    <span>
                      Hiện không tải được danh sách Tỉnh/Quận/Phường. Bạn vui lòng nhập tay
                      địa chỉ bên dưới, đơn hàng vẫn được gửi bình thường.
                    </span>
                    <button
                      type="button"
                      onClick={retryAddressApi}
                      className="shrink-0 font-semibold underline"
                    >
                      Thử tải lại
                    </button>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  {manualAddress ? (
                    <>
                      {/* Province (nhập tay) */}
                      <div>
                        <label htmlFor="province" className="block text-sm font-medium mb-1.5">
                          Tỉnh/Thành phố <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="province"
                          {...register('province')}
                          placeholder="VD: Hà Nội"
                          aria-invalid={!!errors.province}
                          aria-describedby={errors.province ? 'province-error' : undefined}
                          className={errors.province ? 'border-destructive' : ''}
                        />
                        {errors.province && (
                          <p id="province-error" className="text-xs text-destructive mt-1">{errors.province.message}</p>
                        )}
                      </div>

                      {/* District (nhập tay) */}
                      <div>
                        <label htmlFor="district" className="block text-sm font-medium mb-1.5">
                          Quận/Huyện <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="district"
                          {...register('district')}
                          placeholder="VD: Cầu Giấy"
                          aria-invalid={!!errors.district}
                          aria-describedby={errors.district ? 'district-error' : undefined}
                          className={errors.district ? 'border-destructive' : ''}
                        />
                        {errors.district && (
                          <p id="district-error" className="text-xs text-destructive mt-1">{errors.district.message}</p>
                        )}
                      </div>

                      {/* Ward (nhập tay) */}
                      <div>
                        <label htmlFor="ward" className="block text-sm font-medium mb-1.5">
                          Phường/Xã <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="ward"
                          {...register('ward')}
                          placeholder="VD: Dịch Vọng"
                          aria-invalid={!!errors.ward}
                          aria-describedby={errors.ward ? 'ward-error' : undefined}
                          className={errors.ward ? 'border-destructive' : ''}
                        />
                        {errors.ward && (
                          <p id="ward-error" className="text-xs text-destructive mt-1">{errors.ward.message}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Province */}
                      <div>
                        <label htmlFor="province" className="block text-sm font-medium mb-1.5">
                          Tỉnh/Thành phố <span className="text-destructive">*</span>
                        </label>
                        <select
                          id="province"
                          value={selectedProvince}
                          onChange={(e) => handleProvinceChange(e.target.value)}
                          disabled={provincesLoading}
                          aria-invalid={!!errors.province}
                          aria-describedby={errors.province ? 'province-error' : undefined}
                          className={`w-full h-10 rounded-md border px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${
                            errors.province ? 'border-destructive' : 'border-input'
                          }`}
                        >
                          <option value="">
                            {provincesLoading ? 'Đang tải danh sách...' : '-- Chọn Tỉnh/TP --'}
                          </option>
                          {provinces.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <input type="hidden" {...register('province')} />
                        {errors.province && (
                          <p id="province-error" className="text-xs text-destructive mt-1">{errors.province.message}</p>
                        )}
                      </div>

                      {/* District */}
                      <div>
                        <label htmlFor="district" className="block text-sm font-medium mb-1.5">
                          Quận/Huyện <span className="text-destructive">*</span>
                        </label>
                        <select
                          id="district"
                          value={selectedDistrict}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          disabled={!selectedProvince}
                          aria-invalid={!!errors.district}
                          aria-describedby={errors.district ? 'district-error' : undefined}
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
                          <p id="district-error" className="text-xs text-destructive mt-1">{errors.district.message}</p>
                        )}
                      </div>

                      {/* Ward */}
                      <div>
                        <label htmlFor="ward" className="block text-sm font-medium mb-1.5">
                          Phường/Xã <span className="text-destructive">*</span>
                        </label>
                        <select
                          id="ward"
                          onChange={(e) => handleWardChange(e.target.value)}
                          disabled={!selectedDistrict}
                          aria-invalid={!!errors.ward}
                          aria-describedby={errors.ward ? 'ward-error' : undefined}
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
                          <p id="ward-error" className="text-xs text-destructive mt-1">{errors.ward.message}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Exact Address */}
                <div>
                  <label htmlFor="exact_address" className="block text-sm font-medium mb-1.5">
                    Địa chỉ chi tiết <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="exact_address"
                    {...register('exact_address')}
                    placeholder="Số nhà, tên đường, tòa nhà..."
                    aria-invalid={!!errors.exact_address}
                    aria-describedby={errors.exact_address ? 'exact_address-error' : undefined}
                    className={errors.exact_address ? 'border-destructive' : ''}
                  />
                  {errors.exact_address && (
                    <p id="exact_address-error" className="text-xs text-destructive mt-1">{errors.exact_address.message}</p>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm">
                <label htmlFor="order_notes" className="block text-sm font-medium mb-1.5">
                  Ghi chú đơn hàng
                </label>
                <textarea
                  id="order_notes"
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
                          aria-label="Xóa mã giảm giá"
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
                            aria-label="Mã giảm giá"
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

                    {/* Giỏ hàng có thể tụt xuống dưới mức tối thiểu sau khi đã áp mã */}
                    {couponApplied && subtotal < couponApplied.min_order_amount && (
                      <p className="text-xs text-destructive mt-2">
                        Đơn hàng cần đạt tối thiểu{' '}
                        {formatPrice(couponApplied.min_order_amount)} để áp dụng mã này.
                      </p>
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
                    disabled={submitting || items.length === 0 || cartIssues.length > 0}
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
