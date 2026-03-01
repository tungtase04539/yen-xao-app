'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import ImageUpload from '@/components/admin/ImageUpload';
import GalleryUpload from '@/components/admin/GalleryUpload';
import { Loader2, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-[200px] border rounded-lg flex items-center justify-center text-muted-foreground text-sm">Đang tải editor...</div>,
});

interface Variant {
  id?: string;
  title: string;
  price: number;
  sale_price: number | null;
  stock: number;
  sort_order: number;
  is_active: boolean;
}

interface Category { id: string; name: string; slug: string }

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<'simple' | 'variable'>('simple');
  const [price, setPrice] = useState(0);
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [stock, setStock] = useState(100);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [imageGallery, setImageGallery] = useState<string[]>([]);

  // Auto-slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  useEffect(() => {
    supabase.from('categories').select('id, name, slug').eq('type', 'product').order('sort_order').then(({ data }) => {
      setCategories(data || []);
    });

    if (!isNew) {
      supabase.from('products').select('*, variants:product_variants(*)').eq('id', id).single().then(({ data }) => {
        if (data) {
          setName(data.name);
          setSlug(data.slug);
          setThumbnail(data.thumbnail || '');
          setShortDesc(data.short_description || '');
          setContent(data.content || '');
          setCategoryId(data.category_id || '');
          setType(data.type);
          setPrice(data.price || 0);
          setSalePrice(data.sale_price || '');
          setStock(data.stock || 0);
          setIsFeatured(data.is_featured);
          setIsActive(data.is_active);
          setImageGallery(data.image_gallery || []);
          if (data.variants) {
            setVariants(data.variants.sort((a: Variant, b: Variant) => a.sort_order - b.sort_order));
          }
        }
        setLoading(false);
      });
    }
  }, [id, isNew]);

  const addVariant = () => {
    setVariants([...variants, {
      title: '',
      price: 0,
      sale_price: null,
      stock: 100,
      sort_order: variants.length,
      is_active: true,
    }]);
  };

  const updateVariant = (index: number, field: string, value: unknown) => {
    const updated = [...variants];
    (updated[index] as unknown as Record<string, unknown>)[field] = value;
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name,
        slug: slug || generateSlug(name),
        thumbnail: thumbnail || null,
        short_description: shortDesc || null,
        content: content || null,
        category_id: categoryId || null,
        type,
        price: type === 'simple' ? price : 0,
        sale_price: type === 'simple' && salePrice ? Number(salePrice) : null,
        stock: type === 'simple' ? stock : 0,
        is_featured: isFeatured,
        is_active: isActive,
        image_gallery: imageGallery,
      };

      let productId = id;

      if (isNew) {
        const { data, error } = await supabase.from('products').insert(productData).select('id').single();
        if (error) throw error;
        productId = data.id;
      } else {
        const { error } = await supabase.from('products').update(productData).eq('id', id);
        if (error) throw error;
      }

      // Handle variants for variable products
      if (type === 'variable') {
        // Delete old variants
        if (!isNew) {
          await supabase.from('product_variants').delete().eq('product_id', productId);
        }
        // Insert new
        if (variants.length > 0) {
          const variantData = variants.map((v, i) => ({
            product_id: productId,
            title: v.title,
            price: v.price,
            sale_price: v.sale_price || null,
            stock: v.stock,
            sort_order: i,
            is_active: v.is_active,
          }));
          const { error } = await supabase.from('product_variants').insert(variantData);
          if (error) throw error;
        }
      }

      toast.success(isNew ? 'Tạo sản phẩm thành công!' : 'Cập nhật thành công!');
      router.push('/admin/products');
    } catch (err) {
      console.error(err);
      toast.error('Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-burgundy" /></div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold font-serif text-burgundy">
            {isNew ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-burgundy hover:bg-burgundy-light gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Lưu
        </Button>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-foreground">Thông tin cơ bản</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Tên sản phẩm *</label>
              <Input value={name} onChange={(e) => { setName(e.target.value); if (isNew) setSlug(generateSlug(e.target.value)); }} placeholder="Yến Sào Tinh Chế Nguyên Tổ" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Slug</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="yen-sao-tinh-che" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Danh mục</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-10 rounded-md border border-input px-3 text-sm bg-white">
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="grid md:grid-cols-2 gap-4">
            <ImageUpload value={thumbnail} onChange={setThumbnail} bucket="products" folder="thumbnails" label="Ảnh đại diện" />
          </div>

          {/* Gallery Upload */}
          <GalleryUpload value={imageGallery} onChange={setImageGallery} bucket="products" folder="gallery" max={8} />

          <div>
            <label className="block text-sm font-medium mb-1.5">Mô tả ngắn</label>
            <textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} rows={2} className="w-full rounded-md border border-input px-3 py-2 text-sm resize-none" placeholder="Mô tả ngắn hiển thị trên trang chi tiết..." />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-burgundy" />
              <span className="text-sm">Sản phẩm nổi bật</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-burgundy" />
              <span className="text-sm">Hiển thị</span>
            </label>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Giá & Kho hàng</h2>
            <select value={type} onChange={(e) => setType(e.target.value as 'simple' | 'variable')} className="text-sm border border-input rounded-md px-3 py-1.5 bg-white">
              <option value="simple">Sản phẩm đơn giản</option>
              <option value="variable">Sản phẩm có biến thể</option>
            </select>
          </div>

          {type === 'simple' ? (
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Giá gốc (₫)</label>
                <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Giá sale (₫)</label>
                <Input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : '')} placeholder="Để trống nếu không sale" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Tồn kho</label>
                <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-muted-foreground">Biến thể sản phẩm</p>
                <Button type="button" variant="outline" size="sm" onClick={addVariant} className="gap-1">
                  <Plus className="w-3.5 h-3.5" /> Thêm biến thể
                </Button>
              </div>
              {variants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Chưa có biến thể. Nhấn &quot;Thêm biến thể&quot; để tạo.</p>
              ) : (
                <div className="space-y-3">
                  {variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2 items-end p-3 bg-secondary/30 rounded-lg">
                      <div>
                        <label className="block text-[11px] font-medium mb-1">Tên (VD: 50g)</label>
                        <Input value={v.title} onChange={(e) => updateVariant(i, 'title', e.target.value)} className="h-9 text-sm" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium mb-1">Giá gốc</label>
                        <Input type="number" value={v.price} onChange={(e) => updateVariant(i, 'price', Number(e.target.value))} className="h-9 text-sm" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium mb-1">Giá sale</label>
                        <Input type="number" value={v.sale_price || ''} onChange={(e) => updateVariant(i, 'sale_price', e.target.value ? Number(e.target.value) : null)} className="h-9 text-sm" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium mb-1">Tồn kho</label>
                        <Input type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', Number(e.target.value))} className="h-9 text-sm" />
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(i)} className="h-9 text-red-500 hover:text-red-700">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-foreground">Nội dung chi tiết</h2>
          <RichTextEditor content={content} onChange={setContent} placeholder="Mô tả chi tiết sản phẩm..." />
        </div>
      </div>
    </div>
  );
}
