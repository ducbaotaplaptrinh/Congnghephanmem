import api from './api'

function normalizeRecord(r) {
  if (!r) return null
  const dateStr = r.ngay 
    ? (typeof r.ngay === 'string' ? r.ngay.split('T')[0] : new Date(r.ngay).toISOString().split('T')[0]) 
    : (r.date || new Date().toISOString().split('T')[0])
  
  // Lấy tên bác sĩ từ DB (bacsi.hoten hoặc bacsi.nhanvien.hoten)
  let docName = 'Bác sĩ phụ trách'
  if (r.bacsi?.nhanvien?.hoten) {
    docName = r.bacsi.hocham ? `${r.bacsi.hocham}. ${r.bacsi.nhanvien.hoten}` : `BS. ${r.bacsi.nhanvien.hoten}`
  } else if (r.bacsi?.hoten) {
    docName = r.bacsi.hocham ? `${r.bacsi.hocham}. ${r.bacsi.hoten}` : `BS. ${r.bacsi.hoten}`
  } else if (r.doctorName) {
    docName = r.doctorName
  }

  const patientName = r.benhnhan?.hoten || r.patientName || 'Bệnh Nhân'
  const patientPhone = r.benhnhan?.sdt || r.phone || ''
  const patientGender = r.benhnhan?.gioitinh === 'Nu' ? 'Nữ' : (r.benhnhan?.gioitinh || 'Nam')
  const patientDob = r.benhnhan?.ngaysinh ? String(r.benhnhan.ngaysinh).split('T')[0] : ''
  const patientAddress = r.benhnhan?.diachi || ''
  const departmentName = r.bacsi?.chuyenkhoa?.tenchuyenkhoa || 'Khoa Khám Bệnh'

  return {
    id: r.malsk || r.id,
    malsk: r.malsk || r.id,
    code: r.code || `BA${String(r.malsk || r.id).padStart(3, '0')}`,
    mabn: r.mabn,
    mabs: r.mabs,
    patientName,
    phone: patientPhone,
    gender: patientGender,
    birthday: patientDob,
    address: patientAddress,
    doctorName: docName,
    department: departmentName,
    date: dateStr,
    ngay: dateStr,
    diagnosis: r.chandoan || r.diagnosis || 'Khám bệnh định kỳ',
    chandoan: r.chandoan || r.diagnosis || 'Khám bệnh định kỳ',
    symptoms: r.trieuchung || r.symptoms || '',
    trieuchung: r.trieuchung || r.symptoms || '',
    treatment: r.ketluan || r.treatment || '',
    ketluan: r.ketluan || r.treatment || '',
    services: r.chitietdichvukham || [],
    prescription: r.donthuoc || null,
    invoice: r.hoadon || null,
    status: 'Đã hoàn thành'
  }
}

export const medicalRecordService = {
  async getAll(params = {}) {
    try {
      const res = await api.get('/examinations', params)
      const list = Array.isArray(res) 
        ? res 
        : (Array.isArray(res?.data) 
            ? res.data 
            : (Array.isArray(res?.examinations) ? res.examinations : []))
      return list.map(normalizeRecord)
    } catch (err) {
      console.error('[medicalRecordService.getAll] Lỗi nạp phiếu khám từ backend:', err.message)
      return []
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/examinations/${id}`)
      return normalizeRecord(res.data || res)
    } catch (err) {
      console.error(`[medicalRecordService.getById] Lỗi nạp bệnh án #${id}:`, err.message)
      return null
    }
  },

  async getByPatientId(patientId) {
    try {
      // Backend hỗ trợ lọc qua query ?mabn=...
      const res = await api.get('/examinations', { mabn: Number(patientId) })
      const list = Array.isArray(res) 
        ? res 
        : (Array.isArray(res?.data) ? res.data : [])
      return list.map(normalizeRecord)
    } catch (err) {
      console.error(`[medicalRecordService.getByPatientId] Lỗi nạp bệnh án của bệnh nhân #${patientId}:`, err.message)
      return []
    }
  },

  async create(data) {
    const payload = {
      mabn: Number(data.mabn || data.patientId),
      malh: data.malh ? Number(data.malh) : undefined,
      trieuchung: data.symptoms || data.trieuchung || 'Không có triệu chứng bất thường',
      chandoan: data.diagnosis || data.chandoan || 'Khám bệnh định kỳ',
      ketluan: data.treatment || data.ketluan || 'Theo dõi thêm',
      services: data.services || []
    }
    const res = await api.post('/examinations', payload)
    return normalizeRecord(res.data || res)
  },

  async update(id, data) {
    const payload = {
      chandoan: data.diagnosis || data.chandoan,
      ketluan: data.treatment || data.ketluan,
      trieuchung: data.symptoms || data.trieuchung
    }
    const res = await api.put(`/examinations/${id}`, payload)
    return normalizeRecord(res.data || res)
  },

  async delete(id) {
    return await api.delete(`/examinations/${id}`)
  }
}

export default medicalRecordService
