import { z } from 'zod';

const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

export const checkoutSchema = z.object({
  customer_name: z
    .string()
    .min(2, 'Vui lòng nhập họ tên (ít nhất 2 ký tự)')
    .max(100, 'Họ tên quá dài'),
  phone: z
    .string()
    .regex(phoneRegex, 'Số điện thoại không hợp lệ (VD: 0901234567)'),
  email: z
    .string()
    .email('Email không hợp lệ')
    .optional()
    .or(z.literal('')),
  province: z
    .string()
    .min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  district: z
    .string()
    .min(1, 'Vui lòng chọn Quận/Huyện'),
  ward: z
    .string()
    .min(1, 'Vui lòng chọn Phường/Xã'),
  exact_address: z
    .string()
    .min(5, 'Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường...)')
    .max(500, 'Địa chỉ quá dài'),
  order_notes: z
    .string()
    .max(500, 'Ghi chú quá dài')
    .optional(),
  payment_method: z.enum(['COD', 'BANK_TRANSFER'], {
    message: 'Vui lòng chọn phương thức thanh toán',
  }),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ============================================================
// PAYLOAD GỬI LÊN SERVER ACTION
// ============================================================

// Client chỉ được gửi id + số lượng. Giá, tạm tính, giảm giá, phí ship và
// tổng tiền đều do server tự đọc từ DB và tính lại (xem placeOrder).
export const cartLineSchema = z.object({
  product_id: z.string().min(1).max(64),
  variant_id: z.string().min(1).max(64).optional(),
  quantity: z
    .number()
    .int('Số lượng không hợp lệ')
    .min(1, 'Số lượng không hợp lệ')
    .max(999, 'Số lượng quá lớn'),
});

export const cartLinesSchema = z
  .array(cartLineSchema)
  .min(1, 'Giỏ hàng trống')
  .max(50, 'Giỏ hàng có quá nhiều sản phẩm');

export const placeOrderSchema = checkoutSchema.extend({
  coupon_code: z.string().max(50).optional(),
  // Tổng tiền client đang hiển thị — chỉ dùng để đối chiếu với tổng server tính,
  // không bao giờ được ghi xuống DB.
  total_amount: z.number().nonnegative(),
  items: cartLinesSchema,
});

export type CartLine = z.infer<typeof cartLineSchema>;
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

// ============================================================
// TÍNH TIỀN — dùng chung cho cả client (hiển thị) và server (ghi DB)
// ============================================================

export const SHIPPING_FEE = 30000;
export const FREE_SHIPPING_THRESHOLD = 1000000;

export function calcShippingFee(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export interface CouponRule {
  amount: number;
  type: 'percent' | 'fixed';
  min_order_amount: number;
  /** 0 nghĩa là không giới hạn mức giảm tối đa */
  max_discount: number;
}

export function calcDiscount(subtotal: number, coupon: CouponRule | null): number {
  if (!coupon) return 0;
  if (subtotal < coupon.min_order_amount) return 0;

  let discount =
    coupon.type === 'percent'
      ? Math.round(subtotal * (coupon.amount / 100))
      : coupon.amount;

  if (coupon.max_discount > 0) {
    discount = Math.min(discount, coupon.max_discount);
  }

  // Không bao giờ để giảm giá vượt tạm tính, tránh tổng tiền âm
  return Math.max(0, Math.min(discount, subtotal));
}

/** Một dòng giỏ hàng đã được đối chiếu lại với DB */
export interface PricedCartLine {
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_title: string | null;
  price: number;
  stock: number;
  /** false khi sản phẩm/phân loại đã bị xóa hoặc tắt hiển thị */
  available: boolean;
}
