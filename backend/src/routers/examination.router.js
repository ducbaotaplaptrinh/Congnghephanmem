const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");

const {
    createExaminationController,
    getAllExaminationsController,
    getExaminationByIdController,
    updateExaminationController,
    addServicesToExaminationController,
    updateServiceResultController,
    removeServiceFromExaminationController,
    deleteExaminationController,
} = require("../controllers/examination.controller");

const {
    validateExaminationId,
    validateDetailIdParam,
    validateExaminationQuery,
    validateCreateExamination,
    validateUpdateExamination,
    validateAddServices,
    validateUpdateServiceResult,
} = require("../validators/examination.validator");

const router = express.Router();

// Tạo phiếu khám bệnh & chỉ định cận lâm sàng (Bác sĩ, Admin)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("BacSi", "Admin"),
    validateCreateExamination,
    createExaminationController,
);

// Lấy danh sách phiếu khám bệnh (Bác sĩ, Admin, Lễ tân, Bệnh nhân)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("BacSi", "Admin", "LeTan", "BenhNhan"),
    validateExaminationQuery,
    getAllExaminationsController,
);

// Xem chi tiết thông tin một phiếu khám bệnh
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("BacSi", "Admin", "LeTan", "BenhNhan"),
    validateExaminationId,
    getExaminationByIdController,
);

// Bác sĩ cập nhật phiếu khám bệnh (chẩn đoán, triệu chứng, kết luận)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("BacSi", "Admin"),
    validateExaminationId,
    validateUpdateExamination,
    updateExaminationController,
);

// Bác sĩ chỉ định bổ sung danh sách dịch vụ cận lâm sàng
router.post(
    "/:id/services",
    authMiddleware,
    roleMiddleware("BacSi", "Admin"),
    validateExaminationId,
    validateAddServices,
    addServicesToExaminationController,
);

// Cập nhật kết quả khám cận lâm sàng (Bác sĩ, Kỹ thuật viên / Y tá, Admin)
router.put(
    "/:id/services/:detailId",
    authMiddleware,
    roleMiddleware("BacSi", "Admin", "YTa"),
    validateExaminationId,
    validateDetailIdParam,
    validateUpdateServiceResult,
    updateServiceResultController,
);

// Hủy một chỉ định cận lâm sàng khỏi phiếu khám (Bác sĩ, Admin)
router.delete(
    "/:id/services/:detailId",
    authMiddleware,
    roleMiddleware("BacSi", "Admin"),
    validateExaminationId,
    validateDetailIdParam,
    removeServiceFromExaminationController,
);

// Xóa phiếu khám bệnh (Safe Delete Guard - Bác sĩ, Admin)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("BacSi", "Admin"),
    validateExaminationId,
    deleteExaminationController,
);

module.exports = router;
