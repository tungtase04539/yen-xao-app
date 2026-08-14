'use server';

import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import {
  calcDiscount,
  calcShippingFee,
  cartLinesSchema,
  placeOrderSchema,
  type CartLine,
  type CouponRule,
  type PricedCartLine,
} from '@/lib/checkout-schema';
import type { CouponValidation } from '@/types';

const SUPPORT_PHONE = '0843 623 986';

type PlaceOrderResult =
  | { success: true; order_id: string; order_number: string }
  | { success: false; error: string };

interface ProductRow {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  stock: number | null;
  is_active: boolean;
}

interface VariantRow {
  id: string;
  product_id: string;
  title: string;
  price: number;
  sale_price: number | null;
  stock: number | null;
  is_active: boolean;
}

/**
 * Đọc lại giá và tồn kho hiện tại từ DB cho từng dòng giỏ hàng.
 * Đây là nguồn chân lý duy nhất về giá — mọi con số client gửi lên đều bị bỏ qua.
 */
async function resolveCartLines(
  items: CartLine[]
): Promise<{ lines: PricedCartLine[] } | { error: string }> {
  const productIds = [...new Set(items.map((i) => i.product_id))];
  const variantIds = [
    ...new Set(items.map((i) => i.variant_id).filter((id): id is string => !!id)),
  ];

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price, sale_price, stock, is_active')
    .in('id', productIds);

  if (productsError || !products) {
    console.error('Cart price lookup error (products):', productsError);
    return { error: 'Không thể kiểm tra giá sản phẩm. Vui lòng thử lại.' };
  }

  let variants: VariantRow[] = [];
  if (variantIds.length > 0) {
    const { data, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, product_id, title, price, sale_price, stock, is_active')
      .in('id', variantIds);

    if (variantsError || !data) {
      console.error('Cart price lookup error (variants):', variantsError);
      return { error: 'Không thể kiểm tra giá sản phẩm. Vui lòng thử lại.' };
    }
    variants = data as VariantRow[];
  }

  const lines = items.map<PricedCartLine>((item) => {
    const product = (products as ProductRow[]).find((p) => p.id === item.product_id);

    if (!product) {
      return {
        product_id: item.product_id,
        variant_id: item.variant_id ?? null,
        product_name: 'Sản phẩm không còn tồn tại',
        variant_title: null,
        price: 0,
        stock: 0,
        available: false,
      };
    }

    if (item.variant_id) {
      const variant = variants.find(
        (v) => v.id === item.variant_id && v.product_id === product.id
      );
      return {
        product_id: product.id,
        variant_id: item.variant_id,
        product_name: product.name,
        variant_title: variant?.title ?? null,
        price: variant ? variant.sale_price || variant.price : 0,
        stock: variant?.stock ?? 0,
        available: !!variant && variant.is_active && product.is_active,
      };
    }

    return {
      product_id: product.id,
      variant_id: null,
      product_name: product.name,
      variant_title: null,
      price: product.sale_price || product.price,
      stock: product.stock ?? 0,
      available: product.is_active,
    };
  });

  return { lines };
}

function toCouponRule(coupon: CouponValidation): CouponRule {
  return {
    amount: coupon.discount_amount ?? 0,
    type: coupon.discount_type ?? 'fixed',
    min_order_amount: coupon.min_order_amount ?? 0,
    max_discount: coupon.max_discount ?? 0,
  };
}

function lineLabel(line: PricedCartLine): string {
  return line.variant_title
    ? `${line.product_name} (${line.variant_title})`
    : line.product_name;
}

/**
 * Đối chiếu giỏ hàng với DB để trang checkout báo cho khách biết giá đã đổi
 * hoặc sản phẩm đã hết hàng TRƯỚC khi bấm đặt hàng.
 */
export async function getCurrentCartPrices(
  input: unknown
): Promise<{ lines: PricedCartLine[] } | { error: string }> {
  const parsed = cartLinesSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Giỏ hàng không hợp lệ.' };
  }

  try {
    return await resolveCartLines(parsed.data);
  } catch (err) {
    console.error('Cart price check error:', err);
    return { error: 'Không thể kiểm tra giá sản phẩm.' };
  }
}

export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  try {
    // Server action là endpoint POST công khai — validate trước khi chạm DB
    const parsed = placeOrderSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Thông tin đơn hàng không hợp lệ.',
      };
    }
    const data = parsed.data;

    // 1. Lấy lại giá + tồn kho từ DB
    const resolved = await resolveCartLines(data.items);
    if ('error' in resolved) {
      return { success: false, error: resolved.error };
    }
    const lines = resolved.lines;

    const unavailable = lines.find((l) => !l.available);
    if (unavailable) {
      return {
        success: false,
        error: `"${lineLabel(unavailable)}" hiện không còn được bán. Vui lòng cập nhật lại giỏ hàng.`,
      };
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const quantity = data.items[i].quantity;
      if (quantity > line.stock) {
        return {
          success: false,
          error:
            line.stock > 0
              ? `"${lineLabel(line)}" chỉ còn ${line.stock} sản phẩm. Vui lòng giảm số lượng.`
              : `"${lineLabel(line)}" đã hết hàng. Vui lòng xóa khỏi giỏ hàng.`,
        };
      }
    }

    // 2. Tính lại toàn bộ tiền phía server
    const subtotal = lines.reduce(
      (sum, line, i) => sum + line.price * data.items[i].quantity,
      0
    );
    const shippingFee = calcShippingFee(subtotal);

    let discountAmount = 0;
    let couponCode: string | null = null;
    if (data.coupon_code) {
      const coupon = await validateCoupon(data.coupon_code);
      if (!coupon.valid) {
        return { success: false, error: coupon.message || 'Mã giảm giá không hợp lệ.' };
      }

      const rule = toCouponRule(coupon);
      if (subtotal < rule.min_order_amount) {
        return {
          success: false,
          error: `Mã giảm giá chỉ áp dụng cho đơn hàng từ ${formatPrice(rule.min_order_amount)}.`,
        };
      }

      discountAmount = calcDiscount(subtotal, rule);
      couponCode = data.coupon_code.trim().toUpperCase();
    }

    const totalAmount = subtotal - discountAmount + shippingFee;

    // 3. Tổng client hiển thị phải khớp tổng server tính, nếu không thì giá đã đổi
    if (Math.round(data.total_amount) !== totalAmount) {
      return {
        success: false,
        error: `Tổng tiền đơn hàng đã thay đổi (đúng là ${formatPrice(totalAmount)}). Vui lòng tải lại trang và kiểm tra lại đơn hàng.`,
      };
    }

    // 4. Tạo đơn — chỉ ghi con số server tự tính
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: data.customer_name,
        phone: data.phone,
        email: data.email || null,
        province: data.province,
        district: data.district,
        ward: data.ward,
        exact_address: data.exact_address,
        order_notes: data.order_notes || null,
        subtotal,
        discount_amount: discountAmount,
        shipping_fee: shippingFee,
        total_amount: totalAmount,
        coupon_code: couponCode,
        payment_method: data.payment_method,
        status: 'pending',
      })
      .select('id, order_number')
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return { success: false, error: 'Không thể tạo đơn hàng. Vui lòng thử lại.' };
    }

    // 5. Tạo các dòng hàng — tên và giá lấy từ DB, không phải từ client
    const orderItems = lines.map((line, i) => ({
      order_id: order.id,
      product_id: line.product_id,
      variant_id: line.variant_id,
      product_name: line.product_name,
      variant_title: line.variant_title,
      quantity: data.items[i].quantity,
      price: line.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      console.error('Order items error:', itemsError);
      // PostgREST không có transaction nên phải tự xóa đơn vừa tạo. Nếu lệnh xóa
      // cũng hỏng thì đơn mồ côi nằm lại trong DB — phải báo để khách gọi shop.
      const { error: rollbackError } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);

      if (rollbackError) {
        console.error(
          `Order rollback FAILED — orphan order ${order.order_number} (${order.id}):`,
          rollbackError
        );
        return {
          success: false,
          error: `Không thể lưu chi tiết đơn hàng ${order.order_number}. Vui lòng liên hệ ${SUPPORT_PHONE} để được hỗ trợ, đừng đặt lại đơn.`,
        };
      }

      return { success: false, error: 'Không thể lưu chi tiết đơn hàng. Vui lòng thử lại.' };
    }

    // 6. Ghi nhận lượt dùng mã giảm giá
    if (couponCode) {
      const { error: useCouponError } = await supabase.rpc('use_coupon', {
        coupon_code: couponCode,
      });
      if (useCouponError) {
        console.error(`use_coupon failed for ${couponCode} on order ${order.id}:`, useCouponError);
      }
    }

    return {
      success: true,
      order_id: order.id,
      order_number: order.order_number,
    };
  } catch (err) {
    console.error('Place order error:', err);
    return { success: false, error: 'Đã xảy ra lỗi. Vui lòng thử lại.' };
  }
}

export async function validateCoupon(code: string): Promise<CouponValidation> {
  try {
    const { data, error } = await supabase.rpc('validate_coupon', {
      coupon_code: code,
    });

    if (error) {
      console.error('validate_coupon error:', error);
      return { valid: false, message: 'Không thể kiểm tra mã giảm giá.' };
    }

    // validate_coupon là hàm RETURNS TABLE nên PostgREST trả về MẢNG, không phải object
    const row: CouponValidation | undefined = Array.isArray(data) ? data[0] : data;
    return row ?? { valid: false, message: 'Mã giảm giá không tồn tại.' };
  } catch {
    return { valid: false, message: 'Đã xảy ra lỗi khi kiểm tra mã.' };
  }
}
