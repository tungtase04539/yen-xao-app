'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Chị Nguyễn Thị Hương',
    location: 'TP. Hồ Chí Minh',
    rating: 5,
    content: 'Yến sào ở đây rất chất lượng, sợi yến dày và đều. Gia đình tôi đã dùng hơn 2 năm, sức khỏe cải thiện rõ rệt. Đặc biệt là dịch vụ giao hàng rất nhanh và tận tâm.',
    avatar: '👩',
  },
  {
    id: 2,
    name: 'Anh Trần Văn Minh',
    location: 'Hà Nội',
    rating: 5,
    content: 'Tôi đã mua yến sào làm quà biếu cho bố mẹ. Hộp quà rất sang trọng, yến chất lượng cao. Bố mẹ tôi rất hài lòng. Sẽ tiếp tục ủng hộ!',
    avatar: '👨',
  },
  {
    id: 3,
    name: 'Chị Lê Thanh Thảo',
    location: 'Đà Nẵng',
    rating: 5,
    content: 'Mình đang mang thai và dùng yến chưng sẵn hàng ngày. Sản phẩm rất tiện lợi, vị ngon tự nhiên. Mình cũng yên tâm vì có đầy đủ chứng nhận an toàn.',
    avatar: '👩‍🦰',
  },
  {
    id: 4,
    name: 'Anh Phạm Đức Long',
    location: 'Cần Thơ',
    rating: 5,
    content: 'Nước yến collagen rất tuyệt vời! Vợ tôi dùng mỗi ngày, da dẻ mịn màng hẳn. Giá cả hợp lý so với chất lượng. Rất recommend!',
    avatar: '👨‍💼',
  },
];

export default function CustomerFeedback() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="py-16 md:py-20 bg-warm-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-burgundy mb-3">
            Khách Hàng Nói Gì
          </h2>
          <p className="text-muted-foreground">
            Niềm tin của khách hàng là động lực để chúng tôi không ngừng phấn đấu
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonials[current].id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-border/50 relative"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-gold/20" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonials[current].rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground/80 leading-relaxed text-base md:text-lg mb-6 italic">
                &ldquo;{testimonials[current].content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center text-2xl">
                  {testimonials[current].avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonials[current].name}</p>
                  <p className="text-sm text-muted-foreground">{testimonials[current].location}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === current ? 'bg-gold w-6' : 'bg-border hover:bg-gold/50'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
