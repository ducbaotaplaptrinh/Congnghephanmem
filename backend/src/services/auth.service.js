const prisma = require("../config/prisma");
const { generateToken } = require("../utils/jwt");
const { hashPassword, comparePassword } = require("../utils/password");

async function registerService({
    username,
    password,
    hoten,
    gioitinh,
    ngaysinh,
    sdt,
}) {
    //chuan hoa truoc khi kiem tra
    const normalizedUserName = username.trim();

    // Kiem tra user ton tai khong
    const exitingUser = await prisma.taikhoan.findUnique({
        where: { tendangnhap: normalizedUserName },
    });

    //xu ly loi neu ton tai
    if (exitingUser) {
        const error = new Error("Tên tài khoản đã tồn tại");
        error.statusCode = 409;
        throw error;
    }
    //hash password
    const hashedPassword = await hashPassword(password);
    const result = await prisma.$transaction(async (tx) => {
        const account = await tx.taikhoan.create({
            data: {
                tendangnhap: normalizedUserName,
                matkhau: hashedPassword,
                vaitro: "BenhNhan",
            },
        });

        const patient = await tx.benhnhan.create({
            data: {
                matk: account.matk,
                hoten,
                gioitinh,
                ngaysinh: new Date(ngaysinh),
                sdt,
            },
        });
        return { account, patient };
    });

    return {
        matk: result.account.matk,
        tendangnhap: result.account.tendangnhap,
        vaitro: result.account.vaitro,

        mabn: result.patient.mabn,
        hoten: result.patient.hoten,
        gioitinh: result.patient.gioitinh,
        ngaysinh: result.patient.ngaysinh,
        sdt: result.patient.sdt,

        trangthai: result.account.trangthai,
        ngaytao: result.account.ngaytao,
    };
}

async function loginService({ username, password }) {
    //chuan hoa truoc khi kiem tra
    const normalizedUserName = username.trim();

    // Kiem tra user ton tai khong (kem theo thong tin nhanvien/bacsi/benhnhan)
    const user = await prisma.taikhoan.findUnique({
        where: { tendangnhap: normalizedUserName },
        include: {
            nhanvien: {
                include: {
                    bacsi: {
                        include: {
                            chuyenkhoa: true,
                        },
                    },
                },
            },
            benhnhan: true,
        },
    });
    // Kiểm tra user
    if (!user) {
        const error = new Error("Tên đăng nhập hoặc mật khẩu không đúng!");
        error.statusCode = 401;
        throw error;
    }
    //Kiểm tra trạng thái
    if (user.trangthai !== "HoatDong") {
        const error = new Error("Tài khoản đã bị khóa!");
        error.statusCode = 401;
        throw error;
    }
    //Kiểm tra mật khẩu
    const isPasswordValid = await comparePassword(password, user.matkhau);
    if (!isPasswordValid) {
        const error = new Error("Tên đăng nhập hoặc mật khẩu không đúng!");
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken({
        matk: user.matk,
        vaitro: user.vaitro,
    });

    const doctorProfile = user.nhanvien?.bacsi;
    const employeeProfile = user.nhanvien;
    const patientProfile = user.benhnhan;

    return {
        user: {
            matk: user.matk,
            vaitro: user.vaitro,
            trangthai: user.trangthai,
            tendangnhap: user.tendangnhap,
            hoten: employeeProfile?.hoten || patientProfile?.hoten || user.tendangnhap,
            fullName: employeeProfile?.hoten || patientProfile?.hoten || user.tendangnhap,
            manv: employeeProfile?.manv,
            mabs: doctorProfile?.mabs,
            hocham: doctorProfile?.hocham,
            chuyenkhoa: doctorProfile?.chuyenkhoa?.tenchuyenkhoa,
            mack: doctorProfile?.chuyenkhoa?.mack,
            sdt: employeeProfile?.sdt || patientProfile?.sdt,
            mabn: patientProfile?.mabn,
            hinhanh: doctorProfile?.hinhanh || null,
        },
        token,
    };
}

async function getAllUsersService() {
    const accounts = await prisma.taikhoan.findMany({
        include: {
            nhanvien: {
                include: {
                    bacsi: {
                        include: {
                            chuyenkhoa: true,
                        },
                    },
                },
            },
            benhnhan: true,
        },
        orderBy: { matk: "asc" },
    });

    return accounts.map((acc) => {
        const isStaff = !!acc.nhanvien;
        const isPatient = !!acc.benhnhan;
        const doctor = acc.nhanvien?.bacsi;
        const name = acc.nhanvien?.hoten || acc.benhnhan?.hoten || (acc.tendangnhap === 'admin' ? 'Quản Trị Viên Hệ Thống' : (acc.tendangnhap === 'ketoan' ? 'Kế Toán Viên (Thu Ngân)' : acc.tendangnhap));
        const phone = acc.nhanvien?.sdt || acc.benhnhan?.sdt || '';
        const role = acc.vaitro;

        return {
            id: acc.matk,
            matk: acc.matk,
            username: acc.tendangnhap,
            name,
            email: `${acc.tendangnhap}@phongkham.vn`,
            role,
            status: acc.trangthai === "HoatDong" ? "ACTIVE" : "LOCKED",
            rawStatus: acc.trangthai,
            phone,
            gender: acc.nhanvien?.gioitinh || acc.benhnhan?.gioitinh || 'Nam',
            createdAt: acc.ngaytao,
            lastLogin: new Date(acc.ngaytao).toISOString().replace("T", " ").substring(0, 16),
            isStaff,
            isPatient,
            mabs: doctor?.mabs || null,
            hocham: doctor?.hocham || null,
            chuyenkhoa: doctor?.chuyenkhoa?.tenchuyenkhoa || null,
            hinhanh: doctor?.hinhanh || null,
        };
    });
}

async function toggleUserStatusService(userId) {
    const matk = Number(userId);
    const user = await prisma.taikhoan.findUnique({ where: { matk } });
    if (!user) {
        const error = new Error(`Không tìm thấy tài khoản với ID: ${matk}`);
        error.statusCode = 404;
        throw error;
    }

    const newStatus = user.trangthai === "HoatDong" ? "KhoaTaiKhoan" : "HoatDong";
    const updated = await prisma.taikhoan.update({
        where: { matk },
        data: { trangthai: newStatus },
    });

    return {
        matk: updated.matk,
        tendangnhap: updated.tendangnhap,
        trangthai: updated.trangthai,
        status: updated.trangthai === "HoatDong" ? "ACTIVE" : "LOCKED",
    };
}

async function createUserService({ username, password, hoten, vaitro, sdt, gioitinh, mack, hocham, sogiayphephanhnghe, kinhnghiem, existingDoctorId, hinhanh }) {
    const normalizedUsername = (username || '').trim();
    if (!normalizedUsername) {
        const error = new Error("Tên đăng nhập không được để trống!");
        error.statusCode = 400;
        throw error;
    }

    const existing = await prisma.taikhoan.findUnique({
        where: { tendangnhap: normalizedUsername }
    });
    if (existing) {
        const error = new Error("Tên tài khoản đã tồn tại trong hệ thống!");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await hashPassword(password || "123456");
    const validRole = ["Admin", "BacSi", "YTa", "LeTan", "BenhNhan"].includes(vaitro) ? vaitro : "Admin";

    // Chuẩn hóa số điện thoại hợp lệ và duy nhất
    let phone = (sdt || '').replace(/\D/g, '');
    if (!phone || phone.length !== 10 || !phone.startsWith('0')) {
        phone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;
    }
    const checkPhone = await prisma.nhanvien.findUnique({ where: { sdt: phone } });
    if (checkPhone) {
        phone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;
    }

    const account = await prisma.$transaction(async (tx) => {
        const acc = await tx.taikhoan.create({
            data: {
                tendangnhap: normalizedUsername,
                matkhau: hashedPassword,
                vaitro: validRole,
                trangthai: "HoatDong"
            }
        });

        if (validRole === "BenhNhan") {
            await tx.benhnhan.create({
                data: {
                    matk: acc.matk,
                    hoten: hoten || normalizedUsername,
                    gioitinh: gioitinh === "Nu" ? "Nu" : "Nam",
                    ngaysinh: new Date("2000-01-01"),
                    sdt: phone
                }
            });
        } else {
            // Nếu là Bác sĩ và chọn liên kết với bác sĩ đã có chưa có tài khoản
            if (validRole === "BacSi" && existingDoctorId) {
                const docId = Number(existingDoctorId);
                await tx.nhanvien.update({
                    where: { manv: docId },
                    data: { matk: acc.matk }
                });
            } else {
                const employee = await tx.nhanvien.create({
                    data: {
                        matk: acc.matk,
                        hoten: hoten || normalizedUsername,
                        gioitinh: gioitinh === "Nu" ? "Nu" : "Nam",
                        ngaysinh: new Date("1990-01-01"),
                        sdt: phone,
                        chucvu: ["BacSi", "YTa", "LeTan"].includes(validRole) ? validRole : "QuanLy",
                        ngayvaolam: new Date()
                    }
                });

                // Nếu tạo tài khoản Bác sĩ mới: ĐỒNG THỜI tạo hồ sơ bác sĩ đầy đủ trong bảng bacsi
                if (validRole === "BacSi") {
                    const license = (sogiayphephanhnghe || '').trim() || `CCHN-${Math.floor(100000 + Math.random() * 900000)}`;
                    await tx.bacsi.create({
                        data: {
                            mabs: employee.manv,
                            mack: Number(mack) || 1,
                            sogiayphephanhnghe: license,
                            hocham: hocham || "Bác sĩ CKI",
                            kinhnghiem: Number(kinhnghiem) || 5,
                            hinhanh: hinhanh || null
                        }
                    });
                }
            }
        }

        return acc;
    });

    return {
        matk: account.matk,
        tendangnhap: account.tendangnhap,
        vaitro: account.vaitro,
        hoten: hoten || normalizedUsername,
        trangthai: account.trangthai
    };
}

module.exports = {
    registerService,
    loginService,
    getAllUsersService,
    toggleUserStatusService,
    createUserService,
};
