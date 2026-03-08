'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Cert {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}

const fallbackCerts: Cert[] = [
  { id: '1', name: 'ISO 22000', description: 'Hệ thống quản lý ATTP', image_url: null, sort_order: 1 },
  { id: '2', name: 'HACCP', description: 'Tiêu chuẩn an toàn thực phẩm', image_url: null, sort_order: 2 },
  { id: '3', name: 'GMP', description: 'Thực hành sản xuất tốt', image_url: null, sort_order: 3 },
  { id: '4', name: 'ATVSTP', description: 'An toàn vệ sinh thực phẩm', image_url: null, sort_order: 4 },
  { id: '5', name: 'FDA', description: 'Chứng nhận FDA Hoa Kỳ', image_url: null, sort_order: 5 },
  { id: '6', name: 'ORGANIC', description: 'Sản phẩm hữu cơ', image_url: null, sort_order: 6 },
];

export default function Certifications() {
  const [certs, setCerts] = useState<Cert[]>(fallbackCerts);

  useEffect(() => {
    async function fetchCerts() {
      const { data } = await supabase
        .from('certifications')
        .select('id, name, description, image_url, sort_order')
        .eq('is_active', true)
        .order('sort_order');
      if (data && data.length > 0) setCerts(data);
    }
    fetchCerts();
  }, []);

  return (
    <section className="py-16 md:py-20 bg-gradient-luxury relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="ornament-divider mb-5">
            <Shield className="w-4 h-4 text-gold" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-burgundy mb-3">
            Chứng Nhận Chất Lượng
          </h2>
          <p className="text-muted-foreground text-sm">
            Sản phẩm đạt các tiêu chuẩn quốc tế về an toàn & chất lượng
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-6">
          {certs.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group flex flex-col items-center text-center p-3 md:p-5 rounded-2xl luxury-card transition-all duration-300 hover:gold-glow"
            >
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-gold/30 group-hover:border-gold/60 transition-colors" />
                {cert.image_url ? (
                  <img
                    src={cert.image_url}
                    alt={cert.name}
                    className="w-12 h-12 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-burgundy font-bold text-[9px] leading-tight text-center">
                      {cert.name}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">{cert.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
