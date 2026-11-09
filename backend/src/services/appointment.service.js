// ========================================================
// SERVICE: QUẢN LÝ LỊCH HẸN KHÁM BỆNH & CHỐNG TRÙNG KHUNG GIỜ
// ========================================================

const prisma = require("../config/prisma");
const {
    parseTimeToDate,
    getTimeInMinutes,
    formatTime,
} = require("../constants/shift.constant");

// Định dạng đối tượng lịch hẹn trả về cho client
function formatAppointmentResponse(apt) {
    if (!apt) return null;

    const formattedDate = apt.ngayhen instanceof Date
        ? apt.ngayhen.toISOString().split("T")[0]
        : apt.ngayhen;

    return {
        malh: apt.malh,
        mabn: apt.mabn,
        mabs: apt.mabs,
        ngayhen: formattedDate,
        giohen: formatTime(apt.giohen),
        trangthai: apt.trangthai,
        lydokham: apt.lydokham,
        benhnhan: apt.benhnhan
            ? {
                mabn: apt.benhnhan.mabn,
                hoten: apt.benhnhan.hoten,
                sdt: apt.benhnhan.sdt,
                gioitinh: apt.benhnhan.gioitinh,
                ngaysinh: apt.benhnhan.ngaysinh
                    ? (apt.benhnhan.ngaysinh instanceof Date
                        ? apt.benhnhan.ngaysinh.toISOString().split("T")[0]
                        : apt.benhnhan.ngaysinh)
                    : null,
                cccd: apt.benhnhan.cccd,
                sobhyt: apt.benhnhan.sobhyt,
            }
            : undefined,
        bacsi: apt.bacsi
            ? {
                mabs: apt.bacsi.mabs,
                hocham: apt.bacsi.hocham,
                kinhnghiem: apt.bacsi.kinhnghiem,
                nhanvien: apt.bacsi.nhanvien
                    ? {
                        manv: apt.bacsi.nhanvien.manv,
                        hoten: apt.bacsi.nhanvien.hoten,
                        sdt: apt.bacsi.nhanvien.sdt,
                    }
                    : undefined,
                chuyenkhoa: apt.bacsi.chuyenkhoa
                    ? {
                        mack: apt.bacsi.chuyenkhoa.mack,
                        tenchuyenkhoa: apt.bacsi.chuyenkhoa.tenchuyenkhoa,
                    }
                    : undefined,
            }
            : undefined,
    };
}

/**
 * 1. Đặt lịch khám bệnh mới (Có thuật toán kiểm tra ca trực & chống trùng khung giờ)
 */
async function createAppointmentService(user, data) {
    const { mabs, ngayhen, giohen, lydokham } = data;
    const doctorId = Number(mabs);

    // 1. Xác định mã bệnh nhân (mabn)
    let patientId;
    if (user?.vaitro === "BenhNhan") {
        const patient = await prisma.benhnhan.findUnique({
            where: { matk: Number(user.matk) },
            select: { mabn: true, hoten: true },
        });
        if (!patient) {
            const error = new Error("Tài khoản của bạn chưa có hồ sơ bệnh nhân! Vui lòng cập nhật hồ sơ trước.");
            error.statusCode = 404;
            throw error;
        }
        patientId = patient.mabn;
    } else if (["Admin", "LeTan"].includes(user?.vaitro)) {
        if (!data.mabn) {
            const error = new Error("Vui lòng chọn hoặc cung cấp mã bệnh nhân (mabn) khi đặt lịch tại quầy!");
            error.statusCode = 400;
            throw error;
        }
        const patient = await prisma.benhnhan.findUnique({
            where: { mabn: Number(data.mabn) },
            select: { mabn: true },
        });
        if (!patient) {
            const error = new Error(`Không tìm thấy bệnh nhân với mã ID: ${data.mabn}`);
            error.statusCode = 404;
            throw error;
        }
        patientId = patient.mabn;
    } else {
        // Cho phép khách vãng lai hoặc bệnh nhân chưa đăng nhập đặt lịch trực tuyến
        const phone = data.sdt || data.phone;
        const name = data.hoten || data.name || data.patientName || "Bệnh Nhân Đặt Lịch";
        if (!phone) {
            const error = new Error("Vui lòng cung cấp số điện thoại liên hệ để đặt lịch khám!");
            error.statusCode = 400;
            throw error;
        }
        let guestPatient = await prisma.benhnhan.findFirst({
            where: { sdt: String(phone).trim() }
        });
        if (!guestPatient) {
            guestPatient = await prisma.benhnhan.create({
                data: {
                    hoten: String(name).trim(),
                    gioitinh: "Nam",
                    ngaysinh: new Date("1995-01-01"),
                    sdt: String(phone).trim(),
                    diachi: "Bệnh nhân đặt trực tuyến qua website"
                }
            });
            await prisma.hosobenhan.create({
                data: {
                    mahsba: guestPatient.mabn,
                    nhommau: "ChuaRo",
                    tiensubenh: "Chưa ghi nhận",
                    diung: "Không có"
                }
            }).catch(() => {});
        }
        patientId = guestPatient.mabn;
    }

    // 2. Kiểm tra Bác sĩ có tồn tại không
    const doctor = await prisma.bacsi.findUnique({
        where: { mabs: doctorId },
        include: {
            nhanvien: { select: { hoten: true, manv: true } },
            chuyenkhoa: { select: { tenchuyenkhoa: true } },
        },
    });
    if (!doctor) {
        const error = new Error(`Không tìm thấy bác sĩ với mã ID: ${doctorId}`);
        error.statusCode = 404;
        throw error;
    }

    const appointmentDate = new Date(ngayhen.trim());
    const appointmentTimeDate = parseTimeToDate(giohen.trim());
    const appointmentMinutes = getTimeInMinutes(appointmentTimeDate);

    // 3. Kiểm tra ca làm việc / phân công trực của bác sĩ trong ngày
    const staffId = doctor.nhanvien?.manv || doctorId;
    const doctorShifts = await prisma.phanconglamviec.findMany({
        where: {
            manv: staffId,
            calamviec: {
                ngay: appointmentDate,
            },
        },
        include: {
            calamviec: true,
        },
    });

    let isWithinShift = false;
    if (doctorShifts.length > 0) {
        isWithinShift = doctorShifts.some((ps) => {
            const shiftStart = getTimeInMinutes(ps.calamviec.giobatdau);
            const shiftEnd = getTimeInMinutes(ps.calamviec.gioketthuc);
            return appointmentMinutes >= shiftStart && appointmentMinutes < shiftEnd;
        });
        if (!isWithinShift) {
            const shiftTimeStrs = doctorShifts.map((ps) =>
                `${formatTime(ps.calamviec.giobatdau)} - ${formatTime(ps.calamviec.gioketthuc)}`
            ).join(", ");
            const error = new Error(
                `Giờ hẹn ${giohen} không nằm trong ca trực của Bác sĩ ${doctor.nhanvien?.hoten} vào ngày ${ngayhen} (${shiftTimeStrs})!`
            );
            error.statusCode = 400;
            throw error;
        }
    } else {
        // Nếu chưa có phân công riêng, kiểm tra theo giờ mở cửa tiêu chuẩn của phòng khám (07:00 - 18:00)
        const clinicOpenMinutes = 7 * 60; // 07:00
        const clinicCloseMinutes = 18 * 60; // 18:00
        if (appointmentMinutes < clinicOpenMinutes || appointmentMinutes > clinicCloseMinutes) {
            const error = new Error(
                `Giờ hẹn ${giohen} nằm ngoài giờ làm việc của phòng khám (07:00 - 18:00)! Vui lòng chọn lại giờ hẹn.`
            );
            error.statusCode = 400;
            throw error;
        }
    }

    // 4. THUẬT TOÁN CHỐNG TRÙNG KHUNG GIỜ (SLOT CONFLICT DETECTION)
    // 4.1. Chống trùng lịch Bác sĩ: Bác sĩ đã có lịch hẹn ở cùng khung giờ (mỗi slot tương đương 30 phút)
    const existingDoctorApt = await prisma.lichhen.findFirst({
        where: {
            mabs: doctorId,
            ngayhen: appointmentDate,
            giohen: appointmentTimeDate,
            trangthai: {
                in: ["ChoXacNhan", "DaXacNhan"],
            },
        },
    });

    if (existingDoctorApt) {
        const error = new Error(
            `Khung giờ ${giohen} ngày ${ngayhen} của Bác sĩ ${doctor.nhanvien?.hoten} đã được đặt hẹn trước! Vui lòng chọn khung giờ khác (ví dụ: cách 30 phút).`
        );
        error.statusCode = 409;
        throw error;
    }

    // 4.2. Chống trùng lịch Bệnh nhân: Bệnh nhân không thể đặt 2 lịch hẹn trùng khung giờ
    const existingPatientApt = await prisma.lichhen.findFirst({
        where: {
            mabn: patientId,
            ngayhen: appointmentDate,
            giohen: appointmentTimeDate,
            trangthai: {
                in: ["ChoXacNhan", "DaXacNhan"],
            },
        },
    });

    if (existingPatientApt) {
        const error = new Error(
            `Bạn đã có một lịch hẹn khám bệnh trong khung giờ ${giohen} ngày ${ngayhen}!`
        );
        error.statusCode = 409;
        throw error;
    }

    // 5. Tạo lịch hẹn vào cơ sở dữ liệu
    const initialStatus = ["Admin", "LeTan"].includes(user?.vaitro) ? "DaXacNhan" : "ChoXacNhan";

    const newAppointment = await prisma.lichhen.create({
        data: {
            mabn: patientId,
            mabs: doctorId,
            ngayhen: appointmentDate,
            giohen: appointmentTimeDate,
            trangthai: initialStatus,
            lydokham: lydokham ? lydokham.trim() : null,
        },
        include: {
            benhnhan: true,
            bacsi: {
                include: {
                    nhanvien: true,
                    chuyenkhoa: true,
                },
            },
        },
    });

    return formatAppointmentResponse(newAppointment);
}

/**
 * 2. Bệnh nhân xem danh sách lịch hẹn của chính mình
 */
async function getMyAppointmentsService(matk, query = {}) {
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
        where.trangthai = query.status;
    }

    const appointments = await prisma.lichhen.findMany({
        where,
        include: {
            bacsi: {
                include: {
                    nhanvien: true,
                    chuyenkhoa: true,
                },
            },
        },
        orderBy: [
            { ngayhen: "desc" },
            { giohen: "asc" },
        ],
    });

    return appointments.map(formatAppointmentResponse);
}

/**
 * 3. Lễ tân / Bác sĩ / Admin: Lấy danh sách lịch hẹn (Bộ lọc đa năng & Phân trang)
 */
async function getAllAppointmentsService(query = {}) {
    const { date, fromDate, toDate, doctorId, patientId, specialtyId, status, search, page = 1, limit = 10 } = query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (date) {
        where.ngayhen = new Date(date.trim());
    } else if (fromDate || toDate) {
        where.ngayhen = {};
        if (fromDate) where.ngayhen.gte = new Date(fromDate.trim());
        if (toDate) where.ngayhen.lte = new Date(toDate.trim());
    }

    if (doctorId) {
        where.mabs = Number(doctorId);
    }

    if (patientId) {
        where.mabn = Number(patientId);
    }

    if (status) {
        where.trangthai = status;
    }

    if (specialtyId) {
        where.bacsi = {
            mack: Number(specialtyId),
        };
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

    const [appointments, total] = await Promise.all([
        prisma.lichhen.findMany({
            where,
            skip,
            take: limitNum,
            include: {
                benhnhan: true,
                bacsi: {
                    include: {
                        nhanvien: true,
                        chuyenkhoa: true,
                    },
                },
            },
            orderBy: [
                { ngayhen: "asc" },
                { giohen: "asc" },
            ],
        }),
        prisma.lichhen.count({ where }),
    ]);

    return {
        data: appointments.map(formatAppointmentResponse),
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
    };
}

/**
 * 4. Xem chi tiết một lịch hẹn
 */
async function getAppointmentByIdService(id, user) {
    const appointmentId = Number(id);

    const appointment = await prisma.lichhen.findUnique({
        where: { malh: appointmentId },
        include: {
            benhnhan: true,
            bacsi: {
                include: {
                    nhanvien: true,
                    chuyenkhoa: true,
                },
            },
        },
    });

    if (!appointment) {
        const error = new Error(`Không tìm thấy lịch hẹn với mã ID: ${appointmentId}`);
        error.statusCode = 404;
        throw error;
    }

    // Nếu là Bệnh nhân, chỉ cho phép xem lịch hẹn của chính mình
    if (user.vaitro === "BenhNhan") {
        const patient = await prisma.benhnhan.findUnique({
            where: { matk: Number(user.matk) },
            select: { mabn: true },
        });
        if (!patient || appointment.mabn !== patient.mabn) {
            const error = new Error("Bạn không có quyền truy cập thông tin lịch hẹn này!");
            error.statusCode = 403;
            throw error;
        }
    }

    return formatAppointmentResponse(appointment);
}

/**
 * 5. Cập nhật trạng thái lịch hẹn (Lễ tân duyệt, Hủy, hoặc Bác sĩ kết thúc khám)
 */
async function updateAppointmentStatusService(id, { trangthai, ghichu }, user) {
    const appointmentId = Number(id);

    const appointment = await prisma.lichhen.findUnique({
        where: { malh: appointmentId },
        include: { benhnhan: true },
    });

    if (!appointment) {
        const error = new Error(`Không tìm thấy lịch hẹn với mã ID: ${appointmentId}`);
        error.statusCode = 404;
        throw error;
    }

    // Phân quyền chuyển đổi trạng thái
    if (user.vaitro === "BenhNhan") {
        const patient = await prisma.benhnhan.findUnique({
            where: { matk: Number(user.matk) },
            select: { mabn: true },
        });
        if (!patient || appointment.mabn !== patient.mabn) {
            const error = new Error("Bạn không có quyền thao tác trên lịch hẹn này!");
            error.statusCode = 403;
            throw error;
        }
        // Bệnh nhân chỉ được phép Hủy lịch hẹn khi đang ở trạng thái ChoXacNhan hoặc DaXacNhan
        if (trangthai !== "DaHuy") {
            const error = new Error("Bệnh nhân chỉ có quyền yêu cầu hủy lịch hẹn (DaHuy)!");
            error.statusCode = 403;
            throw error;
        }
        if (appointment.trangthai === "DaKham") {
            const error = new Error("Lịch hẹn đã được bác sĩ khám xong, không thể hủy!");
            error.statusCode = 400;
            throw error;
        }
    }

    const updatedAppointment = await prisma.lichhen.update({
        where: { malh: appointmentId },
        data: {
            trangthai,
            ...(ghichu && { lydokham: `${appointment.lydokham || ""} [Ghi chú: ${ghichu}]`.trim() }),
        },
        include: {
            benhnhan: true,
            bacsi: {
                include: {
                    nhanvien: true,
                    chuyenkhoa: true,
                },
            },
        },
    });

    return formatAppointmentResponse(updatedAppointment);
}

/**
 * 6. Dời ngày/giờ khám hoặc đổi Bác sĩ (Reschedule)
 */
async function rescheduleAppointmentService(id, { ngayhen, giohen, mabs }, user) {
    const appointmentId = Number(id);

    const appointment = await prisma.lichhen.findUnique({
        where: { malh: appointmentId },
        include: { benhnhan: true, bacsi: true },
    });

    if (!appointment) {
        const error = new Error(`Không tìm thấy lịch hẹn với mã ID: ${appointmentId}`);
        error.statusCode = 404;
        throw error;
    }

    if (appointment.trangthai === "DaKham") {
        const error = new Error("Lịch hẹn này đã hoàn tất khám bệnh, không thể dời lịch!");
        error.statusCode = 400;
        throw error;
    }
    if (appointment.trangthai === "DaHuy") {
        const error = new Error("Lịch hẹn này đã bị hủy, vui lòng tạo lịch hẹn mới!");
        error.statusCode = 400;
        throw error;
    }

    // Quyền thao tác: Bệnh nhân sở hữu lịch hoặc Nhân viên y tế
    if (user.vaitro === "BenhNhan") {
        const patient = await prisma.benhnhan.findUnique({
            where: { matk: Number(user.matk) },
            select: { mabn: true },
        });
        if (!patient || appointment.mabn !== patient.mabn) {
            const error = new Error("Bạn không có quyền dời lịch hẹn này!");
            error.statusCode = 403;
            throw error;
        }
    }

    const targetDoctorId = mabs ? Number(mabs) : appointment.mabs;
    const targetDateStr = ngayhen ? ngayhen.trim() : appointment.ngayhen.toISOString().split("T")[0];
    const targetDate = new Date(targetDateStr);
    const targetTimeDate = giohen ? parseTimeToDate(giohen.trim()) : appointment.giohen;
    const targetMinutes = getTimeInMinutes(targetTimeDate);

    // Kiểm tra ca trực của bác sĩ
    const doctorShifts = await prisma.phanconglamviec.findMany({
        where: {
            manv: targetDoctorId,
            calamviec: { ngay: targetDate },
        },
        include: { calamviec: true },
    });

    if (doctorShifts.length === 0) {
        const error = new Error(`Bác sĩ không có ca trực vào ngày ${targetDateStr}!`);
        error.statusCode = 400;
        throw error;
    }

    const isWithinShift = doctorShifts.some((ps) => {
        const shiftStart = getTimeInMinutes(ps.calamviec.giobatdau);
        const shiftEnd = getTimeInMinutes(ps.calamviec.gioketthuc);
        return targetMinutes >= shiftStart && targetMinutes < shiftEnd;
    });

    if (!isWithinShift) {
        const error = new Error("Khung giờ mới không nằm trong ca trực của bác sĩ!");
        error.statusCode = 400;
        throw error;
    }

    // Kiểm tra trùng slot bác sĩ (loại trừ chính lịch hẹn này)
    const conflictDoctor = await prisma.lichhen.findFirst({
        where: {
            malh: { not: appointmentId },
            mabs: targetDoctorId,
            ngayhen: targetDate,
            giohen: targetTimeDate,
            trangthai: { in: ["ChoXacNhan", "DaXacNhan"] },
        },
    });

    if (conflictDoctor) {
        const error = new Error("Khung giờ mới của bác sĩ đã có lịch hẹn trước!");
        error.statusCode = 409;
        throw error;
    }

    const updated = await prisma.lichhen.update({
        where: { malh: appointmentId },
        data: {
            mabs: targetDoctorId,
            ngayhen: targetDate,
            giohen: targetTimeDate,
            trangthai: "ChoXacNhan", // Dời lịch đưa về trạng thái chờ xác nhận
        },
        include: {
            benhnhan: true,
            bacsi: {
                include: {
                    nhanvien: true,
                    chuyenkhoa: true,
                },
            },
        },
    });

    return formatAppointmentResponse(updated);
}

/**
 * 7. Hủy lịch hẹn
 */
async function cancelAppointmentService(id, user) {
    return updateAppointmentStatusService(id, { trangthai: "DaHuy" }, user);
}

module.exports = {
    createAppointmentService,
    getMyAppointmentsService,
    getAllAppointmentsService,
    getAppointmentByIdService,
    updateAppointmentStatusService,
    rescheduleAppointmentService,
    cancelAppointmentService,
};
