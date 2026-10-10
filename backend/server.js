const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, "data");
const profilePath = path.join(dataPath, "profile.json");
const privateNotesPath = path.join(dataPath, "private.json");
const notesPath = path.join(dataPath, "notes");

function ensureJsonFile(filePath, initialValue = []) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialValue, null, 2), "utf8");
  }
}

ensureJsonFile(profilePath, { displayName: "Nguyen Van A", theme: "light", password: "123456" });
ensureJsonFile(privateNotesPath, []);
for (const topic of ["hoc-tap", "cong-viec", "ca-nhan"]) {
  ensureJsonFile(path.join(notesPath, `${topic}.json`), []);
}

const allowedTopics = new Set(["hoc-tap", "cong-viec", "ca-nhan"]);
function getTopicFile(topic) {
  if (!allowedTopics.has(topic)) return null;
  return path.join(notesPath, `${topic}.json`);
}
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}
function makeNote(body) {
  const now = new Date().toISOString();
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: String(body.title || "").trim(),
    content: String(body.content || ""),
    createdAt: now,
    updatedAt: now
  };
}

app.get("/", (_req, res) => res.json({ message: "Backend đang chạy!" }));

// Profile: chỉ trả các trường được phép hiển thị; không gửi mật khẩu về frontend.
app.get("/api/profile", (_req, res) => {
  try {
    const profile = readJson(profilePath);
    res.json({ displayName: profile.displayName, theme: profile.theme });
  } catch {
    res.status(500).json({ message: "Lỗi đọc profile." });
  }
});

app.put("/api/profile", (req, res) => {
  try {
    const current = readJson(profilePath);
    const displayName = req.body.displayName;
    const theme = req.body.theme;
    if (displayName !== undefined && typeof displayName !== "string") {
      return res.status(400).json({ success: false, message: "Tên hiển thị không hợp lệ." });
    }
    if (theme !== undefined && !["light", "dark"].includes(theme)) {
      return res.status(400).json({ success: false, message: "Theme phải là light hoặc dark." });
    }
    const next = {
      ...current,
      ...(displayName !== undefined ? { displayName: displayName.trim() } : {}),
      ...(theme !== undefined ? { theme } : {})
    };
    // Demo học tập: mật khẩu lưu dạng plain text; không dùng cách này cho hệ thống thật.
    if (typeof req.body.password === "string" && req.body.password.length > 0) {
      next.password = req.body.password;
    }
    writeJson(profilePath, next);
    res.json({ success: true, message: "Lưu profile thành công.", profile: {
      displayName: next.displayName, theme: next.theme
    }});
  } catch {
    res.status(500).json({ success: false, message: "Lỗi cập nhật profile." });
  }
});

// Public notes CRUD theo chủ đề.
app.get("/api/notes/:topic", (req, res) => {
  const filePath = getTopicFile(req.params.topic);
  if (!filePath) return res.status(400).json({ message: "Chủ đề không hợp lệ." });
  try {
    res.json(readJson(filePath));
  } catch {
    res.status(500).json({ message: "Lỗi đọc ghi chú." });
  }
});

app.post("/api/notes/:topic", (req, res) => {
  const filePath = getTopicFile(req.params.topic);
  if (!filePath) return res.status(400).json({ message: "Chủ đề không hợp lệ." });
  const title = String(req.body.title || "").trim();
  if (!title) return res.status(400).json({ success: false, message: "Tiêu đề không được để trống." });
  try {
    const notes = readJson(filePath);
    const note = makeNote({ ...req.body, title });
    notes.push(note);
    writeJson(filePath, notes);
    res.status(201).json({ success: true, note });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi thêm ghi chú." });
  }
});

app.put("/api/notes/:topic/:id", (req, res) => {
  const filePath = getTopicFile(req.params.topic);
  if (!filePath) return res.status(400).json({ message: "Chủ đề không hợp lệ." });
  const title = String(req.body.title || "").trim();
  if (!title) return res.status(400).json({ success: false, message: "Tiêu đề không được để trống." });
  try {
    const notes = readJson(filePath);
    const index = notes.findIndex(note => note.id === req.params.id);
    if (index < 0) return res.status(404).json({ success: false, message: "Không tìm thấy ghi chú." });
    notes[index] = { ...notes[index], title, content: String(req.body.content || ""), updatedAt: new Date().toISOString() };
    writeJson(filePath, notes);
    res.json({ success: true, note: notes[index] });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi cập nhật ghi chú." });
  }
});

app.delete("/api/notes/:topic/:id", (req, res) => {
  const filePath = getTopicFile(req.params.topic);
  if (!filePath) return res.status(400).json({ message: "Chủ đề không hợp lệ." });
  try {
    const notes = readJson(filePath);
    const next = notes.filter(note => note.id !== req.params.id);
    if (next.length === notes.length) return res.status(404).json({ success: false, message: "Không tìm thấy ghi chú." });
    writeJson(filePath, next);
    res.json({ success: true, message: "Đã xóa ghi chú." });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi xóa ghi chú." });
  }
});

// Demo xác thực bằng mật khẩu trong profile.json.
// Lưu ý: các API private CRUD bên dưới chưa có token/session bảo vệ phía server.
app.post("/api/private/auth", (req, res) => {
  try {
    const profile = readJson(profilePath);
    if (typeof req.body.password === "string" && req.body.password === profile.password) {
      return res.json({ success: true });
    }
    res.status(401).json({ success: false, message: "Sai mật khẩu." });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi xác thực." });
  }
});

app.get("/api/private/notes", (_req, res) => {
  try { res.json(readJson(privateNotesPath)); }
  catch { res.status(500).json({ message: "Lỗi đọc ghi chú riêng tư." }); }
});

app.post("/api/private/notes", (req, res) => {
  const title = String(req.body.title || "").trim();
  if (!title) return res.status(400).json({ success: false, message: "Tiêu đề không được để trống." });
  try {
    const notes = readJson(privateNotesPath);
    const note = makeNote({ ...req.body, title });
    notes.push(note);
    writeJson(privateNotesPath, notes);
    res.status(201).json({ success: true, note });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi thêm ghi chú riêng tư." });
  }
});

app.put("/api/private/notes/:id", (req, res) => {
  const title = String(req.body.title || "").trim();
  if (!title) return res.status(400).json({ success: false, message: "Tiêu đề không được để trống." });
  try {
    const notes = readJson(privateNotesPath);
    const index = notes.findIndex(note => note.id === req.params.id);
    if (index < 0) return res.status(404).json({ success: false, message: "Không tìm thấy ghi chú." });
    notes[index] = { ...notes[index], title, content: String(req.body.content || ""), updatedAt: new Date().toISOString() };
    writeJson(privateNotesPath, notes);
    res.json({ success: true, note: notes[index] });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi cập nhật ghi chú riêng tư." });
  }
});

app.delete("/api/private/notes/:id", (req, res) => {
  try {
    const notes = readJson(privateNotesPath);
    const next = notes.filter(note => note.id !== req.params.id);
    if (next.length === notes.length) return res.status(404).json({ success: false, message: "Không tìm thấy ghi chú." });
    writeJson(privateNotesPath, next);
    res.json({ success: true, message: "Đã xóa ghi chú riêng tư." });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi xóa ghi chú riêng tư." });
  }
});

app.listen(PORT, () => console.log(`Backend đang chạy tại http://localhost:${PORT}`));
