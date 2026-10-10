import { useCallback, useEffect, useState } from "react";

const API = "http://localhost:5000";
const TOPICS = [
  { id: "hoc-tap", label: "Học tập", icon: "▤" },
  { id: "cong-viec", label: "Công việc", icon: "▣" },
  { id: "ca-nhan", label: "Cá nhân", icon: "♡" }
];
const EMPTY_FORM = { title: "", content: "" };

export default function Notes() {
  const [topic, setTopic] = useState("hoc-tap");
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/notes/${topic}`);
      if (!response.ok) throw new Error("Không tải được ghi chú.");
      setNotes(await response.json());
      setMessage("");
    } catch (error) {
      setMessage(error.message || "Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [topic]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  function change(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  }

  function startEdit(note) {
    setEditingId(note.id);
    setForm({ title: note.title, content: note.content });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage("");
  }

  async function save(event) {
    event.preventDefault();
    if (!form.title.trim()) return setMessage("Vui lòng nhập tiêu đề.");
    setBusy(true);
    setMessage("");
    try {
      const editing = editingId !== null;
      const response = await fetch(
        editing ? `${API}/api/notes/${topic}/${editingId}` : `${API}/api/notes/${topic}`,
        { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }
      );
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Không thể lưu ghi chú.");
      setForm(EMPTY_FORM);
      setEditingId(null);
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
      const response = await fetch(`${API}/api/notes/${topic}/${note.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Không thể xóa.");
      if (editingId === note.id) cancelEdit();
      setMessage("Đã xóa ghi chú.");
      await loadNotes();
    } catch (error) {
      setMessage(error.message || "Lỗi kết nối máy chủ.");
    }
  }

  const activeTopic = TOPICS.find(item => item.id === topic);

  return (
    <section>
      <div className="page-heading"><p className="eyebrow">KHÔNG GIAN CỦA BẠN</p><h1>Ghi chú</h1><p className="muted">Lưu lại những điều quan trọng, theo cách của bạn.</p></div>
      <div className="topic-tabs">{TOPICS.map(item => <button key={item.id} className={`topic-tab ${topic === item.id ? "active" : ""}`} onClick={() => { setTopic(item.id); cancelEdit(); }}><span>{item.icon}</span>{item.label}</button>)}</div>
      <div className="notes-layout">
        <form className="panel note-editor" onSubmit={save}>
          <div className="section-title"><span className="section-icon">{editingId ? "✎" : "+"}</span><div><h2>{editingId ? "Sửa ghi chú" : "Ghi chú mới"}</h2><p className="muted">{activeTopic.label}</p></div></div>
          <label>Tiêu đề<input name="title" value={form.title} onChange={change} maxLength={160} placeholder="Ví dụ: Việc cần làm hôm nay" required /></label>
          <label>Nội dung<textarea name="content" value={form.content} onChange={change} rows="7" placeholder="Viết điều bạn muốn ghi nhớ..." /></label>
          {message && <p className={message.startsWith("Đã") ? "message success" : "message error"}>{message}</p>}
          <div className="form-actions"><button className="primary-button" disabled={busy}>{busy ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm ghi chú"}</button>{editingId && <button type="button" className="secondary-button" onClick={cancelEdit}>Hủy</button>}</div>
        </form>
        <div className="notes-area"><div className="list-heading"><h2>{activeTopic.label}</h2><span className="count-pill">{notes.length} ghi chú</span></div>
          {loading ? <p className="muted">Đang tải ghi chú...</p> : notes.length === 0 ? <div className="empty-state"><span>▤</span><h3>Chưa có ghi chú</h3><p>Thêm ghi chú đầu tiên của bạn bằng biểu mẫu bên cạnh.</p></div> :
            <div className="note-list">{notes.map(note => <article className="note-card" key={note.id}><div className="note-card-top"><h3>{note.title}</h3><span className="note-dot">●</span></div><p className="note-content">{note.content || "Không có nội dung."}</p><small>Cập nhật: {new Date(note.updatedAt).toLocaleString("vi-VN")}</small><div className="note-actions"><button className="text-button" onClick={() => startEdit(note)}>Sửa</button><button className="text-button danger" onClick={() => remove(note)}>Xóa</button></div></article>)}</div>}
        </div>
      </div>
    </section>
  );
}