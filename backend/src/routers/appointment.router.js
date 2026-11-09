// ========================================================
// ROUTER: PHÂN HỆ LỊCH HẸN KHÁM BỆNH (APPOINTMENT)
// ========================================================

const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");

const {
    createAppointmentController,
    getMyAppointmentsController,
    getAllAppointmentsController,
    getAppointmentByIdController,
    updateAppointmentStatusController,
    rescheduleAppointmentController,
    cancelAppointmentController,
} = require("../controllers/appointment.controller");

const {
    validateAppointmentId,
    validateCreateAppointment,
    validateAppointmentStatus,
    validateRescheduleAppointment,
    validateAppointmentQuery,
} = require("../validators/appointment.validator");

const router = express.Router();

const { optionalAuthMiddleware } = require("../middlewares/auth.middleware");

// 1. Bệnh nhân đặt lịch trực tuyến (Đã đăng nhập hoặc Khách vãng lai) / Lễ tân đặt hộ tại quầy
router.post(
    "/",
    optionalAuthMiddleware,
    validateCreateAppointment,
    createAppointmentController,
);

// 2. Bệnh nhân xem danh sách lịch hẹn của chính mình
router.get(
    "/my-appointments",
    authMiddleware,
    roleMiddleware("BenhNhan"),
    getMyAppointmentsController,
);

// 3. Nhân viên y tế & Quản trị viên tra cứu danh sách lịch hẹn
router.get(
    "/",
    authMiddleware,
    roleMiddleware("Admin", "LeTan", "BacSi"),
    validateAppointmentQuery,
    getAllAppointmentsController,
);

// 4. Xem chi tiết 1 lịch hẹn
router.get(
    "/:id",
    authMiddleware,
    validateAppointmentId,
    getAppointmentByIdController,
);

// 5. Cập nhật trạng thái lịch hẹn (Duyệt, Tiếp đón, Hoàn tất khám, Hủy)
router.put(
    "/:id/status",
    authMiddleware,
    validateAppointmentId,
    validateAppointmentStatus,
    updateAppointmentStatusController,
);

// 6. Dời ngày giờ khám / đổi bác sĩ
router.put(
    "/:id/reschedule",
    authMiddleware,
    validateAppointmentId,
    validateRescheduleAppointment,
    rescheduleAppointmentController,
);

// 7. Hủy lịch hẹn
router.delete(
    "/:id",
    authMiddleware,
    validateAppointmentId,
    cancelAppointmentController,
);

module.exports = router;
