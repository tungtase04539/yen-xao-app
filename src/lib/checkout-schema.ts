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
