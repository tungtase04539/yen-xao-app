import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Thanh Toán',
  description: 'Hoàn tất đơn hàng yến sào cao cấp của bạn.',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
