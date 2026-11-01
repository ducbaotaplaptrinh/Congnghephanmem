const prisma = require("../config/prisma");
const { hashPassword } = require("../utils/password");

// lấy danh sách bác sĩ (hỗ trợ lọc chuyên khoa, tìm kiếm và phân trang)
async function getAllDoctorsService({ specialtyId, search, page, limit } = {}) {
    const where = {};

    // Lọc theo chuyên khoa
    if (specialtyId) {
        where.mack = Number(specialtyId);
    }

    // tìm kiếm theo tên bác sĩ, số điện thoại, học hàm hoặc số giấy phép hành nghề
    if (search && search.trim()) {
        const keyword = search.trim();
        where.OR = [
            {
                nhanvien: {
                    hoten: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
            },
            {
                nhanvien: {
                    sdt: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
            },
            {
                sogiayphephanhnghe: {
                    contains: keyword,
                    mode: "insensitive",
                },
            },
            {
                hocham: {
                    contains: keyword,
                    mode: "insensitive",
                },
            },
        ];
    }

    const include = {
        nhanvien: {
            select: {
                manv: true,
                hoten: true,
                gioitinh: true,
                ngaysinh: true,
                sdt: true,
                diachi: true,
                chucvu: true,
                ngayvaolam: true,
            },
        },
        chuyenkhoa: {
            select: {
                mack: true,
                tenchuyenkhoa: true,
            },
        },
        _count: {
            select: {
                lichhen: true,
                lichsukham: true,
            },
        },
    };

    // Phân trang nếu có truyền page hoặc limit
    if (page || limit) {
        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.max(1, Number(limit) || 10);
        const skip = (pageNumber - 1) * pageSize;

        const [totalItems, items] = await Promise.all([
            prisma.bacsi.count({ where }),
            prisma.bacsi.findMany({
                where,
                include,
                skip,
                take: pageSize,
                orderBy: { mabs: "asc" },
            }),
        ]);

        return {
            items,
            pagination: {
                total: totalItems,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(totalItems / pageSize),
            },
        };
    }

    // Trả về toàn bộ (dùng cho dropdown/combobox đặt lịch)
    const doctors = await prisma.bacsi.findMany({
        where,
        include,
        orderBy: { mabs: "asc" },
    });

    return doctors;
}

// lấy chi tiết thông tin một bác sĩ theo mã ID (kèm thông tin ca làm việc gần đây)
async function getDoctorByIdService(mabs) {
    const id = Number(mabs);

    const doctor = await prisma.bacsi.findUnique({
        where: { mabs: id },
        include: {
            nhanvien: {
                select: {
                    manv: true,
                    hoten: true,
                    gioitinh: true,
                    ngaysinh: true,
                    sdt: true,
                    diachi: true,
                    chucvu: true,
                    ngayvaolam: true,
                    taikhoan: {
                        select: {
                            matk: true,
                            tendangnhap: true,
                            vaitro: true,
                            trangthai: true,
                        },
                    },
                    phanconglamviec: {
                        take: 10,
                        orderBy: {
                            calamviec: {
                                ngay: "desc",
                            },
                        },
                        select: {
                            mapclv: true,
                            vaitrotrongca: true,
                            calamviec: {
                                select: {
                                    maca: true,
                                    ngay: true,
                                    giobatdau: true,
                                    gioketthuc: true,
                                    phongkham: {
                                        select: {
                                            maphong: true,
                                            tenphong: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            chuyenkhoa: {
                select: {
                    mack: true,
                    tenchuyenkhoa: true,
                    mota: true,
                },
            },
            _count: {
                select: {
                    lichhen: true,
                    lichsukham: true,
                },
            },
        },
    });

    if (!doctor) {
        const error = new Error(`Không tìm thấy bác sĩ với mã ID: ${id}`);
        error.statusCode = 404;
        throw error;
    }

    return doctor;
}

// lấy lịch làm việc / ca trực của một bác sĩ (phục vụ chọn giờ đặt lịch khám)
async function getDoctorScheduleService(mabs, { fromDate, toDate } = {}) {
    const id = Number(mabs);

    const doctor = await prisma.bacsi.findUnique({
        where: { mabs: id },
        include: {
            nhanvien: {
                select: {
                    manv: true,
                    hoten: true,
                },
            },
            chuyenkhoa: {
                select: {
                    mack: true,
                    tenchuyenkhoa: true,
                },
            },
        },
    });

    if (!doctor) {
        const error = new Error(`Không tìm thấy bác sĩ với mã ID: ${id}`);
        error.statusCode = 404;
        throw error;
    }

    const whereSchedule = {
        manv: id,
    };

    if (fromDate || toDate) {
        whereSchedule.calamviec = {};
        if (fromDate) {
            whereSchedule.calamviec.ngay = { gte: new Date(fromDate) };
        }
        if (toDate) {
            whereSchedule.calamviec.ngay = {
                ...(whereSchedule.calamviec.ngay || {}),
                lte: new Date(toDate),
            };
        }
    }

    const shifts = await prisma.phanconglamviec.findMany({
        where: whereSchedule,
        include: {
            calamviec: {
                include: {
                    phongkham: {
                        select: {
                            maphong: true,
                            tenphong: true,
                            trangthai: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            calamviec: {
                ngay: "asc",
            },
        },
    });

    return {
        bacsi: {
            mabs: doctor.mabs,
            hoten: doctor.nhanvien.hoten,
            chuyenkhoa: doctor.chuyenkhoa.tenchuyenkhoa,
        },
        shifts: shifts.map((s) => ({
            mapclv: s.mapclv,
            vaitrotrongca: s.vaitrotrongca,
            calamviec: s.calamviec,
        })),
    };
}

// tạo mới một bác sĩ (Sử dụng Transaction để đảm bảo tính toàn vẹn 1-1 nhanvien - bacsi)
async function createDoctorService(doctorData) {
    const {
        mack,
        sogiayphephanhnghe,
        hocham,
        kinhnghiem,
        hoten,
        gioitinh,
        ngaysinh,
        sdt,
        diachi,
        ngayvaolam,
        username,
        password,
        hinhanh,
    } = doctorData;

    // Kiểm tra chuyên khoa có tồn tại không
    const specialty = await prisma.chuyenkhoa.findUnique({
        where: { mack: Number(mack) },
    });
    if (!specialty) {
        const error = new Error(`Chuyên khoa với mã ID ${mack} không tồn tại trong hệ thống!`);
        error.statusCode = 404;
        throw error;
    }

    // Kiểm tra số giấy phép hành nghề
    const existingCert = await prisma.bacsi.findUnique({
        where: { sogiayphephanhnghe },
    });
    if (existingCert) {
        const error = new Error(
            `Số giấy phép hành nghề "${sogiayphephanhnghe}" đã tồn tại trong hệ thống!`,
        );
        error.statusCode = 409;
        throw error;
    }

    //  Kiểm tra số điện thoại nhân viên
    const existingPhone = await prisma.nhanvien.findUnique({
        where: { sdt },
    });
    if (existingPhone) {
        const error = new Error(
            `Số điện thoại "${sdt}" đã được nhân viên khác sử dụng!`,
        );
        error.statusCode = 409;
        throw error;
    }

    // Kiểm tra tài khoản nếu có yêu cầu tạo
    if (username) {
        const existingAccount = await prisma.taikhoan.findUnique({
            where: { tendangnhap: username },
        });
        if (existingAccount) {
            const error = new Error(
                `Tên đăng nhập "${username}" đã tồn tại trong hệ thống!`,
            );
            error.statusCode = 409;
            throw error;
        }
    }

    // Thực hiện Transaction đồng bộ
    const newDoctor = await prisma.$transaction(async (tx) => {
        let matk = null;

        if (username && password) {
            const hashedPassword = await hashPassword(password);
            const account = await tx.taikhoan.create({
                data: {
                    tendangnhap: username,
                    matkhau: hashedPassword,
                    vaitro: "BacSi",
                    trangthai: "HoatDong",
                },
            });
            matk = account.matk;
        }

        const employee = await tx.nhanvien.create({
            data: {
                matk,
                hoten,
                gioitinh,
                ngaysinh: new Date(ngaysinh),
                sdt,
                diachi: diachi || null,
                chucvu: "BacSi",
                ngayvaolam: ngayvaolam ? new Date(ngayvaolam) : new Date(),
            },
        });

        const doctor = await tx.bacsi.create({
            data: {
                mabs: employee.manv,
                mack: Number(mack),
                sogiayphephanhnghe,
                hocham: hocham || null,
                kinhnghiem: kinhnghiem !== undefined ? Number(kinhnghiem) : 0,
                hinhanh: hinhanh || null,
            },
            include: {
                nhanvien: {
                    select: {
                        manv: true,
                        hoten: true,
                        gioitinh: true,
                        ngaysinh: true,
                        sdt: true,
                        diachi: true,
                        chucvu: true,
                        ngayvaolam: true,
                    },
                },
                chuyenkhoa: {
                    select: {
                        mack: true,
                        tenchuyenkhoa: true,
                    },
                },
            },
        });

        return doctor;
    });

    return newDoctor;
}

// Cập nhật thông tin bác sĩ (bao gồm thông tin chuyên môn, cá nhân và tài khoản)
async function updateDoctorService(mabs, updateData) {
    const id = Number(mabs);

    // Kiểm tra bác sĩ có tồn tại không
    const currentDoctor = await prisma.bacsi.findUnique({
        where: { mabs: id },
        include: { nhanvien: true },
    });

    if (!currentDoctor) {
        const error = new Error(`Không tìm thấy bác sĩ với mã ID: ${id}`);
        error.statusCode = 404;
        throw error;
    }

    // Nếu đổi chuyên khoa, kiểm tra chuyên khoa mới có tồn tại không
    if (updateData.mack && updateData.mack !== currentDoctor.mack) {
        const specialty = await prisma.chuyenkhoa.findUnique({
            where: { mack: Number(updateData.mack) },
        });
        if (!specialty) {
            const error = new Error(
                `Chuyên khoa với mã ID ${updateData.mack} không tồn tại trong hệ thống!`,
            );
            error.statusCode = 404;
            throw error;
        }
    }

    // Nếu đổi số CCHN, kiểm tra xem có trùng với bác sĩ khác không
    if (
        updateData.sogiayphephanhnghe &&
        updateData.sogiayphephanhnghe !== currentDoctor.sogiayphephanhnghe
    ) {
        const duplicateCert = await prisma.bacsi.findUnique({
            where: { sogiayphephanhnghe: updateData.sogiayphephanhnghe },
        });
        if (duplicateCert) {
            const error = new Error(
                `Số giấy phép hành nghề "${updateData.sogiayphephanhnghe}" đã được bác sĩ khác sử dụng!`,
            );
            error.statusCode = 409;
            throw error;
        }
    }

    //  Nếu đổi số điện thoại, kiểm tra xem có trùng với nhân viên khác không
    if (updateData.sdt && updateData.sdt !== currentDoctor.nhanvien.sdt) {
        const duplicatePhone = await prisma.nhanvien.findUnique({
            where: { sdt: updateData.sdt },
        });
        if (duplicatePhone) {
            const error = new Error(
                `Số điện thoại "${updateData.sdt}" đã được nhân viên khác sử dụng!`,
            );
            error.statusCode = 409;
            throw error;
        }
    }

    // Chuẩn bị dữ liệu cập nhật
    const doctorFields = {};
    if (updateData.mack !== undefined) doctorFields.mack = Number(updateData.mack);
    if (updateData.sogiayphephanhnghe !== undefined) doctorFields.sogiayphephanhnghe = updateData.sogiayphephanhnghe;
    if (updateData.hocham !== undefined) doctorFields.hocham = updateData.hocham;
    if (updateData.kinhnghiem !== undefined) doctorFields.kinhnghiem = Number(updateData.kinhnghiem);
    if (updateData.hinhanh !== undefined) doctorFields.hinhanh = updateData.hinhanh || null;

    const employeeFields = {};
    if (updateData.hoten !== undefined) employeeFields.hoten = updateData.hoten;
    if (updateData.gioitinh !== undefined) employeeFields.gioitinh = updateData.gioitinh;
    if (updateData.ngaysinh !== undefined) employeeFields.ngaysinh = new Date(updateData.ngaysinh);
    if (updateData.sdt !== undefined) employeeFields.sdt = updateData.sdt;
    if (updateData.diachi !== undefined) employeeFields.diachi = updateData.diachi;
    if (updateData.ngayvaolam !== undefined) employeeFields.ngayvaolam = new Date(updateData.ngayvaolam);

    // Thực hiện cập nhật trong Transaction
    const updatedDoctor = await prisma.$transaction(async (tx) => {
        // Cập nhật tài khoản nếu có
        if (currentDoctor.nhanvien.matk) {
            const accountFields = {};
            if (updateData.password) {
                accountFields.matkhau = await hashPassword(updateData.password);
            }
            if (updateData.trangthai) {
                accountFields.trangthai = updateData.trangthai;
            }
            if (Object.keys(accountFields).length > 0) {
                await tx.taikhoan.update({
                    where: { matk: currentDoctor.nhanvien.matk },
                    data: accountFields,
                });
            }
        } else if (updateData.username && updateData.password) {
            // Nếu bác sĩ chưa có tài khoản mà admin gửi thông tin tạo mới
            const existingAccount = await tx.taikhoan.findUnique({
                where: { tendangnhap: updateData.username },
            });
            if (existingAccount) {
                const error = new Error(`Tên đăng nhập "${updateData.username}" đã tồn tại!`);
                error.statusCode = 409;
                throw error;
            }
            const hashedPassword = await hashPassword(updateData.password);
            const newAccount = await tx.taikhoan.create({
                data: {
                    tendangnhap: updateData.username,
                    matkhau: hashedPassword,
                    vaitro: "BacSi",
                    trangthai: updateData.trangthai || "HoatDong",
                },
            });
            employeeFields.matk = newAccount.matk;
        }

        if (Object.keys(employeeFields).length > 0) {
            await tx.nhanvien.update({
                where: { manv: id },
                data: employeeFields,
            });
        }

        if (Object.keys(doctorFields).length > 0) {
            await tx.bacsi.update({
                where: { mabs: id },
                data: doctorFields,
            });
        }

        return tx.bacsi.findUnique({
            where: { mabs: id },
            include: {
                nhanvien: {
                    select: {
                        manv: true,
                        hoten: true,
                        gioitinh: true,
                        ngaysinh: true,
                        sdt: true,
                        diachi: true,
                        chucvu: true,
                        ngayvaolam: true,
                        taikhoan: {
                            select: {
                                matk: true,
                                tendangnhap: true,
                                vaitro: true,
                                trangthai: true,
                            },
                        },
                    },
                },
                chuyenkhoa: {
                    select: {
                        mack: true,
                        tenchuyenkhoa: true,
                    },
                },
            },
        });
    });

    return updatedDoctor;
}

// xóa bác sĩ (Có Safe Delete Guard bảo vệ toàn vẹn lịch sử y tế)
async function deleteDoctorService(mabs) {
    const id = Number(mabs);

    // Kiểm tra bác sĩ có tồn tại không
    const doctor = await prisma.bacsi.findUnique({
        where: { mabs: id },
        include: {
            nhanvien: true,
            _count: {
                select: {
                    lichhen: true,
                    lichsukham: true,
                },
            },
        },
    });

    if (!doctor) {
        const error = new Error(`Không tìm thấy bác sĩ với mã ID: ${id}`);
        error.statusCode = 404;
        throw error;
    }

    // Kiểm tra phân công ca trực
    const scheduleCount = await prisma.phanconglamviec.count({
        where: { manv: id },
    });

    const appointmentCount = doctor._count.lichhen;
    const historyCount = doctor._count.lichsukham;

    if (appointmentCount > 0 || historyCount > 0 || scheduleCount > 0) {
        const constraints = [];
        if (appointmentCount > 0) constraints.push(`${appointmentCount} lịch hẹn khám`);
        if (historyCount > 0) constraints.push(`${historyCount} lượt khám chữa bệnh`);
        if (scheduleCount > 0) constraints.push(`${scheduleCount} ca làm việc`);

        const error = new Error(
            `Không thể xóa bác sĩ "${doctor.nhanvien.hoten}" vì đang gắn với dữ liệu y tế (${constraints.join(", ")}). Để bảo vệ hồ sơ bệnh án, không được phép xóa bác sĩ đã phát sinh hoạt động!`,
        );
        error.statusCode = 400;
        throw error;
    }

    // Tiến hành xóa an toàn (nhanvien cascade sang bacsi)
    await prisma.$transaction(async (tx) => {
        await tx.bacsi.delete({
            where: { mabs: id },
        });

        await tx.nhanvien.delete({
            where: { manv: id },
        });

        if (doctor.nhanvien.matk) {
            await tx.taikhoan.delete({
                where: { matk: doctor.nhanvien.matk },
            });
        }
    });

    return {
        mabs: id,
        hoten: doctor.nhanvien.hoten,
    };
}

module.exports = {
    getAllDoctorsService,
    getDoctorByIdService,
    getDoctorScheduleService,
    createDoctorService,
    updateDoctorService,
    deleteDoctorService,
};
