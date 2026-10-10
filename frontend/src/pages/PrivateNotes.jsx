import { useCallback, useEffect, useState } from "react";

const API = "http://localhost:5000";
const EMPTY_FORM = { title: "", content: "" };

export default function PrivateNotes() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/private/notes`);
      if (!response.ok) throw new Error("Không tải được ghi chú riêng tư.");
      setNotes(await response.json());
    } catch (error) {
      setMessage(error.message || "Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (unlocked) loadNotes();
  }, [unlocked, loadNotes]);

  async function login(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`${API}/api/private/auth`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Sai mật khẩu.");
      setUnlocked(true);
      setPassword("");
    } catch (error) {
      setMessage(error.message || "Không thể xác thực.");
    } finally {
      setBusy(false);
    }
  }

  function change(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  }

  function edit(note) {
    setEditingId(note.id);
    setForm({ title: note.title, content: note.content });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function save(event) {
    event.preventDefault();
    if (!form.title.trim()) return setMessage("Vui lòng nhập tiêu đề.");
    setBusy(true);
    setMessage("");
    try {
      const editing = editingId !== null;
      const response = await fetch(
        editing ? `${API}/api/private/notes/${editingId}` : `${API}/api/private/notes`,
        { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }
      );
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Không thể lưu ghi chú.");
      cancelEdit();
      setMessage(editing ? "Đã cập nhật ghi chú." : "Đã thêm ghi chú.");
      await loadNotes();
    } catch (error) {
      setMessage(error.message || "Lỗi kết nối máy chủ.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(note) {
    if (!window.confirm(`Bạn có chắc muốn xóa "${note.title}"?`)) return;
    try {
      const response = await fetch(`${API}/api/private/notes/${note.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Không thể xóa.");
      if (editingId === note.id) cancelEdit();
      setMessage("Đã xóa ghi chú.");
      await loadNotes();
    } catch (error) {
      setMessage(error.message || "Lỗi kết nối máy chủ.");
    }
  }

  function lock() {
    setUnlocked(false);
    setNotes([]);
    setPassword("");
    setMessage("");
    cancelEdit();
  }

  if (!unlocked) {
    return <section className="lock-screen"><div className="lock-illustration">♙</div><p className="eyebrow">KHÔNG GIAN RIÊNG TƯ</p><h1>Vùng kín</h1><p className="muted">Nhập mật khẩu để mở khóa và xem ghi chú riêng tư của bạn.</p><form className="lock-form" onSubmit={login}><label>Mật khẩu<input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Nhập mật khẩu" required autoComplete="current-password" /></label><button className="primary-button" disabled={busy}>{busy ? "Đang kiểm tra..." : "Mở khóa"}</button></form>{message && <p className="message error">{message}</p>}<p className="security-note">Mật khẩu mặc định trong bản demo: <strong>123456</strong></p></section>;
  }

  return <section><div className="page-heading private-heading"><div><p className="eyebrow">KHÔNG GIAN RIÊNG TƯ</p><h1>Ghi chú riêng tư 🔒</h1><p className="muted">Những điều chỉ dành cho bạn.</p></div><button className="secondary-button" onClick={lock}>Khóa lại</button></div>
    <div className="notes-layout"><form className="panel note-editor" onSubmit={save}><div className="section-title"><span className="section-icon">♙</span><div><h2>{editingId ? "Sửa ghi chú" : "Ghi chú riêng tư mới"}</h2><p className="muted">Nội dung cá nhân</p></div></div><label>Tiêu đề<input name="title" value={form.title} onChange={change} maxLength={160} placeholder="Tiêu đề" required /></label><label>Nội dung<textarea name="content" rows="7" value={form.content} onChange={change} placeholder="Nội dung riêng tư..." /></label>{message && <p className={message.startsWith("Đã") ? "message success" : "message error"}>{message}</p>}<div className="form-actions"><button className="primary-button" disabled={busy}>{busy ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm ghi chú"}</button>{editingId && <button type="button" className="secondary-button" onClick={cancelEdit}>Hủy</button>}</div></form>
      <div className="notes-area"><div className="list-heading"><h2>Ghi chú của tôi</h2><span className="count-pill">{notes.length} ghi chú</span></div>{loading ? <p className="muted">Đang tải...</p> : notes.length === 0 ? <div className="empty-state"><span>♙</span><h3>Chưa có ghi chú riêng tư</h3><p>Nội dung bạn thêm sẽ xuất hiện tại đây.</p></div> : <div className="note-list">{notes.map(note => <article className="note-card private-card" key={note.id}><div className="note-card-top"><h3>{note.title}</h3><span>🔒</span></div><p className="note-content">{note.content || "Không có nội dung."}</p><small>Cập nhật: {new Date(note.updatedAt).toLocaleString("vi-VN")}</small><div className="note-actions"><button className="text-button" onClick={() => edit(note)}>Sửa</button><button className="text-button danger" onClick={() => remove(note)}>Xóa</button></div></article>)}</div>}</div></div>
  </section>;
}