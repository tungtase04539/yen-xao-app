'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Save, X, GripVertical, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

interface SlideRow {
  id: string;
  title: string | null;
  subtitle: string | null;
  button_text: string;
  button_link: string;
  background_image: string | null;
  mobile_image: string | null;
  gradient: string;
  sort_order: number;
  is_active: boolean;
}

const defaultGradients = [
  { value: 'from-burgundy-dark via-burgundy to-burgundy-light', label: 'Đỏ Burgundy' },
  { value: 'from-amber-900 via-amber-800 to-amber-700', label: 'Vàng Amber' },
  { value: 'from-rose-900 via-rose-800 to-rose-700', label: 'Hồng Rose' },
  { value: 'from-emerald-900 via-emerald-800 to-emerald-700', label: 'Xanh Emerald' },
  { value: 'from-indigo-900 via-indigo-800 to-indigo-700', label: 'Tím Indigo' },
  { value: 'from-slate-900 via-slate-800 to-slate-700', label: 'Xám Slate' },
];

export default function AdminSlidesPage() {
  const [slides, setSlides] = useState<SlideRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [buttonText, setButtonText] = useState('Khám Phá Ngay');
  const [buttonLink, setButtonLink] = useState('/san-pham');
  const [bgImage, setBgImage] = useState('');
  const [mobileImage, setMobileImage] = useState('');
  const [gradient, setGradient] = useState(defaultGradients[0].value);
  const [isActive, setIsActive] = useState(true);

  const fetchSlides = async () => {
    const { data } = await supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order');
    setSlides(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSlides(); }, []);

  const resetForm = () => {
    setTitle(''); setSubtitle(''); setButtonText('Khám Phá Ngay');
    setButtonLink('/san-pham'); setBgImage(''); setMobileImage('');
    setGradient(defaultGradients[0].value); setIsActive(true);
    setEditId(null); setShowForm(false);
  };

  const startEdit = (s: SlideRow) => {
    setEditId(s.id);
    setTitle(s.title || '');
    setSubtitle(s.subtitle || '');
    setButtonText(s.button_text);
    setButtonLink(s.button_link);
    setBgImage(s.background_image || '');
    setMobileImage(s.mobile_image || '');
    setGradient(s.gradient);
    setIsActive(s.is_active);
    setShowForm(true);
  };

  const handleSave = async () => {

    const data = {
      title: title.trim() || null,
      subtitle: subtitle || null,
      button_text: buttonText || 'Khám Phá Ngay',
      button_link: buttonLink || '/san-pham',
      background_image: bgImage || null,
      mobile_image: mobileImage || null,
      gradient,
      is_active: isActive,
    };

    if (editId) {
      const { error } = await supabase.from('hero_slides').update(data).eq('id', editId);
      if (error) { toast.error('Cập nhật thất bại'); return; }
      toast.success('Đã cập nhật slide');
    } else {
      const { error } = await supabase.from('hero_slides').insert({
        ...data,
        sort_order: slides.length,
      });
      if (error) { toast.error('Thêm slide thất bại'); return; }
      toast.success('Đã thêm slide mới');
    }

    resetForm();
    fetchSlides();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa slide này?')) return;
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) { toast.error('Xóa thất bại'); return; }
    toast.success('Đã xóa slide');
    fetchSlides();
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from('hero_slides').update({ is_active: !active }).eq('id', id);
    if (error) { toast.error('Cập nhật thất bại'); return; }
    toast.success(active ? 'Đã ẩn slide' : 'Đã hiện slide');
    fetchSlides();
  };

  const moveSlide = async (id: string, direction: 'up' | 'down') => {
    const idx = slides.findIndex(s => s.id === id);
    if (direction === 'up' && idx <= 0) return;
    if (direction === 'down' && idx >= slides.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    await supabase.from('hero_slides').update({ sort_order: slides[swapIdx].sort_order }).eq('id', slides[idx].id);
    await supabase.from('hero_slides').update({ sort_order: slides[idx].sort_order }).eq('id', slides[swapIdx].id);
    fetchSlides();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-serif text-burgundy">Hero Slider</h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-burgundy hover:bg-burgundy-light gap-2">
          <Plus className="w-4 h-4" /> Thêm slide
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm mb-6 space-y-4">
          <h2 className="text-sm font-semibold">{editId ? 'Chỉnh sửa slide' : 'Thêm slide mới'}</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Tiêu đề <span className="text-muted-foreground">(tùy chọn)</span></label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input px-3 py-2 text-sm resize-none"
                placeholder="Yến Sào Tinh Chế&#10;Nguyên Chất 100%"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Xuống dòng = Enter để tách 2 dòng</p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Mô tả phụ</label>
              <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Từ đảo yến thiên nhiên Khánh Hòa" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Tên nút bấm</label>
              <Input value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="Khám Phá Ngay" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Link nút bấm</label>
              <Input value={buttonLink} onChange={(e) => setButtonLink(e.target.value)} placeholder="/san-pham hoặc /blog/slug" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Gradient nền</label>
              <select value={gradient} onChange={(e) => setGradient(e.target.value)} className="w-full h-10 rounded-md border border-input px-3 text-sm bg-white">
                {defaultGradients.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
                Hiển thị
              </label>
            </div>
          </div>

          <ImageUpload value={bgImage} onChange={setBgImage} bucket="general" folder="hero" label="🖥️ Ảnh nền Desktop (tùy chọn — nếu không có sẽ dùng gradient)" />

          {/* Mobile image — separate 1:1 square */}
          <div className="space-y-1">
            <ImageUpload value={mobileImage} onChange={setMobileImage} bucket="general" folder="hero/mobile" label="📱 Ảnh Mobile (vuông 1:1 — nếu để trống sẽ dùng ảnh Desktop)" />
            {mobileImage && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-border shrink-0">
                  <img src={mobileImage} alt="Mobile preview" className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] text-muted-foreground">Preview ảnh mobile (1:1)</p>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className={`relative h-32 rounded-lg overflow-hidden bg-gradient-to-br ${gradient}`}>
            {bgImage && (
              <img src={bgImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="relative z-10 flex items-center h-full px-6">
              <div>
                <p className="text-white font-bold font-serif text-lg whitespace-pre-line leading-tight">{title || 'Tiêu đề...'}</p>
                {subtitle && <p className="text-white/70 text-xs mt-1">{subtitle}</p>}
                <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-amber-300 to-amber-500 text-burgundy text-xs font-semibold rounded-full">
                  {buttonText || 'Nút bấm'}
                </span>
              </div>
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

      {/* Slides List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
        ) : slides.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-white rounded-xl border border-border/50">
            Chưa có slide nào. Hãy thêm slide đầu tiên!
          </div>
        ) : slides.map((s, i) => (
          <div key={s.id} className={`bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden ${!s.is_active ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4 p-4">
              {/* Sort controls */}
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => moveSlide(s.id, 'up')} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs">▲</button>
                <GripVertical className="w-4 h-4 text-muted-foreground/40" />
                <button onClick={() => moveSlide(s.id, 'down')} disabled={i === slides.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs">▼</button>
              </div>

              {/* Preview thumbnail */}
              <div className={`relative w-40 h-20 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br ${s.gradient}`}>
                {s.background_image && (
                  <img src={s.background_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="relative z-10 flex items-center h-full px-3">
                  <p className="text-white text-xs font-bold font-serif whitespace-pre-line leading-tight line-clamp-2">{s.title || <span className="opacity-50 italic">Chỉ ảnh nền</span>}</p>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm line-clamp-1">{s.title ? s.title.replace('\n', ' ') : <span className="text-muted-foreground italic">Chỉ ảnh nền</span>}</p>
                {s.subtitle && <p className="text-xs text-muted-foreground line-clamp-1">{s.subtitle}</p>}
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="secondary" className="text-[10px]">{s.button_text}</Badge>
                  <span className="text-[10px] text-muted-foreground">→ {s.button_link}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleActive(s.id, s.is_active)}>
                  {s.is_active ? <Eye className="w-3.5 h-3.5 text-green-600" /> : <EyeOff className="w-3.5 h-3.5 text-red-400" />}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEdit(s)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => handleDelete(s.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
