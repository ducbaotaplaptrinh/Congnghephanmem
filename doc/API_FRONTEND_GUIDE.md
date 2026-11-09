# 📋 TÀI LIỆU TÍCH HỢP API BACKEND CHO FRONTEND
> **Hệ Thống Quản Lý Phòng Khám (Clinic Management System)**  
> **Cập nhật ngày:** 15/10/2026 | **Phiên bản API:** v1.1.0

---

## 📌 1. THÔNG TIN KẾT NỐI CHUNG (GENERAL CONFIG)

* **Base URL (Localhost):** `http://localhost:5000`
* **Base URL (Vercel Production):** `https://backendapiqlpk.vercel.app` *(hoặc domain Vercel nhóm đã deploy)*
* **Quy chuẩn gửi dữ liệu:** 
  * Header bắt buộc cho tất cả request gửi dữ liệu: `Content-Type: application/json`
  * Với các API yêu cầu đăng nhập, đính kèm token vào Header:
    ```http
    Authorization: Bearer <accessToken>
    ```

---

## 📦 2. QUY CHUẨN ĐỊNH DẠNG DỮ LIỆU (RESPONSE FORMAT)

### 🟢 Thành công (HTTP Status 200 / 201)
```json
{
  "success": true,
  "message": "Thông báo kết quả thành công",
  "data": { ... } // hoặc thông tin đối tượng trả về
}
```

### 🔴 Thất bại / Lỗi (HTTP Status 400 / 401 / 403 / 404 / 500)
```json
{
  "success": false,
  "message": "Nội dung thông báo lỗi cụ thể để Frontend hiển thị toast/alert"
}
```

---

## 🔐 3. PHÂN HỆ XÁC THỰC & TÀI KHOẢN (`/api/auth`)

### 3.1. Đăng ký tài khoản Bệnh nhân mới
* **Endpoint:** `POST /api/auth/register`
* **Quyền:** Public (Không cần token)
* **Request Body:**
```json
{
  "username": "nguyenvanan",
  "password": "Password123@",
  "hoten": "Nguyễn Văn An",
  "gioitinh": "Nam",        // "Nam" | "Nu" | "Khac"
  "ngaysinh": "2000-01-15", // Định dạng YYYY-MM-DD
  "sdt": "0912345678"
}
```
* **Response Thành công (201 Created):**
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công!",
  "data": {
    "account": {
      "matk": 1,
      "tendangnhap": "nguyenvanan",
      "vaitro": "BenhNhan",
      "trangthai": "HoatDong"
    },
    "patient": {
      "mabn": 1,
      "hoten": "Nguyễn Văn An",
      "gioitinh": "Nam",
      "sdt": "0912345678"
    }
  }
}
```

---

### 3.2. Đăng nhập hệ thống
* **Endpoint:** `POST /api/auth/login`
* **Quyền:** Public
* **Request Body:**
```json
{
  "username": "nguyenvanan",
  "password": "Password123@"
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công!",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "matk": 1,
    "tendangnhap": "nguyenvanan",
    "vaitro": "BenhNhan",
    "mabn": 1 // Mã bệnh nhân (nếu role là BenhNhan)
  }
}
```
> **💡 Lưu ý cho Frontend:** 
> Lưu `accessToken` vào `localStorage` hoặc Cookie. Lưu thông tin `user` vào Redux / Pinia / React Context để phân quyền hiển thị giao diện.

---

### 3.3. Xem thông tin Token cá nhân (Kiểm tra đăng nhập)
* **Endpoint:** `GET /api/auth/profile`
* **Quyền:** Cần Token (`Bearer Token` mọi role)
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Xác thực Token thành công! Đây là thông tin cá nhân của bạn.",
  "user": {
    "matk": 1,
    "tendangnhap": "nguyenvanan",
    "vaitro": "BenhNhan",
    "mabn": 1
  }
}
```

---

## 🏥 4. PHÂN HỆ HỒ SƠ BỆNH NHÂN & TIỀN SỬ BỆNH ÁN (`/api/patients`)

### 4.1. Xem hồ sơ cá nhân của Bệnh nhân
* **Endpoint:** `GET /api/patients/me`
* **Quyền:** Cần Token (`Bearer Token`, role `BenhNhan`)
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin cá nhân thành công!",
  "data": {
    "mabn": 1,
    "matk": 1,
    "hoten": "Nguyễn Văn An",
    "gioitinh": "Nam",
    "ngaysinh": "2000-01-15T00:00:00.000Z",
    "sdt": "0912345678",
    "diachi": "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
    "cccd": "079200001234",
    "sobhyt": "DN4791234567890",
    "ngaydangky": "2026-10-08T00:00:00.000Z",
    "taikhoan": {
      "tendangnhap": "nguyenvanan",
      "vaitro": "BenhNhan"
    }
  }
}
```

---

### 4.2. Chỉnh sửa / Cập nhật hồ sơ Bệnh nhân
* **Endpoint:** `PUT /api/patients/me`
* **Quyền:** Cần Token (`Bearer Token`, role `BenhNhan`)
* **Request Body (Các trường cần cập nhật):**
```json
{
  "hoten": "Nguyễn Văn An",
  "gioitinh": "Nam",
  "ngaysinh": "2000-01-15",
  "sdt": "0988776655",
  "diachi": "456 Lê Lợi, Quận 1, TP.HCM",
  "cccd": "079200001234",
  "sobhyt": "DN4791234567890"
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật hồ sơ bệnh nhân thành công!",
  "data": {
    "mabn": 1,
    "hoten": "Nguyễn Văn An",
    "gioitinh": "Nam",
    "ngaysinh": "2000-01-15T00:00:00.000Z",
    "sdt": "0988776655",
    "diachi": "456 Lê Lợi, Quận 1, TP.HCM",
    "cccd": "079200001234",
    "sobhyt": "DN4791234567890"
  }
}
```

---

### 4.3. Xem hồ sơ bệnh án & tiền sử bệnh (EMR)
* **Endpoint:** `GET /api/patients/me/medical-record`
* **Quyền:** Cần Token (`Bearer Token`, role `BenhNhan`)
* **Lưu ý đặc biệt cho Frontend:** Nếu bệnh nhân mới đăng ký và chưa từng nhập tiền sử bệnh, hệ thống **tự động khởi tạo bản ghi mặc định** (nhóm máu `"ChuaRo"`, tiền sử bệnh `null`) mà không trả về lỗi 404, giúp giao diện hiển thị mượt mà.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy hồ sơ bệnh án thành công",
  "data": {
    "mahsba": 1,
    "nhommau": "O",        // "A" | "B" | "AB" | "O" | "ChuaRo"
    "tiensubenh": "Không có tiền sử bệnh lý tim mạch hay huyết áp",
    "diung": "Dị ứng phấn hoa, kháng sinh Penicillin",
    "ghichu": "Thể trạng sức khỏe bình thường",
    "benhnhan": {
      "hoten": "Nguyễn Văn An",
      "sdt": "0988776655"
    }
  }
}
```

---

### 4.4. Cập nhật hồ sơ bệnh án & tiền sử bệnh (EMR)
* **Endpoint:** `PUT /api/patients/me/medical-record`
* **Quyền:** Cần Token (`Bearer Token`, role `BenhNhan`)
* **Request Body:**
```json
{
  "nhommau": "O",
  "tiensubenh": "Viêm dạ dày nhẹ năm 2024",
  "diung": "Dị ứng hải sản (tôm, cua), dị ứng Aspirin",
  "ghichu": "Huyết áp ổn định 120/80"
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật hồ sơ bệnh án thành công",
  "data": {
    "mahsba": 1,
    "nhommau": "O",
    "tiensubenh": "Viêm dạ dày nhẹ năm 2024",
    "diung": "Dị ứng hải sản (tôm, cua), dị ứng Aspirin",
    "ghichu": "Huyết áp ổn định 120/80",
    "benhnhan": {
      "hoten": "Nguyễn Văn An",
      "sdt": "0988776655"
    }
  }
}
```

---

### 4.5. Xóa / làm trống (reset) tiền sử bệnh án
* **Endpoint:** `DELETE /api/patients/me/medical-record`
* **Quyền:** Cần Token (`Bearer Token`, role `BenhNhan`)
* **Mục đích:** Bệnh nhân tự làm trống tiền sử bệnh án hoặc thông tin dị ứng đã nhập nhầm.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Đã làm trống (reset) tiền sử bệnh án thành công!",
  "data": {
    "mahsba": 1,
    "nhommau": "ChuaRo",
    "tiensubenh": null,
    "diung": null,
    "ghichu": null
  }
}
```

---

### 4.6. Xem danh sách lịch sử các lần khám bệnh
* **Endpoint:** `GET /api/patients/me/medical-history`
* **Quyền:** Cần Token (`Bearer Token`, role `BenhNhan`)
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy lịch sử khám thành công",
  "data": [
    {
      "malsk": 101,
      "ngay": "2026-10-05T09:30:00.000Z",
      "trieuchung": "Sốt nhẹ, ho có đờm, đau họng 2 ngày",
      "chandoan": "Viêm đường hô hấp trên cấp tính",
      "ketluan": "Theo dõi điều trị ngoại trú bằng thuốc",
      "bacsi": {
        "mabs": 5,
        "hocham": "Bác sĩ CKI",
        "nhanvien": {
          "hoten": "BS. Trần Văn Bình",
          "sdt": "0909123456"
        },
        "chuyenkhoa": {
          "tenchuyenkhoa": "Khoa Tai Mũi Họng"
        }
      },
      "donthuoc": {
        "madt": 55,
        "ngayke": "2026-10-05T00:00:00.000Z",
        "ghichubacsi": "Uống sau ăn no, kiêng nước đá",
        "chitietdonthuoc": [
          {
            "mactdt": 12,
            "soluong": 20,
            "lieudung": "Sáng 1 viên, tối 1 viên",
            "thoigiansudung": "5 ngày",
            "thuoc": {
              "tenthuoc": "Amoxicillin 500mg",
              "donvitinh": "Viên"
            }
          }
        ]
      },
      "chitietdichvukham": [
        {
          "mactdvk": 88,
          "soluong": 1,
          "ketqua": "Họng sung huyết nhẹ",
          "dichvu": {
            "tendichvu": "Khám chuyên khoa Tai Mũi Họng",
            "dongia": "150000"
          }
        }
      ],
      "hoadon": {
        "mahd": 77,
        "tongtien": "350000",
        "trangthaithanhtoan": "DaThanhToan",
        "phuongthuctt": "ChuyenKhoan"
      }
    }
  ]
}
```

---

### 4.7. Xem chi tiết 1 lần khám bệnh cụ thể
* **Endpoint:** `GET /api/patients/me/medical-history/:id`
* **Quyền:** Cần Token (`Bearer Token`, role `BenhNhan`)
* **Tham số đường dẫn:** `:id` - Mã lần khám bệnh (`malsk`).
* **Lưu ý bảo mật:** Hệ thống kiểm tra quyền sở hữu, chỉ cho phép bệnh nhân xem phiếu khám thuộc về chính mình.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy chi tiết lần khám bệnh thành công",
  "data": {
    "malsk": 101,
    "mabn": 1,
    "ngay": "2026-10-05T09:30:00.000Z",
    "trieuchung": "Sốt nhẹ, ho có đờm, đau họng 2 ngày",
    "chandoan": "Viêm đường hô hấp trên cấp tính",
    "ketluan": "Theo dõi điều trị ngoại trú bằng thuốc",
    "bacsi": {
      "mabs": 5,
      "hocham": "Bác sĩ CKI",
      "nhanvien": {
        "hoten": "BS. Trần Văn Bình",
        "sdt": "0909123456"
      },
      "chuyenkhoa": {
        "tenchuyenkhoa": "Khoa Tai Mũi Họng"
      }
    },
    "donthuoc": {
      "madt": 55,
      "ngayke": "2026-10-05T00:00:00.000Z",
      "ghichubacsi": "Uống sau ăn no, kiêng nước đá",
      "chitietdonthuoc": [
        {
          "mactdt": 12,
          "soluong": 20,
          "lieudung": "Sáng 1 viên, tối 1 viên",
          "thoigiansudung": "5 ngày",
          "thuoc": {
            "tenthuoc": "Amoxicillin 500mg",
            "donvitinh": "Viên"
          }
        }
      ]
    },
    "chitietdichvukham": [
      {
        "mactdvk": 88,
        "soluong": 1,
        "ketqua": "Họng sung huyết nhẹ",
        "dichvu": {
          "tendichvu": "Khám chuyên khoa Tai Mũi Họng",
          "dongia": "150000"
        }
      }
    ],
    "hoadon": {
      "mahd": 77,
      "tongtien": "350000",
      "trangthaithanhtoan": "DaThanhToan",
      "phuongthuctt": "ChuyenKhoan"
    }
  }
}
```

---

### 4.8. Bệnh nhân tự yêu cầu xóa tài khoản cá nhân
* **Endpoint:** `DELETE /api/patients/me`
* **Quyền:** Cần Token (`Bearer Token`, role `BenhNhan`)
* **Lưu ý an toàn (Safe Delete Guard):** 
  * Nếu bệnh nhân **chưa từng khám bệnh hoặc phát sinh hóa đơn**: Hệ thống xóa vĩnh viễn tài khoản và hồ sơ.
  * Nếu bệnh nhân **đã từng khám bệnh hoặc phát sinh hóa đơn**: Server trả về `400 Bad Request` vì hồ sơ y tế không được phép xóa cứng theo luật y khoa.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Tài khoản của bạn đã được xóa thành công khỏi hệ thống!",
  "data": {
    "mabn": 1,
    "hoten": "Nguyễn Văn An"
  }
}
```
* **Response Bị Chặn (400 Bad Request):**
```json
{
  "success": false,
  "message": "Tài khoản của bạn đã phát sinh lịch sử khám chữa bệnh hoặc hóa đơn viện phí tại phòng khám, do đó không thể xóa vĩnh viễn theo quy định y tế! Vui lòng liên hệ quản trị viên hoặc lễ tân để được hỗ trợ khóa tài khoản."
}
```

---

### 4.9. [Admin, Lễ tân, Bác sĩ] Lấy danh sách toàn bộ bệnh nhân
* **Endpoint:** `GET /api/patients`
* **Quyền:** Cần Token (`Bearer Token`, role `Admin`, `LeTan`, hoặc `BacSi`)
* **Query Parameters (Tùy chọn):**
  * `search` (string): Tìm kiếm theo họ tên, SĐT, CCCD, số BHYT.
  * `gender` (string): Lọc theo giới tính (`Nam`, `Nu`, `Khac`).
  * `page` (number): Số trang (mặc định: 1).
  * `limit` (number): Số bản ghi mỗi trang (mặc định: 10, tối đa: 100).
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách bệnh nhân thành công",
  "data": [
    {
      "mabn": 1,
      "matk": 1,
      "hoten": "Nguyễn Văn An",
      "gioitinh": "Nam",
      "ngaysinh": "2000-01-15T00:00:00.000Z",
      "sdt": "0912345678",
      "diachi": "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
      "cccd": "079200001234",
      "sobhyt": "DN4791234567890",
      "ngaydangky": "2026-10-08T00:00:00.000Z",
      "taikhoan": {
        "matk": 1,
        "tendangnhap": "nguyenvanan",
        "trangthai": "HoatDong"
      },
      "hosobenhan": {
        "nhommau": "O",
        "tiensubenh": null,
        "diung": "Dị ứng Penicillin"
      },
      "_count": {
        "lichhen": 2,
        "lichsukham": 5,
        "hoadon": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 4.10. [Bác sĩ & Admin] Tra cứu hồ sơ & tiền sử bệnh án bệnh nhân
* **Endpoint:** `GET /api/patients/:id/medical-record`
* **Quyền:** Cần Token (`Bearer Token`, role `BacSi` hoặc `Admin`)
* **Tham số đường dẫn:** `:id` - Mã bệnh nhân (`mabn`).
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Tra cứu hồ sơ bệnh án bệnh nhân thành công",
  "data": {
    "mabn": 1,
    "hoten": "Nguyễn Văn An",
    "gioitinh": "Nam",
    "ngaysinh": "2000-01-15T00:00:00.000Z",
    "sdt": "0912345678",
    "diachi": "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
    "cccd": "079200001234",
    "sobhyt": "DN4791234567890",
    "hosobenhan": {
      "mahsba": 1,
      "nhommau": "O",
      "tiensubenh": "Không có tiền sử bệnh lý tim mạch hay huyết áp",
      "diung": "Dị ứng phấn hoa, kháng sinh Penicillin",
      "ghichu": "Thể trạng sức khỏe bình thường"
    }
  }
}
```

---

### 4.11. [Bác sĩ & Admin] Cập nhật hồ sơ bệnh án khi khám bệnh
* **Endpoint:** `PUT /api/patients/:id/medical-record`
* **Quyền:** Cần Token (`Bearer Token`, role `BacSi` hoặc `Admin`)
* **Tham số đường dẫn:** `:id` - Mã bệnh nhân (`mabn`).
* **Request Body:**
```json
{
  "nhommau": "AB",
  "tiensubenh": "Phát hiện tiền sử đau nửa đầu Migraine",
  "diung": "Dị ứng Paracetamol",
  "ghichu": "Cần lưu ý khi chỉ định thuốc giảm đau"
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật hồ sơ bệnh án bệnh nhân thành công",
  "data": {
    "mahsba": 1,
    "nhommau": "AB",
    "tiensubenh": "Phát hiện tiền sử đau nửa đầu Migraine",
    "diung": "Dị ứng Paracetamol",
    "ghichu": "Cần lưu ý khi chỉ định thuốc giảm đau",
    "benhnhan": {
      "hoten": "Nguyễn Văn An",
      "sdt": "0912345678"
    }
  }
}
```

---

### 4.12. [Admin] Xóa bệnh nhân theo ID (Safe Delete Guard)
* **Endpoint:** `DELETE /api/patients/:id`
* **Quyền:** Cần Token (`Bearer Token`, role `Admin`)
* **Tham số đường dẫn:** `:id` - Mã bệnh nhân (`mabn`).
* **Lưu ý an toàn (Safe Delete Guard):** 
  * Nếu bệnh nhân **đã từng khám bệnh hoặc phát sinh hóa đơn**: Server trả về `400 Bad Request` để bảo vệ chứng từ y tế. Admin nên chuyển trạng thái tài khoản sang `KhoaTaiKhoan` thay vì xóa.
  * Nếu bệnh nhân **chưa từng có lịch sử khám/hóa đơn**: Xóa sạch trong một Transaction (`hosobenhan`, `lichhen`, `benhnhan`, `taikhoan`).
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Đã xóa thành công bệnh nhân \"Nguyễn Văn An\" và tài khoản liên kết!",
  "data": {
    "mabn": 1,
    "hoten": "Nguyễn Văn An"
  }
}
```
* **Response Bị Chặn (400 Bad Request):**
```json
{
  "success": false,
  "message": "Không thể xóa bệnh nhân \"Nguyễn Văn An\" (ID: 1) vì đã có 5 lần khám bệnh và 5 hóa đơn viện phí liên kết. Theo quy định pháp luật y tế, hồ sơ y khoa thật không được phép xóa cứng! Hãy chuyển trạng thái tài khoản sang \"KhoaTaiKhoan\" nếu muốn ngưng hoạt động."
}
```

---

## 🩺 5. PHÂN HỆ MASTER DATA CHUYÊN KHOA (`/api/specialties`)

Phân hệ phục vụ hiển thị danh mục chuyên khoa khám bệnh trên Website, Landing Page, hỗ trợ tìm kiếm, lọc, dropdown đặt lịch và chức năng quản lý danh mục dành cho Admin.

### 5.1. Lấy danh sách chuyên khoa
* **Endpoint:** `GET /api/specialties`
* **Quyền:** Public (Không yêu cầu đăng nhập)
* **Query Parameters (Tùy chọn):**
  * `search` (string): Tìm kiếm theo tên chuyên khoa (không phân biệt hoa thường). Ví dụ: `?search=Tai`
  * `includeCounts` (boolean): `true` để lấy thêm số lượng bác sĩ, phòng khám, dịch vụ trực thuộc. Ví dụ: `?includeCounts=true`
  * `page` (number), `limit` (number): Phân trang danh sách nếu cần. Ví dụ: `?page=1&limit=10`
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách chuyên khoa thành công!",
  "data": [
    {
      "mack": 1,
      "tenchuyenkhoa": "Khoa Nội Tổng Quát",
      "mota": "Chuyên chẩn đoán và điều trị các bệnh nội khoa không phẫu thuật",
      "_count": {
        "bacsi": 3,
        "phongkham": 2,
        "dichvu": 5
      }
    },
    {
      "mack": 2,
      "tenchuyenkhoa": "Khoa Tai Mũi Họng",
      "mota": "Khám và điều trị các bệnh lý tai mũi họng người lớn và trẻ em",
      "_count": {
        "bacsi": 2,
        "phongkham": 1,
        "dichvu": 4
      }
    }
  ]
}
```

---

### 5.2. Lấy chi tiết chuyên khoa theo ID
* **Endpoint:** `GET /api/specialties/:id`
* **Quyền:** Public
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin chi tiết chuyên khoa thành công!",
  "data": {
    "mack": 2,
    "tenchuyenkhoa": "Khoa Tai Mũi Họng",
    "mota": "Khám và điều trị các bệnh lý tai mũi họng người lớn và trẻ em",
    "bacsi": [
      {
        "mabs": 5,
        "hocham": "Bác sĩ CKI",
        "kinhnghiem": 8,
        "sogiayphephanhnghe": "CCHN-001254",
        "nhanvien": {
          "hoten": "BS. Trần Văn Bình",
          "sdt": "0909123456",
          "gioitinh": "Nam"
        }
      }
    ],
    "phongkham": [
      {
        "maphong": 102,
        "tenphong": "Phòng Khám TMH 1",
        "trangthai": "SanSang"
      }
    ],
    "dichvu": [
      {
        "madv": 15,
        "tendichvu": "Nội soi tai mũi họng",
        "dongia": "200000"
      }
    ],
    "_count": {
      "bacsi": 1,
      "phongkham": 1,
      "dichvu": 1
    }
  }
}
```

---

### 5.3. Thêm mới chuyên khoa
* **Endpoint:** `POST /api/specialties`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "tenchuyenkhoa": "Khoa Mắt",
  "mota": "Khám và phẫu thuật, điều trị các bệnh lý về mắt"
}
```
* **Response Thành công (201 Created):**
```json
{
  "success": true,
  "message": "Thêm mới chuyên khoa thành công!",
  "data": {
    "mack": 3,
    "tenchuyenkhoa": "Khoa Mắt",
    "mota": "Khám và phẫu thuật, điều trị các bệnh lý về mắt"
  }
}
```

---

### 5.4. Cập nhật chuyên khoa
* **Endpoint:** `PUT /api/specialties/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "tenchuyenkhoa": "Khoa Mắt Kỹ Thuật Cao",
  "mota": "Cập nhật mô tả chuyên khoa"
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật thông tin chuyên khoa thành công!",
  "data": {
    "mack": 3,
    "tenchuyenkhoa": "Khoa Mắt Kỹ Thuật Cao",
    "mota": "Cập nhật mô tả chuyên khoa"
  }
}
```

---

### 5.5. Xóa chuyên khoa
* **Endpoint:** `DELETE /api/specialties/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Lưu ý an toàn:** Nếu chuyên khoa đang có Bác sĩ, Phòng khám hoặc Dịch vụ liên kết, server sẽ trả về lỗi `400 Bad Request` để bảo vệ dữ liệu.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Xóa chuyên khoa \"Khoa Mắt Kỹ Thuật Cao\" thành công!",
  "data": {
    "mack": 3,
    "tenchuyenkhoa": "Khoa Mắt Kỹ Thuật Cao"
  }
}
```

---

## 👨‍⚕️ 6. PHÂN HỆ MASTER DATA BÁC SĨ (`/api/doctors`)

Phân hệ phục vụ hiển thị danh sách bác sĩ, lọc bác sĩ theo chuyên khoa khi đặt lịch hẹn khám bệnh, xem hồ sơ chi tiết bác sĩ và chức năng quản lý nhân sự Bác sĩ cho Admin.

### 6.1. Lấy danh sách bác sĩ
* **Endpoint:** `GET /api/doctors`
* **Quyền:** Public (Không yêu cầu đăng nhập)
* **Query Parameters (Tùy chọn):**
  * `specialtyId` (number): Lọc danh sách bác sĩ theo mã chuyên khoa `mack`. Ví dụ: `?specialtyId=2` (lọc bác sĩ thuộc Khoa Tai Mũi Họng)
  * `search` (string): Tìm kiếm theo họ tên bác sĩ, học hàm hoặc số giấy phép hành nghề. Ví dụ: `?search=Bình`
  * `page` (number), `limit` (number): Phân trang danh sách nếu cần. Ví dụ: `?page=1&limit=10`
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách bác sĩ thành công!",
  "data": [
    {
      "mabs": 5,
      "mack": 2,
      "sogiayphephanhnghe": "CCHN-001254",
      "hocham": "Bác sĩ CKI",
      "kinhnghiem": 8,
      "nhanvien": {
        "manv": 5,
        "hoten": "BS. Trần Văn Bình",
        "gioitinh": "Nam",
        "ngaysinh": "1988-03-15T00:00:00.000Z",
        "sdt": "0909123456",
        "diachi": "123 Cách Mạng Tháng 8, Quận 3, TP.HCM",
        "chucvu": "BacSi",
        "ngayvaolam": "2020-01-10T00:00:00.000Z"
      },
      "chuyenkhoa": {
        "mack": 2,
        "tenchuyenkhoa": "Khoa Tai Mũi Họng"
      },
      "_count": {
        "lichhen": 12,
        "lichsukham": 45
      }
    }
  ]
}
```

---

### 6.2. Lấy chi tiết thông tin một bác sĩ
* **Endpoint:** `GET /api/doctors/:id`
* **Quyền:** Public
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin chi tiết bác sĩ thành công!",
  "data": {
    "mabs": 5,
    "mack": 2,
    "sogiayphephanhnghe": "CCHN-001254",
    "hocham": "Bác sĩ CKI",
    "kinhnghiem": 8,
    "nhanvien": {
      "manv": 5,
      "hoten": "BS. Trần Văn Bình",
      "gioitinh": "Nam",
      "ngaysinh": "1988-03-15T00:00:00.000Z",
      "sdt": "0909123456",
      "diachi": "123 Cách Mạng Tháng 8, Quận 3, TP.HCM",
      "chucvu": "BacSi",
      "ngayvaolam": "2020-01-10T00:00:00.000Z",
      "taikhoan": {
        "matk": 8,
        "tendangnhap": "bs_tranvanbinh",
        "vaitro": "BacSi",
        "trangthai": "HoatDong"
      }
    },
    "chuyenkhoa": {
      "mack": 2,
      "tenchuyenkhoa": "Khoa Tai Mũi Họng",
      "mota": "Khám và điều trị các bệnh lý tai mũi họng"
    },
    "_count": {
      "lichhen": 12,
      "lichsukham": 45
    }
  }
}
```

---

### 6.3. Lấy lịch làm việc / ca trực của bác sĩ
* **Endpoint:** `GET /api/doctors/:id/schedule`
* **Quyền:** Public (Phục vụ bệnh nhân chọn giờ khi đặt lịch khám)
* **Query Parameters (Tùy chọn):**
  * `fromDate` (YYYY-MM-DD): Lọc từ ngày
  * `toDate` (YYYY-MM-DD): Lọc đến ngày
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy lịch làm việc của bác sĩ thành công!",
  "data": {
    "bacsi": {
      "mabs": 5,
      "hoten": "BS. Trần Văn Bình",
      "chuyenkhoa": "Khoa Tai Mũi Họng"
    },
    "shifts": [
      {
        "mapclv": 10,
        "vaitrotrongca": "Bác sĩ chính",
        "calamviec": {
          "maca": 1,
          "ngay": "2026-10-12T00:00:00.000Z",
          "giobatdau": "1970-01-01T07:30:00.000Z",
          "gioketthuc": "1970-01-01T11:30:00.000Z",
          "phongkham": {
            "maphong": 102,
            "tenphong": "Phòng Khám TMH 1",
            "trangthai": "SanSang"
          }
        }
      }
    ]
  }
}
```

---

### 6.4. Thêm mới bác sĩ
* **Endpoint:** `POST /api/doctors`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "mack": 2,
  "sogiayphephanhnghe": "CCHN-889977",
  "hocham": "Thạc sĩ, Bác sĩ CKI",
  "kinhnghiem": 10,
  "hoten": "Nguyễn Hoàng Nam",
  "gioitinh": "Nam",
  "ngaysinh": "1985-06-20",
  "sdt": "0912349988",
  "diachi": "123 Hai Bà Trưng, Quận 1, TP.HCM",
  "ngayvaolam": "2026-10-10",
  "username": "bs_hoangnam",
  "password": "Password123@"
}
```
* **Response Thành công (201 Created):**
```json
{
  "success": true,
  "message": "Thêm mới bác sĩ thành công!",
  "data": {
    "mabs": 6,
    "mack": 2,
    "sogiayphephanhnghe": "CCHN-889977",
    "hocham": "Thạc sĩ, Bác sĩ CKI",
    "kinhnghiem": 10,
    "nhanvien": {
      "manv": 6,
      "hoten": "Nguyễn Hoàng Nam",
      "gioitinh": "Nam",
      "ngaysinh": "1985-06-20T00:00:00.000Z",
      "sdt": "0912349988",
      "diachi": "123 Hai Bà Trưng, Quận 1, TP.HCM",
      "chucvu": "BacSi",
      "ngayvaolam": "2026-10-10T00:00:00.000Z"
    },
    "chuyenkhoa": {
      "mack": 2,
      "tenchuyenkhoa": "Khoa Tai Mũi Họng"
    }
  }
}
```

---

### 6.5. Cập nhật thông tin bác sĩ
* **Endpoint:** `PUT /api/doctors/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "hocham": "Bác sĩ CKII",
  "kinhnghiem": 12,
  "diachi": "456 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM"
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật thông tin bác sĩ thành công!",
  "data": { ... }
}
```

---

### 6.6. Xóa bác sĩ
* **Endpoint:** `DELETE /api/doctors/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Lưu ý an toàn:** Nếu bác sĩ đã có Lịch hẹn, Lịch sử khám bệnh hoặc Ca trực được phân công, server sẽ từ chối xóa và trả về `400 Bad Request` để bảo vệ hồ sơ bệnh án.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Xóa bác sĩ \"Nguyễn Hoàng Nam\" thành công!",
  "data": {
    "mabs": 6,
    "hoten": "Nguyễn Hoàng Nam"
  }
}
```

---

## 🚪 7. PHÂN HỆ MASTER DATA PHÒNG KHÁM (`/api/rooms`)

Phân hệ phục vụ hiển thị danh sách phòng khám, sơ đồ phòng, lọc phòng theo chuyên khoa và trạng thái (`SanSang`, `DangSuDung`, `BaoTri`), hỗ trợ lễ tân xếp ca và quản trị viên quản lý cơ sở vật chất.

### 7.1. Lấy danh sách phòng khám
* **Endpoint:** `GET /api/rooms`
* **Quyền:** Public (Không yêu cầu đăng nhập)
* **Query Parameters (Tùy chọn):**
  * `specialtyId` (number): Lọc phòng khám theo mã chuyên khoa `mack`. Ví dụ: `?specialtyId=1`
  * `status` (string): Lọc theo trạng thái phòng (`SanSang` | `DangSuDung` | `BaoTri`). Ví dụ: `?status=SanSang`
  * `search` (string): Tìm kiếm theo tên phòng. Ví dụ: `?search=Nội`
  * `page` (number), `limit` (number): Phân trang danh sách nếu cần. Ví dụ: `?page=1&limit=10`
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách phòng khám thành công!",
  "data": [
    {
      "maphong": 101,
      "tenphong": "Phòng Khám Nội Tổng Quát 1",
      "mack": 1,
      "trangthai": "SanSang",
      "chuyenkhoa": {
        "mack": 1,
        "tenchuyenkhoa": "Khoa Nội Tổng Quát"
      },
      "_count": {
        "calamviec": 4
      }
    },
    {
      "maphong": 102,
      "tenphong": "Phòng Khám TMH 1",
      "mack": 2,
      "trangthai": "DangSuDung",
      "chuyenkhoa": {
        "mack": 2,
        "tenchuyenkhoa": "Khoa Tai Mũi Họng"
      },
      "_count": {
        "calamviec": 2
      }
    }
  ]
}
```

---

### 7.2. Lấy chi tiết thông tin một phòng khám
* **Endpoint:** `GET /api/rooms/:id`
* **Quyền:** Public
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin chi tiết phòng khám thành công!",
  "data": {
    "maphong": 101,
    "tenphong": "Phòng Khám Nội Tổng Quát 1",
    "mack": 1,
    "trangthai": "SanSang",
    "chuyenkhoa": {
      "mack": 1,
      "tenchuyenkhoa": "Khoa Nội Tổng Quát",
      "mota": "Khám và điều trị nội khoa"
    },
    "calamviec": [
      {
        "maca": 1,
        "ngay": "2026-10-12T00:00:00.000Z",
        "giobatdau": "1970-01-01T07:30:00.000Z",
        "gioketthuc": "1970-01-01T11:30:00.000Z"
      }
    ],
    "_count": {
      "calamviec": 1
    }
  }
}
```

---

### 7.3. Thêm mới phòng khám
* **Endpoint:** `POST /api/rooms`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "tenphong": "Phòng Khám Nhi 202",
  "mack": 3,
  "trangthai": "SanSang"
}
```
* **Response Thành công (201 Created):**
```json
{
  "success": true,
  "message": "Thêm mới phòng khám thành công!",
  "data": {
    "maphong": 105,
    "tenphong": "Phòng Khám Nhi 202",
    "mack": 3,
    "trangthai": "SanSang",
    "chuyenkhoa": {
      "mack": 3,
      "tenchuyenkhoa": "Khoa Nhi"
    }
  }
}
```

---

### 7.4. Cập nhật thông tin phòng khám
* **Endpoint:** `PUT /api/rooms/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "tenphong": "Phòng Khám Nhi VIP 202",
  "trangthai": "BaoTri"
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật thông tin phòng khám thành công!",
  "data": {
    "maphong": 105,
    "tenphong": "Phòng Khám Nhi VIP 202",
    "mack": 3,
    "trangthai": "BaoTri",
    "chuyenkhoa": {
      "mack": 3,
      "tenchuyenkhoa": "Khoa Nhi"
    }
  }
}
```

---

### 7.5. Xóa phòng khám
* **Endpoint:** `DELETE /api/rooms/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Lưu ý an toàn:** Nếu phòng khám đã có ca làm việc (`calamviec`) được phân công, server sẽ từ chối xóa và trả về `400 Bad Request` để bảo vệ dữ liệu ca trực của nhân viên.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Xóa phòng khám \"Phòng Khám Nhi VIP 202\" thành công!",
  "data": {
    "maphong": 105,
    "tenphong": "Phòng Khám Nhi VIP 202"
  }
}
```

---

## 💉 8. PHÂN HỆ MASTER DATA DỊCH VỤ (`/api/services`)

Phân hệ phục vụ hiển thị bảng giá dịch vụ khám bệnh, danh mục cận lâm sàng, lọc dịch vụ theo chuyên khoa hoặc khoảng giá, phục vụ bác sĩ chỉ định và thu ngân tính tiền viện phí.

### 8.1. Lấy danh sách dịch vụ
* **Endpoint:** `GET /api/services`
* **Quyền:** Public (Không yêu cầu đăng nhập)
* **Query Parameters (Tùy chọn):**
  * `specialtyId` (number): Lọc dịch vụ theo mã chuyên khoa `mack`. Ví dụ: `?specialtyId=1`
  * `minPrice`, `maxPrice` (number): Lọc dịch vụ theo khoảng giá. Ví dụ: `?minPrice=100000&maxPrice=500000`
  * `search` (string): Tìm kiếm theo tên dịch vụ. Ví dụ: `?search=Nội soi`
  * `page` (number), `limit` (number): Phân trang danh sách nếu cần. Ví dụ: `?page=1&limit=10`
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách dịch vụ thành công!",
  "data": [
    {
      "madv": 1,
      "tendichvu": "Khám chuyên khoa Nội",
      "dongia": "150000",
      "mack": 1,
      "chuyenkhoa": {
        "mack": 1,
        "tenchuyenkhoa": "Khoa Nội Tổng Quát"
      },
      "_count": {
        "chitietdichvukham": 25,
        "chitiethoadon": 25
      }
    },
    {
      "madv": 2,
      "tendichvu": "Nội soi tai mũi họng",
      "dongia": "200000",
      "mack": 2,
      "chuyenkhoa": {
        "mack": 2,
        "tenchuyenkhoa": "Khoa Tai Mũi Họng"
      },
      "_count": {
        "chitietdichvukham": 18,
        "chitiethoadon": 18
      }
    }
  ]
}
```

---

### 8.2. Lấy chi tiết thông tin một dịch vụ
* **Endpoint:** `GET /api/services/:id`
* **Quyền:** Public
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin chi tiết dịch vụ thành công!",
  "data": {
    "madv": 2,
    "tendichvu": "Nội soi tai mũi họng",
    "dongia": "200000",
    "mack": 2,
    "chuyenkhoa": {
      "mack": 2,
      "tenchuyenkhoa": "Khoa Tai Mũi Họng",
      "mota": "Khám và điều trị các bệnh lý tai mũi họng"
    },
    "_count": {
      "chitietdichvukham": 18,
      "chitiethoadon": 18
    }
  }
}
```

---

### 8.3. Thêm mới dịch vụ
* **Endpoint:** `POST /api/services`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "tendichvu": "Chụp X-Quang tim phổi thẳng",
  "dongia": 120000,
  "mack": 1
}
```
* **Response Thành công (201 Created):**
```json
{
  "success": true,
  "message": "Thêm mới dịch vụ thành công!",
  "data": {
    "madv": 3,
    "tendichvu": "Chụp X-Quang tim phổi thẳng",
    "dongia": "120000",
    "mack": 1,
    "chuyenkhoa": {
      "mack": 1,
      "tenchuyenkhoa": "Khoa Nội Tổng Quát"
    }
  }
}
```

---

### 8.4. Cập nhật thông tin dịch vụ
* **Endpoint:** `PUT /api/services/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "tendichvu": "Chụp X-Quang kỹ thuật số",
  "dongia": 150000
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật thông tin dịch vụ thành công!",
  "data": {
    "madv": 3,
    "tendichvu": "Chụp X-Quang kỹ thuật số",
    "dongia": "150000",
    "mack": 1,
    "chuyenkhoa": {
      "mack": 1,
      "tenchuyenkhoa": "Khoa Nội Tổng Quát"
    }
  }
}
```

---

### 8.5. Xóa dịch vụ
* **Endpoint:** `DELETE /api/services/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Lưu ý an toàn:** Nếu dịch vụ đã phát sinh chỉ định khám (`chitietdichvukham`) hoặc khoản thu hóa đơn (`chitiethoadon`), server sẽ từ chối xóa và trả về `400 Bad Request` để bảo vệ chứng từ viện phí.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Xóa dịch vụ \"Chụp X-Quang kỹ thuật số\" thành công!",
  "data": {
    "madv": 3,
    "tendichvu": "Chụp X-Quang kỹ thuật số"
  }
}
```

---

## 📅 9. PHÂN HỆ QUẢN LÝ CA LÀM VIỆC & PHÂN CÔNG TRỰC (`/api/shifts`)

### 9.1. Lấy danh sách ca làm việc (kèm phân công & bộ lọc)
* **Endpoint:** `GET /api/shifts`
* **Quyền:** Cần Token (`Bearer Token` mọi vai trò)
* **Query Parameters (Tùy chọn):**
  * `date`: Lọc theo ngày cụ thể (`YYYY-MM-DD`, ví dụ: `2026-10-20`).
  * `fromDate`: Từ ngày (`YYYY-MM-DD`).
  * `toDate`: Đến ngày (`YYYY-MM-DD`).
  * `roomId`: Lọc theo phòng khám (`maphong`).
  * `staffId`: Lọc theo nhân viên trực (`manv`).
  * `specialtyId`: Lọc theo chuyên khoa của phòng (`mack`).
  * `page`, `limit`: Phân trang dữ liệu (nếu không truyền sẽ trả về toàn bộ danh sách).
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách ca làm việc thành công!",
  "data": [
    {
      "maca": 1,
      "ngay": "2026-10-20",
      "giobatdau": "07:30",
      "gioketthuc": "11:30",
      "maphong": 1,
      "phongkham": {
        "maphong": 1,
        "tenphong": "Phòng Khám Nội 101",
        "trangthai": "SanSang",
        "chuyenkhoa": {
          "mack": 1,
          "tenchuyenkhoa": "Khoa Nội Tổng Quát"
        }
      },
      "phanconglamviec": [
        {
          "mapclv": 10,
          "manv": 1,
          "vaitrotrongca": "Bác sĩ khám chính",
          "nhanvien": {
            "manv": 1,
            "hoten": "BS. Nguyễn Văn A",
            "chucvu": "BacSi",
            "sdt": "0912345678",
            "bacsi": {
              "mabs": 1,
              "hocham": "Thạc sĩ Bác sĩ",
              "chuyenkhoa": {
                "mack": 1,
                "tenchuyenkhoa": "Khoa Nội Tổng Quát"
              }
            }
          }
        }
      ],
      "_count": {
        "phanconglamviec": 1
      }
    }
  ]
}
```

---

### 9.2. Xem chi tiết ca làm việc
* **Endpoint:** `GET /api/shifts/:id`
* **Quyền:** Cần Token (`Bearer Token`)
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin chi tiết ca làm việc thành công!",
  "data": {
    "maca": 1,
    "ngay": "2026-10-20",
    "giobatdau": "07:30",
    "gioketthuc": "11:30",
    "maphong": 1,
    "phongkham": {
      "maphong": 1,
      "tenphong": "Phòng Khám Nội 101",
      "trangthai": "SanSang",
      "chuyenkhoa": {
        "mack": 1,
        "tenchuyenkhoa": "Khoa Nội Tổng Quát"
      }
    },
    "phanconglamviec": [
      {
        "mapclv": 10,
        "manv": 1,
        "vaitrotrongca": "Bác sĩ khám chính",
        "nhanvien": {
          "manv": 1,
          "hoten": "BS. Nguyễn Văn A",
          "chucvu": "BacSi",
          "sdt": "0912345678",
          "bacsi": {
            "mabs": 1,
            "hocham": "Thạc sĩ Bác sĩ"
          }
        }
      }
    ]
  }
}
```

---

### 9.3. Tạo mới ca làm việc (Hỗ trợ phân công đồng thời)
* **Endpoint:** `POST /api/shifts`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Tính năng thông minh:** Tự động phát hiện và chặn nếu phòng khám hoặc nhân viên bị trùng giờ ca khác trong cùng ngày (trả về `409 Conflict`).
* **Request Body:**
```json
{
  "ngay": "2026-10-20",
  "giobatdau": "07:30",
  "gioketthuc": "11:30",
  "maphong": 1,
  "assignments": [
    {
      "manv": 1,
      "vaitrotrongca": "Bác sĩ khám chính"
    },
    {
      "manv": 2,
      "vaitrotrongca": "Y tá hỗ trợ"
    }
  ]
}
```
* **Response Thành công (201 Created):**
```json
{
  "success": true,
  "message": "Tạo mới ca làm việc thành công!",
  "data": {
    "maca": 5,
    "ngay": "2026-10-20",
    "giobatdau": "07:30",
    "gioketthuc": "11:30",
    "maphong": 1,
    "phongkham": {
      "maphong": 1,
      "tenphong": "Phòng Khám Nội 101"
    },
    "phanconglamviec": [
      {
        "mapclv": 21,
        "manv": 1,
        "vaitrotrongca": "Bác sĩ khám chính"
      }
    ]
  }
}
```

---

### 9.4. Cập nhật ca làm việc
* **Endpoint:** `PUT /api/shifts/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "ngay": "2026-10-20",
  "giobatdau": "08:00",
  "gioketthuc": "12:00",
  "maphong": 2
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật ca làm việc thành công!",
  "data": {
    "maca": 5,
    "ngay": "2026-10-20",
    "giobatdau": "08:00",
    "gioketthuc": "12:00",
    "maphong": 2
  }
}
```

---

### 9.5. Xóa ca làm việc
* **Endpoint:** `DELETE /api/shifts/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Xóa ca làm việc ngày 2026-10-20 (08:00 - 12:00) tại phòng Phòng Khám 102 thành công!",
  "data": {
    "maca": 5,
    "ngay": "2026-10-20",
    "giobatdau": "08:00",
    "gioketthuc": "12:00",
    "tenphong": "Phòng Khám 102",
    "deletedAssignmentsCount": 2
  }
}
```

---

### 9.6. Phân công nhân viên vào ca
* **Endpoint:** `POST /api/shifts/:id/assign`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "manv": 3,
  "vaitrotrongca": "Y tá hỗ trợ"
}
```
* **Response Thành công (201 Created):**
```json
{
  "success": true,
  "message": "Phân công nhân viên \"Nguyễn Thị B\" vào ca thành công!",
  "data": {
    "mapclv": 25,
    "maca": 5,
    "manv": 3,
    "vaitrotrongca": "Y tá hỗ trợ",
    "nhanvien": {
      "manv": 3,
      "hoten": "Nguyễn Thị B",
      "chucvu": "YTa"
    }
  }
}
```

---

### 9.7. Hủy phân công nhân viên khỏi ca
* **Endpoint:** `DELETE /api/shifts/:id/assign/:staffId`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Hủy phân công nhân viên \"Nguyễn Thị B\" khỏi ca làm việc thành công!",
  "data": {
    "mapclv": 25,
    "maca": 5,
    "manv": 3,
    "hoten": "Nguyễn Thị B",
    "tenphong": "Phòng Khám Nội 101"
  }
}
```

---

### 9.8. Xem lịch trực cá nhân của nhân viên
* **Endpoint:** `GET /api/shifts/staff/:staffId`
* **Quyền:** Cần Token (`Bearer Token`)
* **Query Parameters (Tùy chọn):** `fromDate`, `toDate` (YYYY-MM-DD)
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy lịch trực của nhân viên \"BS. Nguyễn Văn A\" thành công!",
  "data": {
    "nhanvien": {
      "manv": 1,
      "hoten": "BS. Nguyễn Văn A",
      "chucvu": "BacSi",
      "sdt": "0912345678",
      "bacsi": {
        "mabs": 1,
        "hocham": "Thạc sĩ Bác sĩ",
        "chuyenkhoa": "Khoa Nội Tổng Quát"
      }
    },
    "shifts": [
      {
        "mapclv": 10,
        "vaitrotrongca": "Bác sĩ khám chính",
        "calamviec": {
          "maca": 1,
          "ngay": "2026-10-20",
          "giobatdau": "07:30",
          "gioketthuc": "11:30",
          "phongkham": {
            "maphong": 1,
            "tenphong": "Phòng Khám Nội 101",
            "chuyenkhoa": "Khoa Nội Tổng Quát"
          }
        }
      }
    ]
  }
}
```

---

## 📅 10. PHÂN HỆ ĐẶT LỊCH KHÁM TRỰC TUYẾN & TIẾP ĐÓN (`/api/appointments`)

### 10.1. Đặt lịch khám trực tuyến
* **Endpoint:** `POST /api/appointments`
* **Quyền:** `BenhNhan` (Hoặc `Admin`, `LeTan` đặt hộ bệnh nhân)
* **Quy tắc nghiệp vụ:**
  - Bác sĩ phải có lịch trực làm việc trong ngày được chọn.
  - Khung giờ khám phải nằm trong khoảng thời gian ca trực của bác sĩ.
  - Tránh đặt trùng khung giờ: cùng một bác sĩ không thể nhận 2 lịch hẹn trùng giờ hoặc cách nhau dưới 15 phút.
  - Bệnh nhân không được đặt trùng giờ với một lịch hẹn khác của chính mình.
* **Request Body:**
```json
{
  "mabs": 1,
  "mabn": 1,               // Bắt buộc nếu Admin/LeTan đặt hộ; Bệnh nhân tự đặt không cần gửi trường này
  "ngayhen": "2026-10-25", // Định dạng YYYY-MM-DD (Không được ở quá khứ)
  "giohen": "08:30",       // Định dạng HH:mm
  "lydokham": "Tái khám kiểm tra huyết áp và đau ngực"
}
```
* **Response Thành công (201 Created):**
```json
{
  "status": "success",
  "message": "Đặt lịch khám thành công! Vui lòng chờ lễ tân xác nhận.",
  "data": {
    "malh": 12,
    "mabn": 1,
    "mabs": 1,
    "ngayhen": "2026-10-25T00:00:00.000Z",
    "giohen": "08:30",
    "lydokham": "Tái khám kiểm tra huyết áp và đau ngực",
    "trangthai": "ChoXacNhan",
    "bacsi": {
      "mabs": 1,
      "hoten": "BS. CKI Nguyễn Văn A",
      "chuyenkhoa": { "tenchuyenkhoa": "Khoa Nội Tim Mạch" }
    }
  }
}
```

---

### 10.2. Bệnh nhân xem danh sách lịch hẹn của mình
* **Endpoint:** `GET /api/appointments/my-appointments`
* **Quyền:** `BenhNhan`
* **Response Thành công (200 OK):**
```json
{
  "status": "success",
  "message": "Lấy danh sách lịch hẹn của bạn thành công",
  "total": 2,
  "data": [
    {
      "malh": 12,
      "ngayhen": "2026-10-25",
      "giohen": "08:30",
      "lydokham": "Tái khám kiểm tra huyết áp và đau ngực",
      "trangthai": "ChoXacNhan",
      "bacsi": {
        "mabs": 1,
        "hoten": "BS. CKI Nguyễn Văn A",
        "chuyenkhoa": { "tenchuyenkhoa": "Khoa Nội Tim Mạch" }
      }
    }
  ]
}
```

---

### 10.3. Tra cứu danh sách lịch hẹn phòng khám
* **Endpoint:** `GET /api/appointments`
* **Quyền:** `Admin`, `LeTan`, `BacSi`
* **Query Parameters:**
  - `ngay`: Lọc theo ngày hẹn (VD: `2026-10-25`)
  - `mabs`: Lọc theo bác sĩ (VD: `1`)
  - `mabn`: Lọc theo bệnh nhân (VD: `1`)
  - `trangthai`: Lọc theo trạng thái (`ChoXacNhan` | `DaXacNhan` | `DaTiepDon` | `DaKham` | `DaHuy`)
* **Response Thành công (200 OK):**
```json
{
  "status": "success",
  "message": "Lấy danh sách lịch hẹn thành công",
  "total": 1,
  "data": [
    {
      "malh": 12,
      "ngayhen": "2026-10-25",
      "giohen": "08:30",
      "lydokham": "Tái khám",
      "trangthai": "ChoXacNhan",
      "benhnhan": {
        "mabn": 1,
        "hoten": "Trần Thị B",
        "sdt": "0988776655"
      },
      "bacsi": {
        "mabs": 1,
        "hoten": "BS. CKI Nguyễn Văn A"
      }
    }
  ]
}
```

---

### 10.4. Cập nhật trạng thái lịch hẹn (Tiếp đón, Duyệt, Hủy)
* **Endpoint:** `PATCH /api/appointments/:id/status`
* **Quyền:** `Admin`, `LeTan`
* **Quy trình chuyển đổi trạng thái (`trangthai`):**
  - `ChoXacNhan` -> `DaXacNhan`: Lễ tân gọi điện xác nhận người bệnh đến khám.
  - `DaXacNhan` -> `DaTiepDon`: Bệnh nhân có mặt tại phòng khám để làm thủ tục vào khám.
  - `DaTiepDon` -> `DaKham`: Bác sĩ hoàn thành phiên khám.
  - Bất kỳ trạng thái nào trước khám -> `DaHuy`: Hủy lịch khám (kèm lý do).
* **Request Body:**
```json
{
  "trangthai": "DaTiepDon", // "ChoXacNhan" | "DaXacNhan" | "DaTiepDon" | "DaKham" | "DaHuy"
  "lydohuy": ""             // Bắt buộc nếu trangthai = "DaHuy"
}
```

---

### 10.5. Đổi lịch hẹn (Reschedule)
* **Endpoint:** `PATCH /api/appointments/:id/reschedule`
* **Quyền:** `Admin`, `LeTan`, `BenhNhan` (Bệnh nhân chỉ đổi được lịch của mình khi còn ở trạng thái `ChoXacNhan` hoặc `DaXacNhan`)
* **Request Body:**
```json
{
  "ngayhen": "2026-10-26",
  "giohen": "09:00",
  "mabs": 1 // Tùy chọn nếu muốn đổi sang bác sĩ khác
}
```

---

### 10.6. Hủy lịch hẹn
* **Endpoint:** `DELETE /api/appointments/:id/cancel`
* **Quyền:** `Admin`, `LeTan`, `BenhNhan`
* **Request Body:**
```json
{
  "lydohuy": "Bận việc đột xuất không thể đến khám đúng hẹn"
}
```

---

## 🧾 11. PHÂN HỆ HÓA ĐƠN VIỆN PHÍ & THANH TOÁN (`/api/invoices`)

### 11.1. Khởi tạo hóa đơn viện phí từ phiên khám bệnh
* **Endpoint:** `POST /api/invoices`
* **Quyền:** `Admin`, `LeTan`
* **Cơ chế tính toán tự động qua Database Trigger:**
  - Hệ thống tự động quét chi tiết các dịch vụ kỹ thuật đã chỉ định (`ChiTietDichVu`) và đơn thuốc (`ChiTietDonThuoc`) từ phiên khám `malsk`.
  - Tự động tạo các bản ghi chi tiết viện phí tương ứng trong bảng `ChiTietHoaDon`.
  - **Trigger PostgreSQL `trg_cthd_update_tongtien`** sẽ tự động tính tổng tiền `tongtien` của hóa đơn ngay tại Database.
* **Request Body:**
```json
{
  "malsk": 101,                         // Mã lịch sử khám bệnh
  "phuongthucthanhtoan": "TienMat",     // "TienMat" | "ChuyenKhoan" | "TheNganHang" | "ViDienTu"
  "ghichu": "Hóa đơn khám bệnh và thuốc"
}
```
* **Response Thành công (201 Created):**
```json
{
  "status": "success",
  "message": "Khởi tạo hóa đơn viện phí thành công",
  "data": {
    "mahd": 55,
    "malsk": 101,
    "ngaylap": "2026-10-25T09:30:00.000Z",
    "tongtien": 650000,
    "trangthaithanhtoan": "ChuaThanhToan",
    "phuongthucthanhtoan": "TienMat",
    "chitiethoadon": [
      {
        "macthd": 1,
        "noidung": "Dịch vụ: Khám Nội tổng quát",
        "soluong": 1,
        "dongia": 150000,
        "thanhtien": 150000,
        "loaichiphi": "DichVu"
      },
      {
        "macthd": 2,
        "noidung": "Thuốc: Paracetamol 500mg (Viên)",
        "soluong": 20,
        "dongia": 25000,
        "thanhtien": 500000,
        "loaichiphi": "Thuoc"
      }
    ]
  }
}
```

---

### 11.2. Thêm khoản mục viện phí bổ sung vào hóa đơn
* **Endpoint:** `POST /api/invoices/:id/items`
* **Quyền:** `Admin`, `LeTan`
* **Lưu ý:** Chỉ thêm được khi hóa đơn ở trạng thái `ChuaThanhToan`. Trigger DB sẽ tự động cộng dồn `tongtien`.
* **Request Body:**
```json
{
  "noidung": "Phí vật tư tiêu hao / Băng gạc vô trùng",
  "soluong": 2,
  "dongia": 25000,
  "loaichiphi": "Khac" // "DichVu" | "Thuoc" | "KhamBenh" | "Khac"
}
```

---

### 11.3. Xóa khoản mục viện phí khỏi hóa đơn
* **Endpoint:** `DELETE /api/invoices/:id/items/:itemId`
* **Quyền:** `Admin`, `LeTan`
* **Lưu ý:** Chỉ xóa được khi chưa thanh toán. Trigger DB sẽ tự động trừ `tongtien`.

---

### 11.4. Thu ngân xác nhận thanh toán hóa đơn
* **Endpoint:** `PATCH /api/invoices/:id/pay`
* **Quyền:** `Admin`, `LeTan`
* **Request Body:**
```json
{
  "phuongthucthanhtoan": "ChuyenKhoan", // "TienMat" | "ChuyenKhoan" | "TheNganHang" | "ViDienTu"
  "ghichu": "Đã nhận thanh toán qua QR Code VietQR"
}
```

---

### 11.5. Hủy hóa đơn viện phí
* **Endpoint:** `PATCH /api/invoices/:id/cancel`
* **Quyền:** `Admin`
* **Request Body:**
```json
{
  "lydohuy": "Bác sĩ chỉ định hủy khám hoàn lại tiền"
}
```

---

### 11.6. Danh sách hóa đơn viện phí
* **Endpoint:** `GET /api/invoices`
* **Quyền:** `Admin`, `LeTan`
* **Query Parameters:**
  - `page`: Trang hiện tại (Mặc định: 1)
  - `limit`: Số bản ghi mỗi trang (Mặc định: 20)
  - `trangthaithanhtoan`: `ChuaThanhToan` | `DaThanhToan` | `DaHuy`
  - `startDate`: Ngày bắt đầu lọc theo ngày lập (`YYYY-MM-DD`)
  - `endDate`: Ngày kết thúc lọc (`YYYY-MM-DD`)
  - `mabn`: Lọc theo mã bệnh nhân

---

### 11.7. Bệnh nhân xem lịch sử hóa đơn của mình
* **Endpoint:** `GET /api/invoices/my-invoices`
* **Quyền:** `BenhNhan`
* **Response Thành công (200 OK):** Trả về danh sách tất cả các hóa đơn viện phí của tài khoản đang đăng nhập.

---

### 11.8. Xem chi tiết hóa đơn viện phí
* **Endpoint:** `GET /api/invoices/:id`
* **Quyền:** `Admin`, `LeTan`, hoặc chính `BenhNhan` sở hữu hóa đơn

---

## 📊 12. PHÂN HỆ BÁO CÁO & THỐNG KÊ DOANH THU ADMIN (`/api/statistics`)

> ⚠️ **Lưu ý phân quyền:** Toàn bộ API trong phân hệ Thống kê yêu cầu Header Token có vai trò `Admin`.

### 12.1. Thống kê tổng quan Dashboard phòng khám
* **Endpoint:** `GET /api/statistics/overview`
* **Quyền:** `Admin`
* **Response Thành công (200 OK):**
```json
{
  "status": "success",
  "message": "Lấy số liệu tổng quan thành công",
  "data": {
    "tongbenhnhan": 1280,
    "tongbacsi": 24,
    "lichhen_homnay": 45,
    "lichhen_choxacnhan": 8,
    "luotkham_homnay": 38,
    "doanhthu_homnay": 18500000,
    "doanhthu_thangnay": 340200000,
    "tongdoanhthu": 1420500000,
    "hoadon_chuathanhtoan": 5
  }
}
```

---

### 12.2. Báo cáo doanh thu theo thời gian & cơ cấu thu viện phí
* **Endpoint:** `GET /api/statistics/revenue`
* **Quyền:** `Admin`
* **Query Parameters:**
  - `startDate`: `YYYY-MM-DD` (Mặc định: 30 ngày trước)
  - `endDate`: `YYYY-MM-DD` (Mặc định: Hôm nay)
  - `groupBy`: `day` (mặc định) hoặc `month`
* **Response Thành công (200 OK):**
```json
{
  "status": "success",
  "message": "Lấy báo cáo doanh thu thành công",
  "data": {
    "tong_doanhthu": 45200000,
    "tong_hoadon": 62,
    "theo_phuongthuc": {
      "TienMat": 20100000,
      "ChuyenKhoan": 22300000,
      "TheNganHang": 2800000,
      "ViDienTu": 0
    },
    "theo_loaichiphi": {
      "KhamBenh": 15000000,
      "DichVu": 18200000,
      "Thuoc": 12000000,
      "Khac": 0
    },
    "dong_thoiluan": [
      {
        "moc_thoigian": "2026-10-20",
        "doanhthu": 12500000,
        "so_hoadon": 15
      },
      {
        "moc_thoigian": "2026-10-21",
        "doanhthu": 15800000,
        "so_hoadon": 22
      }
    ]
  }
}
```

---

### 12.3. Báo cáo số lượt khám bệnh theo chuyên khoa & bác sĩ
* **Endpoint:** `GET /api/statistics/examinations`
* **Quyền:** `Admin`
* **Query Parameters:** `startDate`, `endDate`
* **Response Thành công (200 OK):**
```json
{
  "status": "success",
  "message": "Lấy thống kê lượt khám thành công",
  "data": {
    "tong_luotkham": 120,
    "theo_chuyenkhoa": [
      {
        "machuyenkhoa": 1,
        "tenchuyenkhoa": "Khoa Nội Tim Mạch",
        "so_luotkham": 48
      },
      {
        "machuyenkhoa": 2,
        "tenchuyenkhoa": "Khoa Nhi",
        "so_luotkham": 35
      }
    ],
    "theo_bacsi": [
      {
        "mabs": 1,
        "hoten": "BS. CKI Nguyễn Văn A",
        "so_luotkham": 42
      }
    ],
    "theo_ngay": [
      { "ngay": "2026-10-20", "so_luotkham": 22 }
    ]
  }
}
```

---

### 12.4. Báo cáo Top dịch vụ kỹ thuật được chỉ định nhiều nhất
* **Endpoint:** `GET /api/statistics/top-services`
* **Quyền:** `Admin`
* **Query Parameters:**
  - `startDate`, `endDate`
  - `limit`: Số lượng top cần lấy (Mặc định: 5, tối đa: 50)
* **Response Thành công (200 OK):**
```json
{
  "status": "success",
  "message": "Lấy danh sách top dịch vụ thành công",
  "data": [
    {
      "madv": 1,
      "tendv": "Siêu âm Tim Doppler màu",
      "dongia": 350000,
      "solan_chidinh": 84,
      "tong_soluong": 84,
      "tong_doanhthu": 29400000
    }
  ]
}
```

---

### 12.5. Báo cáo Top thuốc kê đơn nhiều nhất
* **Endpoint:** `GET /api/statistics/top-medicines`
* **Quyền:** `Admin`
* **Query Parameters:**
  - `startDate`, `endDate`
  - `limit`: Mặc định 5
* **Response Thành công (200 OK):**
```json
{
  "status": "success",
  "message": "Lấy danh sách top thuốc kê đơn thành công",
  "data": [
    {
      "mathuoc": 10,
      "tenthuoc": "Amlodipine 5mg",
      "donvitinh": "Viên",
      "dongia": 3500,
      "solan_kethuoc": 45,
      "tong_soluong_xuat": 1350
    }
  ]
}
```

---

## 🩺 13. PHÂN HỆ KHÁM BỆNH & CHỈ ĐỊNH CẬN LÂM SÀNG (`/api/examinations`)

Phân hệ phục vụ Bác sĩ thực hiện khám bệnh, ghi nhận triệu chứng, chẩn đoán, kết luận, chỉ định cận lâm sàng (xét nghiệm, siêu âm, X-quang...), cập nhật kết quả cận lâm sàng và quản lý phiếu khám bệnh.

### 13.1. Tạo phiếu khám bệnh & Chỉ định cận lâm sàng
* **Endpoint:** `POST /api/examinations`
* **Quyền:** `BacSi`, `Admin` (`Bearer Token`)
* **Tính năng:**
  - Nếu là Bác sĩ đăng nhập, hệ thống tự động gán `mabs` từ tài khoản đăng nhập (chống giả mạo bác sĩ khác).
  - Tự động liên kết và chuyển trạng thái lịch hẹn (`lichhen`) thành `DaKham` nếu có gửi `malh`.
  - Thực thi qua Database Transaction đảm bảo tính nguyên tử (Atomic).
* **Request Body:**
```json
{
  "mabn": 1,
  "malh": 5,                                      // Tùy chọn: liên kết lịch hẹn nếu có
  "trieuchung": "Sốt cao 38.5 độ, đau họng, ho có đờm vàng 3 ngày",
  "chandoan": "Theo dõi Viêm phế quản cấp / Viêm amidan mủ",
  "ketluan": "Chỉ định chụp X-quang phổi và xét nghiệm tổng phân tích tế bào máu",
  "services": [                                  // Tùy chọn: chỉ định cận lâm sàng
    {
      "madv": 1,                                 // Mã dịch vụ cận lâm sàng
      "soluong": 1
    },
    {
      "madv": 3,
      "soluong": 1
    }
  ]
}
```
* **Response Thành công (201 Created):**
```json
{
  "success": true,
  "message": "Tạo phiếu khám bệnh và chỉ định cận lâm sàng thành công!",
  "data": {
    "malsk": 12,
    "mabn": 1,
    "mabs": 2,
    "ngay": "2026-10-18T05:00:00.000Z",
    "trieuchung": "Sốt cao 38.5 độ, đau họng, ho có đờm vàng 3 ngày",
    "chandoan": "Theo dõi Viêm phế quản cấp / Viêm amidan mủ",
    "ketluan": "Chỉ định chụp X-quang phổi và xét nghiệm tổng phân tích tế bào máu",
    "benhnhan": {
      "mabn": 1,
      "hoten": "Nguyễn Văn An",
      "gioitinh": "Nam",
      "sdt": "0912345678"
    },
    "bacsi": {
      "mabs": 2,
      "hocham": "Thạc sĩ, Bác sĩ CKI",
      "hoten": "BS. Trần Văn Bình",
      "chuyenkhoa": {
        "mack": 2,
        "tenchuyenkhoa": "Khoa Tai Mũi Họng"
      }
    },
    "chitietdichvukham": [
      {
        "mactdvk": 101,
        "malsk": 12,
        "madv": 1,
        "tendichvu": "Tổng phân tích tế bào máu ngoại vi",
        "dongia": 120000,
        "soluong": 1,
        "thanhtien": 120000,
        "ketqua": null
      },
      {
        "mactdvk": 102,
        "malsk": 12,
        "madv": 3,
        "tendichvu": "Chụp X-quang ngực thẳng",
        "dongia": 150000,
        "soluong": 1,
        "thanhtien": 150000,
        "ketqua": null
      }
    ]
  }
}
```

---

### 13.2. Lấy danh sách phiếu khám bệnh
* **Endpoint:** `GET /api/examinations`
* **Quyền:** `BacSi`, `Admin`, `LeTan` (`Bearer Token`)
* **Query Parameters (Tùy chọn):**
  * `mabn` (number): Lọc phiếu khám theo mã bệnh nhân.
  * `mabs` (number): Lọc phiếu khám theo bác sĩ phụ trách.
  * `fromDate`, `toDate` (YYYY-MM-DD): Lọc theo khoảng ngày khám.
  * `search` (string): Tìm kiếm theo tên bệnh nhân, số điện thoại, chẩn đoán, triệu chứng.
  * `page`, `limit`: Phân trang dữ liệu (Mặc định: `page=1&limit=10`).
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách phiếu khám bệnh thành công!",
  "data": [
    {
      "malsk": 12,
      "mabn": 1,
      "mabs": 2,
      "ngay": "2026-10-18T05:00:00.000Z",
      "chandoan": "Viêm phế quản cấp",
      "benhnhan": { "mabn": 1, "hoten": "Nguyễn Văn An" },
      "bacsi": { "mabs": 2, "hoten": "BS. Trần Văn Bình" }
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### 13.3. Xem chi tiết phiếu khám bệnh
* **Endpoint:** `GET /api/examinations/:id`
* **Quyền:** `BacSi`, `Admin`, `LeTan`, `BenhNhan` (`Bearer Token` - Bệnh nhân chỉ xem được phiếu của chính mình)
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin chi tiết phiếu khám bệnh thành công!",
  "data": {
    "malsk": 12,
    "mabn": 1,
    "mabs": 2,
    "ngay": "2026-10-18T05:00:00.000Z",
    "trieuchung": "Sốt cao, đau rát họng",
    "chandoan": "Viêm phế quản cấp",
    "ketluan": "Nghỉ ngơi, uống nhiều nước, tái khám sau 5 ngày",
    "benhnhan": { ... },
    "bacsi": { ... },
    "chitietdichvukham": [
      {
        "mactdvk": 101,
        "madv": 1,
        "tendichvu": "Tổng phân tích tế bào máu ngoại vi",
        "dongia": 120000,
        "soluong": 1,
        "thanhtien": 120000,
        "ketqua": "Bạch cầu tăng nhẹ: 11.2 G/L"
      }
    ],
    "donthuoc": null,
    "hoadon": null
  }
}
```

---

### 13.4. Bác sĩ cập nhật phiếu khám bệnh
* **Endpoint:** `PUT /api/examinations/:id`
* **Quyền:** `BacSi`, `Admin` (`Bearer Token`)
* **Request Body:**
```json
{
  "chandoan": "Viêm họng cấp tính do virus",
  "ketluan": "Không cần dùng kháng sinh, dùng súc họng sát khuẩn và hạ sốt khi cần"
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật phiếu khám bệnh thành công!",
  "data": { ... }
}
```

---

### 13.5. Chỉ định bổ sung dịch vụ cận lâm sàng
* **Endpoint:** `POST /api/examinations/:id/services`
* **Quyền:** `BacSi`, `Admin` (`Bearer Token`)
* **Lưu ý:** Nếu lần khám đã được tạo hóa đơn viện phí trước đó (chưa thanh toán), hệ thống sẽ tự động đồng bộ dịch vụ mới vào hóa đơn. Nếu hóa đơn đã thanh toán thì sẽ chặn và báo lỗi 400.
* **Request Body:**
```json
{
  "services": [
    {
      "madv": 5,
      "soluong": 1
    }
  ]
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Chỉ định bổ sung dịch vụ cận lâm sàng thành công!",
  "data": { ... }
}
```

---

### 13.6. Cập nhật kết quả cận lâm sàng
* **Endpoint:** `PUT /api/examinations/:id/services/:detailId`
* **Quyền:** `BacSi`, `Admin`, `YTa` (`Bearer Token`)
* **Request Body:**
```json
{
  "ketqua": "Hình ảnh thâm nhiễm nhẹ rốn phổi 2 bên, không thấy tràn dịch màng phổi"
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật kết quả cận lâm sàng thành công!",
  "data": {
    "mactdvk": 102,
    "malsk": 12,
    "madv": 3,
    "tendichvu": "Chụp X-quang ngực thẳng",
    "dongia": 150000,
    "soluong": 1,
    "ketqua": "Hình ảnh thâm nhiễm nhẹ rốn phổi 2 bên, không thấy tràn dịch màng phổi"
  }
}
```

---

### 13.7. Hủy một chỉ định cận lâm sàng khỏi phiếu khám
* **Endpoint:** `DELETE /api/examinations/:id/services/:detailId`
* **Quyền:** `BacSi`, `Admin` (`Bearer Token`)
* **Lưu ý an toàn:** Không thể xóa dịch vụ cận lâm sàng nếu lần khám bệnh đã hoàn tất thanh toán hóa đơn viện phí.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Hủy chỉ định dịch vụ \"Chụp X-quang ngực thẳng\" thành công!",
  "data": {
    "mactdvk": 102,
    "malsk": 12,
    "madv": 3,
    "tendichvu": "Chụp X-quang ngực thẳng"
  }
}
```

---

### 13.8. Xóa phiếu khám bệnh (Safe Delete Guard)
* **Endpoint:** `DELETE /api/examinations/:id`
* **Quyền:** `Admin`, `BacSi` (`Bearer Token`)
* **Lưu ý an toàn:** Chỉ xóa được khi phiếu khám chưa thanh toán viện phí và chưa kê đơn thuốc.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Xóa phiếu khám bệnh #12 thành công!",
  "data": {
    "malsk": 12,
    "mabn": 1,
    "mabs": 2
  }
}
```

---

## 💊 14. PHÂN HỆ QUẢN LÝ KHO THUỐC & CẢNH BÁO TỒN KHO (`/api/medicines`)

Phân hệ phục vụ quản lý danh mục thuốc, tra cứu bảng giá, nhập xuất tồn kho, kiểm kê điều chỉnh số lượng và tự động cảnh báo thuốc hết hàng hoặc cận hạn sử dụng.

### 14.1. Lấy danh sách thuốc (kèm tìm kiếm & bộ lọc)
* **Endpoint:** `GET /api/medicines`
* **Quyền:** Public / All Roles (Không yêu cầu đăng nhập)
* **Query Parameters (Tùy chọn):**
  * `search` (string): Tìm kiếm theo tên thuốc hoặc nhà sản xuất.
  * `minPrice`, `maxPrice` (number): Lọc theo khoảng giá bán.
  * `stockStatus` (string): Lọc theo trạng thái tồn kho:
    * `in_stock`: Còn hàng (số lượng tồn > 10).
    * `low_stock`: Sắp hết hàng (0 < số lượng tồn <= 10).
    * `out_of_stock`: Hết hàng (số lượng tồn = 0).
    * `expired`: Đã hết hạn sử dụng.
    * `near_expiry`: Cận hạn dùng (hết hạn trong 30 ngày tới).
  * `page`, `limit`: Phân trang dữ liệu (Mặc định: `page=1&limit=10`).
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách thuốc thành công!",
  "data": [
    {
      "mathuoc": 1,
      "tenthuoc": "Paracetamol 500mg",
      "donvitinh": "Viên",
      "dongia": 2000,
      "soluongton": 150,
      "hansudung": "2027-12-31",
      "nhasanxuat": "Dược Hậu Giang",
      "status": {
        "isOutOfStock": false,
        "isLowStock": false,
        "isExpired": false,
        "isNearExpiry": false,
        "stockStatusText": "Còn hàng",
        "expiryStatusText": "Còn hạn"
      },
      "_count": {
        "solankethuoc": 45,
        "solanxuathoadon": 45
      }
    }
  ],
  "pagination": {
    "total": 30,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

### 14.2. Cảnh báo tồn kho & hạn dùng thông minh
* **Endpoint:** `GET /api/medicines/alerts`
* **Quyền:** `Admin`, `BacSi`, `YTa` (`Bearer Token`)
* **Query Parameters (Tùy chọn):**
  * `threshold` (number, mặc định `10`): Ngưỡng số lượng tồn cảnh báo sắp hết hàng.
  * `days` (number, mặc định `30`): Số ngày tính cận hạn sử dụng.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách cảnh báo tồn kho và hạn sử dụng thành công!",
  "data": {
    "summary": {
      "outOfStockCount": 2,
      "lowStockCount": 5,
      "expiredCount": 1,
      "nearExpiryCount": 4,
      "totalAlerts": 12,
      "appliedThreshold": 10,
      "appliedWarningDays": 30
    },
    "alerts": {
      "outOfStock": [ ... ],
      "lowStock": [ ... ],
      "expired": [ ... ],
      "nearExpiry": [ ... ]
    }
  }
}
```

---

### 14.3. Thống kê tổng quan kho thuốc (Dashboard Overview)
* **Endpoint:** `GET /api/medicines/stats/overview`
* **Quyền:** `Admin` (`Bearer Token`)
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy dữ liệu thống kê tổng quan kho thuốc thành công!",
  "data": {
    "totalMedicineTypes": 30,
    "totalUnitsInStock": 4520,
    "totalInventoryValue": 85450000,
    "statusCounts": {
      "inStock": 23,
      "lowStock": 5,
      "outOfStock": 2,
      "expired": 1,
      "nearExpiry": 4
    }
  }
}
```

---

### 14.4. Xem chi tiết thông tin thuốc
* **Endpoint:** `GET /api/medicines/:id`
* **Quyền:** Public / All Roles
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin chi tiết thuốc thành công!",
  "data": {
    "mathuoc": 1,
    "tenthuoc": "Paracetamol 500mg",
    "donvitinh": "Viên",
    "dongia": 2000,
    "soluongton": 150,
    "hansudung": "2027-12-31",
    "nhasanxuat": "Dược Hậu Giang",
    "status": {
      "isOutOfStock": false,
      "isLowStock": false,
      "isExpired": false,
      "isNearExpiry": false,
      "stockStatusText": "Còn hàng",
      "expiryStatusText": "Còn hạn"
    }
  }
}
```

---

### 14.5. Thêm mới thuốc vào danh mục
* **Endpoint:** `POST /api/medicines`
* **Quyền:** `Admin` (`Bearer Token`)
* **Request Body:**
```json
{
  "tenthuoc": "Amoxicillin 500mg",
  "donvitinh": "Viên",
  "dongia": 3500,
  "soluongton": 200,
  "hansudung": "2027-10-31",
  "nhasanxuat": "Mekophar"
}
```
* **Response Thành công (201 Created):**
```json
{
  "success": true,
  "message": "Thêm mới thuốc vào danh mục thành công!",
  "data": {
    "mathuoc": 5,
    "tenthuoc": "Amoxicillin 500mg",
    "donvitinh": "Viên",
    "dongia": 3500,
    "soluongton": 200,
    "hansudung": "2027-10-31",
    "nhasanxuat": "Mekophar"
  }
}
```

---

### 14.6. Cập nhật thông tin thuốc
* **Endpoint:** `PUT /api/medicines/:id`
* **Quyền:** `Admin` (`Bearer Token`)
* **Request Body:**
```json
{
  "dongia": 3800,
  "nhasanxuat": "Mekophar - Dược phẩm Việt Nam"
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật thông tin thuốc thành công!",
  "data": { ... }
}
```

---

### 14.7. Nhập thêm hàng vào kho (Stock Import)
* **Endpoint:** `POST /api/medicines/:id/import`
* **Quyền:** `Admin` (`Bearer Token`)
* **Request Body:**
```json
{
  "soluong": 300,
  "hansudung": "2028-06-30",
  "dongia": 3600,
  "ghichu": "Nhập lô thuốc mới theo hóa đơn HD-NK-0088"
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Nhập kho thành công 300 đơn vị cho thuốc \"Amoxicillin 500mg\"!",
  "data": {
    "medicine": {
      "mathuoc": 5,
      "tenthuoc": "Amoxicillin 500mg",
      "soluongton": 500,
      "hansudung": "2028-06-30",
      "dongia": 3600
    },
    "importDetails": {
      "mathuoc": 5,
      "soluongnhap": 300,
      "soluongtoncu": 200,
      "soluongtonmoi": 500,
      "ghichu": "Nhập lô thuốc mới theo hóa đơn HD-NK-0088",
      "thoigiannhap": "2026-10-20T13:00:00.000Z"
    }
  }
}
```

---

### 14.8. Kiểm kê & điều chỉnh tồn kho (Stock Adjustment)
* **Endpoint:** `PUT /api/medicines/:id/stock`
* **Quyền:** `Admin` (`Bearer Token`)
* **Request Body:**
```json
{
  "soluongton": 490,
  "lydo": "Kiểm kê kho định kỳ: phát hiện hỏng vỡ 10 viên"
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Điều chỉnh số lượng tồn kho thành công (500 -> 490)!",
  "data": {
    "medicine": {
      "mathuoc": 5,
      "soluongton": 490
    },
    "adjustmentDetails": {
      "mathuoc": 5,
      "soluongtoncu": 500,
      "soluongtonmoi": 490,
      "chenhlech": -10,
      "lydo": "Kiểm kê kho định kỳ: phát hiện hỏng vỡ 10 viên",
      "thoigiandieuchinh": "2026-10-20T13:05:00.000Z"
    }
  }
}
```

---

### 14.9. Xóa thuốc khỏi danh mục (Safe Delete Guard)
* **Endpoint:** `DELETE /api/medicines/:id`
* **Quyền:** `Admin` (`Bearer Token`)
* **Lưu ý an toàn:** Không thể xóa thuốc nếu thuốc đã được kê đơn cho bệnh nhân (`chitietdonthuoc`) hoặc đã xuất hóa đơn viện phí (`chitiethoadon`) để bảo vệ toàn vẹn lịch sử bệnh án.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Xóa thuốc \"Amoxicillin 500mg\" thành công!",
  "data": {
    "mathuoc": 5,
    "tenthuoc": "Amoxicillin 500mg"
  }
}
```

---

## 💊 15. PHÂN HỆ KÊ ĐƠN THUỐC ĐIỆN TỬ & TỰ ĐỘNG KIỂM TRA/TRỪ KHO (`/api/prescriptions`)

> **Quy tắc nghiệp vụ quan trọng:**
> 1. Mỗi lần khám bệnh (`malsk`) chỉ được kê tối đa **01 đơn thuốc duy nhất**. Nếu kê thêm sẽ báo lỗi trùng lặp `409 Conflict`.
> 2. Hệ thống tự động kiểm tra **hạn sử dụng** và **số lượng tồn kho** của từng loại thuốc trước khi lưu. Nếu thuốc hết hạn hoặc tồn kho không đủ, API sẽ từ chối tạo đơn (`400 Bad Request`) và thông báo rõ loại thuốc nào, còn bao nhiêu đơn vị.
> 3. Toàn bộ thao tác tạo/sửa/xóa đơn thuốc đều chạy trong **Prisma Database Transaction** nguyên tử (Atomic). Trừ kho ngay lập tức khi kê đơn, hoàn trả lại tồn kho nếu hủy đơn.
> 4. Tự động đồng bộ các loại thuốc đã kê vào hóa đơn viện phí (`chitiethoadon`) và cập nhật lại tổng tiền hóa đơn nếu hóa đơn đang ở trạng thái `ChuaThanhToan`.
> 5. **Bảo vệ an toàn (Safe Guard):** Nếu hóa đơn của lần khám đã thanh toán (`DaThanhToan`), hệ thống khóa quyền chỉnh sửa và hủy đơn thuốc để bảo toàn dữ liệu tài chính.

---

### 15.1. Kê đơn thuốc điện tử mới
* **Endpoint:** `POST /api/prescriptions`
* **Quyền:** `BacSi`, `Admin` (`Bearer Token`)
* **Request Body:**
```json
{
  "malsk": 1,
  "ghichubacsi": "Uống sau khi ăn no. Tái khám sau 7 ngày nếu còn sốt.",
  "medicines": [
    {
      "mathuoc": 1,
      "soluong": 20,
      "lieudung": "1 viên/lần, ngày 2 lần sáng - tối",
      "thoigiansudung": "Uống sau ăn 30 phút"
    },
    {
      "mathuoc": 2,
      "soluong": 10,
      "lieudung": "1 viên/ngày vào buổi sáng",
      "thoigiansudung": "Uống với nhiều nước"
    }
  ]
}
```
* **Response Thành công (201 Created):**
```json
{
  "success": true,
  "message": "Kê đơn thuốc điện tử thành công! Đã tự động kiểm tra và trừ tồn kho thuốc.",
  "data": {
    "madt": 10,
    "malsk": 1,
    "ngayke": "2026-10-24",
    "ghichubacsi": "Uống sau khi ăn no. Tái khám sau 7 ngày nếu còn sốt.",
    "benhnhan": {
      "mabn": 1,
      "hoten": "Nguyễn Văn An",
      "ngaysinh": "2000-01-15",
      "gioitinh": "Nam",
      "sdt": "0912345678",
      "diachi": "123 Nguyễn Trãi, Q5, TP.HCM"
    },
    "bacsi": {
      "mabs": 1,
      "hoten": "BS. Lê Văn B",
      "sdt": "0987654321",
      "chuyenkhoa": "Khoa Nội Tổng Quát"
    },
    "khambenh": {
      "ngaykham": "2026-10-24",
      "trieuchung": "Sốt cao, đau họng, ho khan",
      "chandoan": "Viêm họng cấp",
      "ketluan": "Kê đơn ngoại trú điều trị tại nhà"
    },
    "hoadon": {
      "mahd": 5,
      "tongtien": 150000,
      "trangthaithanhtoan": "ChuaThanhToan"
    },
    "items": [
      {
        "mactdt": 21,
        "mathuoc": 1,
        "tenthuoc": "Paracetamol 500mg",
        "donvitinh": "Viên",
        "dongia": 2000,
        "soluong": 20,
        "lieudung": "1 viên/lần, ngày 2 lần sáng - tối",
        "thoigiansudung": "Uống sau ăn 30 phút",
        "thanhtien": 40000,
        "hansudung": "2028-12-31",
        "soluongton_hientai": 480
      },
      {
        "mactdt": 22,
        "mathuoc": 2,
        "tenthuoc": "Amoxicillin 500mg",
        "donvitinh": "Viên",
        "dongia": 5000,
        "soluong": 10,
        "lieudung": "1 viên/ngày vào buổi sáng",
        "thoigiansudung": "Uống với nhiều nước",
        "thanhtien": 50000,
        "hansudung": "2027-10-20",
        "soluongton_hientai": 190
      }
    ],
    "tongsoluongthuoc": 30,
    "tongtienthuoc": 90000
  }
}
```

---

### 15.2. Lấy danh sách đơn thuốc (Tìm kiếm & Phân trang)
* **Endpoint:** `GET /api/prescriptions`
* **Quyền:** `BacSi`, `Admin`, `LeTan`, `YTa`, `BenhNhan` (`Bearer Token`)
* **Lưu ý phân quyền:** Tài khoản vai trò `BenhNhan` chỉ truy xuất được các đơn thuốc thuộc hồ sơ của chính mình.
* **Query Parameters:**
  * `mabn` *(number, optional)*: Lọc theo mã bệnh nhân.
  * `mabs` *(number, optional)*: Lọc theo mã bác sĩ kê đơn.
  * `malsk` *(number, optional)*: Lọc theo mã lần khám.
  * `fromDate` *(string, optional, YYYY-MM-DD)*: Từ ngày kê đơn.
  * `toDate` *(string, optional, YYYY-MM-DD)*: Đến ngày kê đơn.
  * `page` *(number, default: 1)*: Trang hiện tại.
  * `limit` *(number, default: 10)*: Số dòng mỗi trang.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách đơn thuốc thành công!",
  "data": [
    {
      "madt": 10,
      "malsk": 1,
      "ngayke": "2026-10-24",
      "ghichubacsi": "Uống sau khi ăn no. Tái khám sau 7 ngày nếu còn sốt.",
      "benhnhan": { ... },
      "bacsi": { ... },
      "khambenh": { ... },
      "hoadon": { ... },
      "items": [ ... ],
      "tongsoluongthuoc": 30,
      "tongtienthuoc": 90000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 15.3. Xem chi tiết đơn thuốc theo ID
* **Endpoint:** `GET /api/prescriptions/:id`
* **Quyền:** `BacSi`, `Admin`, `LeTan`, `YTa`, `BenhNhan` (`Bearer Token`)
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy chi tiết đơn thuốc thành công!",
  "data": {
    "madt": 10,
    "malsk": 1,
    "ngayke": "2026-10-24",
    "ghichubacsi": "Uống sau khi ăn no.",
    "benhnhan": { ... },
    "bacsi": { ... },
    "khambenh": { ... },
    "hoadon": { ... },
    "items": [ ... ],
    "tongsoluongthuoc": 30,
    "tongtienthuoc": 90000
  }
}
```

---

### 15.4. Lấy đơn thuốc theo mã lần khám bệnh
* **Endpoint:** `GET /api/prescriptions/exam/:examId`
* **Quyền:** `BacSi`, `Admin`, `LeTan`, `YTa`, `BenhNhan` (`Bearer Token`)
* **Mục đích:** Giúp màn hình chi tiết phiếu khám tải ngay đơn thuốc tương ứng của lần khám đó mà không cần qua danh sách đơn thuốc.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin đơn thuốc của lần khám bệnh thành công!",
  "data": { ... }
}
```

---

### 15.5. Cập nhật đơn thuốc điện tử
* **Endpoint:** `PUT /api/prescriptions/:id`
* **Quyền:** `BacSi`, `Admin` (`Bearer Token`)
* **Điều kiện:** Hóa đơn của lần khám tương ứng **chưa thanh toán**.
* **Cơ chế cân đối tồn kho:** Hệ thống sẽ tự động hoàn trả số lượng thuốc cũ về kho, kiểm tra hạn dùng & tồn kho của danh sách thuốc mới, sau đó trừ kho mới và cập nhật lại chi tiết hóa đơn viện phí.
* **Request Body:**
```json
{
  "ghichubacsi": "Uống sau ăn 30 phút. Bổ sung nhiều nước ấm.",
  "medicines": [
    {
      "mathuoc": 1,
      "soluong": 15,
      "lieudung": "1 viên/lần, ngày 2 lần",
      "thoigiansudung": "Uống sau ăn"
    }
  ]
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật đơn thuốc điện tử và cân đối tồn kho thành công!",
  "data": { ... }
}
```

---

### 15.6. Hủy / Xóa đơn thuốc và tự động hoàn trả tồn kho
* **Endpoint:** `DELETE /api/prescriptions/:id`
* **Quyền:** `BacSi`, `Admin` (`Bearer Token`)
* **Điều kiện:** Hóa đơn của lần khám **chưa thanh toán**.
* **Cơ chế Rollback:** Toàn bộ số lượng của các loại thuốc trong đơn sẽ được tự động cộng trả lại vào kho (`soluongton`), đồng thời xóa các dòng tương ứng trong chi tiết hóa đơn và cập nhật lại tổng tiền hóa đơn viện phí.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Hủy đơn thuốc #10 thành công! Toàn bộ số lượng thuốc (2 loại) đã được tự động hoàn lại vào kho."
}
```

---

## 🛠️ 16. MẪU CODE GỌI API CHO FRONTEND (AXIOS INSTANCE)

Đoạn mã mẫu cài đặt Axios Interceptor tự động gắn token và xử lý lỗi:

```javascript
// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 1. Tự động gắn Token vào tất cả Request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// 2. Xử lý kết quả & bắt lỗi tập trung
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Nếu token hết hạn hoặc không hợp lệ (401), chuyển hướng về trang Login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || 'Lỗi kết nối máy chủ!';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
```



