# EX03 - Ứng dụng quản lý ghi chú

Project học tập gồm React + Vite frontend, Node.js + Express backend và dữ liệu JSON.

## Yêu cầu
- Node.js LTS và npm
- VS Code (khuyến nghị)

## Chạy Backend
Mở terminal:
```bash
cd backend
npm install
npm start
```
Backend: http://localhost:5000

## Chạy Frontend
Mở terminal thứ hai:
```bash
cd frontend
npm install
npm run dev
```
Mở URL Vite hiển thị trong terminal (thường là http://localhost:5173).

## Mật khẩu demo
Mật khẩu vùng kín mặc định: `123456`. Có thể đổi tại trang Cài đặt.

## Phân công nhóm
- TV1: Profile, Settings, AppContext, Layout và kiểm thử theme.
- TV2: Public Notes, các API `/api/notes/:topic` và CRUD.
- TV3: Private Notes, API xác thực demo và CRUD private.
- Cả ba thành viên cần hiểu cách chạy project, cấu trúc dữ liệu JSON, luồng frontend/backend và chuẩn bị vấn đáp cá nhân.

## Lưu ý bảo mật
Đây là bản demo học tập, không phải ứng dụng triển khai thực tế. Mật khẩu đang được lưu dạng văn bản thuần trong profile.json; API private CRUD chưa được bảo vệ bằng phiên/token ở backend. Không dùng dữ liệu thật hoặc triển khai công khai trước khi bổ sung xác thực/phân quyền phù hợp.
