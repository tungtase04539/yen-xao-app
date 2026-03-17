'use client';

export default function ChinhSachBaoHanhPage() {
  return (
    <div className="min-h-screen bg-gradient-luxury">
      {/* Hero */}
      <section className="bg-gradient-dark-luxury text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="ornament-divider mb-6">
            <span className="text-gold text-lg">✦</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 tracking-tight">
            Chính Sách Bảo Hành
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-sm md:text-base">
            Cam kết chất lượng — Bảo vệ quyền lợi khách hàng
          </p>
          <div className="flex justify-center items-center gap-3 mt-6 text-sm text-white/30">
            <a href="/" className="hover:text-gold transition-colors">Trang chủ</a>
            <span className="text-gold/30">✦</span>
            <span className="text-gold/70">Chính sách bảo hành</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-3xl shadow-sm border border-border/50 p-8 md:p-12 luxury-prose">

            <section>
              <h2>1. Phạm Vi Áp Dụng</h2>
              <p>
                Chính sách bảo hành này áp dụng cho tất cả sản phẩm yến sào được mua tại hệ thống
                cửa hàng và website chính thức của <strong>QiQi Yến Sào</strong>. Chúng tôi cam kết
                cung cấp sản phẩm đạt chuẩn chất lượng và đảm bảo quyền lợi tối đa cho khách hàng.
              </p>
            </section>

            <section>
              <h2>2. Điều Kiện Bảo Hành</h2>
              <p>Sản phẩm được hỗ trợ đổi trả trong các trường hợp sau:</p>
              <ul>
                <li>Sản phẩm bị lỗi do quá trình sản xuất hoặc đóng gói</li>
                <li>Sản phẩm không đúng với mô tả hoặc hình ảnh trên website</li>
                <li>Sản phẩm bị hư hỏng trong quá trình vận chuyển (cần có ảnh/video làm bằng chứng)</li>
                <li>Sản phẩm bị ôi, mốc, mùi lạ dù chưa mở nắp và còn trong hạn sử dụng</li>
              </ul>
            </section>

            <section>
              <h2>3. Thời Gian Bảo Hành</h2>
              <ul>
                <li><strong>Trong vòng 24 giờ</strong> kể từ khi nhận hàng: Đổi trả miễn phí với mọi lỗi phát sinh</li>
                <li><strong>Từ 2 — 7 ngày</strong>: Hỗ trợ đổi trả với sản phẩm lỗi do nhà sản xuất</li>
                <li><strong>Sau 7 ngày</strong>: Không áp dụng chính sách đổi trả (trừ trường hợp đặc biệt)</li>
              </ul>
            </section>

            <section>
              <h2>4. Quy Trình Đổi Trả</h2>
              <ol>
                <li>Liên hệ hotline <strong>0843.623986</strong> hoặc email <strong>tp.phucthinh.co@gmail.com</strong> để thông báo tình trạng sản phẩm</li>
                <li>Cung cấp ảnh/video làm bằng chứng cùng hóa đơn mua hàng</li>
                <li>Đội ngũ chăm sóc khách hàng xác nhận và hướng dẫn quy trình đổi trả trong vòng 24 giờ</li>
                <li>Sản phẩm thay thế hoặc hoàn tiền được xử lý trong vòng 3 — 5 ngày làm việc</li>
              </ol>
            </section>

            <section>
              <h2>5. Các Trường Hợp Không Được Bảo Hành</h2>
              <ul>
                <li>Sản phẩm đã được mở seal, sử dụng một phần</li>
                <li>Sản phẩm bị hư hỏng do người dùng (rơi vỡ, bảo quản sai cách)</li>
                <li>Sản phẩm không có hóa đơn hoặc hóa đơn không hợp lệ</li>
                <li>Khiếu nại sau thời hạn bảo hành quy định</li>
              </ul>
            </section>

            <section>
              <h2>6. Cam Kết Của Chúng Tôi</h2>
              <p>
                QiQi Yến Sào luôn đặt sự hài lòng của khách hàng lên hàng đầu. Mọi khiếu nại đều
                được tiếp nhận và giải quyết nhanh chóng, minh bạch. Chúng tôi không để bất kỳ
                khách hàng nào phải chịu thiệt thòi vì lỗi từ phía chúng tôi.
              </p>
              <p>
                Nếu có bất kỳ thắc mắc nào về chính sách bảo hành, vui lòng liên hệ:
                <strong> 0843.623986</strong> — chúng tôi sẵn lòng hỗ trợ 24/7.
              </p>
            </section>

          </div>
        </div>
      </section>
    </div>
  );
}
