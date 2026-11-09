// ========================================================
// SERVICE: QUẢN LÝ HÓA ĐƠN VIỆN PHÍ & TRIGGER TÍNH TIỀN
// ========================================================

const prisma = require("../config/prisma");

// Định dạng dữ liệu hóa đơn trả về cho client
function formatInvoiceResponse(invoice) {
    if (!invoice) return null;

    return {
        mahd: invoice.mahd,
        mabn: invoice.mabn,
        malsk: invoice.malsk,
        ngaylap: invoice.ngaylap,
        tongtien: invoice.tongtien !== null && invoice.tongtien !== undefined ? Number(invoice.tongtien) : 0,
        trangthaithanhtoan: invoice.trangthaithanhtoan,
        phuongthuctt: invoice.phuongthuctt,
        benhnhan: invoice.benhnhan
            ? {
                mabn: invoice.benhnhan.mabn,
                hoten: invoice.benhnhan.hoten,
                sdt: invoice.benhnhan.sdt,
                gioitinh: invoice.benhnhan.gioitinh,
                cccd: invoice.benhnhan.cccd,
                sobhyt: invoice.benhnhan.sobhyt,
            }
            : undefined,
        lichsukham: invoice.lichsukham
            ? {
                malsk: invoice.lichsukham.malsk,
                ngay: invoice.lichsukham.ngay,
                trieuchung: invoice.lichsukham.trieuchung,
                chandoan: invoice.lichsukham.chandoan,
                ketluan: invoice.lichsukham.ketluan,
                bacsi: invoice.lichsukham.bacsi
                    ? {
                        mabs: invoice.lichsukham.bacsi.mabs,
                        hocham: invoice.lichsukham.bacsi.hocham,
                        nhanvien: invoice.lichsukham.bacsi.nhanvien
                            ? {
                                hoten: invoice.lichsukham.bacsi.nhanvien.hoten,
                                sdt: invoice.lichsukham.bacsi.nhanvien.sdt,
                            }
                            : undefined,
                        chuyenkhoa: invoice.lichsukham.bacsi.chuyenkhoa
                            ? {
                                mack: invoice.lichsukham.bacsi.chuyenkhoa.mack,
                                tenchuyenkhoa: invoice.lichsukham.bacsi.chuyenkhoa.tenchuyenkhoa,
                            }
                            : undefined,
                    }
                    : undefined,
            }
            : undefined,
        chitiethoadon: Array.isArray(invoice.chitiethoadon)
            ? invoice.chitiethoadon.map((item) => ({
                macthd: item.macthd,
                mahd: item.mahd,
                madv: item.madv,
                mathuoc: item.mathuoc,
                madt: item.madt,
                loai: item.madv ? "DichVu" : "Thuoc",
                ten: item.dichvu ? item.dichvu.tendichvu : (item.thuoc ? item.thuoc.tenthuoc : "Khác"),
                donvitinh: item.thuoc ? item.thuoc.donvitinh : "Lần",
                soluong: item.soluong,
                dongia: Number(item.dongia),
                thanhtien: item.thanhtien ? Number(item.thanhtien) : Number(item.soluong) * Number(item.dongia),
            }))
            : undefined,
    };
}

/**
 * 1. Khởi tạo hóa đơn từ lần khám bệnh (Đồng bộ Dịch vụ khám & Đơn thuốc vào Chi tiết hóa đơn)
 * Database Trigger `trg_cthd_update_tongtien` sẽ tự động tính và cập nhật tổng tiền
 */
async function createInvoiceService({ malsk, phuongthuctt, tongtien, phikham }) {
    const examId = Number(malsk);

    // 1. Kiểm tra lần khám bệnh có tồn tại không
    const exam = await prisma.lichsukham.findUnique({
        where: { malsk: examId },
        include: {
            benhnhan: true,
            chitietdichvukham: {
                include: { dichvu: true },
            },
            donthuoc: {
                include: {
                    chitietdonthuoc: {
                        include: { thuoc: true },
                    },
                },
            },
        },
    });

    if (!exam) {
        const error = new Error(`Không tìm thấy thông tin lần khám bệnh với mã ID: ${examId}`);
        error.statusCode = 404;
        throw error;
    }

    // 2. Kiểm tra lần khám này đã được lập hóa đơn chưa, nếu có rồi thì trả về luôn (idempotent)
    const existingInvoice = await prisma.hoadon.findUnique({
        where: { malsk: examId },
        include: {
            benhnhan: true,
            lichsukham: {
                include: {
                    bacsi: {
                        include: {
                            nhanvien: true,
                            chuyenkhoa: true,
                        },
                    },
                },
            },
            chitiethoadon: {
                include: {
                    dichvu: true,
                    thuoc: true,
                },
            },
        },
    });
    if (existingInvoice) {
        return formatInvoiceResponse(existingInvoice);
    }

    // 3. Thực thi Transaction khởi tạo Hóa đơn và nạp các dòng ChiTietHoaDon
    const createdInvoiceId = await prisma.$transaction(async (tx) => {
        // Tạo hóa đơn viện phí
        const invoice = await tx.hoadon.create({
            data: {
                mabn: exam.mabn,
                malsk: examId,
                trangthaithanhtoan: "ChuaThanhToan",
                phuongthuctt: phuongthuctt || null,
            },
        });

        // Nạp chi tiết các dịch vụ khám đã chỉ định
        if (exam.chitietdichvukham && exam.chitietdichvukham.length > 0) {
            for (const ctdv of exam.chitietdichvukham) {
                await tx.chitiethoadon.create({
                    data: {
                        mahd: invoice.mahd,
                        madv: ctdv.madv,
                        soluong: ctdv.soluong || 1,
                        dongia: ctdv.dichvu.dongia,
                    },
                });
            }
        }

        // Nạp chi tiết các thuốc đã kê trong đơn
        if (exam.donthuoc && exam.donthuoc.chitietdonthuoc && exam.donthuoc.chitietdonthuoc.length > 0) {
            for (const ctdt of exam.donthuoc.chitietdonthuoc) {
                await tx.chitiethoadon.create({
                    data: {
                        mahd: invoice.mahd,
                        mathuoc: ctdt.mathuoc,
                        madt: exam.donthuoc.madt,
                        soluong: ctdt.soluong,
                        dongia: ctdt.thuoc.dongia,
                    },
                });
            }
        }

        // Tự động tính toán tổng tiền trực tiếp bằng code để cập nhật vào hoadon
        const allDetails = await tx.chitiethoadon.findMany({
            where: { mahd: invoice.mahd }
        });
        const itemsTotal = allDetails.reduce((sum, item) => sum + Number(item.dongia) * Number(item.soluong), 0);

        let finalTotal = itemsTotal;
        if (tongtien !== undefined && Number(tongtien) > 0) {
            finalTotal = Math.max(itemsTotal, Number(tongtien));
        } else if (phikham !== undefined && Number(phikham) > 0) {
            finalTotal = itemsTotal + Number(phikham);
        }

        await tx.hoadon.update({
            where: { mahd: invoice.mahd },
            data: { tongtien: finalTotal }
        });

        return invoice.mahd;
    });

    // 4. Lấy lại hóa đơn hoàn chỉnh từ DB (nơi Trigger PostgreSQL đã tính lại TongTien chính xác)
    const result = await prisma.hoadon.findUnique({
        where: { mahd: createdInvoiceId },
        include: {
            benhnhan: true,
            lichsukham: {
                include: {
                    bacsi: {
                        include: {
                            nhanvien: true,
                            chuyenkhoa: true,
                        },
                    },
                },
            },
            chitiethoadon: {
                include: {
                    dichvu: true,
                    thuoc: true,
                },
            },
        },
    });

    return formatInvoiceResponse(result);
}

/**
 * 2. Thêm mục viện phí vào hóa đơn (Dịch vụ hoặc Thuốc phát sinh)
 */
async function addInvoiceItemService(invoiceId, itemData) {
    const mahd = Number(invoiceId);
    const { madv, mathuoc, madt, soluong, dongia } = itemData;

    const invoice = await prisma.hoadon.findUnique({
        where: { mahd },
    });

    if (!invoice) {
        const error = new Error(`Không tìm thấy hóa đơn với mã ID: ${mahd}`);
        error.statusCode = 404;
        throw error;
    }

    if (invoice.trangthaithanhtoan !== "ChuaThanhToan") {
        const error = new Error(`Hóa đơn này đang ở trạng thái "${invoice.trangthaithanhtoan}", không thể thêm mục mới!`);
        error.statusCode = 400;
        throw error;
    }

    let finalPrice = dongia !== undefined ? Number(dongia) : null;

    if (madv) {
        const service = await prisma.dichvu.findUnique({
            where: { madv: Number(madv) },
        });
        if (!service) {
            const error = new Error(`Không tìm thấy dịch vụ với mã ID: ${madv}`);
            error.statusCode = 404;
            throw error;
        }
        if (finalPrice === null) finalPrice = Number(service.dongia);
    } else if (mathuoc) {
        const medicine = await prisma.thuoc.findUnique({
            where: { mathuoc: Number(mathuoc) },
        });
        if (!medicine) {
            const error = new Error(`Không tìm thấy thuốc với mã ID: ${mathuoc}`);
            error.statusCode = 404;
            throw error;
        }
        if (finalPrice === null) finalPrice = Number(medicine.dongia);
    }

    // Thêm dòng chi tiết (Trigger DB sẽ tự động tính lại TongTien trong HoaDon)
    await prisma.chitiethoadon.create({
        data: {
            mahd,
            madv: madv ? Number(madv) : null,
            mathuoc: mathuoc ? Number(mathuoc) : null,
            madt: madt ? Number(madt) : null,
            soluong: Number(soluong),
            dongia: finalPrice,
        },
    });

    // Lấy lại hóa đơn sau khi Trigger cập nhật
    const updatedInvoice = await prisma.hoadon.findUnique({
        where: { mahd },
        include: {
            benhnhan: true,
            lichsukham: {
                include: {
                    bacsi: {
                        include: {
                            nhanvien: true,
                            chuyenkhoa: true,
                        },
                    },
                },
            },
            chitiethoadon: {
                include: {
                    dichvu: true,
                    thuoc: true,
                },
            },
        },
    });

    return formatInvoiceResponse(updatedInvoice);
}

/**
 * 3. Xóa một mục khỏi hóa đơn (Trigger DB tự động giảm trừ TongTien)
 */
async function removeInvoiceItemService(invoiceId, itemId) {
    const mahd = Number(invoiceId);
    const macthd = Number(itemId);

    const invoice = await prisma.hoadon.findUnique({
        where: { mahd },
    });
    if (!invoice) {
        const error = new Error(`Không tìm thấy hóa đơn với mã ID: ${mahd}`);
        error.statusCode = 404;
        throw error;
    }

    if (invoice.trangthaithanhtoan !== "ChuaThanhToan") {
        const error = new Error(`Hóa đơn đã ở trạng thái "${invoice.trangthaithanhtoan}", không thể xóa mục viện phí!`);
        error.statusCode = 400;
        throw error;
    }

    const item = await prisma.chitiethoadon.findFirst({
        where: { macthd, mahd },
    });
    if (!item) {
        const error = new Error(`Mục chi tiết #${macthd} không tồn tại trong hóa đơn #${mahd}!`);
        error.statusCode = 404;
        throw error;
    }

    // Xóa dòng chi tiết
    await prisma.chitiethoadon.delete({
        where: { macthd },
    });

    // Lấy lại hóa đơn sau khi Trigger tự động trừ tiền
    const updatedInvoice = await prisma.hoadon.findUnique({
        where: { mahd },
        include: {
            benhnhan: true,
            lichsukham: {
                include: {
                    bacsi: {
                        include: {
                            nhanvien: true,
                            chuyenkhoa: true,
                        },
                    },
                },
            },
            chitiethoadon: {
                include: {
                    dichvu: true,
                    thuoc: true,
                },
            },
        },
    });

    return formatInvoiceResponse(updatedInvoice);
}

/**
 * 4. Xác nhận thanh toán hóa đơn viện phí
 */
async function payInvoiceService(invoiceId, { phuongthuctt }) {
    const mahd = Number(invoiceId);

    const invoice = await prisma.hoadon.findUnique({
        where: { mahd },
        include: {
            benhnhan: true,
            chitiethoadon: true,
        },
    });

    if (!invoice) {
        const error = new Error(`Không tìm thấy hóa đơn với mã ID: ${mahd}`);
        error.statusCode = 404;
        throw error;
    }

    if (invoice.trangthaithanhtoan === "DaThanhToan") {
        const error = new Error(`Hóa đơn #${mahd} đã được thanh toán trước đó!`);
        error.statusCode = 400;
        throw error;
    }

    if (invoice.trangthaithanhtoan === "DaHuy") {
        const error = new Error(`Hóa đơn #${mahd} đã bị hủy, không thể thanh toán!`);
        error.statusCode = 400;
        throw error;
    }

    const updated = await prisma.hoadon.update({
        where: { mahd },
        data: {
            trangthaithanhtoan: "DaThanhToan",
            phuongthuctt,
        },
        include: {
            benhnhan: true,
            lichsukham: {
                include: {
                    bacsi: {
                        include: {
                            nhanvien: true,
                            chuyenkhoa: true,
                        },
                    },
                },
            },
            chitiethoadon: {
                include: {
                    dichvu: true,
                    thuoc: true,
                },
            },
        },
    });

    return formatInvoiceResponse(updated);
}

/**
 * 5. Hủy hóa đơn viện phí
 */
async function cancelInvoiceService(invoiceId, user) {
    const mahd = Number(invoiceId);

    const invoice = await prisma.hoadon.findUnique({
        where: { mahd },
    });

    if (!invoice) {
        const error = new Error(`Không tìm thấy hóa đơn với mã ID: ${mahd}`);
        error.statusCode = 404;
        throw error;
    }

    if (invoice.trangthaithanhtoan === "DaHuy") {
        const error = new Error(`Hóa đơn #${mahd} đã ở trạng thái hủy!`);
        error.statusCode = 400;
        throw error;
    }

    if (invoice.trangthaithanhtoan === "DaThanhToan" && user.vaitro !== "Admin") {
        const error = new Error("Hóa đơn đã được thanh toán, chỉ Quản trị viên (Admin) mới có quyền hủy/hoàn tiền!");
        error.statusCode = 403;
        throw error;
    }

    const updated = await prisma.hoadon.update({
        where: { mahd },
        data: {
            trangthaithanhtoan: "DaHuy",
        },
        include: {
            benhnhan: true,
            lichsukham: {
                include: {
                    bacsi: {
                        include: {
                            nhanvien: true,
                            chuyenkhoa: true,
                        },
                    },
                },
            },
            chitiethoadon: {
                include: {
                    dichvu: true,
                    thuoc: true,
                },
            },
        },
    });

    return formatInvoiceResponse(updated);
}

/**
 * 6. Lấy danh sách hóa đơn (Bộ lọc đa năng & Phân trang)
 */
async function getAllInvoicesService(query = {}) {
    const { date, fromDate, toDate, status, paymentMethod, patientId, search, page = 1, limit = 10 } = query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (date) {
        const startOfDay = new Date(`${date.trim()}T00:00:00.000Z`);
        const endOfDay = new Date(`${date.trim()}T23:59:59.999Z`);
        where.ngaylap = { gte: startOfDay, lte: endOfDay };
    } else if (fromDate || toDate) {
        where.ngaylap = {};
        if (fromDate) where.ngaylap.gte = new Date(`${fromDate.trim()}T00:00:00.000Z`);
        if (toDate) where.ngaylap.lte = new Date(`${toDate.trim()}T23:59:59.999Z`);
    }

    if (status) {
        where.trangthaithanhtoan = status;
    }

    if (paymentMethod) {
        where.phuongthuctt = paymentMethod;
    }

    if (patientId) {
        where.mabn = Number(patientId);
    }

    if (search && search.trim() !== "") {
        const keyword = search.trim();
        where.benhnhan = {
            OR: [
                { hoten: { contains: keyword, mode: "insensitive" } },
                { sdt: { contains: keyword } },
                { cccd: { contains: keyword } },
            ],
        };
    }

    const [invoices, total] = await Promise.all([
        prisma.hoadon.findMany({
            where,
            skip,
            take: limitNum,
            include: {
                benhnhan: true,
                lichsukham: {
                    include: {
                        bacsi: {
                            include: {
                                nhanvien: true,
                                chuyenkhoa: true,
                            },
                        },
                    },
                },
                _count: {
                    select: { chitiethoadon: true },
                },
            },
            orderBy: { ngaylap: "desc" },
        }),
        prisma.hoadon.count({ where }),
    ]);

    return {
        data: invoices.map(formatInvoiceResponse),
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
    };
}

/**
 * 7. Lấy chi tiết một hóa đơn
 */
async function getInvoiceByIdService(id, user) {
    const mahd = Number(id);

    const invoice = await prisma.hoadon.findUnique({
        where: { mahd },
        include: {
            benhnhan: true,
            lichsukham: {
                include: {
                    bacsi: {
                        include: {
                            nhanvien: true,
                            chuyenkhoa: true,
                        },
                    },
                },
            },
            chitiethoadon: {
                include: {
                    dichvu: true,
                    thuoc: true,
                },
            },
        },
    });

    if (!invoice) {
        const error = new Error(`Không tìm thấy hóa đơn với mã ID: ${mahd}`);
        error.statusCode = 404;
        throw error;
    }

    // Nếu là Bệnh nhân, chỉ được xem hóa đơn của chính mình
    if (user.vaitro === "BenhNhan") {
        const patient = await prisma.benhnhan.findUnique({
            where: { matk: Number(user.matk) },
            select: { mabn: true },
        });
        if (!patient || invoice.mabn !== patient.mabn) {
            const error = new Error("Bạn không có quyền truy cập hóa đơn này!");
            error.statusCode = 403;
            throw error;
        }
    }

    return formatInvoiceResponse(invoice);
}

/**
 * 8. Bệnh nhân xem các hóa đơn viện phí của chính mình
 */
async function getMyInvoicesService(matk, query = {}) {
    const patient = await prisma.benhnhan.findUnique({
        where: { matk: Number(matk) },
        select: { mabn: true },
    });

    if (!patient) {
        const error = new Error("Tài khoản của bạn chưa có hồ sơ bệnh nhân!");
        error.statusCode = 404;
        throw error;
    }

    const where = {
        mabn: patient.mabn,
    };

    if (query.status) {
        where.trangthaithanhtoan = query.status;
    }

    const invoices = await prisma.hoadon.findMany({
        where,
        include: {
            lichsukham: {
                include: {
                    bacsi: {
                        include: {
                            nhanvien: true,
                            chuyenkhoa: true,
                        },
                    },
                },
            },
            chitiethoadon: {
                include: {
                    dichvu: true,
                    thuoc: true,
                },
            },
        },
        orderBy: { ngaylap: "desc" },
    });

    return invoices.map(formatInvoiceResponse);
}

module.exports = {
    createInvoiceService,
    addInvoiceItemService,
    removeInvoiceItemService,
    payInvoiceService,
    cancelInvoiceService,
    getAllInvoicesService,
    getInvoiceByIdService,
    getMyInvoicesService,
};
