# Hệ thống quản lý phòng khám Phú Lợi Bảo

Ứng dụng quản lý phòng khám gồm website bệnh nhân, các màn hình quản trị, cổng bác sĩ và cổng kế toán. Frontend sử dụng React và Vite; backend cung cấp REST API bằng Node.js, Express, Prisma và PostgreSQL.

## Thành viên nhóm

| Họ và tên | Mã số sinh viên |
| --- | --- |
| Nguyễn Đức Bảo | 231A290113 |
| Phạm Hữu Lợi | 231A290119 |
| Phạm Hữu Phú | 231A290100 |

## Chức năng hiện có

- **Website bệnh nhân:** giới thiệu, chuyên khoa, dịch vụ, danh sách bác sĩ, đặt lịch, đăng ký và đăng nhập; tài khoản bệnh nhân có trang hồ sơ và sổ khám bệnh.
- **Quản trị:** bảng tổng quan; danh sách lịch hẹn, bệnh nhân, bác sĩ, bệnh án, đơn thuốc, hóa đơn và tài khoản. Các thao tác cụ thể và giới hạn được mô tả trong [Hướng dẫn sử dụng admin](doc/HUONG_DAN_SU_DUNG_ADMIN.md).
- **Bác sĩ:** bàn khám, danh sách lịch hẹn, bệnh án, đơn thuốc, bệnh nhân và lịch trực.
- **Kế toán:** quầy thu phí, danh sách hóa đơn, sổ quỹ và báo cáo.
- **API:** xác thực, bệnh nhân, chuyên khoa, bác sĩ, phòng, dịch vụ, ca trực, lịch hẹn, hóa đơn, thống kê, khám bệnh, thuốc và đơn thuốc.

**Lưu ý:** Một số dữ liệu và thao tác trên giao diện vẫn là dữ liệu mẫu hoặc chỉ thay đổi trạng thái cục bộ. Chẳng hạn danh sách bệnh nhân có thể hiển thị dữ liệu mẫu khi API lỗi hoặc trả về danh sách rỗng; màn hình sửa bệnh nhân hiện gọi thao tác tạo mới. Cổng kế toán có sổ quỹ mẫu và thao tác tạo phiếu lưu trong trạng thái giao diện. Cần kiểm tra dữ liệu trực tiếp qua API/CSDL trước khi dùng cho nghiệp vụ thực tế.

## Cấu trúc chính

```text
frontend/              React, Vite, trang và dịch vụ gọi API
backend/src/           Express: routers, controllers, services, validators, middleware
backend/prisma/        Prisma schema và migrations
backend/.env.example   Mẫu cấu hình backend
doc/                   Tài liệu hướng dẫn, báo cáo và kế hoạch
  API_FRONTEND_GUIDE.md  Tài liệu tham khảo API/frontend
  HUONG_DAN_SU_DUNG_ADMIN.md  Hướng dẫn thao tác quản trị
```

## Cài đặt và chạy

Cần Node.js tương thích với các phiên bản Vite và Prisma trong `package.json`, npm và PostgreSQL. Chuẩn bị cơ sở dữ liệu phù hợp với `backend/prisma/schema.prisma`; chạy migration hoặc thiết lập schema theo môi trường của bạn trước khi sử dụng dữ liệu.

### Backend

1. Sao chép `backend/.env.example` thành `backend/.env` và điền cấu hình của môi trường. `DATABASE_URL` được backend dùng để kết nối PostgreSQL; `DIRECT_URL` được Prisma CLI đọc trong `prisma.config.ts`. Đặt `JWT_SECRET` riêng và cấu hình `CORS_ORIGIN` nếu cần.
2. Trong thư mục `backend`, chạy:

```bash
npm install
npm run dev
```

`npm install` chạy `prisma generate` qua `postinstall`. Máy chủ mặc định ở `http://localhost:5000`; mở `http://localhost:5000/` để kiểm tra phản hồi. Các script được khai báo là `dev`, `start` và `build`; dự án hiện không khai báo `npm test` hay `npm run seed` trong `backend/package.json`.

### Frontend

Trong một terminal khác:

```bash
cd frontend
npm install
npm run dev
```

Vite thường chạy tại `http://localhost:5173`. Mặc định frontend gọi `http://localhost:5000/api`; có thể đặt `VITE_API_URL` trong `frontend/.env` nếu API ở địa chỉ khác. Build bằng `npm run build` và kiểm tra lint bằng `npm run lint` trong thư mục `frontend`.

## Đường dẫn thường dùng

| Trang | Đường dẫn |
| --- | --- |
| Trang chủ / đặt lịch | `/` / `/dat-lich-kham` |
| Đăng nhập / đăng ký | `/login` / `/register` |
| Quản trị | `/dashboard` |
| Bệnh nhân / bác sĩ / lịch hẹn | `/patients` / `/doctors-manage` / `/appointments` |
| Bệnh án / đơn thuốc / hóa đơn / tài khoản | `/medical-records` / `/prescriptions` / `/invoices` / `/users` |
| Cổng bác sĩ | `/doctor/ban-kham` |
| Cổng kế toán | `/accountant` hoặc `/ke-toan` |

Màn hình đăng nhập điền sẵn thông tin minh họa cho từng vai trò; đăng nhập chỉ thành công nếu tài khoản tương ứng tồn tại trong cơ sở dữ liệu. Không coi thông tin điền sẵn là tài khoản triển khai mặc định.
