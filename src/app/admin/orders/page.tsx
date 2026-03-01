'use client';

import { useEffect, useState, Fragment } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ChevronDown } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/format';
import { toast } from 'sonner';

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
  shipping: { label: 'Đang giao', color: 'bg-indigo-100 text-indigo-700' },
  completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

const statusFlow = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  province: string;
  district: string;
  ward: string;
  exact_address: string;
}

interface OrderDetail extends OrderRow {
  items: {
    product_name: string;
    variant_title: string | null;
    quantity: number;
    price: number;
  }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const viewOrder = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    const { data } = await supabase.from('orders').select('*, items:order_items(product_name, variant_title, quantity, price)').eq('id', id).single();
    setOrderDetail(data as OrderDetail);
    setExpandedId(id);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (error) { toast.error('Cập nhật trạng thái thất bại'); return; }
    toast.success(`Đơn hàng đã chuyển sang "${statusMap[newStatus]?.label}"`);
    fetchOrders();
    if (expandedId === id && orderDetail) {
      setOrderDetail({ ...orderDetail, status: newStatus });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-serif text-burgundy">Đơn hàng</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="text-sm border border-input rounded-lg px-3 py-2 bg-white">
          <option value="all">Tất cả</option>
          {statusFlow.map((s) => <option key={s} value={s}>{statusMap[s].label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Mã ĐH</th>
                <th className="text-left px-4 py-3 font-medium">Khách hàng</th>
                <th className="text-left px-4 py-3 font-medium">Tổng tiền</th>
                <th className="text-left px-4 py-3 font-medium">Thanh toán</th>
                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 font-medium">Ngày đặt</th>
                <th className="text-right px-4 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Đang tải...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Không có đơn hàng</td></tr>
              ) : orders.map((o) => (
                <Fragment key={o.id}>
                  <tr className="hover:bg-secondary/30 cursor-pointer" onClick={() => viewOrder(o.id)}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-burgundy">{o.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{o.phone}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(o.total_amount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs">
                        {o.payment_method === 'COD' ? '💰 COD' : '🏦 CK'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${statusMap[o.status]?.color || ''}`}>
                        {statusMap[o.status]?.label || o.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === o.id ? 'rotate-180' : ''}`} />
                      </Button>
                    </td>
                  </tr>
                  {/* Expanded Detail */}
                  {expandedId === o.id && orderDetail && (
                    <tr>
                      <td colSpan={7} className="px-4 py-4 bg-secondary/20">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Address */}
                          <div>
                            <h3 className="text-sm font-semibold mb-2">Địa chỉ giao hàng</h3>
                            <p className="text-sm text-muted-foreground">
                              {orderDetail.exact_address}, {orderDetail.ward}, {orderDetail.district}, {orderDetail.province}
                            </p>
                          </div>
                          {/* Status Change */}
                          <div>
                            <h3 className="text-sm font-semibold mb-2">Cập nhật trạng thái</h3>
                            <div className="flex flex-wrap gap-1.5">
                              {statusFlow.map((s) => (
                                <Button
                                  key={s}
                                  size="sm"
                                  variant={orderDetail.status === s ? 'default' : 'outline'}
                                  className={`text-xs h-7 ${orderDetail.status === s ? 'bg-burgundy' : ''}`}
                                  onClick={(e) => { e.stopPropagation(); updateStatus(o.id, s); }}
                                >
                                  {statusMap[s].label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                        {/* Items */}
                        <div className="mt-4">
                          <h3 className="text-sm font-semibold mb-2">Sản phẩm</h3>
                          <div className="space-y-2">
                            {orderDetail.items?.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm py-1.5 border-b border-border/30 last:border-0">
                                <span>
                                  {item.product_name}
                                  {item.variant_title && <span className="text-muted-foreground"> ({item.variant_title})</span>}
                                  <span className="text-muted-foreground"> x{item.quantity}</span>
                                </span>
                                <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
