'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/format';
import { toast } from 'sonner';

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  type: string;
  price: number;
  sale_price: number | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  category: { name: string } | null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('id, name, slug, thumbnail, type, price, sale_price, is_featured, is_active, created_at, category:categories(name)')
      .order('created_at', { ascending: false });
    setProducts((data as unknown as ProductRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return;
    const { error: varError } = await supabase.from('product_variants').delete().eq('product_id', id);
    if (varError) { toast.error('Không thể xóa biến thể sản phẩm'); return; }
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast.error('Xóa sản phẩm thất bại'); return; }
    toast.success('Đã xóa sản phẩm');
    fetchProducts();
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('products').update({ is_active: !current }).eq('id', id);
    if (error) { toast.error('Cập nhật thất bại'); return; }
    toast.success(current ? 'Đã ẩn sản phẩm' : 'Đã hiện sản phẩm');
    fetchProducts();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-serif text-burgundy">Sản phẩm</h1>
        <Link href="/admin/products/new">
          <Button className="bg-burgundy hover:bg-burgundy-light gap-2">
            <Plus className="w-4 h-4" /> Thêm sản phẩm
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Sản phẩm</th>
                <th className="text-left px-4 py-3 font-medium">Danh mục</th>
                <th className="text-left px-4 py-3 font-medium">Giá</th>
                <th className="text-left px-4 py-3 font-medium">Loại</th>
                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 font-medium">Ngày tạo</th>
                <th className="text-right px-4 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Đang tải...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Chưa có sản phẩm nào
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center text-lg shrink-0">
                          {p.thumbnail ? (
                            <div className="w-full h-full rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${p.thumbnail})` }} />
                          ) : '🕊️'}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{p.name}</p>
                          {p.is_featured && <Badge variant="outline" className="text-[10px] border-gold text-gold mt-0.5">Nổi bật</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.category?.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold text-burgundy">
                          {p.type === 'variable' ? (p.price > 0 ? `Từ ${formatPrice(p.price)}` : '—') : formatPrice(p.sale_price || p.price)}
                        </span>
                        {p.type === 'simple' && p.sale_price && p.sale_price < p.price && (
                          <span className="text-xs text-muted-foreground line-through ml-1">
                            {formatPrice(p.price)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs">
                        {p.type === 'variable' ? 'Biến thể' : 'Đơn giản'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(p.id, p.is_active)}>
                        <Badge className={`text-xs cursor-pointer ${p.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                          {p.is_active ? 'Hoạt động' : 'Ẩn'}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link href={`/san-pham/${p.slug}`} target="_blank">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/admin/products/${p.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" onClick={() => handleDelete(p.id, p.name)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
