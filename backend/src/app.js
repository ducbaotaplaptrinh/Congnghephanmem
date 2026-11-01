const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authRoutes = require("./routers/auth.router");
const patientRoutes = require("./routers/patient.router");
const specialtyRoutes = require("./routers/specialty.router");
const doctorRoutes = require("./routers/doctor.router");
const roomRoutes = require("./routers/room.router");
const serviceRoutes = require("./routers/service.router");
const shiftRoutes = require("./routers/shift.router");
const appointmentRoutes = require("./routers/appointment.router");
const invoiceRoutes = require("./routers/invoice.router");
const statisticRoutes = require("./routers/statistic.router");
const examinationRoutes = require("./routers/examination.router");
const medicineRoutes = require("./routers/medicine.router");
const prescriptionRoutes = require("./routers/prescription.router");
const errorMiddleware = require("./middlewares/error.middleware");
const app = express();

// ========================================================
// 1. CẤU HÌNH CÁC MIDDLEWARE CƠ BẢN
// ========================================================
app.use(helmet()); // Bảo mật HTTP headers
// Cấu hình CORS bảo mật: kiểm soát danh sách domain được phép truy cập
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : ["http://localhost:3000", "http://localhost:5173"];

app.use(
    cors({
        origin: (origin, callback) => {
            // Cho phép các công cụ test (Postman, curl) hoặc domain trong whitelist
            if (
                !origin ||
                allowedOrigins.includes(origin) ||
                process.env.NODE_ENV !== "production"
            ) {
                return callback(null, true);
            }
            return callback(
                new Error(
                    `CORS blocked: Nguồn [${origin}] không có quyền gọi API!`,
                ),
            );
        },
        credentials: true,
    }),
);
app.use(morgan("dev")); // Log các request gửi lên server trong môi trường dev
app.use(express.json({ limit: "10mb" })); // Phân tích dữ liệu JSON từ body request (hỗ trợ ảnh đại diện Base64)
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Phân tích dữ liệu từ urlencoded form

// ========================================================
// 2. ROUTE KIỂM TRA HỆ THỐNG (HEALTH CHECK)
// ========================================================
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Chào mừng đến với API Hệ Thống Quản Lý Phòng Khám!",
        timestamp: new Date().toISOString(),
    });
});

// ========================================================
// 3. ĐĂNG KÝ CÁC ROUTERS CHÍNH CỦA HỆ THỐNG
// Đăng ký router cho auth
app.use("/api/auth", authRoutes);

// Đăng ký router cho patient
app.use("/api/patients", patientRoutes);

// Đăng ký router cho master data chuyên khoa
app.use("/api/specialties", specialtyRoutes);

// Đăng ký router cho master data bác sĩ
app.use("/api/doctors", doctorRoutes);

// Đăng ký router cho master data phòng khám
app.use("/api/rooms", roomRoutes);

// Đăng ký router cho master data dịch vụ
app.use("/api/services", serviceRoutes);

// Đăng ký router cho quản lý ca làm việc và phân công trực
app.use("/api/shifts", shiftRoutes);

// Đăng ký router cho đặt lịch khám trực tuyến và quản lý lịch hẹn
app.use("/api/appointments", appointmentRoutes);

// Đăng ký router cho thanh toán và hóa đơn viện phí
app.use("/api/invoices", invoiceRoutes);

// Đăng ký router cho báo cáo thống kê và dashboard Admin
app.use("/api/statistics", statisticRoutes);

// Đăng ký router cho phiếu khám bệnh và chỉ định cận lâm sàng
app.use("/api/examinations", examinationRoutes);

// Đăng ký router cho kho thuốc, danh mục dược phẩm & cảnh báo tồn kho
app.use("/api/medicines", medicineRoutes);

// Đăng ký router cho kê đơn thuốc điện tử & tự động kiểm tra/trừ kho
app.use("/api/prescriptions", prescriptionRoutes);

// ========================================================
// 4. XỬ LÝ KHI KHÔNG TÌM THẤY ROUTE (404 NOT FOUND)
// ========================================================
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Đường dẫn [${req.method}] ${req.originalUrl} không tồn tại trên hệ thống!`,
    });
});

// ========================================================
// 5. XỬ LÝ LỖI TẬP TRUNG TOÀN CỤC (GLOBAL ERROR HANDLER)
// ========================================================
app.use(errorMiddleware);

module.exports = app;
