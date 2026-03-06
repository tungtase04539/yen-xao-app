import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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

async function getSections() {
  const { data } = await supabase
    .from('page_sections')
    .select('*, section_media(*)')
    .eq('page_slug', 'gioi-thieu')
    .eq('is_published', true)
    .order('sort_order');
  return data || [];
}

export default async function AboutPage() {
  const [page, sections] = await Promise.all([getAboutPage(), getSections()]);

  return (
    <div className="min-h-screen">
      {/* Hero Section — Thumbnail background with dark overlay */}
      <section className="text-white py-20 md:py-32 relative overflow-hidden">
        {/* Background image/gif/video */}
        {page?.thumbnail && (
          /\.(mp4|webm|ogg)(\?.*)?$/i.test(page.thumbnail) ? (
            <video
              src={page.thumbnail}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ zIndex: 0 }}
            />
          ) : (
            <img
              src={page.thumbnail}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ zIndex: 0 }}
            />
          )
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-dark-luxury" style={page?.thumbnail ? { opacity: 0.85 } : undefined} />
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-5 tracking-tight" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            {page?.title || 'Giới Thiệu'}
          </h1>
          <p className="text-white/80 max-w-xl mx-auto text-sm md:text-base leading-relaxed" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.4)' }}>
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
              <div
                className="luxury-prose"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p>Nội dung đang được cập nhật...</p>
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Sections (Nhà Máy, Nhà Yến, etc.) */}
      {sections.map((section: { id: string; title: string; section_type: string; description: string; section_media: { id: string; media_url: string; media_type: string; caption: string; sort_order?: number }[] }, idx: number) => (
        <section key={section.id} className={`py-16 md:py-24 ${idx % 2 === 0 ? 'bg-gradient-dark-luxury text-white' : 'bg-gradient-luxury'}`}>
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12">
                <div className="ornament-divider mb-6">
                  <span className="text-gold text-lg">
                    {section.section_type === 'nha-may' ? '🏭' : section.section_type === 'nha-yen' ? '🏠' : '✦'}
                  </span>
                </div>
                <h2 className={`text-3xl md:text-4xl font-bold font-serif mb-4 ${idx % 2 === 0 ? 'text-white' : ''}`}>
                  {section.title}
                </h2>
                {section.description && (
                  <p className={`max-w-2xl mx-auto text-base leading-relaxed ${idx % 2 === 0 ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {section.description}
                  </p>
                )}
              </div>

              {/* Media Grid */}
              {section.section_media && section.section_media.length > 0 && (
                <div className={`grid gap-4 ${
                  section.section_media.length === 1 ? 'grid-cols-1 max-w-3xl mx-auto' :
                  section.section_media.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                  'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}>
                  {section.section_media
                    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                    .map((m) => (
                    <div key={m.id} className="rounded-2xl overflow-hidden border border-gold/10 shadow-lg group">
                      {m.media_type === 'video' ? (
                        <video
                          src={m.media_url}
                          controls
                          className="w-full aspect-video object-cover"
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={m.media_url}
                          alt={m.caption || section.title}
                          className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      {m.caption && (
                        <div className={`px-4 py-3 text-sm ${idx % 2 === 0 ? 'text-white/60' : 'text-muted-foreground'}`}>
                          {m.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
