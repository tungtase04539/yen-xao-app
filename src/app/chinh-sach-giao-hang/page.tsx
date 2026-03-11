'use client';

export default function ChinhSachGiaoHangPage() {
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
            Chính Sách Giao Hàng
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-sm md:text-base">
            Giao hàng toàn quốc — Nhanh chóng, An toàn, Đáng tin cậy
          </p>
          <div className="flex justify-center items-center gap-3 mt-6 text-sm text-white/30">
            <a href="/" className="hover:text-gold transition-colors">Trang chủ</a>
            <span className="text-gold/30">✦</span>
            <span className="text-gold/70">Chính sách giao hàng</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-3xl shadow-sm border border-border/50 p-8 md:p-12 luxury-prose">

            <section>
              <h2>1. Phạm Vi Giao Hàng</h2>
              <p>
                <strong>QiQi Yến Sào</strong> giao hàng toàn quốc trên tất cả 63 tỉnh thành tại Việt Nam.
                Đơn hàng được xử lý và giao qua các đơn vị vận chuyển uy tín như GHN, GHTK, J&T Express,
                đảm bảo an toàn và đúng thời gian.
              </p>
            </section>

            <section>
              <h2>2. Thời Gian Giao Hàng</h2>
              <ul>
                <li><strong>Nội thành Hải Phòng:</strong> 1 — 2 ngày làm việc</li>
                <li><strong>Hà Nội, TP. Hồ Chí Minh, Đà Nẵng:</strong> 2 — 3 ngày làm việc</li>
                <li><strong>Các tỉnh thành khác:</strong> 3 — 5 ngày làm việc</li>
                <li><strong>Vùng sâu, vùng xa:</strong> 5 — 7 ngày làm việc</li>
              </ul>
              <p>
                Thời gian giao hàng được tính từ lúc đơn hàng được xác nhận. Trong trường hợp
                có sự kiện đặc biệt (Tết, lễ lớn), thời gian giao hàng có thể kéo dài hơn.
              </p>
            </section>

            <section>
              <h2>3. Phí Giao Hàng</h2>
              <ul>
                <li><strong>Miễn phí vận chuyển</strong> cho đơn hàng từ <strong>1.000.000₫</strong> trở lên (toàn quốc)</li>
                <li>Đơn hàng dưới 1.000.000₫: Phí ship theo khu vực, dao động <strong>25.000₫ — 45.000₫</strong></li>
                <li>Đơn hàng nặng hoặc cồng kềnh: Phí vận chuyển sẽ được thông báo cụ thể trước khi xác nhận đơn</li>
              </ul>
            </section>

            <section>
              <h2>4. Quy Trình Xử Lý Đơn Hàng</h2>
              <ol>
                <li>Khách đặt hàng trực tuyến hoặc qua hotline</li>
                <li>Nhân viên xác nhận đơn hàng trong vòng <strong>2 — 4 giờ</strong> (trong giờ hành chính)</li>
                <li>Đơn hàng được đóng gói cẩn thận và bàn giao cho đơn vị vận chuyển</li>
                <li>Khách nhận mã vận đơn để theo dõi trạng thái đơn hàng</li>
                <li>Nhận hàng và kiểm tra ngay trước khi ký nhận</li>
              </ol>
            </section>

            <section>
              <h2>5. Lưu Ý Khi Nhận Hàng</h2>
              <ul>
                <li>Kiểm tra tình trạng kiện hàng <strong>trước khi ký nhận</strong>. Nếu phát hiện hư hỏng, từ chối nhận và liên hệ chúng tôi ngay</li>
                <li>Quay video quá trình mở hàng để có bằng chứng trong trường hợp cần khiếu nại</li>
                <li>Sản phẩm yến sào cần được bảo quản ở nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp</li>
              </ul>
            </section>

            <section>
              <h2>6. Hỗ Trợ & Liên Hệ</h2>
              <p>
                Nếu đơn hàng của bạn bị chậm trễ, thất lạc hoặc có vấn đề trong quá trình giao nhận,
                vui lòng liên hệ ngay với chúng tôi để được hỗ trợ kịp thời:
              </p>
              <ul>
                <li>📞 Hotline: <strong>0984 234 669</strong> (hỗ trợ 7:00 — 22:00 hằng ngày)</li>
                <li>✉️ Email: <strong>info@yensaocaocap.vn</strong></li>
                <li>💬 Zalo: <strong>0984 234 669</strong></li>
              </ul>
            </section>

          </div>
        </div>
      </section>
    </div>
  );
}
