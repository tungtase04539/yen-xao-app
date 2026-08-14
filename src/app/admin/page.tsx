'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, ShoppingCart, FileText, Tag, TrendingUp, DollarSign } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';

// PostgREST của Supabase cắt mọi SELECT ở 1000 dòng mà KHÔNG trả lỗi, nên phải đọc
// doanh thu theo lô cho tới hết thay vì tin vào một lần select duy nhất.
const PAGE_SIZE = 1000;

async function sumCompletedRevenue(): Promise<number> {
  let total = 0;
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'completed')
      .order('id')
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    if (!data || data.length === 0) return total;
    total += data.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    if (data.length < PAGE_SIZE) return total;
  }
}

interface Stats {
  products: number;
  orders: number;
  posts: number;
  coupons: number;
  revenue: number;
  pending_orders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    products: 0, orders: 0, posts: 0, coupons: 0, revenue: 0, pending_orders: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [products, orders, pendingOrders, posts, coupons, revenue] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('posts').select('id', { count: 'exact', head: true }),
          supabase.from('coupons').select('id', { count: 'exact', head: true }),
          sumCompletedRevenue(),
        ]);

        for (const res of [products, orders, pendingOrders, posts, coupons]) {
          if (res.error) throw res.error;
        }

        setStats({
          products: products.count || 0,
          orders: orders.count || 0,
          posts: posts.count || 0,
          coupons: coupons.count || 0,
          revenue,
          pending_orders: pendingOrders.count || 0,
        });
      } catch (err: unknown) {
        console.error('Dashboard stats error:', err);
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Không tải được số liệu tổng quan: ${msg}`);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    { label: 'Sản phẩm', value: stats.products, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Đơn hàng', value: stats.orders, icon: ShoppingCart, color: 'bg-green-50 text-green-600', sub: `${stats.pending_orders} chờ xử lý` },
    { label: 'Bài viết', value: stats.posts, icon: FileText, color: 'bg-purple-50 text-purple-600' },
    { label: 'Mã giảm giá', value: stats.coupons, icon: Tag, color: 'bg-orange-50 text-orange-600' },
    { label: 'Doanh thu', value: formatPrice(stats.revenue), icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Đơn chờ', value: stats.pending_orders, icon: TrendingUp, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold font-serif text-burgundy mb-6">Tổng quan</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-5 border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            {card.sub && <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
