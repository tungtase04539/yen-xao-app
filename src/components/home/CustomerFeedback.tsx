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
    <section className="py-20 md:py-28 bg-gradient-luxury">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="ornament-divider mb-6">
            <Quote className="w-4 h-4 text-gold" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-burgundy mb-4 tracking-tight">
            Khách Hàng Nói Gì
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
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
              className="relative luxury-card rounded-3xl p-8 md:p-12"
            >
              {/* Gold top accent */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

              {/* Quote icon */}
              <div className="absolute top-6 right-8 w-14 h-14 rounded-2xl bg-gold/5 flex items-center justify-center">
                <Quote className="w-6 h-6 text-gold/30" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonials[current].rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground/75 leading-relaxed text-base md:text-lg mb-8 italic font-serif">
                &ldquo;{testimonials[current].content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center text-2xl shadow-md">
                    {testimonials[current].avatar}
                  </div>
                  {/* Gold ring */}
                  <div className="absolute inset-[-2px] rounded-full border border-gold/30" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonials[current].name}</p>
                  <p className="text-sm text-muted-foreground">{testimonials[current].location}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-6 mt-10">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full border border-gold/20 flex items-center justify-center hover:border-gold hover:text-gold hover:bg-gold/5 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === current ? 'bg-gold w-8' : 'bg-border w-3 hover:bg-gold/40'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-11 h-11 rounded-full border border-gold/20 flex items-center justify-center hover:border-gold hover:text-gold hover:bg-gold/5 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
