import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function Home() {
  const { profile } = useApp();
  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">TỔNG QUAN</p>
        <h1>Chào mừng trở lại, {profile.displayName || "bạn"} 👋</h1>
        <p className="muted">Ghi lại ý tưởng, sắp xếp công việc và giữ riêng tư những điều quan trọng.</p>
      </div>
      <div className="home-grid">
        <article className="feature-card feature-public"><div className="feature-symbol">▤</div><h2>Ghi chú của bạn</h2><p>Tạo và quản lý ghi chú theo chủ đề học tập, công việc và cá nhân.</p><Link className="primary-link" to="/notes">Mở ghi chú →</Link></article>
        <article className="feature-card feature-private"><div className="feature-symbol">♙</div><h2>Vùng kín</h2><p>Một khu vực yêu cầu mật khẩu trước khi mở khóa ghi chú riêng tư.</p><Link className="primary-link" to="/private">Mở vùng kín →</Link></article>
        <article className="feature-card feature-settings"><div className="feature-symbol">⚙</div><h2>Cá nhân hóa</h2><p>Đổi tên hiển thị, giao diện sáng/tối và mật khẩu vùng kín.</p><Link className="primary-link" to="/settings">Mở cài đặt →</Link></article>
      </div>
      <div className="tip-panel"><strong>💡 Mẹo nhỏ</strong><p>Đặt tiêu đề ngắn gọn và chọn đúng chủ đề để tìm lại ghi chú dễ dàng hơn.</p></div>
    </section>
  );
}