'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  type: string;
  sort_order: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editType, setEditType] = useState('product');
  const [editImage, setEditImage] = useState('');
  const [showNew, setShowNew] = useState(false);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('type').order('sort_order');
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const generateSlug = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSave = async () => {
    if (!editName.trim()) return;
    const slug = editSlug || generateSlug(editName);

    if (editId) {
      const { error } = await supabase.from('categories').update({ name: editName, slug, type: editType, image: editImage || null }).eq('id', editId);
      if (error) { toast.error(`Cập nhật thất bại: ${error.message}`); return; }
      toast.success('Đã cập nhật danh mục');
    } else {
      const { data, error } = await supabase.from('categories').insert({ name: editName, slug, type: editType, image: editImage || null, sort_order: categories.length }).select('id');
      if (error) { toast.error(`Thêm thất bại: ${error.message}`); return; }
      if (!data || data.length === 0) { toast.error('Thêm thất bại: Kiểm tra RLS policy bảng categories'); return; }
      toast.success('Đã thêm danh mục mới');
    }

    setEditId(null);
    setEditName('');
    setEditSlug('');
    setEditImage('');
    setShowNew(false);
    fetchCategories();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa danh mục "${name}"?`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { toast.error(`Xóa thất bại: ${error.message}`); return; }
    toast.success('Đã xóa danh mục');
    fetchCategories();
  };

  const startEdit = (cat: CategoryRow) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditType(cat.type);
    setEditImage(cat.image || '');
    setShowNew(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-serif text-burgundy">Danh mục</h1>
        <Button onClick={() => { setShowNew(true); setEditId(null); setEditName(''); setEditSlug(''); setEditType('product'); setEditImage(''); }} className="bg-burgundy hover:bg-burgundy-light gap-2">
          <Plus className="w-4 h-4" /> Thêm danh mục
        </Button>
      </div>

      {/* New/Edit Form */}
      {(showNew || editId) && (
        <div className="bg-white rounded-xl p-5 border border-border/50 shadow-sm mb-6 space-y-3">
          <h2 className="text-sm font-semibold">{editId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Tên danh mục" value={editName} onChange={(e) => { setEditName(e.target.value); if (!editId) setEditSlug(generateSlug(e.target.value)); }} />
            <Input placeholder="Slug" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
            <select value={editType} onChange={(e) => setEditType(e.target.value)} className="h-10 rounded-md border border-input px-3 text-sm bg-white">
              <option value="product">Sản phẩm</option>
              <option value="blog">Bài viết</option>
            </select>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-burgundy hover:bg-burgundy-light gap-1 flex-1">
                <Save className="w-3.5 h-3.5" /> Lưu
              </Button>
              <Button variant="ghost" onClick={() => { setShowNew(false); setEditId(null); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <ImageUpload value={editImage} onChange={setEditImage} bucket="general" folder="categories" label="Ảnh danh mục" />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Ảnh</th>
              <th className="text-left px-4 py-3 font-medium">Tên danh mục</th>
              <th className="text-left px-4 py-3 font-medium">Slug</th>
              <th className="text-left px-4 py-3 font-medium">Loại</th>
              <th className="text-right px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Đang tải...</td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <div className="w-10 h-10 rounded-lg bg-cream overflow-hidden flex items-center justify-center">
                    {cat.image ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" /> : <span className="text-lg">{cat.type === 'product' ? '🛒' : '📝'}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{cat.slug}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="text-xs">
                    {cat.type === 'product' ? '🛒 Sản phẩm' : '📝 Bài viết'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEdit(cat)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => handleDelete(cat.id, cat.name)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
