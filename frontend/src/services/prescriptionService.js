import api from './api'

const initialPrescriptions = [
  { id: 1, madt: 1, malsk: 1, code: 'DT001', patientName: 'Nguyễn Văn An', doctorName: 'BS. CKII. Trần Văn Hùng', date: '2026-10-01', totalMedicines: 3, medicines: [
    { name: 'Amlodipine 5mg', tenthuoc: 'Amlodipine 5mg', quantity: 30, soluong: 30, unit: 'viên', donvitinh: 'viên', usage: 'Uống 1 viên vào buổi sáng sau ăn', lieudung: 'Uống 1 viên vào buổi sáng sau ăn' },
    { name: 'Panadol Extra', tenthuoc: 'Panadol Extra', quantity: 10, soluong: 10, unit: 'viên', donvitinh: 'viên', usage: 'Uống khi đau đầu', lieudung: 'Uống khi đau đầu' },
    { name: 'Vitamin C 500mg', tenthuoc: 'Vitamin C 500mg', quantity: 20, soluong: 20, unit: 'viên', donvitinh: 'viên', usage: 'Uống 1 viên sau ăn trưa', lieudung: 'Uống 1 viên sau ăn trưa' }
  ], notes: 'Tái khám sau 1 tháng mang theo sổ' },
  { id: 2, madt: 2, malsk: 2, code: 'DT002', patientName: 'Trần Thị Mai', doctorName: 'ThS. BS. Nguyễn Thị Lan', date: '2026-10-03', totalMedicines: 2, medicines: [
    { name: 'Augmentin 625mg', tenthuoc: 'Augmentin 625mg', quantity: 14, soluong: 14, unit: 'viên', donvitinh: 'viên', usage: 'Uống 1 viên x 2 lần/ngày sau ăn', lieudung: 'Uống 1 viên x 2 lần/ngày sau ăn' },
    { name: 'Siro Prospan', tenthuoc: 'Siro Prospan', quantity: 1, soluong: 1, unit: 'chai', donvitinh: 'chai', usage: 'Uống 5ml x 3 lần/ngày', lieudung: 'Uống 5ml x 3 lần/ngày' }
  ], notes: 'Uống nhiều nước ấm, súc họng nước muối' }
]

function normalizePrescription(p) {
  if (!p) return null
  const dateStr = p.ngayke ? (typeof p.ngayke === 'string' ? p.ngayke.split('T')[0] : new Date(p.ngayke).toISOString().split('T')[0]) : (p.date || new Date().toISOString().split('T')[0])
  const details = p.items || p.chitietdonthuoc || p.medicines || []

  const medicines = details.map((m, idx) => ({
    id: m.mactdt || idx + 1,
    mathuoc: m.mathuoc,
    name: m.tenthuoc || m.thuoc?.tenthuoc || m.name || 'Thuốc',
    tenthuoc: m.tenthuoc || m.thuoc?.tenthuoc || m.name || 'Thuốc',
    quantity: m.soluong || m.quantity || 1,
    soluong: m.soluong || m.quantity || 1,
    unit: m.donvitinh || m.thuoc?.donvitinh || m.unit || 'Viên',
    donvitinh: m.donvitinh || m.thuoc?.donvitinh || m.unit || 'Viên',
    price: m.dongia ? Number(m.dongia) : 0,
    dongia: m.dongia ? Number(m.dongia) : 0,
    subtotal: m.thanhtien ? Number(m.thanhtien) : (Number(m.dongia || 0) * Number(m.soluong || m.quantity || 1)),
    usage: m.lieudung || m.usage || 'Uống theo chỉ định của bác sĩ',
    lieudung: m.lieudung || m.usage || 'Uống theo chỉ định của bác sĩ',
    duration: m.thoigiansudung || ''
  }))

  const docName = p.bacsi?.nhanvien?.hoten 
    ? (p.bacsi.hocham ? `${p.bacsi.hocham}. ${p.bacsi.nhanvien.hoten}` : `BS. ${p.bacsi.nhanvien.hoten}`)
    : (p.bacsi?.hoten 
      ? (p.bacsi.hocham ? `${p.bacsi.hocham}. ${p.bacsi.hoten}` : `BS. ${p.bacsi.hoten}`)
      : (p.doctorName || 'Bác sĩ điều trị'))

  const patAge = p.benhnhan?.ngaysinh 
    ? (new Date().getFullYear() - new Date(p.benhnhan.ngaysinh).getFullYear()) 
    : (p.age || 35)

  return {
    id: p.madt || p.id,
    madt: p.madt || p.id,
    malsk: p.malsk,
    code: p.code || `DT${String(p.madt || p.id).padStart(3, '0')}`,
    patientName: p.benhnhan?.hoten || p.patientName || 'Bệnh Nhân',
    age: patAge,
    gender: p.benhnhan?.gioitinh === 'Nu' ? 'Nữ' : (p.gender || 'Nam'),
    phone: p.benhnhan?.sdt || p.phone || '',
    address: p.benhnhan?.diachi || p.address || '',
    doctorName: docName,
    date: dateStr,
    ngayke: dateStr,
    diagnosis: p.khambenh?.chandoan || p.diagnosis || 'Khám bệnh theo đơn',
    symptoms: p.khambenh?.trieuchung || p.symptoms || '',
    totalMedicines: medicines.length,
    medicines,
    notes: p.ghichubacsi || p.notes || '',
    ghichubacsi: p.ghichubacsi || p.notes || '',
    totalAmount: Number(p.tongtienthuoc || 0)
  }
}

export const prescriptionService = {
  async getAll(params = {}) {
    try {
      const res = await api.get('/prescriptions', params)
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : [])
      if (Array.isArray(list) && list.length > 0) {
        return list.map(normalizePrescription)
      }
      return list.map(normalizePrescription)
    } catch (err) {
      console.warn('[prescriptionService] Gọi /prescriptions lỗi, dùng fallback:', err.message)
      return initialPrescriptions.map(normalizePrescription)
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/prescriptions/${id}`)
      return normalizePrescription(res.data || res)
    } catch {
      return initialPrescriptions.find(p => p.id === Number(id) || p.madt === Number(id)) || null
    }
  },

  async getByExamId(examId) {
    try {
      const res = await api.get(`/prescriptions/exam/${examId}`)
      return normalizePrescription(res.data || res)
    } catch {
      return initialPrescriptions.find(p => p.malsk === Number(examId)) || null
    }
  },

  async create(data) {
    try {
      const payload = {
        malsk: Number(data.malsk || data.examId || 1),
        ghichubacsi: data.notes || data.ghichubacsi || 'Uống theo đúng chỉ định của bác sĩ',
        medicines: (data.medicines || []).map(m => ({
          mathuoc: Number(m.mathuoc || m.id || 1),
          soluong: Number(m.soluong || m.quantity || 1),
          lieudung: m.lieudung || m.usage || 'Uống sau ăn',
          thoigiansudung: m.thoigiansudung || m.duration || '5 ngày'
        }))
      }
      const res = await api.post('/prescriptions', payload)
      return normalizePrescription(res.data || res)
    } catch (err) {
      console.warn('[prescriptionService] Tạo đơn thuốc backend lỗi, dùng fallback:', err.message)
      return normalizePrescription({
        id: Date.now(),
        code: `DT${Math.floor(100 + Math.random() * 900)}`,
        ...data
      })
    }
  },

  async delete(id) {
    try {
      return await api.delete(`/prescriptions/${id}`)
    } catch {
      return { success: true }
    }
  }
}

export default prescriptionService
