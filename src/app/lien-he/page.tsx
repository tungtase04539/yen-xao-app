import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, MapPin, Phone, Mail, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Liên Hệ',
  description: 'Liên hệ với Yến Sào Cao Cấp - Hotline, địa chỉ, email và mạng xã hội.',
};

const branches = [
  { label: 'Cơ sở 1', addr: 'Số 10/20/98 Khúc Thừa Dụ, P. An Biên, Hải Phòng', map: 'Số+10/20/98+Khúc+Thừa+Dụ,+Phường+An+Biên,+Hải+Phòng' },
  { label: 'Cơ sở 2', addr: '50 Phạm Ngọc Đa, TT. Tiên Lãng, Hải Phòng', map: '50+Phạm+Ngọc+Đa,+Thị+Trấn+Tiên+Lãng,+Hải+Phòng' },
  { label: 'Cơ sở 3', addr: 'Khu đường tàu, TT. Hà Khẩu, Trung Quốc', map: 'Khu+đường+tàu,+Thị+Trấn+Hà+Khẩu,+Hà+Khẩu,+Vân+Nam,+Trung+Quốc' },
  { label: 'Cơ sở 4', addr: 'Phố 114 Bạch Đằng, P. Thủy Nguyên, Hải Phòng', map: 'Phố+114+Bạch+Đằng,+Phường+Thủy+Nguyên,+Hải+Phòng' },
  { label: 'Cơ sở 5', addr: '37A Mê Linh, P. Gia Viên, Tp. Hải Phòng', map: '37A+Mê+Linh,+Phường+Gia+Viên,+Hải+Phòng' },
];

const contactInfo = [
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
              {/* Addresses */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-burgundy" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Hệ thống cơ sở</p>
                  <div className="space-y-1.5">
                    {branches.map(({ label, addr, map }) => (
                      <a
                        key={label}
                        href={`https://www.google.com/maps/search/?api=1&query=${map}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-muted-foreground hover:text-burgundy transition-colors"
                      >
                        <span className="font-medium text-foreground">{label}:</span> {addr}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

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
                  { name: 'Facebook', href: 'https://www.facebook.com/qiqiyensao', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                  { name: 'TikTok VN', href: 'https://www.tiktok.com/@yensaoqiqi', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
                  { name: 'Douyin', href: 'https://www.douyin.com/user/58483434306', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
                ].map(({ name, href, icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-burgundy hover:text-white transition-colors"
                  >
                    {icon}
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
