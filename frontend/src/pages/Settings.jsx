import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";

const API = "http://localhost:5000";

export default function Settings() {
  const { profile, updateProfile } = useApp();
  const [form, setForm] = useState({ displayName: "", theme: "light", password: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API}/api/profile`)
      .then(async response => {
        if (!response.ok) throw new Error("Không tải được cài đặt");
        return response.json();
      })
      .then(data => setForm({ displayName: data.displayName || "", theme: data.theme || "light", password: "" }))
      .catch(error => setMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  function change(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function save(event) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      const response = await fetch(`${API}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Không thể lưu cài đặt");
      updateProfile(data.profile || { displayName: form.displayName, theme: form.theme });
      setForm(current => ({ ...current, password: "" }));
      setMessage("Đã lưu cài đặt thành công.");
    } catch (error) {
      setMessage(error.message || "Lỗi kết nối máy chủ.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Đang tải cài đặt...</p>;

  return (
    <section className="page-narrow">
      <div className="page-heading"><p className="eyebrow">TÙY CHỈNH</p><h1>Cài đặt</h1><p className="muted">Quản lý thông tin hiển thị và trải nghiệm của bạn.</p></div>
      <form className="panel settings-form" onSubmit={save}>
        <div className="section-title"><span className="section-icon">♙</span><div><h2>Hồ sơ cá nhân</h2><p className="muted">Thông tin cơ bản của bạn</p></div></div>
        <label>Tên hiển thị<input name="displayName" value={form.displayName} onChange={change} required maxLength={80} /></label>
        <div className="divider" />
        <div className="section-title"><span className="section-icon">☼</span><div><h2>Giao diện</h2><p className="muted">Chọn chế độ bạn muốn sử dụng</p></div></div>
        <label>Chế độ màu<select name="theme" value={form.theme} onChange={change}><option value="light">Sáng</option><option value="dark">Tối</option></select></label>
        <div className="divider" />
        <div className="section-title"><span className="section-icon">♙</span><div><h2>Mật khẩu vùng kín</h2><p className="muted">Để trống nếu bạn không muốn đổi mật khẩu</p></div></div>
        <label>Mật khẩu mới<input name="password" type="password" value={form.password} onChange={change} autoComplete="new-password" placeholder="Nhập mật khẩu mới" /></label>
        {message && <p className={message.includes("thành công") ? "message success" : "message error"}>{message}</p>}
        <div className="form-actions"><button className="primary-button" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button></div>
      </form>
    </section>
  );
}