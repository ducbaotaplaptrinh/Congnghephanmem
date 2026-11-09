const {
    createPrescriptionService,
    getAllPrescriptionsService,
    getPrescriptionByIdService,
    getPrescriptionByExamIdService,
    updatePrescriptionService,
    deletePrescriptionService,
} = require("../services/prescription.service");

// 1. Tạo mới đơn thuốc điện tử
async function createPrescriptionController(req, res, next) {
    try {
        const result = await createPrescriptionService(req.body, req.user);
        return res.status(201).json({
            success: true,
            message: "Kê đơn thuốc điện tử thành công! Đã tự động kiểm tra và trừ tồn kho thuốc.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 2. Lấy danh sách đơn thuốc (tìm kiếm, lọc, phân trang)
async function getAllPrescriptionsController(req, res, next) {
    try {
        const result = await getAllPrescriptionsService(req.query, req.user);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đơn thuốc thành công!",
            data: result.prescriptions,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
}

// 3. Lấy chi tiết đơn thuốc theo ID (:id)
async function getPrescriptionByIdController(req, res, next) {
    try {
        const result = await getPrescriptionByIdService(req.params.id, req.user);
        return res.status(200).json({
            success: true,
            message: "Lấy chi tiết đơn thuốc thành công!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 4. Lấy đơn thuốc theo mã lần khám bệnh (:examId)
async function getPrescriptionByExamIdController(req, res, next) {
    try {
        const result = await getPrescriptionByExamIdService(req.params.examId, req.user);
        return res.status(200).json({
            success: true,
            message: "Lấy thông tin đơn thuốc của lần khám bệnh thành công!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 5. Cập nhật đơn thuốc điện tử (:id)
async function updatePrescriptionController(req, res, next) {
    try {
        const result = await updatePrescriptionService(req.params.id, req.body, req.user);
        return res.status(200).json({
            success: true,
            message: "Cập nhật đơn thuốc điện tử và cân đối tồn kho thành công!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 6. Xóa / Hủy đơn thuốc điện tử (:id)
async function deletePrescriptionController(req, res, next) {
    try {
        const result = await deletePrescriptionService(req.params.id, req.user);
        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createPrescriptionController,
    getAllPrescriptionsController,
    getPrescriptionByIdController,
    getPrescriptionByExamIdController,
    updatePrescriptionController,
    deletePrescriptionController,
};
