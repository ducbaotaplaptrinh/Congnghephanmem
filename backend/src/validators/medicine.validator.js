const { VALID_STOCK_STATUSES } = require("../constants/medicine.constant");

// 1. Kiểm tra ID thuốc trên params (:id)
function validateMedicineId(req, res, next) {
    const { id } = req.params;
    const numericId = Number(id);

    if (!id || !Number.isInteger(numericId) || numericId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã thuốc (ID) không hợp lệ! Phải là số nguyên dương.",
        });
    }

    req.params.id = numericId;
    next();
}

// 2. Kiểm tra query parameters khi lọc danh sách thuốc
function validateMedicineQuery(req, res, next) {
    const { search, minPrice, maxPrice, stockStatus, page, limit } = req.query;

    if (search !== undefined) {
        if (typeof search !== "string") {
            return res.status(400).json({
                success: false,
                message: "Tham số tìm kiếm search phải là chuỗi ký tự!",
            });
        }
        req.query.search = search.trim();
    }

    if (minPrice !== undefined) {
        const min = Number(minPrice);
        if (isNaN(min) || min < 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số minPrice phải là số không âm!",
            });
        }
        req.query.minPrice = min;
    }

    if (maxPrice !== undefined) {
        const max = Number(maxPrice);
        if (isNaN(max) || max < 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số maxPrice phải là số không âm!",
            });
        }
        req.query.maxPrice = max;
    }

    if (req.query.minPrice !== undefined && req.query.maxPrice !== undefined) {
        if (req.query.minPrice > req.query.maxPrice) {
            return res.status(400).json({
                success: false,
                message: "Giá trị minPrice không được lớn hơn maxPrice!",
            });
        }
    }

    if (stockStatus !== undefined) {
        if (!VALID_STOCK_STATUSES.includes(stockStatus)) {
            return res.status(400).json({
                success: false,
                message: `Trạng thái tồn kho không hợp lệ! Chỉ chấp nhận: ${VALID_STOCK_STATUSES.join(", ")}`,
            });
        }
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

// 3. Kiểm tra query parameters cho API cảnh báo tồn kho
function validateAlertQuery(req, res, next) {
    const { threshold, days } = req.query;

    if (threshold !== undefined) {
        const numThreshold = Number(threshold);
        if (!Number.isInteger(numThreshold) || numThreshold <= 0 || numThreshold > 1000) {
            return res.status(400).json({
                success: false,
                message: "Tham số threshold (ngưỡng tồn kho) phải là số nguyên dương từ 1 đến 1000!",
            });
        }
        req.query.threshold = numThreshold;
    }

    if (days !== undefined) {
        const numDays = Number(days);
        if (!Number.isInteger(numDays) || numDays <= 0 || numDays > 365) {
            return res.status(400).json({
                success: false,
                message: "Tham số days (số ngày cận hạn) phải là số nguyên dương từ 1 đến 365!",
            });
        }
        req.query.days = numDays;
    }

    next();
}

// 4. Kiểm tra dữ liệu khi tạo mới thuốc
function validateCreateMedicine(req, res, next) {
    const { tenthuoc, donvitinh, dongia, soluongton, hansudung, nhasanxuat } = req.body;

    // Tên thuốc (Bắt buộc)
    if (!tenthuoc || typeof tenthuoc !== "string" || tenthuoc.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "Tên thuốc là bắt buộc và không được để trống!",
        });
    }
    const trimmedName = tenthuoc.trim();
    if (trimmedName.length < 2 || trimmedName.length > 150) {
        return res.status(400).json({
            success: false,
            message: "Tên thuốc phải có độ dài từ 2 đến 150 ký tự!",
        });
    }
    req.body.tenthuoc = trimmedName;

    // Đơn vị tính (Bắt buộc)
    if (!donvitinh || typeof donvitinh !== "string" || donvitinh.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "Đơn vị tính là bắt buộc (ví dụ: Viên, Vỉ, Hộp, Chai, Lọ, Gói)!",
        });
    }
    const trimmedUnit = donvitinh.trim();
    if (trimmedUnit.length > 20) {
        return res.status(400).json({
            success: false,
            message: "Đơn vị tính không được vượt quá 20 ký tự!",
        });
    }
    req.body.donvitinh = trimmedUnit;

    // Đơn giá (Bắt buộc, > 0)
    if (dongia === undefined || dongia === null) {
        return res.status(400).json({
            success: false,
            message: "Đơn giá thuốc là bắt buộc!",
        });
    }
    const numPrice = Number(dongia);
    if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({
            success: false,
            message: "Đơn giá thuốc phải là số dương lớn hơn 0!",
        });
    }
    req.body.dongia = numPrice;

    // Số lượng tồn (Tùy chọn, mặc định 0)
    if (soluongton !== undefined && soluongton !== null) {
        const numStock = Number(soluongton);
        if (!Number.isInteger(numStock) || numStock < 0) {
            return res.status(400).json({
                success: false,
                message: "Số lượng tồn ban đầu phải là số nguyên không âm!",
            });
        }
        req.body.soluongton = numStock;
    } else {
        req.body.soluongton = 0;
    }

    // Hạn sử dụng (Bắt buộc)
    if (!hansudung) {
        return res.status(400).json({
            success: false,
            message: "Hạn sử dụng của thuốc là bắt buộc (YYYY-MM-DD)!",
        });
    }
    const parsedDate = new Date(hansudung);
    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: "Hạn sử dụng không đúng định dạng ngày hợp lệ (YYYY-MM-DD)!",
        });
    }
    req.body.hansudung = parsedDate;

    // Nhà sản xuất (Tùy chọn)
    if (nhasanxuat !== undefined && nhasanxuat !== null) {
        if (typeof nhasanxuat !== "string") {
            return res.status(400).json({
                success: false,
                message: "Tên nhà sản xuất phải là chuỗi ký tự!",
            });
        }
        if (nhasanxuat.trim().length > 100) {
            return res.status(400).json({
                success: false,
                message: "Tên nhà sản xuất không được vượt quá 100 ký tự!",
            });
        }
        req.body.nhasanxuat = nhasanxuat.trim();
    }

    next();
}

// 5. Kiểm tra dữ liệu khi cập nhật thông tin thuốc
function validateUpdateMedicine(req, res, next) {
    const { tenthuoc, donvitinh, dongia, soluongton, hansudung, nhasanxuat } = req.body;

    if (
        tenthuoc === undefined &&
        donvitinh === undefined &&
        dongia === undefined &&
        soluongton === undefined &&
        hansudung === undefined &&
        nhasanxuat === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp ít nhất một thông tin cần cập nhật!",
        });
    }

    if (tenthuoc !== undefined) {
        if (typeof tenthuoc !== "string" || tenthuoc.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Tên thuốc không được để trống!",
            });
        }
        const trimmedName = tenthuoc.trim();
        if (trimmedName.length < 2 || trimmedName.length > 150) {
            return res.status(400).json({
                success: false,
                message: "Tên thuốc phải có độ dài từ 2 đến 150 ký tự!",
            });
        }
        req.body.tenthuoc = trimmedName;
    }

    if (donvitinh !== undefined) {
        if (typeof donvitinh !== "string" || donvitinh.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Đơn vị tính không được để trống!",
            });
        }
        const trimmedUnit = donvitinh.trim();
        if (trimmedUnit.length > 20) {
            return res.status(400).json({
                success: false,
                message: "Đơn vị tính không được vượt quá 20 ký tự!",
            });
        }
        req.body.donvitinh = trimmedUnit;
    }

    if (dongia !== undefined) {
        const numPrice = Number(dongia);
        if (isNaN(numPrice) || numPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Đơn giá thuốc phải là số dương lớn hơn 0!",
            });
        }
        req.body.dongia = numPrice;
    }

    if (soluongton !== undefined) {
        const numStock = Number(soluongton);
        if (!Number.isInteger(numStock) || numStock < 0) {
            return res.status(400).json({
                success: false,
                message: "Số lượng tồn phải là số nguyên không âm!",
            });
        }
        req.body.soluongton = numStock;
    }

    if (hansudung !== undefined) {
        const parsedDate = new Date(hansudung);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Hạn sử dụng không đúng định dạng ngày hợp lệ (YYYY-MM-DD)!",
            });
        }
        req.body.hansudung = parsedDate;
    }

    if (nhasanxuat !== undefined && nhasanxuat !== null) {
        if (typeof nhasanxuat !== "string") {
            return res.status(400).json({
                success: false,
                message: "Tên nhà sản xuất phải là chuỗi ký tự!",
            });
        }
        if (nhasanxuat.trim().length > 100) {
            return res.status(400).json({
                success: false,
                message: "Tên nhà sản xuất không được vượt quá 100 ký tự!",
            });
        }
        req.body.nhasanxuat = nhasanxuat.trim();
    }

    next();
}

// 6. Kiểm tra dữ liệu khi nhập thêm hàng vào kho
function validateImportStock(req, res, next) {
    const { soluong, hansudung, dongia, ghichu } = req.body;

    if (soluong === undefined || soluong === null) {
        return res.status(400).json({
            success: false,
            message: "Số lượng nhập thêm (soluong) là bắt buộc!",
        });
    }

    const numQty = Number(soluong);
    if (!Number.isInteger(numQty) || numQty <= 0 || numQty > 1000000) {
        return res.status(400).json({
            success: false,
            message: "Số lượng nhập thêm phải là số nguyên dương từ 1 đến 1.000.000!",
        });
    }
    req.body.soluong = numQty;

    if (hansudung !== undefined && hansudung !== null) {
        const parsedDate = new Date(hansudung);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Hạn sử dụng mới không đúng định dạng ngày hợp lệ (YYYY-MM-DD)!",
            });
        }
        req.body.hansudung = parsedDate;
    }

    if (dongia !== undefined && dongia !== null) {
        const numPrice = Number(dongia);
        if (isNaN(numPrice) || numPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Đơn giá mới phải là số dương lớn hơn 0!",
            });
        }
        req.body.dongia = numPrice;
    }

    if (ghichu !== undefined && ghichu !== null) {
        if (typeof ghichu !== "string") {
            return res.status(400).json({
                success: false,
                message: "Ghi chú nhập kho phải là chuỗi ký tự!",
            });
        }
        if (ghichu.trim().length > 500) {
            return res.status(400).json({
                success: false,
                message: "Ghi chú nhập kho không được vượt quá 500 ký tự!",
            });
        }
        req.body.ghichu = ghichu.trim();
    }

    next();
}

// 7. Kiểm tra dữ liệu khi kiểm kê & điều chỉnh tồn kho
function validateAdjustStock(req, res, next) {
    const { soluongton, lydo } = req.body;

    if (soluongton === undefined || soluongton === null) {
        return res.status(400).json({
            success: false,
            message: "Số lượng tồn thực tế (soluongton) là bắt buộc!",
        });
    }

    const numStock = Number(soluongton);
    if (!Number.isInteger(numStock) || numStock < 0 || numStock > 1000000) {
        return res.status(400).json({
            success: false,
            message: "Số lượng tồn thực tế phải là số nguyên không âm (0 đến 1.000.000)!",
        });
    }
    req.body.soluongton = numStock;

    if (!lydo || typeof lydo !== "string" || lydo.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "Lý do điều chỉnh tồn kho (lydo) là bắt buộc (ví dụ: Kiểm kê định kỳ, Hỏng vỡ, Hết hạn)!",
        });
    }
    const trimmedReason = lydo.trim();
    if (trimmedReason.length < 3 || trimmedReason.length > 500) {
        return res.status(400).json({
            success: false,
            message: "Lý do điều chỉnh tồn kho phải có độ dài từ 3 đến 500 ký tự!",
        });
    }
    req.body.lydo = trimmedReason;

    next();
}

module.exports = {
    validateMedicineId,
    validateMedicineQuery,
    validateAlertQuery,
    validateCreateMedicine,
    validateUpdateMedicine,
    validateImportStock,
    validateAdjustStock,
};
