const express = require("express");
const authController = require("../controllers/auth.controller");
const {
    validateRegister,
    validateLogin,
} = require("../validators/auth.validator");
const authMiddleware = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");

const router = express.Router();

router.post("/register", validateRegister, authController.registerController);
router.post("/login", validateLogin, authController.loginController);
// 2. Task 2: Protected Endpoints (Dùng để test Verify Token & RBAC)
// Route A: Bất kỳ ai có Token hợp lệ đều vào được (Xem Profile cá nhân)
router.get("/profile", authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Xác thực Token thành công! Đây là thông tin cá nhân của bạn.",
        user: req.user,
    });
});
// Route B: Chỉ dành riêng cho Admin (Test cấm Bệnh nhân vào)
router.get(
    "/admin-only",
    authMiddleware,
    roleMiddleware("Admin"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message:
                "Chào mừng Quản trị viên (Admin) truy cập khu vực nhạy cảm!",
        });
    },
);
// Route C: Dành cho Bệnh nhân (Hoặc Bác sĩ)
router.get(
    "/patient-only",
    authMiddleware,
    roleMiddleware("BenhNhan", "BacSi"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Truy cập khu vực Bệnh nhân & Bác sĩ thành công!",
        });
    },
);

// ========================================================
// QUẢN TRỊ NGƯỜI DÙNG & TÀI KHOẢN (ADMIN USERS MANAGEMENT)
// ========================================================
router.get(
    "/users",
    authMiddleware,
    roleMiddleware("Admin", "BacSi", "LeTan"),
    authController.getAllUsersController,
);

router.post(
    "/users",
    authMiddleware,
    roleMiddleware("Admin"),
    authController.createUserController,
);

router.put(
    "/users/:id/status",
    authMiddleware,
    roleMiddleware("Admin"),
    authController.toggleUserStatusController,
);

module.exports = router;
