# Hệ Thống Quản Lý Phòng Khám (Clinic Management System)

Dự án phần mềm quản lý phòng khám toàn diện, được kiến trúc theo mô hình Client-Server hiện đại, bao gồm cổng thông tin công cộng cho bệnh nhân và hệ thống quản trị chuyên sâu cho đội ngũ y bác sĩ & nhân viên y tế.

---

## 📁 Cấu Trúc Dự Án

```text
clinic-management/ (QLPK)
│
├── frontend/                  # Ứng dụng Giao diện ReactJS (Vite)
│   ├── public/                # Static assets & favicons
│   ├── src/
│   │   ├── assets/            # Hình ảnh minh họa, icons, styles
│   │   ├── components/        # Component tái sử dụng
│   │   │   ├── common/        # PageTitle, ScrollTop, LoadingSpinner, StatusBadge
│   │   │   ├── layout/        # Header, Footer, MainLayout, AdminLayout
│   │   │   ├── patient/       # PatientCard, PatientTable, PatientForm
│   │   │   ├── doctor/        # DoctorCard, DoctorFilter
│   │   │   └── appointment/   # AppointmentBookingForm, AppointmentCard, AppointmentTable
│   │   │
│   │   ├── pages/             # Các trang giao diện
│   │   │   ├── auth/          # Login, Register
│   │   │   ├── dashboard/     # Tổng quan quản trị phòng khám
│   │   │   ├── patients/      # Quản lý hồ sơ bệnh nhân
│   │   │   ├── doctors/       # Quản lý & hiển thị danh sách bác sĩ
│   │   │   ├── appointments/  # Quản lý & đặt lịch khám bệnh
│   │   │   ├── medical-records/ # Quản lý hồ sơ bệnh án điện tử (EMR)
│   │   │   ├── prescriptions/ # Quản lý kê đơn thuốc
│   │   │   ├── invoices/      # Quản lý hóa đơn & thu phí
│   │   │   └── users/         # Phân quyền & tài khoản người dùng
│   │   │
│   │   ├── services/          # Tầng giao tiếp API (Axios/Fetch Client)
│   │   │   ├── authService.js
│   │   │   ├── patientService.js
│   │   │   ├── doctorService.js
│   │   │   ├── appointmentService.js
│   │   │   ├── medicalRecordService.js
│   │   │   ├── prescriptionService.js
│   │   │   └── invoiceService.js
│   │   │
│   │   ├── hooks/             # Custom Hooks (useAuth, useAppointments, usePatients)
│   │   ├── routes/            # Cấu hình định tuyến (AppRoutes)
│   │   ├── context/           # React Context (AuthContext)
│   │   ├── store/             # Global state management
│   │   ├── utils/             # Formatters, helpers
│   │   ├── constants/         # Role, Status, API config
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── .env
│
├── backend/                   # Ứng dụng Máy chủ API Node.js + Express
│   ├── src/
│   │   ├── config/            # Cấu hình CSDL, CORS, JWT
│   │   ├── routes/            # Định tuyến RESTful API endpoints
│   │   ├── middlewares/       # Middleware xác thực, phân quyền, xử lý lỗi
│   │   ├── controllers/       # Điều khiển luồng request/response
│   │   ├── services/          # Xử lý logic nghiệp vụ y tế
│   │   ├── repositories/      # Tầng truy xuất dữ liệu
│   │   ├── models/            # Mô hình dữ liệu thực thể (Entities)
│   │   ├── validators/        # Kiểm tra tính hợp lệ của input
│   │   ├── utils/             # Helper mã hóa mật khẩu, JWT, response chuẩn
│   │   ├── constants/         # HTTP status, Role, Messages
│   │   ├── app.js             # Khởi tạo Express App
│   │   └── server.js          # Điểm khởi chạy HTTP Server
│   │
│   ├── tests/                 # Unit tests (Node Test Runner)
│   ├── migrations/            # Kịch bản khởi tạo CSDL (SQL)
│   ├── seeds/                 # Dữ liệu mẫu khởi đầu
│   ├── package.json
│   └── .env
│
├── README.md
└── .gitignore
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Khởi chạy Frontend (ReactJS)

```bash
cd frontend
npm install
npm run dev
```

Ứng dụng frontend sẽ chạy tại: `http://localhost:5173`

- **Trang chủ & Cổng thông tin:** `http://localhost:5173/`
- **Đặt lịch khám:** `http://localhost:5173/dat-lich-kham`
- **Đội ngũ bác sĩ:** `http://localhost:5173/bac-si`
- **Bảng điều khiển quản trị (Dashboard):** `http://localhost:5173/dashboard`
- **Đăng nhập quản trị:** `http://localhost:5173/login` (Tài khoản mẫu: `admin@phongkham.vn` / `123456`)

### 2. Khởi chạy Backend (Node.js + Express)

```bash
cd backend
npm install
npm run dev
```

API Server sẽ lắng nghe tại: `http://localhost:5000`

- **Kiểm tra trạng thái máy chủ:** `http://localhost:5000/api/health`
- **Chạy kiểm thử tự động:** `npm test`
- **Nạp dữ liệu mẫu:** `npm run seed`

---

## 🩺 Các Phân Hệ Chính

1. **Cổng Thông Tin Công Cộng (Portal)**:
   - Giới thiệu phòng khám, chuyên khoa, dịch vụ và bảng giá.
   - Đặt lịch khám trực tuyến với form xác nhận tự động.
   - Tra cứu đội ngũ bác sĩ chuyên khoa.

2. **Hệ Thống Quản Lý Phòng Khám (Admin & Clinic Management)**:
   - **Tổng quan (Dashboard):** Thống kê số lượng bệnh nhân, lịch hẹn trong ngày, doanh thu thu được.
   - **Bệnh nhân (Patients):** Tiếp nhận bệnh nhân mới, quản lý hồ sơ nhân khẩu học, nhóm máu, dị ứng.
   - **Lịch hẹn (Appointments):** Quản lý và duyệt lịch khám, xác nhận hoặc hủy lịch.
   - **Bác sĩ (Doctors):** Quản lý hồ sơ bác sĩ, phân khoa và lịch công tác.
   - **Bệnh án điện tử (Medical Records):** Lưu trữ chẩn đoán bệnh, triệu chứng lâm sàng và chỉ định.
   - **Đơn thuốc (Prescriptions):** Kê đơn thuốc, liều dùng và lời dặn bác sĩ.
   - **Hóa đơn (Invoices):** Xuất phiếu thu tiền khám và thuốc, theo dõi trạng thái thanh toán.
   - **Tài khoản & Phân quyền (Users):** Quản lý phân quyền Quản trị viên, Bác sĩ, Tiếp tân, Dược sĩ.
