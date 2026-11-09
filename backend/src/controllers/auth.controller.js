const {
    registerService,
    loginService,
    getAllUsersService,
    toggleUserStatusService,
    createUserService,
} = require("../services/auth.service");

async function registerController(req, res, next) {
    try {
        const result = await registerService(req.body);
        res.status(201).json({
            message: "Đăng ký tài khoản thành công",
            user: result,
        });
    } catch (error) {
        next(error);
    }
}
async function loginController(req, res, next) {
    try {
        const result = await loginService(req.body);
        res.status(201).json({
            message: "Đăng nhập tài khoản thành công",
            user: result,
        });
    } catch (error) {
        next(error);
    }
}
async function getAllUsersController(req, res, next) {
    try {
        const users = await getAllUsersService();
        res.status(200).json({
            success: true,
            message: "Lấy danh sách người dùng thành công",
            data: users,
        });
    } catch (error) {
        next(error);
    }
}

async function toggleUserStatusController(req, res, next) {
    try {
        const updated = await toggleUserStatusService(req.params.id);
        res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái tài khoản thành công",
            data: updated,
        });
    } catch (error) {
        next(error);
    }
}

async function createUserController(req, res, next) {
    try {
        const newUser = await createUserService(req.body);
        res.status(201).json({
            success: true,
            message: "Tạo tài khoản mới thành công",
            data: newUser,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    registerController,
    loginController,
    getAllUsersController,
    toggleUserStatusController,
    createUserController,
};
