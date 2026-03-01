'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, ShoppingCart, FileText, Tag, TrendingUp, DollarSign } from 'lucide-react';
import { formatPrice } from '@/lib/format';

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
      const [products, orders, posts, coupons] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total_amount, status'),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('coupons').select('id', { count: 'exact', head: true }),
      ]);

      const orderData = orders.data || [];
      const revenue = orderData
        .filter((o) => o.status === 'completed')
        .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      const pending = orderData.filter((o) => o.status === 'pending').length;

      setStats({
        products: products.count || 0,
        orders: orderData.length,
        posts: posts.count || 0,
        coupons: coupons.count || 0,
        revenue,
        pending_orders: pending,
      });
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
