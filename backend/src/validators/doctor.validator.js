// Kiểm tra ID bác sĩ trên params (:id)

function validateDoctorId(req, res, next) {
    const { id } = req.params;
    const numericId = Number(id);

    if (!id || !Number.isInteger(numericId) || numericId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã bác sĩ (ID) không hợp lệ! Phải là số nguyên dương.",
        });
    }

    req.params.id = numericId;
    next();
}


// Kiểm tra các tham số query khi lọc danh sách bác sĩ

function validateDoctorQuery(req, res, next) {
    const { specialtyId, search, page, limit } = req.query;

    if (specialtyId !== undefined) {
        const specId = Number(specialtyId);
        if (!Number.isInteger(specId) || specId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số specialtyId phải là số nguyên dương!",
            });
        }
        req.query.specialtyId = specId;
    }

    if (search !== undefined) {
        if (typeof search !== "string") {
            return res.status(400).json({
                success: false,
                message: "Tham số tìm kiếm search phải là chuỗi ký tự!",
            });
        }
        req.query.search = search.trim();
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


// Kiểm tra query parameters khi lấy lịch làm việc / ca trực của bác sĩ
function validateDoctorScheduleQuery(req, res, next) {
    const { fromDate, toDate } = req.query;

    if (fromDate !== undefined) {
        const parsedFrom = new Date(fromDate);
        if (isNaN(parsedFrom.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Tham số fromDate không đúng định dạng ngày tháng hợp lệ (YYYY-MM-DD)!",
            });
        }
    }

    if (toDate !== undefined) {
        const parsedTo = new Date(toDate);
        if (isNaN(parsedTo.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Tham số toDate không đúng định dạng ngày tháng hợp lệ (YYYY-MM-DD)!",
            });
        }
    }

    if (fromDate && toDate) {
        if (new Date(fromDate) > new Date(toDate)) {
            return res.status(400).json({
                success: false,
                message: "fromDate không được lớn hơn toDate!",
            });
        }
    }

    next();
}


// Kiểm tra dữ liệu khi tạo mới bác sĩ
function validateCreateDoctor(req, res, next) {
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
        avatar,
        image,
        img,
    } = req.body;

    // Kiểm tra mã chuyên khoa (mack)
    const numMack = Number(mack);
    if (!mack || !Number.isInteger(numMack) || numMack <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã chuyên khoa (mack) là bắt buộc và phải là số nguyên dương!",
        });
    }

    // Kiểm tra số giấy phép hành nghề (sogiayphephanhnghe)
    if (
        !sogiayphephanhnghe ||
        typeof sogiayphephanhnghe !== "string" ||
        sogiayphephanhnghe.trim().length < 3 ||
        sogiayphephanhnghe.trim().length > 50
    ) {
        return res.status(400).json({
            success: false,
            message: "Số giấy phép hành nghề là bắt buộc và phải từ 3 đến 50 ký tự!",
        });
    }

    // Kiểm tra họ và tên nhân viên (hoten)
    if (
        !hoten ||
        typeof hoten !== "string" ||
        hoten.trim().length < 2 ||
        hoten.trim().length > 100
    ) {
        return res.status(400).json({
            success: false,
            message: "Họ và tên bác sĩ là bắt buộc và phải từ 2 đến 100 ký tự!",
        });
    }

    // Kiểm tra giới tính (gioitinh)
    const validGenders = ["Nam", "Nu", "Khac"];
    if (!gioitinh || !validGenders.includes(gioitinh)) {
        return res.status(400).json({
            success: false,
            message: `Giới tính không hợp lệ! Chỉ chấp nhận: ${validGenders.join(", ")}`,
        });
    }

    // Kiểm tra ngày sinh (ngaysinh)
    if (!ngaysinh) {
        return res.status(400).json({
            success: false,
            message: "Ngày sinh là bắt buộc!",
        });
    }
    const parsedBirthDate = new Date(ngaysinh);
    if (isNaN(parsedBirthDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: "Ngày sinh không đúng định dạng hợp lệ (YYYY-MM-DD)!",
        });
    }
    if (parsedBirthDate > new Date()) {
        return res.status(400).json({
            success: false,
            message: "Ngày sinh không thể lớn hơn ngày hiện tại!",
        });
    }
    if (parsedBirthDate.getFullYear() < 1920) {
        return res.status(400).json({
            success: false,
            message: "Năm sinh không hợp lệ (phải từ năm 1920 trở lại đây)!",
        });
    }

    // Kiểm tra số điện thoại (sdt)
    if (!sdt || typeof sdt !== "string") {
        return res.status(400).json({
            success: false,
            message: "Số điện thoại là bắt buộc!",
        });
    }
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(sdt.trim())) {
        return res.status(400).json({
            success: false,
            message: "Số điện thoại không hợp lệ! Phải bao gồm đúng 10 chữ số bắt đầu bằng số 0.",
        });
    }

    // Kiểm tra học hàm / học vị (nếu có)
    if (hocham !== undefined && hocham !== null) {
        if (typeof hocham !== "string" || hocham.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: "Học hàm/học vị không được vượt quá 50 ký tự!",
            });
        }
    }

    // Kiểm tra số năm kinh nghiệm (nếu có)
    let numExp = 0;
    if (kinhnghiem !== undefined && kinhnghiem !== null) {
        numExp = Number(kinhnghiem);
        if (!Number.isInteger(numExp) || numExp < 0 || numExp > 70) {
            return res.status(400).json({
                success: false,
                message: "Số năm kinh nghiệm phải là số nguyên từ 0 đến 70 năm!",
            });
        }
    }

    // Kiểm tra địa chỉ (nếu có)
    if (diachi !== undefined && diachi !== null) {
        if (typeof diachi !== "string" || diachi.trim().length > 255) {
            return res.status(400).json({
                success: false,
                message: "Địa chỉ không được vượt quá 255 ký tự!",
            });
        }
    }

    // Kiểm tra ngày vào làm (nếu có)
    if (ngayvaolam !== undefined && ngayvaolam !== null) {
        const parsedWorkDate = new Date(ngayvaolam);
        if (isNaN(parsedWorkDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Ngày vào làm không đúng định dạng ngày tháng hợp lệ!",
            });
        }
    }

    // Kiểm tra thông tin tài khoản đăng nhập (nếu có gửi kèm)
    if (username || password) {
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Nếu muốn cấp tài khoản cho bác sĩ, vui lòng cung cấp cả username và password!",
            });
        }
        if (typeof username !== "string" || username.trim().length < 4 || username.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: "Tên đăng nhập (username) phải từ 4 đến 50 ký tự!",
            });
        }
        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu (password) phải có ít nhất 6 ký tự!",
            });
        }
    }

    // Chuẩn hóa dữ liệu sau khi trim
    req.body.mack = numMack;
    req.body.sogiayphephanhnghe = sogiayphephanhnghe.trim();
    req.body.hoten = hoten.trim();
    req.body.sdt = sdt.trim();
    req.body.kinhnghiem = numExp;
    if (hocham) req.body.hocham = hocham.trim();
    if (diachi) req.body.diachi = diachi.trim();
    if (username) req.body.username = username.trim();
    req.body.hinhanh = hinhanh || avatar || image || img || null;

    next();
}


// Kiểm tra dữ liệu khi cập nhật thông tin bác sĩ
function validateUpdateDoctor(req, res, next) {
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
        trangthai,
        hinhanh,
        avatar,
        image,
        img,
    } = req.body;

    // Phải có ít nhất một trường dữ liệu
    if (
        mack === undefined &&
        sogiayphephanhnghe === undefined &&
        hocham === undefined &&
        kinhnghiem === undefined &&
        hoten === undefined &&
        gioitinh === undefined &&
        ngaysinh === undefined &&
        sdt === undefined &&
        diachi === undefined &&
        ngayvaolam === undefined &&
        username === undefined &&
        password === undefined &&
        trangthai === undefined &&
        hinhanh === undefined &&
        avatar === undefined &&
        image === undefined &&
        img === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp ít nhất một thông tin cần cập nhật!",
        });
    }

    if (mack !== undefined) {
        const numMack = Number(mack);
        if (!Number.isInteger(numMack) || numMack <= 0) {
            return res.status(400).json({
                success: false,
                message: "Mã chuyên khoa (mack) phải là số nguyên dương!",
            });
        }
        req.body.mack = numMack;
    }

    if (sogiayphephanhnghe !== undefined) {
        if (
            typeof sogiayphephanhnghe !== "string" ||
            sogiayphephanhnghe.trim().length < 3 ||
            sogiayphephanhnghe.trim().length > 50
        ) {
            return res.status(400).json({
                success: false,
                message: "Số giấy phép hành nghề phải từ 3 đến 50 ký tự!",
            });
        }
        req.body.sogiayphephanhnghe = sogiayphephanhnghe.trim();
    }

    if (hoten !== undefined) {
        if (
            typeof hoten !== "string" ||
            hoten.trim().length < 2 ||
            hoten.trim().length > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Họ và tên bác sĩ phải từ 2 đến 100 ký tự!",
            });
        }
        req.body.hoten = hoten.trim();
    }

    if (gioitinh !== undefined) {
        const validGenders = ["Nam", "Nu", "Khac"];
        if (!validGenders.includes(gioitinh)) {
            return res.status(400).json({
                success: false,
                message: `Giới tính không hợp lệ! Chỉ chấp nhận: ${validGenders.join(", ")}`,
            });
        }
    }

    if (ngaysinh !== undefined) {
        const parsedBirthDate = new Date(ngaysinh);
        if (isNaN(parsedBirthDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Ngày sinh không đúng định dạng hợp lệ (YYYY-MM-DD)!",
            });
        }
        if (parsedBirthDate > new Date()) {
            return res.status(400).json({
                success: false,
                message: "Ngày sinh không thể lớn hơn ngày hiện tại!",
            });
        }
        if (parsedBirthDate.getFullYear() < 1920) {
            return res.status(400).json({
                success: false,
                message: "Năm sinh không hợp lệ (phải từ năm 1920 trở lại đây)!",
            });
        }
    }

    if (sdt !== undefined) {
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(sdt.trim())) {
            return res.status(400).json({
                success: false,
                message: "Số điện thoại không hợp lệ! Phải bao gồm đúng 10 chữ số bắt đầu bằng số 0.",
            });
        }
        req.body.sdt = sdt.trim();
    }

    if (hocham !== undefined && hocham !== null) {
        if (typeof hocham !== "string" || hocham.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: "Học hàm/học vị không được vượt quá 50 ký tự!",
            });
        }
        req.body.hocham = hocham.trim();
    }

    if (kinhnghiem !== undefined && kinhnghiem !== null) {
        const numExp = Number(kinhnghiem);
        if (!Number.isInteger(numExp) || numExp < 0 || numExp > 70) {
            return res.status(400).json({
                success: false,
                message: "Số năm kinh nghiệm phải là số nguyên từ 0 đến 70 năm!",
            });
        }
        req.body.kinhnghiem = numExp;
    }

    if (diachi !== undefined && diachi !== null) {
        if (typeof diachi !== "string" || diachi.trim().length > 255) {
            return res.status(400).json({
                success: false,
                message: "Địa chỉ không được vượt quá 255 ký tự!",
            });
        }
        req.body.diachi = diachi.trim();
    }

    if (ngayvaolam !== undefined && ngayvaolam !== null) {
        const parsedWorkDate = new Date(ngayvaolam);
        if (isNaN(parsedWorkDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Ngày vào làm không đúng định dạng ngày tháng hợp lệ!",
            });
        }
    }

    if (username !== undefined) {
        if (typeof username !== "string" || username.trim().length < 4 || username.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: "Tên đăng nhập (username) phải từ 4 đến 50 ký tự!",
            });
        }
        req.body.username = username.trim();
    }

    if (password !== undefined) {
        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu (password) phải có ít nhất 6 ký tự!",
            });
        }
    }

    if (trangthai !== undefined) {
        const validStatuses = ["HoatDong", "KhoaTaiKhoan"];
        if (!validStatuses.includes(trangthai)) {
            return res.status(400).json({
                success: false,
                message: `Trạng thái tài khoản không hợp lệ! Chỉ chấp nhận: ${validStatuses.join(", ")}`,
            });
        }
    }

    if (hinhanh !== undefined || avatar !== undefined || image !== undefined || img !== undefined) {
        req.body.hinhanh = hinhanh !== undefined ? hinhanh : (avatar !== undefined ? avatar : (image !== undefined ? image : img));
    }

    next();
}

module.exports = {
    validateDoctorId,
    validateDoctorQuery,
    validateDoctorScheduleQuery,
    validateCreateDoctor,
    validateUpdateDoctor,
};
