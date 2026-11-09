// ========================================================
// VALIDATOR: KIỂM TRA DỮ LIỆU ĐƠN THUỐC ĐIỆN TỬ
// ========================================================

// 1. Kiểm tra ID đơn thuốc trên params (:id)
function validatePrescriptionId(req, res, next) {
    const { id } = req.params;
    const numericId = Number(id);

    if (!id || !Number.isInteger(numericId) || numericId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã đơn thuốc (ID) không hợp lệ! Phải là số nguyên dương.",
        });
    }

    req.params.id = numericId;
    next();
}

// 2. Kiểm tra ID lần khám trên params (:examId)
function validateExamIdParam(req, res, next) {
    const { examId } = req.params;
    const numericId = Number(examId);

    if (!examId || !Number.isInteger(numericId) || numericId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã lần khám bệnh (examId) không hợp lệ! Phải là số nguyên dương.",
        });
    }

    req.params.examId = numericId;
    next();
}

// 3. Kiểm tra query parameters khi lọc danh sách đơn thuốc
function validatePrescriptionQuery(req, res, next) {
    const { mabn, mabs, malsk, fromDate, toDate, page, limit } = req.query;

    if (mabn !== undefined) {
        const numMabn = Number(mabn);
        if (!Number.isInteger(numMabn) || numMabn <= 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số mabn phải là số nguyên dương!",
            });
        }
        req.query.mabn = numMabn;
    }

    if (mabs !== undefined) {
        const numMabs = Number(mabs);
        if (!Number.isInteger(numMabs) || numMabs <= 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số mabs phải là số nguyên dương!",
            });
        }
        req.query.mabs = numMabs;
    }

    if (malsk !== undefined) {
        const numMalsk = Number(malsk);
        if (!Number.isInteger(numMalsk) || numMalsk <= 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số malsk phải là số nguyên dương!",
            });
        }
        req.query.malsk = numMalsk;
    }

    if (fromDate !== undefined) {
        const parsedFrom = new Date(fromDate);
        if (isNaN(parsedFrom.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Tham số fromDate không đúng định dạng ngày hợp lệ (YYYY-MM-DD)!",
            });
        }
    }

    if (toDate !== undefined) {
        const parsedTo = new Date(toDate);
        if (isNaN(parsedTo.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Tham số toDate không đúng định dạng ngày hợp lệ (YYYY-MM-DD)!",
            });
        }
    }

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
        return res.status(400).json({
            success: false,
            message: "fromDate không được lớn hơn toDate!",
        });
    }

    if (page !== undefined) {
        const pageNum = Number(page);
        if (!Number.isInteger(pageNum) || pageNum <= 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số page phải là số nguyên dương lớn hơn 0!",
            });
        }
        req.query.page = pageNum;
    }

    if (limit !== undefined) {
        const limitNum = Number(limit);
        if (!Number.isInteger(limitNum) || limitNum <= 0 || limitNum > 100) {
            return res.status(400).json({
                success: false,
                message: "Tham số limit phải là số nguyên dương từ 1 đến 100!",
            });
        }
        req.query.limit = limitNum;
    }

    next();
}

// 4. Kiểm tra dữ liệu khi tạo mới đơn thuốc điện tử
function validateCreatePrescription(req, res, next) {
    const { malsk, ghichubacsi, medicines } = req.body;

    // 4.1. Kiểm tra mã lần khám bệnh (malsk)
    const numMalsk = Number(malsk);
    if (!malsk || !Number.isInteger(numMalsk) || numMalsk <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã lần khám bệnh (malsk) là bắt buộc và phải là số nguyên dương!",
        });
    }
    req.body.malsk = numMalsk;

    // 4.2. Kiểm tra ghi chú dặn dò của bác sĩ (nếu có)
    if (ghichubacsi !== undefined && ghichubacsi !== null) {
        if (typeof ghichubacsi !== "string") {
            return res.status(400).json({
                success: false,
                message: "Ghi chú bác sĩ phải là chuỗi ký tự!",
            });
        }
        if (ghichubacsi.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Ghi chú bác sĩ không được vượt quá 1000 ký tự!",
            });
        }
        req.body.ghichubacsi = ghichubacsi.trim();
    }

    // 4.3. Kiểm tra danh sách thuốc trong đơn (medicines)
    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Danh sách thuốc trong đơn (medicines) là bắt buộc và phải chứa ít nhất một loại thuốc!",
        });
    }

    const seenMedicineIds = new Set();

    for (let i = 0; i < medicines.length; i++) {
        const item = medicines[i];
        if (!item || typeof item !== "object") {
            return res.status(400).json({
                success: false,
                message: `Dữ liệu thuốc tại dòng ${i + 1} không hợp lệ!`,
            });
        }

        // Kiểm tra mathuoc
        const numMathuoc = Number(item.mathuoc);
        if (!item.mathuoc || !Number.isInteger(numMathuoc) || numMathuoc <= 0) {
            return res.status(400).json({
                success: false,
                message: `Mã thuốc (mathuoc) tại dòng ${i + 1} phải là số nguyên dương!`,
            });
        }
        item.mathuoc = numMathuoc;

        // Chặn trùng lặp thuốc trong đơn
        if (seenMedicineIds.has(numMathuoc)) {
            return res.status(400).json({
                success: false,
                message: `Thuốc có mã ID #${numMathuoc} bị kê trùng lặp trong đơn! Vui lòng gộp chung vào một dòng.`,
            });
        }
        seenMedicineIds.add(numMathuoc);

        // Kiểm tra số lượng
        const numQty = Number(item.soluong);
        if (!item.soluong || !Number.isInteger(numQty) || numQty <= 0 || numQty > 1000) {
            return res.status(400).json({
                success: false,
                message: `Số lượng thuốc tại dòng ${i + 1} phải là số nguyên từ 1 đến 1000!`,
            });
        }
        item.soluong = numQty;

        // Kiểm tra liều dùng (nếu có)
        if (item.lieudung !== undefined && item.lieudung !== null) {
            if (typeof item.lieudung !== "string") {
                return res.status(400).json({
                    success: false,
                    message: `Liều dùng thuốc tại dòng ${i + 1} phải là chuỗi ký tự!`,
                });
            }
            if (item.lieudung.trim().length > 100) {
                return res.status(400).json({
                    success: false,
                    message: `Liều dùng thuốc tại dòng ${i + 1} không được vượt quá 100 ký tự!`,
                });
            }
            item.lieudung = item.lieudung.trim();
        }

        // Kiểm tra thời gian sử dụng (nếu có)
        if (item.thoigiansudung !== undefined && item.thoigiansudung !== null) {
            if (typeof item.thoigiansudung !== "string") {
                return res.status(400).json({
                    success: false,
                    message: `Thời gian sử dụng thuốc tại dòng ${i + 1} phải là chuỗi ký tự!`,
                });
            }
            if (item.thoigiansudung.trim().length > 100) {
                return res.status(400).json({
                    success: false,
                    message: `Thời gian sử dụng thuốc tại dòng ${i + 1} không được vượt quá 100 ký tự!`,
                });
            }
            item.thoigiansudung = item.thoigiansudung.trim();
        }
    }

    next();
}

// 5. Kiểm tra dữ liệu khi cập nhật đơn thuốc
function validateUpdatePrescription(req, res, next) {
    const { ghichubacsi, medicines } = req.body;

    if (ghichubacsi === undefined && medicines === undefined) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp ít nhất một thông tin cần cập nhật (ghichubacsi hoặc medicines)!",
        });
    }

    if (ghichubacsi !== undefined && ghichubacsi !== null) {
        if (typeof ghichubacsi !== "string") {
            return res.status(400).json({
                success: false,
                message: "Ghi chú bác sĩ phải là chuỗi ký tự!",
            });
        }
        if (ghichubacsi.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Ghi chú bác sĩ không được vượt quá 1000 ký tự!",
            });
        }
        req.body.ghichubacsi = ghichubacsi.trim();
    }

    if (medicines !== undefined) {
        if (!Array.isArray(medicines) || medicines.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Danh sách thuốc (medicines) phải là mảng chứa ít nhất một loại thuốc!",
            });
        }

        const seenMedicineIds = new Set();

        for (let i = 0; i < medicines.length; i++) {
            const item = medicines[i];
            const numMathuoc = Number(item.mathuoc);
            if (!item.mathuoc || !Number.isInteger(numMathuoc) || numMathuoc <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Mã thuốc tại dòng ${i + 1} phải là số nguyên dương!`,
                });
            }
            item.mathuoc = numMathuoc;

            if (seenMedicineIds.has(numMathuoc)) {
                return res.status(400).json({
                    success: false,
                    message: `Thuốc có mã ID #${numMathuoc} bị trùng lặp trong đơn!`,
                });
            }
            seenMedicineIds.add(numMathuoc);

            const numQty = Number(item.soluong);
            if (!item.soluong || !Number.isInteger(numQty) || numQty <= 0 || numQty > 1000) {
                return res.status(400).json({
                    success: false,
                    message: `Số lượng thuốc tại dòng ${i + 1} phải là số nguyên từ 1 đến 1000!`,
                });
            }
            item.soluong = numQty;

            if (item.lieudung !== undefined && item.lieudung !== null) {
                item.lieudung = typeof item.lieudung === "string" ? item.lieudung.trim() : null;
            }
            if (item.thoigiansudung !== undefined && item.thoigiansudung !== null) {
                item.thoigiansudung = typeof item.thoigiansudung === "string" ? item.thoigiansudung.trim() : null;
            }
        }
    }

    next();
}

module.exports = {
    validatePrescriptionId,
    validateExamIdParam,
    validatePrescriptionQuery,
    validateCreatePrescription,
    validateUpdatePrescription,
};
