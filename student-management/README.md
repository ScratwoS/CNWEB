# Student Management (MERN)

Ứng dụng CRUD quản lý học sinh: thêm, sửa, xóa, tìm kiếm, sắp xếp (theo tên riêng) với React + Express + MongoDB (Atlas).

## Cấu trúc
- `frontend/` – Vite + React, gọi API qua Axios (`VITE_API_URL`).
- `backend/` – Express + Mongoose, model `Student` (collection `web`), API prefix `/api`.
- `docker-compose.yml` – build & chạy cả frontend + backend.

## Chạy nhanh bằng Docker
```bash
cd student-management
# (tùy chọn) export MONGO_URI="mongodb+srv://user:pass@host/db?..."
docker compose up --build
```
- Frontend: http://localhost:3333
- Backend: http://localhost:5000
- Mặc định backend dùng URI Atlas trong compose; đặt `MONGO_URI` để override. Muốn frontend gọi backend trong compose, đặt `VITE_API_URL=http://backend:5000` rồi build lại (compose arg đã hỗ trợ).

## API chính (`/api/students`)
- `GET /api/students` – danh sách, hỗ trợ `?name=` lọc theo tên (regex, không phân biệt hoa thường).
- `GET /api/students/:id` – chi tiết.
- `POST /api/students` – tạo mới `{ name, age, class }`.
- `PUT /api/students/:id` – cập nhật.
- `DELETE /api/students/:id` – xóa.

## Lưu ý giao diện
- Form thêm/sửa dùng chung.
- Tìm kiếm client-side; sắp xếp A↔Z ưu tiên tên riêng (từ cuối).
- Bảng danh sách có nút mũi tên để thu gọn/mở rộng.
