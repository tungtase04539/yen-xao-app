import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Giới Thiệu',
  description: 'Câu chuyện thương hiệu Yến Sào Cao Cấp - Hành trình mang tinh hoa yến sào đến mọi gia đình Việt.',
};

async function getAboutPage() {
  const { data } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'gioi-thieu')
    .single();
  return data;
}

export default async function AboutPage() {
  const page = await getAboutPage();

  return (
    <div className="min-h-screen">
      {/* Hero Section — Luxury Dark with Gold accents */}
      <section className="bg-gradient-dark-luxury text-white py-20 md:py-32 relative overflow-hidden">
        {/* Gold decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          <div className="absolute top-[20%] left-[10%] w-80 h-80 rounded-full bg-gold/[0.03] blur-[120px]" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-gold/[0.04] blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 text-center relative">
          <div className="ornament-divider mb-8">
            <span className="text-gold text-lg">✦</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-5 tracking-tight">
            {page?.title || 'Giới Thiệu'}
          </h1>
          <p className="text-white/50 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            {page?.summary || 'Câu chuyện thương hiệu Yến Sào Cao Cấp — Hành trình mang tinh hoa yến sào đến mọi gia đình Việt'}
          </p>
          {/* Breadcrumbs */}
          <div className="flex justify-center items-center gap-3 mt-8 text-sm text-white/30">
            <a href="/" className="hover:text-gold transition-colors">Trang chủ</a>
            <span className="text-gold/30">✦</span>
            <span className="text-gold/70">Giới Thiệu</span>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24 bg-gradient-luxury">
        <div className="container mx-auto px-4">
          {page?.content ? (
            <div className="max-w-4xl mx-auto">
              {/* Rich Text Content with luxury prose styling */}
              <div
                className="luxury-prose"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />

              {/* Stats Section */}
              <div className="mt-20 md:mt-28 grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { number: '15+', label: 'Năm kinh nghiệm' },
                  { number: '50K+', label: 'Khách hàng tin dùng' },
                  { number: '100%', label: 'Yến sào nguyên chất' },
                  { number: '6+', label: 'Chứng nhận quốc tế' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-8 md:p-10 rounded-2xl luxury-card group hover:gold-glow transition-all duration-300 overflow-hidden">
                    <p className="text-4xl md:text-5xl font-bold text-gradient-gold mb-3" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>{stat.number}</p>
                    <p className="text-sm md:text-base text-muted-foreground uppercase tracking-widest font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p>Nội dung đang được cập nhật...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
