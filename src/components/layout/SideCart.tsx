'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/lib/format';

export default function SideCart() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice } = useCart();
  const totalPrice = getTotalPrice();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-burgundy font-serif">
            <ShoppingBag className="w-5 h-5" />
            Giỏ hàng ({items.length} sản phẩm)
          </SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium mb-2">
                Giỏ hàng trống
              </p>
              <p className="text-sm text-muted-foreground/70 mb-6">
                Hãy thêm sản phẩm yến sào cao cấp vào giỏ hàng
              </p>
              <Button
                variant="outline"
                onClick={closeCart}
                className="border-gold text-gold hover:bg-gold hover:text-burgundy"
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={`${item.product_id}-${item.variant_id || 'default'}`}
                  layout
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-3 mb-4 pb-4 border-b border-border/50 last:border-0"
                >
                  {/* Product Image */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-secondary shrink-0">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🕊️
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/san-pham/${item.slug}`}
                      className="text-sm font-medium text-foreground hover:text-burgundy line-clamp-2 transition-colors"
                      onClick={closeCart}
                    >
                      {item.product_name}
                    </Link>
                    {item.variant_title && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.variant_title}
                      </p>
                    )}
                    <p className="text-sm font-bold text-burgundy mt-1">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product_id,
                              item.quantity - 1,
                              item.variant_id
                            )
                          }
                          className="p-1.5 hover:bg-secondary transition-colors rounded-l-lg"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-sm font-medium min-w-[32px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product_id,
                              item.quantity + 1,
                              item.variant_id
                            )
                          }
                          className="p-1.5 hover:bg-secondary transition-colors rounded-r-lg"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product_id, item.variant_id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer - Order Summary */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-4 bg-cream/50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-muted-foreground">Tạm tính:</span>
              <span className="text-lg font-bold text-burgundy">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Phí vận chuyển sẽ được tính ở trang thanh toán
            </p>
            <Separator className="mb-4" />
            <div className="space-y-2">
              <Link href="/checkout" onClick={closeCart}>
                <Button className="w-full bg-burgundy hover:bg-burgundy-light text-white font-semibold py-5 gap-2">
                  Thanh toán
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full border-gold text-gold hover:bg-gold hover:text-burgundy"
                onClick={closeCart}
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
