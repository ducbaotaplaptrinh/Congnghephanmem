const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");

const {
    createPrescriptionController,
    getAllPrescriptionsController,
    getPrescriptionByIdController,
    getPrescriptionByExamIdController,
    updatePrescriptionController,
    deletePrescriptionController,
} = require("../controllers/prescription.controller");

const {
    validatePrescriptionId,
    validateExamIdParam,
    validatePrescriptionQuery,
    validateCreatePrescription,
    validateUpdatePrescription,
} = require("../validators/prescription.validator");

const router = express.Router();

// Tất cả các endpoints đơn thuốc yêu cầu xác thực người dùng
router.use(authMiddleware);

// 1. Tạo mới đơn thuốc điện tử (Chỉ Bác sĩ & Admin)
router.post(
    "/",
    roleMiddleware("BacSi", "Admin"),
    validateCreatePrescription,
    createPrescriptionController
);

// 2. Lấy danh sách đơn thuốc (Admin, Bác sĩ, Lễ tân, Y tá, Bệnh nhân)
router.get(
    "/",
    roleMiddleware("BacSi", "Admin", "LeTan", "YTa", "BenhNhan"),
    validatePrescriptionQuery,
    getAllPrescriptionsController
);

// 3. Lấy đơn thuốc theo mã lần khám bệnh (:examId)
// Lưu ý: Đặt route /exam/:examId trước route động /:id để tránh xung đột routing
router.get(
    "/exam/:examId",
    roleMiddleware("BacSi", "Admin", "LeTan", "YTa", "BenhNhan"),
    validateExamIdParam,
    getPrescriptionByExamIdController
);

// 4. Lấy chi tiết đơn thuốc theo ID (:id)
router.get(
    "/:id",
    roleMiddleware("BacSi", "Admin", "LeTan", "YTa", "BenhNhan"),
    validatePrescriptionId,
    getPrescriptionByIdController
);

// 5. Cập nhật đơn thuốc điện tử (Chỉ Bác sĩ & Admin)
router.put(
    "/:id",
    roleMiddleware("BacSi", "Admin"),
    validatePrescriptionId,
    validateUpdatePrescription,
    updatePrescriptionController
);

// 6. Xóa / Hủy đơn thuốc điện tử và hoàn kho (Chỉ Bác sĩ & Admin)
router.delete(
    "/:id",
    roleMiddleware("BacSi", "Admin"),
    validatePrescriptionId,
    deletePrescriptionController
);

module.exports = router;
