'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Pencil, Trash2, MapPin, Calendar, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Exhibition {
  id: string;
  title: string;
  location: string;
  event_date: string;
  is_published: boolean;
  sort_order: number;
  image_count?: number;
}

export default function ExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExhibitions = async () => {
    const { data } = await supabase
      .from('exhibitions')
      .select('*, exhibition_images(count)')
      .order('event_date', { ascending: false });

    if (data) {
      setExhibitions(data.map((e: Record<string, unknown>) => ({
        ...e,
        image_count: (e.exhibition_images as { count: number }[])?.[0]?.count || 0,
      })) as Exhibition[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchExhibitions(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa triển lãm này?')) return;
    const { error } = await supabase.from('exhibitions').delete().eq('id', id);
    if (error) { toast.error('Xóa thất bại'); return; }
    toast.success('Đã xóa');
    fetchExhibitions();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-burgundy" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-serif text-burgundy">Triển lãm</h1>
        <Link href="/admin/exhibitions/new">
          <Button className="bg-burgundy hover:bg-burgundy-light gap-2">
            <Plus className="w-4 h-4" /> Thêm triển lãm
          </Button>
        </Link>
      </div>

      {exhibitions.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Chưa có triển lãm nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exhibitions.map((ex) => (
            <div key={ex.id} className="bg-white rounded-xl border border-border/50 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-lg">{ex.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ex.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {ex.is_published ? 'Hiện' : 'Ẩn'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{ex.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(ex.event_date).toLocaleDateString('vi-VN')}</span>
                  <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" />{ex.image_count} ảnh</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/exhibitions/${ex.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5"><Pencil className="w-3.5 h-3.5" /> Sửa</Button>
                </Link>
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(ex.id)}>
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
