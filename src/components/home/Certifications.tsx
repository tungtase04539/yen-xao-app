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
  { id: '1', name: 'ISO 22000', description: 'Hệ thống quản lý an toàn thực phẩm', image_url: null, sort_order: 1 },
  { id: '2', name: 'HACCP', description: 'Tiêu chuẩn an toàn thực phẩm quốc tế', image_url: null, sort_order: 2 },
  { id: '3', name: 'GMP', description: 'Thực hành sản xuất tốt', image_url: null, sort_order: 3 },
  { id: '4', name: 'ATVSTP', description: 'An toàn vệ sinh thực phẩm', image_url: null, sort_order: 4 },
  { id: '5', name: 'FDA', description: 'Chứng nhận FDA Hoa Kỳ', image_url: null, sort_order: 5 },
  { id: '6', name: 'ORGANIC', description: 'Sản phẩm hữu cơ', image_url: null, sort_order: 6 },
];

export default function Certifications() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCerts() {
      const { data } = await supabase
        .from('certifications')
        .select('id, name, description, image_url, sort_order')
        .eq('is_active', true)
        .order('sort_order');
      setCerts(data && data.length > 0 ? data : fallbackCerts);
      setLoading(false);
    }
    fetchCerts();
  }, []);

  return (
    <section className="py-20 md:py-28 bg-gradient-luxury relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="ornament-divider mb-5">
            <Shield className="w-4 h-4 text-gold" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-burgundy mb-4">
            Chứng Nhận Chất Lượng
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Sản phẩm đạt các tiêu chuẩn quốc tế về an toàn &amp; chất lượng
          </p>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center text-center p-5 rounded-2xl luxury-card">
                <div className="w-full aspect-square rounded-xl bg-cream animate-pulse mb-3" />
                <div className="h-3 w-16 bg-cream rounded-full animate-pulse mb-2" />
                <div className="h-2 w-20 bg-cream rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 md:gap-6">
            {certs.map((cert, i) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="group flex flex-col items-center text-center p-4 md:p-5 rounded-2xl luxury-card transition-all duration-300 hover:gold-glow hover:-translate-y-1"
              >
                {/* Badge image — to, không vòng tròn */}
                {cert.image_url ? (
                  <div className="w-full aspect-square rounded-xl overflow-hidden mb-3">
                    <img
                      src={cert.image_url}
                      alt={cert.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square rounded-xl bg-gradient-gold flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-burgundy font-bold text-lg md:text-xl leading-tight text-center px-2">
                      {cert.name}
                    </span>
                  </div>
                )}

                {/* Name */}
                <p className="font-semibold text-sm md:text-base text-foreground mb-1 leading-tight">
                  {cert.name}
                </p>

                {/* Description */}
                {cert.description && (
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {cert.description}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
