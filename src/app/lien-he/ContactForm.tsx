'use client';

import { useState } from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';

const EMAIL = 'tp.phucthinh.co@gmail.com';
const ZALO_URL = 'https://zalo.me/0843623986';

const SUBJECTS = [
  'Tư vấn sản phẩm',
  'Hỏi về đơn hàng',
  'Hợp tác kinh doanh',
  'Khiếu nại / Góp ý',
  'Khác',
];

const inputClass =
  'w-full rounded-lg border border-input px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy';

/**
 * Form liên hệ soạn sẵn nội dung rồi mở ứng dụng email của khách.
 *
 * Vì sao không POST thẳng về server: shop chưa có bảng lưu liên hệ và cũng chưa
 * có dịch vụ gửi mail. Một form tự nuốt dữ liệu rồi báo "đã gửi" còn tệ hơn
 * không có form, nên ở đây nội dung được đóng gói vào `mailto:` để khách nhìn
 * thấy chính xác thứ mình gửi đi, kèm hotline/Zalo làm đường dự phòng.
 */
export default function ContactForm() {
  const [opened, setOpened] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') || '').trim();
    const phone = String(form.get('phone') || '').trim();
    const email = String(form.get('email') || '').trim();
    const topic = String(form.get('topic') || '').trim();
    const message = String(form.get('message') || '').trim();

    const subject = `[Liên hệ website] ${topic} — ${name}`;
    const body = [
      `Họ tên: ${name}`,
      `Số điện thoại: ${phone}`,
      email ? `Email: ${email}` : null,
      `Chủ đề: ${topic}`,
      '',
      message,
    ]
      .filter(Boolean)
      .join('\n');

    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm">
      <h2 className="text-xl font-bold font-serif text-burgundy mb-2">
        Gửi tin nhắn cho chúng tôi
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Điền thông tin bên dưới, chúng tôi sẽ soạn sẵn nội dung và mở ứng dụng email của bạn để gửi đi.
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="contact-name" className="block text-sm font-medium mb-1.5">Họ tên</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              placeholder="Nguyễn Văn A"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="contact-phone" className="block text-sm font-medium mb-1.5">Số điện thoại</label>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              required
              placeholder="0901234567"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium mb-1.5">Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            placeholder="email@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="contact-topic" className="block text-sm font-medium mb-1.5">Chủ đề</label>
          <select id="contact-topic" name="topic" className={`${inputClass} bg-white`} defaultValue={SUBJECTS[0]}>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="contact-message" className="block text-sm font-medium mb-1.5">Nội dung</label>
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            required
            placeholder="Nội dung tin nhắn..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-burgundy text-white font-semibold rounded-xl hover:bg-burgundy-light transition-colors inline-flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Soạn email gửi cho chúng tôi
        </button>
      </form>

      {opened && (
        <p className="mt-4 text-sm text-muted-foreground" role="status">
          Chúng tôi vừa mở ứng dụng email với nội dung đã điền sẵn — bạn chỉ cần bấm Gửi.
          Nếu không có gì mở ra, hãy dùng hotline hoặc Zalo bên dưới nhé.
        </p>
      )}

      <div className="mt-6 pt-6 border-t border-border/50">
        <p className="text-sm font-semibold text-foreground mb-3">Hoặc liên hệ nhanh hơn</p>
        <div className="flex flex-wrap gap-3">
          <a
            href="tel:0843623986"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-burgundy text-white text-sm font-semibold hover:bg-burgundy-light transition-colors"
          >
            <Phone className="w-4 h-4" />
            Gọi 0843.623986
          </a>
          <a
            href={ZALO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-sm font-semibold hover:bg-burgundy hover:text-white transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Nhắn Zalo
          </a>
        </div>
      </div>
    </div>
  );
}
