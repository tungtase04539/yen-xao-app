'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2, Shield, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

interface Cert {
  id: string;
  name: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

export default function CertificationsAdminPage() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCerts = async () => {
    const { data } = await supabase
      .from('certifications')
      .select('*')
      .order('sort_order');
    if (data) setCerts(data);
    setLoading(false);
  };

  useEffect(() => { fetchCerts(); }, []);

  const addCert = () => {
    setCerts([...certs, {
      id: `new-${Date.now()}`,
      name: '',
      description: '',
      image_url: '',
      sort_order: certs.length + 1,
      is_active: true,
    }]);
  };

  const updateCert = (idx: number, field: keyof Cert, value: string | number | boolean) => {
    setCerts(certs.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const removeCert = async (idx: number) => {
    const cert = certs[idx];
    if (!cert.id.startsWith('new-')) {
      if (!confirm('Xóa chứng nhận này?')) return;
      await supabase.from('certifications').delete().eq('id', cert.id);
      toast.success('Đã xóa');
    }
    setCerts(certs.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < certs.length; i++) {
        const cert = certs[i];
        const payload = {
          name: cert.name,
          description: cert.description || null,
          image_url: cert.image_url || null,
          sort_order: i + 1,
          is_active: cert.is_active,
        };

        if (cert.id.startsWith('new-')) {
          const { error } = await supabase.from('certifications').insert(payload);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('certifications').update(payload).eq('id', cert.id);
          if (error) throw error;
        }
      }
      toast.success('Lưu thành công!');
      fetchCerts();
    } catch {
      toast.error('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-burgundy" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-serif text-burgundy">Chứng Nhận Chất Lượng</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý các chứng nhận hiển thị trên trang chủ</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addCert} className="gap-2">
            <Plus className="w-4 h-4" /> Thêm
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-burgundy hover:bg-burgundy-light gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Lưu tất cả
          </Button>
        </div>
      </div>

      {certs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Chưa có chứng nhận nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certs.map((cert, idx) => (
            <div key={cert.id} className="bg-white rounded-xl border border-border/50 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-muted-foreground/40">
                  <GripVertical className="w-5 h-5" />
                  <span className="text-xs font-medium">#{idx + 1}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => removeCert(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Fields */}
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Tên chứng nhận *</label>
                  <Input
                    value={cert.name}
                    onChange={(e) => updateCert(idx, 'name', e.target.value)}
                    placeholder="VD: ISO 22000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Mô tả</label>
                  <Input
                    value={cert.description}
                    onChange={(e) => updateCert(idx, 'description', e.target.value)}
                    placeholder="VD: Hệ thống quản lý ATTP"
                  />
                </div>
              </div>

              {/* Image upload — full width */}
              <div className="mb-3">
                <ImageUpload
                  value={cert.image_url}
                  onChange={(url) => updateCert(idx, 'image_url', url)}
                  bucket="certifications"
                  folder="badges"
                  label="Ảnh badge"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={cert.is_active}
                  onChange={(e) => updateCert(idx, 'is_active', e.target.checked)}
                  className="rounded border-gray-300"
                />
                Hiển thị
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
