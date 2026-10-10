import { NavLink, Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function Layout() {
  const { profile, profileLoading } = useApp();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-icon">✎</span><span>NoteSpace</span></div>
        <p className="sidebar-caption">KHÔNG GIAN CỦA BẠN</p>
        <nav className="nav-list">
          <NavLink to="/" end>⌂ <span>Trang chủ</span></NavLink>
          <NavLink to="/notes">▤ <span>Ghi chú</span></NavLink>
          <NavLink to="/private">♙ <span>Vùng kín</span></NavLink>
          <NavLink to="/settings">⚙ <span>Cài đặt</span></NavLink>
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{(profile.displayName || "U").charAt(0).toUpperCase()}</div>
          <div><strong>{profileLoading ? "Đang tải..." : profile.displayName}</strong><small>Người dùng</small></div>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  );
}