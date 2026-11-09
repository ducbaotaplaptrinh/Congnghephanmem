const {
    getAllMedicinesService,
    getMedicineByIdService,
    createMedicineService,
    updateMedicineService,
    importMedicineStockService,
    adjustMedicineStockService,
    getInventoryAlertsService,
    getInventoryOverviewStatsService,
    deleteMedicineService,
} = require("../services/medicine.service");

// 1. Lấy danh sách thuốc (kèm tìm kiếm, lọc khoảng giá, trạng thái tồn kho, phân trang)
async function getAllMedicinesController(req, res, next) {
    try {
        const result = await getAllMedicinesService(req.query);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách thuốc thành công!",
            data: result.medicines,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
}

// 2. Lấy danh sách cảnh báo tồn kho & hạn sử dụng
async function getInventoryAlertsController(req, res, next) {
    try {
        const result = await getInventoryAlertsService(req.query);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách cảnh báo tồn kho và hạn sử dụng thành công!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 3. Thống kê tổng quan kho thuốc (Dashboard overview)
async function getInventoryOverviewStatsController(req, res, next) {
    try {
        const result = await getInventoryOverviewStatsService();
        return res.status(200).json({
            success: true,
            message: "Lấy dữ liệu thống kê tổng quan kho thuốc thành công!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 4. Lấy chi tiết thông tin một loại thuốc
async function getMedicineByIdController(req, res, next) {
    try {
        const result = await getMedicineByIdService(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Lấy thông tin chi tiết thuốc thành công!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 5. Thêm mới thuốc vào danh mục
async function createMedicineController(req, res, next) {
    try {
        const result = await createMedicineService(req.body);
        return res.status(201).json({
            success: true,
            message: "Thêm mới thuốc vào danh mục thành công!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 6. Cập nhật thông tin thuốc
async function updateMedicineController(req, res, next) {
    try {
        const result = await updateMedicineService(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: "Cập nhật thông tin thuốc thành công!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 7. Nhập thêm hàng vào kho (Stock Import)
async function importMedicineStockController(req, res, next) {
    try {
        const result = await importMedicineStockService(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: `Nhập kho thành công ${result.importDetails.soluongnhap} đơn vị cho thuốc \"${result.medicine.tenthuoc}\"!`,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 8. Kiểm kê & điều chỉnh tồn kho (Stock Adjustment)
async function adjustMedicineStockController(req, res, next) {
    try {
        const result = await adjustMedicineStockService(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: `Điều chỉnh số lượng tồn kho thành công (${result.adjustmentDetails.soluongtoncu} -> ${result.adjustmentDetails.soluongtonmoi})!`,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// 9. Xóa thuốc khỏi danh mục (Safe Delete Guard)
async function deleteMedicineController(req, res, next) {
    try {
        const result = await deleteMedicineService(req.params.id);
        return res.status(200).json({
            success: true,
            message: `Xóa thuốc \"${result.tenthuoc}\" thành công!`,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllMedicinesController,
    getInventoryAlertsController,
    getInventoryOverviewStatsController,
    getMedicineByIdController,
    createMedicineController,
    updateMedicineController,
    importMedicineStockController,
    adjustMedicineStockController,
    deleteMedicineController,
};
