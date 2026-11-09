require('dotenv').config();
const { generateToken } = require('./src/utils/jwt');
const prisma = require('./src/config/prisma');

const BASE_URL = 'http://localhost:5000/api';

const results = [];

async function test(name, category, fn) {
  const start = Date.now();
  try {
    const res = await fn();
    const duration = Date.now() - start;
    results.push({
      category,
      name,
      status: 'PASS',
      code: res.status || 200,
      duration: `${duration}ms`,
      details: res.message || 'Thành công'
    });
    console.log(`[PASS] [${category}] ${name} (${duration}ms)`);
    return res.data !== undefined ? res.data : res;
  } catch (err) {
    const duration = Date.now() - start;
    results.push({
      category,
      name,
      status: 'FAIL',
      code: err.status || 500,
      duration: `${duration}ms`,
      details: err.message || 'Lỗi không xác định'
    });
    console.error(`[FAIL] [${category}] ${name} (${duration}ms):`, err.message);
    return null;
  }
}

async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    const error = new Error(data.message || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return { status: res.status, message: data.message, data: data.data || data };
}

async function runAllTests() {
  console.log('========================================================');
  console.log('🚀 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN 13 PHÂN HỆ API PHÒNG KHÁM');
  console.log(`📡 URL Mục Tiêu: ${BASE_URL}`);
  console.log(`⏱️ Thời gian: ${new Date().toLocaleString('vi-VN')}`);
  console.log('========================================================\n');

  // Chuẩn bị Tokens
  const adminToken = generateToken({ matk: 4, vaitro: 'Admin' });
  const doctorToken = generateToken({ matk: 8, vaitro: 'BacSi' });
  const patientToken = generateToken({ matk: 6, vaitro: 'BenhNhan' });

  let sharedExamId = null;
  let sharedMedicineId = null;
  let sharedInvoiceId = null;
  let sharedAppointmentId = null;

  // ----------------------------------------------------
  // 1. Phân hệ Xác thực & Tài khoản (/api/auth)
  // ----------------------------------------------------
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const testUser = {
    username: `test_user_${randomSuffix}`,
    password: 'Password123@',
    hoten: `Bệnh Nhân Test ${randomSuffix}`,
    gioitinh: 'Nam',
    ngaysinh: '1995-05-15',
    sdt: `09${Math.floor(10000000 + Math.random() * 90000000)}`
  };

  await test('POST /auth/register - Đăng ký tài khoản bệnh nhân mới', 'Auth', async () => {
    return await apiRequest('/auth/register', 'POST', testUser);
  });

  await test('POST /auth/login - Đăng nhập tài khoản vừa tạo', 'Auth', async () => {
    return await apiRequest('/auth/login', 'POST', {
      username: testUser.username,
      password: testUser.password
    });
  });

  await test('POST /auth/login - Chặn đăng nhập sai mật khẩu (401)', 'Auth', async () => {
    try {
      await apiRequest('/auth/login', 'POST', {
        username: testUser.username,
        password: 'WrongPassword'
      });
      throw new Error('Đáng lẽ phải trả về lỗi 401');
    } catch (err) {
      if (err.status === 401) return { status: 401, message: 'Chặn thành công lỗi 401' };
      throw err;
    }
  });

  // ----------------------------------------------------
  // 2. Phân hệ Master Data Chuyên khoa (/api/specialties)
  // ----------------------------------------------------
  let createdSpecialtyId = null;
  await test('GET /specialties - Lấy danh sách chuyên khoa', 'Master Data', async () => {
    return await apiRequest('/specialties');
  });

  await test('POST /specialties - Tạo chuyên khoa mới (Quyền Admin)', 'Master Data', async () => {
    const res = await apiRequest('/specialties', 'POST', {
      tenchuyenkhoa: `Khoa Test ${randomSuffix}`,
      mota: 'Chuyên khoa thử nghiệm tự động'
    }, adminToken);
    createdSpecialtyId = res.data?.mack || res.data?.id;
    return res;
  });

  if (createdSpecialtyId) {
    await test(`GET /specialties/${createdSpecialtyId} - Xem chi tiết chuyên khoa`, 'Master Data', async () => {
      return await apiRequest(`/specialties/${createdSpecialtyId}`);
    });
  }

  // ----------------------------------------------------
  // 3. Phân hệ Bác sĩ (/api/doctors)
  // ----------------------------------------------------
  await test('GET /doctors - Lấy danh sách bác sĩ', 'Bác sĩ', async () => {
    return await apiRequest('/doctors');
  });

  await test('GET /doctors/1 - Xem chi tiết bác sĩ Nguyễn Hoàng Nam', 'Bác sĩ', async () => {
    return await apiRequest('/doctors/1');
  });

  // ----------------------------------------------------
  // 4. Phân hệ Phòng khám (/api/rooms) & Dịch vụ (/api/services)
  // ----------------------------------------------------
  await test('GET /rooms - Lấy danh sách phòng khám', 'Phòng khám', async () => {
    return await apiRequest('/rooms');
  });

  let createdServiceId = null;
  await test('GET /services - Lấy danh sách dịch vụ y tế', 'Dịch vụ', async () => {
    return await apiRequest('/services');
  });

  await test('POST /services - Thêm dịch vụ khám mới (Quyền Admin)', 'Dịch vụ', async () => {
    const res = await apiRequest('/services', 'POST', {
      tendichvu: `Đo thị lực chuyên sâu ${randomSuffix}`,
      dongia: 120000,
      mack: 1
    }, adminToken);
    createdServiceId = res.data?.madv || res.data?.id;
    return res;
  });

  // ----------------------------------------------------
  // 5. Phân hệ Bệnh nhân (/api/patients)
  // ----------------------------------------------------
  await test('GET /patients - Lấy danh sách bệnh nhân (Admin/Bác sĩ)', 'Bệnh nhân', async () => {
    return await apiRequest('/patients', 'GET', null, doctorToken);
  });

  await test('GET /patients/me - Lấy hồ sơ cá nhân bệnh nhân đang đăng nhập', 'Bệnh nhân', async () => {
    return await apiRequest('/patients/me', 'GET', null, patientToken);
  });

  await test('GET /patients/me/medical-record - Lấy tiền sử bệnh án cá nhân', 'Bệnh nhân', async () => {
    return await apiRequest('/patients/me/medical-record', 'GET', null, patientToken);
  });

  // ----------------------------------------------------
  // 6. Phân hệ Ca làm việc & Đặt lịch hẹn (/api/shifts & /api/appointments)
  // ----------------------------------------------------
  const appointmentDateStr = '2026-11-10';
  // Tạo ca làm việc và phân công trực cho Bác sĩ 1 vào ngày này để lịch hẹn hợp lệ
  let createdShift = null;
  try {
    createdShift = await prisma.calamviec.create({
      data: {
        maphong: 1,
        ngay: new Date(appointmentDateStr),
        giobatdau: new Date(`1970-01-01T07:30:00Z`),
        gioketthuc: new Date(`1970-01-01T11:30:00Z`),
        phanconglamviec: {
          create: {
            manv: 1,
            vaitrotrongca: 'Bác sĩ khám chính'
          }
        }
      }
    });
  } catch {}

  await test('POST /appointments - Đặt lịch hẹn khám bệnh trực tuyến', 'Lịch hẹn', async () => {
    const res = await apiRequest('/appointments', 'POST', {
      mabs: 1,
      ngayhen: appointmentDateStr,
      giohen: '08:30:00',
      lydokham: 'Mắt nhìn mờ, cộm rát cần kiểm tra thị lực'
    }, patientToken);
    sharedAppointmentId = res.data?.malh || res.data?.id;
    return res;
  });

  await test('GET /appointments - Xem danh sách lịch hẹn', 'Lịch hẹn', async () => {
    return await apiRequest('/appointments', 'GET', null, doctorToken);
  });

  if (sharedAppointmentId) {
    await test(`PUT /appointments/${sharedAppointmentId}/status - Xác nhận lịch hẹn (DaXacNhan)`, 'Lịch hẹn', async () => {
      return await apiRequest(`/appointments/${sharedAppointmentId}/status`, 'PUT', {
        trangthai: 'DaXacNhan'
      }, doctorToken);
    });
  }

  // ----------------------------------------------------
  // 7. Phân hệ Khám bệnh & Cận lâm sàng (/api/examinations)
  // ----------------------------------------------------
  await test('POST /examinations - Bác sĩ tạo phiếu khám bệnh & chỉ định dịch vụ', 'Khám bệnh', async () => {
    const res = await apiRequest('/examinations', 'POST', {
      mabn: 1,
      trieuchung: 'Mắt phải mờ đột ngột, chảy nước mắt nhiều',
      chandoan: 'Viêm kết mạc cấp tính',
      ketluan: 'Chỉ định nhỏ thuốc kháng viêm và tái khám sau 7 ngày',
      services: createdServiceId ? [{ madv: createdServiceId, soluong: 1 }] : []
    }, doctorToken);
    sharedExamId = res.data?.malsk || res.data?.id;
    return res;
  });

  await test('GET /examinations - Lấy danh sách phiếu khám', 'Khám bệnh', async () => {
    return await apiRequest('/examinations', 'GET', null, doctorToken);
  });

  if (sharedExamId) {
    await test(`GET /examinations/${sharedExamId} - Xem chi tiết phiếu khám bệnh`, 'Khám bệnh', async () => {
      return await apiRequest(`/examinations/${sharedExamId}`, 'GET', null, doctorToken);
    });
  }

  // ----------------------------------------------------
  // 8. Phân hệ Kho Dược (/api/medicines)
  // ----------------------------------------------------
  await test('POST /medicines - Thêm thuốc mới vào kho (Quyền Admin)', 'Kho thuốc', async () => {
    const res = await apiRequest('/medicines', 'POST', {
      tenthuoc: `Tobradex Nhỏ Mắt ${randomSuffix}`,
      donvitinh: 'Lọ',
      dongia: 65000,
      soluongton: 50,
      hansudung: '2028-06-30',
      nhasanxuat: 'Alcon Pharmaceuticals'
    }, adminToken);
    sharedMedicineId = res.data?.mathuoc || res.data?.id;
    return res;
  });

  await test('GET /medicines - Xem danh mục dược phẩm', 'Kho thuốc', async () => {
    return await apiRequest('/medicines');
  });

  await test('GET /medicines/alerts - Kiểm tra cảnh báo tồn kho & hạn dùng', 'Kho thuốc', async () => {
    return await apiRequest('/medicines/alerts', 'GET', null, adminToken);
  });

  // ----------------------------------------------------
  // 9. Phân hệ Kê đơn thuốc điện tử & Tự động trừ kho (/api/prescriptions)
  // ----------------------------------------------------
  if (sharedExamId && sharedMedicineId) {
    let initialStock = 50;

    await test('POST /prescriptions - Bác sĩ kê đơn thuốc điện tử (Tự động trừ kho)', 'Kê đơn', async () => {
      const res = await apiRequest('/prescriptions', 'POST', {
        malsk: sharedExamId,
        ghichubacsi: 'Nhỏ mắt 2 giọt/lần, ngày 3 lần sau khi rửa sạch tay',
        medicines: [
          {
            mathuoc: sharedMedicineId,
            soluong: 2,
            lieudung: '2 giọt/lần, ngày 3 lần',
            thoigiansudung: '7 ngày'
          }
        ]
      }, doctorToken);
      return res;
    });

    await test('Kiểm tra tự động trừ tồn kho (soluongton giảm từ 50 xuống 48)', 'Kê đơn (Inventory)', async () => {
      const med = await prisma.thuoc.findUnique({ where: { mathuoc: sharedMedicineId } });
      if (med.soluongton === initialStock - 2) {
        return { status: 200, message: `Tồn kho đã trừ chính xác: 50 -> ${med.soluongton}` };
      }
      throw new Error(`Tồn kho không đúng: mong đợi 48 nhưng nhận được ${med.soluongton}`);
    });

    await test(`GET /prescriptions/exam/${sharedExamId} - Tra cứu đơn thuốc theo mã lần khám`, 'Kê đơn', async () => {
      return await apiRequest(`/prescriptions/exam/${sharedExamId}`, 'GET', null, doctorToken);
    });
  }

  // ----------------------------------------------------
  // 10. Phân hệ Viện phí & Hóa đơn (/api/invoices)
  // ----------------------------------------------------
  await test('GET /invoices - Lấy danh sách hóa đơn viện phí', 'Hóa đơn', async () => {
    const res = await apiRequest('/invoices', 'GET', null, adminToken);
    const list = Array.isArray(res.data) ? res.data : (res.data?.invoices || []);
    if (list.length > 0) {
      sharedInvoiceId = list[0].mahd || list[0].id;
    }
    return res;
  });

  if (sharedInvoiceId) {
    await test(`GET /invoices/${sharedInvoiceId} - Xem chi tiết hóa đơn (kèm dịch vụ và tiền thuốc)`, 'Hóa đơn', async () => {
      return await apiRequest(`/invoices/${sharedInvoiceId}`, 'GET', null, adminToken);
    });

    await test(`PUT /invoices/${sharedInvoiceId}/payment - Thanh toán viện phí VietQR/Chuyển khoản`, 'Hóa đơn', async () => {
      return await apiRequest(`/invoices/${sharedInvoiceId}/payment`, 'PUT', {
        phuongthuctt: 'ChuyenKhoan',
        trangthaithanhtoan: 'DaThanhToan'
      }, adminToken);
    });
  }

  // ----------------------------------------------------
  // 11. Phân hệ Báo cáo & Thống kê (/api/statistics)
  // ----------------------------------------------------
  await test('GET /statistics/overview - Dashboard thống kê tổng quan phòng khám', 'Thống kê', async () => {
    return await apiRequest('/statistics/overview', 'GET', null, adminToken);
  });

  await test('GET /statistics/revenue - Thống kê doanh thu theo thời gian', 'Thống kê', async () => {
    return await apiRequest('/statistics/revenue', 'GET', null, adminToken);
  });

  await test('GET /statistics/examinations - Thống kê lượt khám & chẩn đoán', 'Thống kê', async () => {
    return await apiRequest('/statistics/examinations', 'GET', null, adminToken);
  });

  await test('GET /statistics/top-services - Top dịch vụ y tế chỉ định nhiều nhất', 'Thống kê', async () => {
    return await apiRequest('/statistics/top-services', 'GET', null, adminToken);
  });

  // ----------------------------------------------------
  // 12. Kiểm tra Bảo mật & Phân quyền (Security & RBAC)
  // ----------------------------------------------------
  await test('Chặn truy cập API bảo mật khi không có Token (401)', 'Bảo mật', async () => {
    try {
      await apiRequest('/patients', 'GET', null, null);
      throw new Error('Đáng lẽ phải bị chặn 401');
    } catch (err) {
      if (err.status === 401) return { status: 401, message: 'Chặn thành công lỗi 401' };
      throw err;
    }
  });

  await test('Chặn Bệnh nhân truy cập báo cáo doanh thu Admin (403)', 'Bảo mật', async () => {
    try {
      await apiRequest('/statistics/revenue', 'GET', null, patientToken);
      throw new Error('Đáng lẽ phải bị chặn 403');
    } catch (err) {
      if (err.status === 403) return { status: 403, message: 'Chặn thành công quyền truy cập 403' };
      throw err;
    }
  });

  // ----------------------------------------------------
  // TỔNG KẾT BÁO CÁO
  // ----------------------------------------------------
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log('\n========================================================');
  console.log(`🏁 KẾT QUẢ KIỂM THỬ: ${passed}/${total} PASS (${Math.round(passed / total * 100)}%)`);
  if (failed === 0) {
    console.log('🎉 TẤT CẢ 100% CÁC CHỨC NĂNG API ĐÃ HOẠT ĐỘNG HOÀN HẢO!');
  } else {
    console.log(`⚠️ Có ${failed} bài test chưa đạt yêu cầu.`);
  }
  console.log('========================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(err => {
  console.error('LỖI KHÔNG MONG MUỐN TRONG TEST SUITE:', err);
  process.exit(1);
});
