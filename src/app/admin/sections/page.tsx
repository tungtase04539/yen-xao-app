'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Pencil, Trash2, Factory, Home, FileText } from 'lucide-react';
import { toast } from 'sonner';

const typeLabels: Record<string, { label: string; icon: string }> = {
  'nha-may': { label: 'Nhà Máy', icon: '🏭' },
  'nha-yen': { label: 'Nhà Yến', icon: '🏠' },
  'co-so-thuc-te': { label: 'Cơ Sở Thực Tế', icon: '📸' },
  'other': { label: 'Khác', icon: '📋' },
};

interface Section {
  id: string;
  title: string;
  section_type: string;
  sort_order: number;
  is_published: boolean;
  media_count?: number;
}

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSections = async () => {
    const { data } = await supabase
      .from('page_sections')
      .select('*, section_media(count)')
      .eq('page_slug', 'gioi-thieu')
      .order('sort_order');
    if (data) {
      setSections(data.map((s: Record<string, unknown>) => ({
        ...s,
        media_count: (s.section_media as { count: number }[])?.[0]?.count || 0,
      })) as Section[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSections(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa mục này?')) return;
    const { error } = await supabase.from('page_sections').delete().eq('id', id);
    if (error) { toast.error('Xóa thất bại'); return; }
    toast.success('Đã xóa');
    fetchSections();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-burgundy" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-serif text-burgundy">Mục giới thiệu</h1>
        <Link href="/admin/sections/new">
          <Button className="bg-burgundy hover:bg-burgundy-light gap-2">
            <Plus className="w-4 h-4" /> Thêm mục
          </Button>
        </Link>
      </div>

      <p className="text-sm text-muted-foreground mb-4">Quản lý các mục hiển thị trên trang Giới Thiệu (Nhà Máy, Nhà Yến...)</p>

      {sections.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Factory className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Chưa có mục nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-border/50 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-lg">{typeLabels[s.section_type]?.icon || '📋'}</span>
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {s.is_published ? 'Hiện' : 'Ẩn'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{typeLabels[s.section_type]?.label || s.section_type}</span>
                  <span>📷 {s.media_count} ảnh/video</span>
                  <span>Thứ tự: {s.sort_order}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/sections/${s.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5"><Pencil className="w-3.5 h-3.5" /> Sửa</Button>
                </Link>
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(s.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
