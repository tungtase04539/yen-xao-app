'use server';

import { supabase } from '@/lib/supabase';

interface OrderData {
  customer_name: string;
  phone: string;
  email?: string;
  province: string;
  district: string;
  ward: string;
  exact_address: string;
  order_notes?: string;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total_amount: number;
  coupon_code?: string;
  payment_method: 'COD' | 'BANK_TRANSFER';
  items: {
    product_id: string;
    variant_id?: string;
    product_name: string;
    variant_title?: string;
    quantity: number;
    price: number;
  }[];
}

export async function placeOrder(data: OrderData) {
  try {
    // 1. Create order
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
        subtotal: data.subtotal,
        discount_amount: data.discount_amount,
        shipping_fee: data.shipping_fee,
        total_amount: data.total_amount,
        coupon_code: data.coupon_code || null,
        payment_method: data.payment_method,
        status: 'pending',
      })
      .select('id, order_number')
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return { success: false, error: 'Không thể tạo đơn hàng. Vui lòng thử lại.' };
    }

    // 2. Create order items
    const orderItems = data.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      product_name: item.product_name,
      variant_title: item.variant_title || null,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items error:', itemsError);
      // Rollback: delete the order
      await supabase.from('orders').delete().eq('id', order.id);
      return { success: false, error: 'Không thể lưu chi tiết đơn hàng.' };
    }

    // 3. Use coupon if provided
    if (data.coupon_code) {
      await supabase.rpc('use_coupon', { coupon_code: data.coupon_code });
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

export async function validateCoupon(code: string) {
  try {
    const { data, error } = await supabase.rpc('validate_coupon', {
      coupon_code: code,
    });

    if (error) {
      return { valid: false, message: 'Không thể kiểm tra mã giảm giá.' };
    }

    return data;
  } catch {
    return { valid: false, message: 'Đã xảy ra lỗi khi kiểm tra mã.' };
  }
}
