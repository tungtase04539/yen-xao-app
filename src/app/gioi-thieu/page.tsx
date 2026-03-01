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
      {/* Hero */}
      <section className="bg-gradient-hero text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">
            {page?.title || 'Giới Thiệu'}
          </h1>
          <p className="text-white/70 max-w-xl mx-auto">
            {page?.summary || 'Câu chuyện thương hiệu Yến Sào Cao Cấp'}
          </p>
          {/* Breadcrumbs */}
          <div className="flex justify-center items-center gap-2 mt-6 text-sm text-white/50">
            <a href="/" className="hover:text-gold transition-colors">Trang chủ</a>
            <span>/</span>
            <span className="text-gold">Giới Thiệu</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          {page?.content ? (
            <div className="max-w-4xl mx-auto">
              {/* Alternating layout sections */}
              <div className="space-y-16 md:space-y-24">
                {/* Section 1: Sứ Mệnh */}
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 text-gold-dark text-sm mb-4">
                      <span className="w-2 h-2 rounded-full bg-gold" />
                      01 — Sứ Mệnh
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold font-serif text-burgundy mb-4">
                      Sứ Mệnh Của Chúng Tôi
                    </h2>
                    <p className="text-foreground/70 leading-relaxed">
                      Chúng tôi mang đến những sản phẩm yến sào nguyên chất, tinh khiết nhất từ thiên nhiên.
                      Với quy trình sản xuất nghiêm ngặt và đội ngũ nghệ nhân giàu kinh nghiệm,
                      mỗi sản phẩm đều là kết tinh của tâm huyết và chất lượng.
                    </p>
                  </div>
                  <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-cream to-secondary flex items-center justify-center text-8xl shadow-inner">
                    🕊️
                  </div>
                </div>

                {/* Section 2: Tầm Nhìn (reversed) */}
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                  <div className="order-2 md:order-1 aspect-[4/3] rounded-2xl bg-gradient-to-br from-secondary to-cream flex items-center justify-center text-8xl shadow-inner">
                    🌊
                  </div>
                  <div className="order-1 md:order-2">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 text-gold-dark text-sm mb-4">
                      <span className="w-2 h-2 rounded-full bg-gold" />
                      02 — Tầm Nhìn
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold font-serif text-burgundy mb-4">
                      Tầm Nhìn Chiến Lược
                    </h2>
                    <p className="text-foreground/70 leading-relaxed">
                      Trở thành thương hiệu yến sào hàng đầu Việt Nam, được tin cậy bởi hàng triệu gia đình.
                      Chúng tôi không ngừng đổi mới và nâng cao chất lượng để xứng đáng với niềm tin của khách hàng.
                    </p>
                  </div>
                </div>

                {/* Section 3: Triết Lý */}
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 text-gold-dark text-sm mb-4">
                      <span className="w-2 h-2 rounded-full bg-gold" />
                      03 — Triết Lý
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold font-serif text-burgundy mb-4">
                      Triết Lý Kinh Doanh
                    </h2>
                    <p className="text-foreground/70 leading-relaxed">
                      Chất lượng là nền tảng, uy tín là hàng đầu. Mỗi sản phẩm đều trải qua kiểm định nghiêm ngặt
                      trước khi đến tay người tiêu dùng. Chúng tôi cam kết không sử dụng chất bảo quản,
                      phụ gia hay bất kỳ hóa chất nào.
                    </p>
                  </div>
                  <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-cream to-secondary flex items-center justify-center text-8xl shadow-inner">
                    ⭐
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { number: '15+', label: 'Năm kinh nghiệm' },
                  { number: '50K+', label: 'Khách hàng tin dùng' },
                  { number: '100%', label: 'Yến sào nguyên chất' },
                  { number: '6+', label: 'Chứng nhận quốc tế' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-6 rounded-xl bg-cream border border-border/50">
                    <p className="text-3xl md:text-4xl font-bold text-burgundy font-serif">{stat.number}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>Nội dung đang được cập nhật...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
