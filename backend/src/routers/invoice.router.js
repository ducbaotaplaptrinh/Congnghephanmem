// ========================================================
// ROUTER: PHÂN HỆ HÓA ĐƠN VIỆN PHÍ (INVOICE)
// ========================================================

const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");

const {
    createInvoiceController,
    addInvoiceItemController,
    removeInvoiceItemController,
    payInvoiceController,
    cancelInvoiceController,
    getAllInvoicesController,
    getInvoiceByIdController,
    getMyInvoicesController,
} = require("../controllers/invoice.controller");

const {
    validateInvoiceId,
    validateCreateInvoice,
    validateInvoicePayment,
    validateAddInvoiceItem,
    validateInvoiceQuery,
} = require("../validators/invoice.validator");

const router = express.Router();

// 1. Khởi tạo hóa đơn từ lần khám bệnh (Admin, Lễ tân / Thu ngân, Bác sĩ khi hoàn thành ca khám)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("Admin", "LeTan", "BacSi"),
    validateCreateInvoice,
    createInvoiceController,
);

// 2. Bệnh nhân xem danh sách hóa đơn của mình
router.get(
    "/my-invoices",
    authMiddleware,
    roleMiddleware("BenhNhan"),
    getMyInvoicesController,
);

// 3. Nhân viên y tế & Quản trị viên xem danh sách hóa đơn
router.get(
    "/",
    authMiddleware,
    roleMiddleware("Admin", "LeTan", "BacSi"),
    validateInvoiceQuery,
    getAllInvoicesController,
);

// 4. Xem chi tiết một hóa đơn
router.get(
    "/:id",
    authMiddleware,
    validateInvoiceId,
    getInvoiceByIdController,
);

// 5. Thêm mục viện phí vào hóa đơn (Dịch vụ hoặc Thuốc phát sinh)
router.post(
    "/:id/items",
    authMiddleware,
    roleMiddleware("Admin", "LeTan"),
    validateInvoiceId,
    validateAddInvoiceItem,
    addInvoiceItemController,
);

// 6. Xóa mục viện phí khỏi hóa đơn (Trigger DB tự động giảm trừ tổng tiền)
router.delete(
    "/:id/items/:itemId",
    authMiddleware,
    roleMiddleware("Admin", "LeTan"),
    validateInvoiceId,
    removeInvoiceItemController,
);

// 7. Xác nhận thanh toán viện phí (hỗ trợ cả /pay và /payment)
router.put(
    "/:id/pay",
    authMiddleware,
    roleMiddleware("Admin", "LeTan"),
    validateInvoiceId,
    validateInvoicePayment,
    payInvoiceController,
);
router.put(
    "/:id/payment",
    authMiddleware,
    roleMiddleware("Admin", "LeTan"),
    validateInvoiceId,
    validateInvoicePayment,
    payInvoiceController,
);

// 8. Hủy hóa đơn viện phí
router.put(
    "/:id/cancel",
    authMiddleware,
    roleMiddleware("Admin", "LeTan"),
    validateInvoiceId,
    cancelInvoiceController,
);

module.exports = router;
