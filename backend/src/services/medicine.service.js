const prisma = require("../config/prisma");
const {
    DEFAULT_LOW_STOCK_THRESHOLD,
    DEFAULT_EXPIRY_WARNING_DAYS,
} = require("../constants/medicine.constant");

// Helper: Định dạng dữ liệu thuốc trả về kèm các cờ cảnh báo trạng thái
function formatMedicineResponse(medicine, threshold = DEFAULT_LOW_STOCK_THRESHOLD, warningDays = DEFAULT_EXPIRY_WARNING_DAYS) {
    if (!medicine) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nearExpiryLimit = new Date(today);
    nearExpiryLimit.setDate(nearExpiryLimit.getDate() + warningDays);

    const expiryDate = new Date(medicine.hansudung);
    expiryDate.setHours(0, 0, 0, 0);

    const isOutOfStock = medicine.soluongton === 0;
    const isLowStock = medicine.soluongton > 0 && medicine.soluongton <= threshold;
    const isExpired = expiryDate < today;
    const isNearExpiry = expiryDate >= today && expiryDate <= nearExpiryLimit;

    let stockStatusText = "Còn hàng";
    if (isOutOfStock) stockStatusText = "Hết hàng";
    else if (isLowStock) stockStatusText = "Sắp hết hàng";

    let expiryStatusText = "Còn hạn";
    if (isExpired) expiryStatusText = "Đã hết hạn";
    else if (isNearExpiry) expiryStatusText = "Cận hạn dùng";

    return {
        mathuoc: medicine.mathuoc,
        tenthuoc: medicine.tenthuoc,
        donvitinh: medicine.donvitinh,
        dongia: Number(medicine.dongia),
        soluongton: medicine.soluongton,
        hansudung: medicine.hansudung instanceof Date
            ? medicine.hansudung.toISOString().split("T")[0]
            : medicine.hansudung,
        nhasanxuat: medicine.nhasanxuat || null,
        status: {
            isOutOfStock,
            isLowStock,
            isExpired,
            isNearExpiry,
            stockStatusText,
            expiryStatusText,
        },
        _count: medicine._count
            ? {
                solankethuoc: medicine._count.chitietdonthuoc || 0,
                solanxuathoadon: medicine._count.chitiethoadon || 0,
            }
            : undefined,
    };
}

// 1. Lấy danh sách thuốc (Tìm kiếm, lọc khoảng giá, trạng thái tồn kho, phân trang)
async function getAllMedicinesService(query) {
    const { search, minPrice, maxPrice, stockStatus, page, limit } = query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nearExpiryDate = new Date(today);
    nearExpiryDate.setDate(nearExpiryDate.getDate() + DEFAULT_EXPIRY_WARNING_DAYS);

    const where = {};

    // Tìm kiếm theo tên thuốc hoặc nhà sản xuất
    if (search) {
        where.OR = [
            { tenthuoc: { contains: search, mode: "insensitive" } },
            { nhasanxuat: { contains: search, mode: "insensitive" } },
        ];
    }

    // Lọc theo khoảng giá
    if (minPrice !== undefined || maxPrice !== undefined) {
        where.dongia = {};
        if (minPrice !== undefined) where.dongia.gte = minPrice;
        if (maxPrice !== undefined) where.dongia.lte = maxPrice;
    }

    // Lọc theo trạng thái tồn kho
    if (stockStatus) {
        switch (stockStatus) {
            case "out_of_stock":
                where.soluongton = 0;
                break;
            case "low_stock":
                where.soluongton = { gt: 0, lte: DEFAULT_LOW_STOCK_THRESHOLD };
                break;
            case "in_stock":
                where.soluongton = { gt: DEFAULT_LOW_STOCK_THRESHOLD };
                break;
            case "expired":
                where.hansudung = { lt: today };
                break;
            case "near_expiry":
                where.hansudung = { gte: today, lte: nearExpiryDate };
                break;
            default:
                break;
        }
    }

    // Phân trang
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 10;
    const skip = (pageNum - 1) * limitNum;

    const [total, medicines] = await Promise.all([
        prisma.thuoc.count({ where }),
        prisma.thuoc.findMany({
            where,
            include: {
                _count: {
                    select: {
                        chitietdonthuoc: true,
                        chitiethoadon: true,
                    },
                },
            },
            orderBy: [{ soluongton: "asc" }, { tenthuoc: "asc" }],
            skip,
            take: limitNum,
        }),
    ]);

    return {
        medicines: medicines.map((m) => formatMedicineResponse(m)),
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
    };
}

// 2. Lấy thông tin chi tiết một loại thuốc
async function getMedicineByIdService(id) {
    const medicineId = Number(id);

    const medicine = await prisma.thuoc.findUnique({
        where: { mathuoc: medicineId },
        include: {
            _count: {
                select: {
                    chitietdonthuoc: true,
                    chitiethoadon: true,
                },
            },
        },
    });

    if (!medicine) {
        const error = new Error(`Không tìm thấy thuốc với mã ID: ${medicineId}`);
        error.statusCode = 404;
        throw error;
    }

    return formatMedicineResponse(medicine);
}

// 3. Thêm mới thuốc vào danh mục
async function createMedicineService(data) {
    const { tenthuoc, donvitinh, dongia, soluongton, hansudung, nhasanxuat } = data;

    const newMedicine = await prisma.thuoc.create({
        data: {
            tenthuoc,
            donvitinh,
            dongia,
            soluongton: soluongton || 0,
            hansudung,
            nhasanxuat: nhasanxuat || null,
        },
    });

    return formatMedicineResponse(newMedicine);
}

// 4. Cập nhật thông tin thuốc
async function updateMedicineService(id, data) {
    const medicineId = Number(id);

    const existingMedicine = await prisma.thuoc.findUnique({
        where: { mathuoc: medicineId },
    });

    if (!existingMedicine) {
        const error = new Error(`Không tìm thấy thuốc với mã ID: ${medicineId}`);
        error.statusCode = 404;
        throw error;
    }

    const { tenthuoc, donvitinh, dongia, soluongton, hansudung, nhasanxuat } = data;

    const updatedMedicine = await prisma.thuoc.update({
        where: { mathuoc: medicineId },
        data: {
            ...(tenthuoc !== undefined && { tenthuoc }),
            ...(donvitinh !== undefined && { donvitinh }),
            ...(dongia !== undefined && { dongia }),
            ...(soluongton !== undefined && { soluongton }),
            ...(hansudung !== undefined && { hansudung }),
            ...(nhasanxuat !== undefined && { nhasanxuat }),
        },
    });

    return formatMedicineResponse(updatedMedicine);
}

// 5. Nhập thêm hàng vào kho (Stock Import)
// Tăng số lượng tồn kho, tùy chọn cập nhật HSD mới hoặc đơn giá mới
async function importMedicineStockService(id, { soluong, hansudung, dongia, ghichu }) {
    const medicineId = Number(id);

    const existingMedicine = await prisma.thuoc.findUnique({
        where: { mathuoc: medicineId },
    });

    if (!existingMedicine) {
        const error = new Error(`Không tìm thấy thuốc với mã ID: ${medicineId}`);
        error.statusCode = 404;
        throw error;
    }

    const previousStock = existingMedicine.soluongton;
    const addedQty = Number(soluong);
    const newStock = previousStock + addedQty;

    const updatedMedicine = await prisma.thuoc.update({
        where: { mathuoc: medicineId },
        data: {
            soluongton: newStock,
            ...(hansudung && { hansudung }),
            ...(dongia && { dongia }),
        },
    });

    return {
        medicine: formatMedicineResponse(updatedMedicine),
        importDetails: {
            mathuoc: medicineId,
            soluongnhap: addedQty,
            soluongtoncu: previousStock,
            soluongtonmoi: newStock,
            ghichu: ghichu || "Nhập hàng bổ sung vào kho",
            thoigiannhap: new Date().toISOString(),
        },
    };
}

// 6. Kiểm kê & điều chỉnh tồn kho (Stock Adjustment)
// Cập nhật số lượng tồn thực tế kèm ghi nhận lý do
async function adjustMedicineStockService(id, { soluongton, lydo }) {
    const medicineId = Number(id);

    const existingMedicine = await prisma.thuoc.findUnique({
        where: { mathuoc: medicineId },
    });

    if (!existingMedicine) {
        const error = new Error(`Không tìm thấy thuốc với mã ID: ${medicineId}`);
        error.statusCode = 404;
        throw error;
    }

    const previousStock = existingMedicine.soluongton;
    const adjustedStock = Number(soluongton);
    const difference = adjustedStock - previousStock;

    const updatedMedicine = await prisma.thuoc.update({
        where: { mathuoc: medicineId },
        data: {
            soluongton: adjustedStock,
        },
    });

    return {
        medicine: formatMedicineResponse(updatedMedicine),
        adjustmentDetails: {
            mathuoc: medicineId,
            soluongtoncu: previousStock,
            soluongtonmoi: adjustedStock,
            chenhlech: difference,
            lydo,
            thoigiandieuchinh: new Date().toISOString(),
        },
    };
}

// 7. Lấy danh sách cảnh báo tồn kho & hạn sử dụng (Smart Alerts)
// - Thuốc hết hàng (soluongton = 0)
// - Thuốc sắp hết hàng (0 < soluongton <= threshold)
// - Thuốc đã hết hạn (hansudung < hôm nay)
// - Thuốc cận hạn sử dụng (hết hạn trong vòng [days] ngày tới)
async function getInventoryAlertsService({ threshold, days }) {
    const lowStockThreshold = threshold ? Number(threshold) : DEFAULT_LOW_STOCK_THRESHOLD;
    const expiryWarningDays = days ? Number(days) : DEFAULT_EXPIRY_WARNING_DAYS;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nearExpiryDate = new Date(today);
    nearExpiryDate.setDate(nearExpiryDate.getDate() + expiryWarningDays);

    const [outOfStockList, lowStockList, expiredList, nearExpiryList] = await Promise.all([
        // 1. Thuốc hết hàng
        prisma.thuoc.findMany({
            where: { soluongton: 0 },
            orderBy: { tenthuoc: "asc" },
        }),
        // 2. Thuốc sắp hết hàng
        prisma.thuoc.findMany({
            where: {
                soluongton: {
                    gt: 0,
                    lte: lowStockThreshold,
                },
            },
            orderBy: { soluongton: "asc" },
        }),
        // 3. Thuốc đã hết hạn
        prisma.thuoc.findMany({
            where: {
                hansudung: {
                    lt: today,
                },
            },
            orderBy: { hansudung: "asc" },
        }),
        // 4. Thuốc cận hạn sử dụng
        prisma.thuoc.findMany({
            where: {
                hansudung: {
                    gte: today,
                    lte: nearExpiryDate,
                },
            },
            orderBy: { hansudung: "asc" },
        }),
    ]);

    return {
        summary: {
            outOfStockCount: outOfStockList.length,
            lowStockCount: lowStockList.length,
            expiredCount: expiredList.length,
            nearExpiryCount: nearExpiryList.length,
            totalAlerts: outOfStockList.length + lowStockList.length + expiredList.length + nearExpiryList.length,
            appliedThreshold: lowStockThreshold,
            appliedWarningDays: expiryWarningDays,
        },
        alerts: {
            outOfStock: outOfStockList.map((m) => formatMedicineResponse(m, lowStockThreshold, expiryWarningDays)),
            lowStock: lowStockList.map((m) => formatMedicineResponse(m, lowStockThreshold, expiryWarningDays)),
            expired: expiredList.map((m) => formatMedicineResponse(m, lowStockThreshold, expiryWarningDays)),
            nearExpiry: nearExpiryList.map((m) => formatMedicineResponse(m, lowStockThreshold, expiryWarningDays)),
        },
    };
}

// 8. Thống kê tổng quan kho thuốc (Dashboard Overview Analytics)
async function getInventoryOverviewStatsService() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nearExpiryDate = new Date(today);
    nearExpiryDate.setDate(nearExpiryDate.getDate() + DEFAULT_EXPIRY_WARNING_DAYS);

    const [allMedicines, totalOutOfStock, totalLowStock, totalExpired, totalNearExpiry] = await Promise.all([
        prisma.thuoc.findMany({
            select: {
                mathuoc: true,
                dongia: true,
                soluongton: true,
            },
        }),
        prisma.thuoc.count({ where: { soluongton: 0 } }),
        prisma.thuoc.count({
            where: {
                soluongton: {
                    gt: 0,
                    lte: DEFAULT_LOW_STOCK_THRESHOLD,
                },
            },
        }),
        prisma.thuoc.count({
            where: {
                hansudung: { lt: today },
            },
        }),
        prisma.thuoc.count({
            where: {
                hansudung: { gte: today, lte: nearExpiryDate },
            },
        }),
    ]);

    let totalUnitsInStock = 0;
    let totalInventoryValue = 0;

    for (const item of allMedicines) {
        const qty = item.soluongton || 0;
        const price = Number(item.dongia || 0);
        totalUnitsInStock += qty;
        totalInventoryValue += qty * price;
    }

    return {
        totalMedicineTypes: allMedicines.length,
        totalUnitsInStock,
        totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
        statusCounts: {
            inStock: allMedicines.length - totalOutOfStock - totalLowStock,
            lowStock: totalLowStock,
            outOfStock: totalOutOfStock,
            expired: totalExpired,
            nearExpiry: totalNearExpiry,
        },
    };
}

// 9. Xóa thuốc khỏi danh mục (Safe Delete Guard)
// Chặn xóa nếu thuốc đã được kê đơn hoặc đã xuất hóa đơn viện phí
async function deleteMedicineService(id) {
    const medicineId = Number(id);

    const medicine = await prisma.thuoc.findUnique({
        where: { mathuoc: medicineId },
        include: {
            _count: {
                select: {
                    chitietdonthuoc: true,
                    chitiethoadon: true,
                },
            },
        },
    });

    if (!medicine) {
        const error = new Error(`Không tìm thấy thuốc với mã ID: ${medicineId}`);
        error.statusCode = 404;
        throw error;
    }

    const prescriptionCount = medicine._count.chitietdonthuoc;
    const invoiceCount = medicine._count.chitiethoadon;

    if (prescriptionCount > 0 || invoiceCount > 0) {
        const error = new Error(
            `Thuốc \"${medicine.tenthuoc}\" đã phát sinh trong ${prescriptionCount} đơn thuốc và ${invoiceCount} hóa đơn viện phí! Không thể xóa để bảo vệ toàn vẹn lịch sử y tế. Bạn có thể điều chỉnh số lượng tồn về 0 nếu không còn kinh doanh.`
        );
        error.statusCode = 400;
        throw error;
    }

    await prisma.thuoc.delete({
        where: { mathuoc: medicineId },
    });

    return {
        mathuoc: medicine.mathuoc,
        tenthuoc: medicine.tenthuoc,
    };
}

module.exports = {
    getAllMedicinesService,
    getMedicineByIdService,
    createMedicineService,
    updateMedicineService,
    importMedicineStockService,
    adjustMedicineStockService,
    getInventoryAlertsService,
    getInventoryOverviewStatsService,
    deleteMedicineService,
};
