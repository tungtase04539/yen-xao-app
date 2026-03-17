'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, X } from 'lucide-react';

const actions = [
  {
    id: 'hotline',
    icon: Phone,
    label: 'Hotline',
    href: 'tel:0843623986',
    color: 'bg-red-500 hover:bg-red-600',
    animate: true,
  },
  {
    id: 'zalo',
    icon: MessageCircle,
    label: 'Zalo',
    href: 'https://zalo.me/0843623986',
    color: 'bg-blue-500 hover:bg-blue-600',
    animate: false,
  },
  {
    id: 'messenger',
    icon: MessageCircle,
    label: 'Messenger',
    href: 'https://m.me/yensaocaocap',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    animate: false,
  },
];

export default function FloatingActions() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex flex-col-reverse items-end gap-2 md:gap-3">
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-11 h-11 md:w-14 md:h-14 rounded-full text-white shadow-lg flex items-center justify-center transition-all"
        style={{ background: 'linear-gradient(135deg, #d4af37 0%, #C9A55A 50%, #b8943e 100%)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" style={{ color: '#6E1222' }} />
            </motion.div>
          ) : (
            <motion.div
              key="phone"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="animate-phone-ring"
            >
              <Phone className="w-6 h-6" style={{ color: '#6E1222' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Action Buttons */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {actions.map((action, index) => (
              <motion.a
                key={action.id}
                href={action.href}
                target={action.id !== 'hotline' ? '_blank' : undefined}
                rel={action.id !== 'hotline' ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: 20 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full text-white shadow-lg ${action.color} transition-all`}
                whileHover={{ scale: 1.05, x: -5 }}
              >
                <action.icon className={`w-5 h-5 ${action.animate ? 'animate-phone-ring' : ''}`} />
                <span className="text-sm font-medium whitespace-nowrap">
                  {action.label}
                </span>
              </motion.a>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Ripple Effect */}
      {!isExpanded && (
        <>
          <span className="absolute bottom-0 right-0 w-14 h-14 rounded-full animate-ping pointer-events-none" style={{ background: 'rgba(201,165,90,0.3)' }} />
        </>
      )}
    </div>
  );
}
