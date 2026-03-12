import { Metadata } from 'next';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import BackgroundVideo from '@/components/common/BackgroundVideo';
import VideoHeroSection from '@/components/common/VideoHeroSection';
import SectionMediaGrid from '@/components/gioi-thieu/SectionMediaGrid';

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

const isVideo = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

export default async function AboutPage() {
  const [page, sections] = await Promise.all([getAboutPage(), getSections()]);
  const hasVideo = page?.thumbnail && isVideo(page.thumbnail);

  return (
    <div className="min-h-screen">

      {/* ── MOBILE: Video standalone at top, text below ── */}
      {hasVideo && (
        <div className="md:hidden">
          {/* Video — full width, no overlay, no interaction */}
          <VideoHeroSection src={page.thumbnail} fallbackSrc="/zalo-banner.jpg" />

          {/* Text block below video */}
          <section className="py-10 px-4 text-center bg-white">
            <div className="ornament-divider mb-6">
              <span className="text-gold text-lg">✦</span>
            </div>
            <h1 className="text-3xl font-bold font-serif mb-4 tracking-tight text-burgundy">
              {page?.title || 'Giới Thiệu'}
            </h1>
            <p className="text-gray-800 text-sm leading-relaxed mb-6">
              {page?.summary || 'Câu chuyện thương hiệu Yến Sào Cao Cấp — Hành trình mang tinh hoa yến sào đến mọi gia đình Việt'}
            </p>
            <div className="flex justify-center items-center gap-3 text-sm text-gray-400">
              <a href="/" className="hover:text-gold transition-colors">Trang chủ</a>
              <span className="text-gold/50">✦</span>
              <span className="text-gold font-medium">Giới Thiệu</span>
            </div>
          </section>
        </div>
      )}

      {/* ── DESKTOP (md+): Video as background with text overlay ── */}
      {/* Also used on mobile when thumbnail is an image (no video) */}
      <section className={`text-white py-20 md:py-32 relative overflow-hidden ${hasVideo ? 'hidden md:block' : ''}`}>
        {/* Background */}
        {page?.thumbnail && (
          hasVideo ? (
            <BackgroundVideo src={page.thumbnail} />
          ) : (
            <Image
              src={page.thumbnail}
              alt="QiQi Yến Sào - Giới thiệu"
              fill
              priority
              className="object-cover"
              sizes="100vw"
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

              {section.section_media && section.section_media.length > 0 && (
                <SectionMediaGrid
                  media={section.section_media}
                  sectionTitle={section.title}
                  isDark={idx % 2 === 0}
                  initialCount={6}
                />
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
