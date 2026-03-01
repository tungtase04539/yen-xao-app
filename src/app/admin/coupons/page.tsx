'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice, formatDate } from '@/lib/format';

interface CouponRow {
  id: string;
  code: string;
  discount_type: string;
  discount_amount: number;
  min_order_amount: number;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percent');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [minOrder, setMinOrder] = useState(0);
  const [maxUses, setMaxUses] = useState(100);
  const [endDate, setEndDate] = useState('');

  const fetchCoupons = async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const resetForm = () => {
    setCode(''); setDiscountType('percent'); setDiscountAmount(0);
    setMinOrder(0); setMaxUses(100); setEndDate('');
    setEditId(null); setShowForm(false);
  };

  const startEdit = (c: CouponRow) => {
    setEditId(c.id); setCode(c.code); setDiscountType(c.discount_type);
    setDiscountAmount(c.discount_amount); setMinOrder(c.min_order_amount);
    setMaxUses(c.max_uses); setEndDate(c.end_date?.split('T')[0] || '');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!code.trim()) return;
    const data = {
      code: code.toUpperCase(),
      discount_type: discountType,
      discount_amount: discountAmount,
      min_order_amount: minOrder,
      max_uses: maxUses,
      end_date: endDate ? new Date(endDate).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
      is_active: true,
    };

    if (editId) {
      await supabase.from('coupons').update(data).eq('id', editId);
      toast.success('Đã cập nhật mã giảm giá');
    } else {
      await supabase.from('coupons').insert({ ...data, start_date: new Date().toISOString(), current_uses: 0 });
      toast.success('Đã tạo mã giảm giá mới');
    }
    resetForm();
    fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa mã giảm giá này?')) return;
    await supabase.from('coupons').delete().eq('id', id);
    fetchCoupons();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('coupons').update({ is_active: !active }).eq('id', id);
    fetchCoupons();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-serif text-burgundy">Mã giảm giá</h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-burgundy hover:bg-burgundy-light gap-2">
          <Plus className="w-4 h-4" /> Thêm mã
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 border border-border/50 shadow-sm mb-6 space-y-3">
          <h2 className="text-sm font-semibold">{editId ? 'Chỉnh sửa' : 'Thêm mã mới'}</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Mã giảm giá</label>
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SALE20" className="uppercase" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Loại</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="w-full h-10 rounded-md border border-input px-3 text-sm bg-white">
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (₫)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Giá trị giảm</label>
              <Input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Đơn tối thiểu (₫)</label>
              <Input type="number" value={minOrder} onChange={(e) => setMinOrder(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Số lần sử dụng tối đa</label>
              <Input type="number" value={maxUses} onChange={(e) => setMaxUses(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Ngày hết hạn</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-burgundy hover:bg-burgundy-light gap-1">
              <Save className="w-3.5 h-3.5" /> Lưu
            </Button>
            <Button variant="ghost" onClick={resetForm}><X className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Mã</th>
                <th className="text-left px-4 py-3 font-medium">Giảm giá</th>
                <th className="text-left px-4 py-3 font-medium">Đơn tối thiểu</th>
                <th className="text-left px-4 py-3 font-medium">Đã dùng</th>
                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 font-medium">Hết hạn</th>
                <th className="text-right px-4 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Đang tải...</td></tr>
              ) : coupons.map((c) => (
                <tr key={c.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono font-bold text-burgundy">{c.code}</td>
                  <td className="px-4 py-3">
                    {c.discount_type === 'percent' ? `${c.discount_amount}%` : formatPrice(c.discount_amount)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatPrice(c.min_order_amount)}</td>
                  <td className="px-4 py-3">{c.current_uses}/{c.max_uses}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c.id, c.is_active)}>
                      <Badge className={`text-xs cursor-pointer ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.is_active ? 'Hoạt động' : 'Tắt'}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(c.end_date)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEdit(c)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
