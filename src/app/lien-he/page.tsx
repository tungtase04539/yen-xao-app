import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, MapPin, Phone, Mail, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Liên Hệ',
  description: 'Liên hệ với Yến Sào Cao Cấp - Hotline, địa chỉ, email và mạng xã hội.',
};

const contactInfo = [
  {
    icon: MapPin,
    label: 'Địa chỉ',
    value: 'Cơ sở 1: Số 10/20/98 Khúc Thừa Dụ, Phường An Biên, Hải Phòng',
    href: null,
  },
  {
    icon: Phone,
    label: 'Hotline',
    value: '0843.623986',
    href: 'tel:0843623986',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'tp.phucthinh.co@gmail.com',
    href: 'mailto:tp.phucthinh.co@gmail.com',
  },
  {
    icon: Clock,
    label: 'Giờ làm việc',
    value: 'T2 - CN: 8:00 - 21:00',
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-burgundy-dark to-burgundy text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Liên Hệ</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn
          </p>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-burgundy transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">Liên hệ</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Left: Contact Info */}
          <div>
            <h2 className="text-2xl font-bold font-serif text-burgundy mb-6">
              Thông tin liên hệ
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Hãy liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào về sản phẩm yến sào,
              đơn hàng, hoặc cần tư vấn. Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn.
            </p>

            <div className="space-y-6">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-burgundy" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm text-burgundy hover:text-burgundy-light transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="mt-8 pt-8 border-t border-border/50">
              <p className="text-sm font-semibold text-foreground mb-3">Theo dõi chúng tôi</p>
              <div className="flex gap-3">
                {[
                  { name: 'Facebook', href: 'https://www.facebook.com/qiqiyensao' },
                  { name: 'Instagram', href: '#' },
                  { name: 'YouTube', href: '#' },
                  { name: 'TikTok VN', href: 'https://www.tiktok.com/@yensaoqiqi' },
                  { name: 'TikTok CN', href: 'https://www.douyin.com/user/58483434306' },
                ].map(({ name, href }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-burgundy hover:text-white transition-colors"
                  >
                    {name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm">
            <h2 className="text-xl font-bold font-serif text-burgundy mb-6">
              Gửi tin nhắn cho chúng tôi
            </h2>

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Họ tên</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-lg border border-input px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Số điện thoại</label>
                  <input
                    type="tel"
                    placeholder="0901234567"
                    className="w-full rounded-lg border border-input px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="w-full rounded-lg border border-input px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Chủ đề</label>
                <select className="w-full rounded-lg border border-input px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy">
                  <option>Tư vấn sản phẩm</option>
                  <option>Hỏi về đơn hàng</option>
                  <option>Hợp tác kinh doanh</option>
                  <option>Khiếu nại / Góp ý</option>
                  <option>Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Nội dung</label>
                <textarea
                  rows={4}
                  placeholder="Nội dung tin nhắn..."
                  className="w-full rounded-lg border border-input px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-burgundy text-white font-semibold rounded-xl hover:bg-burgundy-light transition-colors"
              >
                Gửi tin nhắn
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
