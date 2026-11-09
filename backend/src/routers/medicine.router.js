const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");

const {
    getAllMedicinesController,
    getInventoryAlertsController,
    getInventoryOverviewStatsController,
    getMedicineByIdController,
    createMedicineController,
    updateMedicineController,
    importMedicineStockController,
    adjustMedicineStockController,
    deleteMedicineController,
} = require("../controllers/medicine.controller");

const {
    validateMedicineId,
    validateMedicineQuery,
    validateAlertQuery,
    validateCreateMedicine,
    validateUpdateMedicine,
    validateImportStock,
    validateAdjustStock,
} = require("../validators/medicine.validator");

const router = express.Router();

// 1. Lấy danh sách thuốc (Public - phục vụ tra cứu, xem bảng giá và tìm kiếm)
router.get("/", validateMedicineQuery, getAllMedicinesController);

// 2. Lấy danh sách cảnh báo tồn kho & hạn dùng (Admin, Bác sĩ, Y tá)
// Lưu ý: Đặt route tĩnh /alerts trước route động /:id
router.get(
    "/alerts",
    authMiddleware,
    roleMiddleware("Admin", "BacSi", "YTa"),
    validateAlertQuery,
    getInventoryAlertsController,
);

// 3. Thống kê tổng quan kho thuốc (Dashboard overview - Chỉ Admin)
router.get(
    "/stats/overview",
    authMiddleware,
    roleMiddleware("Admin"),
    getInventoryOverviewStatsController,
);

// 4. Lấy chi tiết thông tin một loại thuốc (Public)
router.get("/:id", validateMedicineId, getMedicineByIdController);

// 5. Thêm mới thuốc vào danh mục (Chỉ Admin)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("Admin"),
    validateCreateMedicine,
    createMedicineController,
);

// 6. Cập nhật thông tin thuốc (Chỉ Admin)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("Admin"),
    validateMedicineId,
    validateUpdateMedicine,
    updateMedicineController,
);

// 7. Nhập thêm hàng vào kho (Chỉ Admin)
router.post(
    "/:id/import",
    authMiddleware,
    roleMiddleware("Admin"),
    validateMedicineId,
    validateImportStock,
    importMedicineStockController,
);

// 8. Kiểm kê & điều chỉnh số lượng tồn kho (Chỉ Admin)
router.put(
    "/:id/stock",
    authMiddleware,
    roleMiddleware("Admin"),
    validateMedicineId,
    validateAdjustStock,
    adjustMedicineStockController,
);

// 9. Xóa thuốc khỏi danh mục (Chỉ Admin, có Safe Delete Guard)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("Admin"),
    validateMedicineId,
    deleteMedicineController,
);

module.exports = router;
