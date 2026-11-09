import api from './api'

const initialDoctors = [
  { id: 1, mabs: 1, name: 'BS. CKII. Trần Văn Hùng', hoten: 'BS. CKII. Trần Văn Hùng', title: 'Trưởng khoa Tim Mạch', department: 'Khoa Tim Mạch', chuyenkhoa: 'Khoa Tim Mạch', experience: '15+ năm', kinhnghiem: 15, rating: 4.9, reviewsCount: 142, bio: 'Chuyên gia đầu ngành về can thiệp tim mạch, nguyên Phó trưởng khoa Bệnh viện Chợ Rẫy.' },
  { id: 2, mabs: 2, name: 'ThS. BS. Nguyễn Thị Lan', hoten: 'ThS. BS. Nguyễn Thị Lan', title: 'Phó khoa Nhi', department: 'Khoa Nhi', chuyenkhoa: 'Khoa Nhi', experience: '10+ năm', kinhnghiem: 10, rating: 5.0, reviewsCount: 198, bio: 'Tận tâm, yêu trẻ, giàu kinh nghiệm khám và điều trị các bệnh lý hô hấp, tiêu hóa ở trẻ em.' },
  { id: 3, mabs: 3, name: 'TS. BS. Lê Hoàng Nam', hoten: 'TS. BS. Lê Hoàng Nam', title: 'Bác sĩ chuyên khoa', department: 'Khoa Thần Kinh', chuyenkhoa: 'Khoa Thần Kinh', experience: '12+ năm', kinhnghiem: 12, rating: 4.8, reviewsCount: 88, bio: 'Chuyên gia điều trị các bệnh đau nửa đầu, rối loạn tiền đình, thần kinh cơ và đột quỵ.' },
  { id: 4, mabs: 4, name: 'BS. CKI. Phạm Minh Tuấn', hoten: 'BS. CKI. Phạm Minh Tuấn', title: 'Bác sĩ chuyên khoa', department: 'Khoa Mắt Kỹ Thuật Cao', chuyenkhoa: 'Khoa Mắt Kỹ Thuật Cao', experience: '9+ năm', kinhnghiem: 9, rating: 4.9, reviewsCount: 110, bio: 'Phẫu thuật viên Phaco giàu kinh nghiệm, điều trị tật khúc xạ và các bệnh lý giác mạc.' },
  { id: 5, mabs: 5, name: 'ThS. BS. Vũ Đức Anh', hoten: 'ThS. BS. Vũ Đức Anh', title: 'Trưởng khoa Nha', department: 'Khoa Răng Hàm Mặt', chuyenkhoa: 'Khoa Răng Hàm Mặt', experience: '8+ năm', kinhnghiem: 8, rating: 4.9, reviewsCount: 95, bio: 'Chuyên sâu chỉnh nha thẩm mỹ, cấy ghép Implant công nghệ cao không đau.' },
  { id: 6, mabs: 6, name: 'BS. Hoàng Kim Yến', hoten: 'BS. Hoàng Kim Yến', title: 'Bác sĩ chuyên khoa', department: 'Khoa Nội Tổng Quát', chuyenkhoa: 'Khoa Nội Tổng Quát', experience: '7+ năm', kinhnghiem: 7, rating: 4.8, reviewsCount: 76, bio: 'Khám tầm soát sức khỏe định kỳ, điều trị các bệnh mãn tính tiểu đường, mỡ máu.' }
]

function normalizeDoctor(d) {
  if (!d) return null
  const nv = d.nhanvien || {}
  const ck = d.chuyenkhoa || {}

  const fullName = nv.hoten || d.hoten || d.name || 'Bác Sĩ'
  const deptName = typeof ck === 'string' ? ck : (ck.tenchuyenkhoa || d.chuyenkhoa || d.department || 'Khoa Nội Tổng Quát')
  const phone = nv.sdt || d.sdt || d.phone || '0901234567'
  const title = d.hocham ? `${d.hocham}` : (nv.chucvu || d.chucvu || d.title || 'Bác sĩ chuyên khoa')
  const years = d.kinhnghiem !== undefined && d.kinhnghiem !== null 
    ? `${d.kinhnghiem}+ năm` 
    : (d.experience || '5+ năm')

  return {
    id: d.mabs || d.id,
    mabs: d.mabs || d.id,
    manv: d.manv || nv.manv || d.mabs || d.id,
    mack: d.mack || ck.mack || 1,
    name: fullName,
    hoten: fullName,
    department: deptName,
    chuyenkhoa: deptName,
    specialty: deptName,
    dept: deptName,
    title,
    hocham: d.hocham || title,
    phone,
    sdt: phone,
    experience: years,
    kinhnghiem: d.kinhnghiem ?? (parseInt(years) || 5),
    gender: nv.gioitinh || d.gioitinh || 'Nam',
    gioitinh: nv.gioitinh || d.gioitinh || 'Nam',
    birthday: nv.ngaysinh ? nv.ngaysinh.split('T')[0] : (d.ngaysinh ? d.ngaysinh.split('T')[0] : '1985-01-01'),
    license: d.sogiayphephanhnghe || d.license || `CCHN_${d.mabs || d.id || Date.now()}`,
    sogiayphephanhnghe: d.sogiayphephanhnghe || d.license || `CCHN_${d.mabs || d.id || Date.now()}`,
    diachi: nv.diachi || d.diachi || '',
    rating: d.rating || 5.0,
    reviewsCount: d._count?.lichsukham || d.reviewsCount || 12,
    bio: d.bio || `Bác sĩ ${fullName} với ${years} kinh nghiệm chuyên sâu tại ${deptName}.`,
    desc: d.desc || d.bio || `Bác sĩ ${fullName} với ${years} kinh nghiệm chuyên sâu tại ${deptName}.`,
    image: d.hinhanh || d.avatar || d.image || d.img || null,
    hinhanh: d.hinhanh || d.avatar || d.image || null,
    avatar: d.hinhanh || d.avatar || d.image || null,
    img: d.hinhanh || d.avatar || d.image || d.img || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=250&fit=crop&crop=face',
    delay: d.delay || 100
  }
}

export const doctorService = {
  async getAll() {
    try {
      const res = await api.get('/doctors')
      const rawList = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (res?.data?.items || []))
      if (rawList && rawList.length > 0) {
        return rawList.map(normalizeDoctor)
      }
      return initialDoctors
    } catch (err) {
      console.warn('[doctorService] Gọi /doctors lỗi, dùng fallback:', err.message)
      return initialDoctors
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/doctors/${id}`)
      const doc = res.data || res
      return normalizeDoctor(doc)
    } catch {
      return initialDoctors.find(d => d.id === Number(id) || d.mabs === Number(id)) || null
    }
  },

  async create(data) {
    // 1. Chuẩn hóa số điện thoại: loại bỏ ký tự không phải số, đảm bảo 10 số bắt đầu bằng 0
    let phone = String(data.phone || data.sdt || '').replace(/\D/g, '')
    if (!phone || phone.length !== 10 || !phone.startsWith('0')) {
      if (phone.startsWith('0') && phone.length <= 10) {
        phone = phone.padEnd(10, '0')
      } else {
        phone = `09${Math.floor(10000000 + Math.random() * 90000000)}`
      }
    }

    // 2. Chuẩn hóa giới tính: "Nam", "Nu", "Khac"
    const rawGender = String(data.gender || data.gioitinh || 'Nam').toLowerCase()
    const validGender = (rawGender.includes('nu') || rawGender.includes('nữ') || rawGender.includes('female'))
      ? 'Nu'
      : (rawGender.includes('khac') ? 'Khac' : 'Nam')

    // 3. Chuẩn hóa kinh nghiệm
    const expNum = typeof data.kinhnghiem === 'number'
      ? data.kinhnghiem
      : (parseInt(data.experience) || 5)

    // 4. Chuẩn hóa số giấy phép hành nghề
    let license = String(data.license || data.sogiayphephanhnghe || '').trim()
    if (!license || license.length < 3) {
      license = `CCHN-${Math.floor(100000 + Math.random() * 900000)}`
    }

    // 5. Chuẩn hóa ngày sinh
    let birthday = data.birthday || data.ngaysinh
    if (!birthday || isNaN(new Date(birthday).getTime())) {
      birthday = '1985-05-15'
    } else {
      birthday = String(birthday).split('T')[0]
    }

    const payload = {
      hoten: (data.name || data.hoten || '').trim(),
      mack: Number(data.mack) || 1,
      sdt: phone,
      gioitinh: validGender,
      ngaysinh: birthday,
      sogiayphephanhnghe: license,
      hocham: (data.title || data.hocham || 'Bác sĩ chuyên khoa').trim(),
      kinhnghiem: expNum
    }

    if (data.diachi) {
      payload.diachi = String(data.diachi).trim()
    }

    if (data.username && data.password) {
      payload.username = String(data.username).trim()
      payload.password = String(data.password)
    }

    if (data.hinhanh !== undefined || data.image !== undefined || data.avatar !== undefined || data.img !== undefined) {
      payload.hinhanh = data.hinhanh !== undefined ? data.hinhanh : (data.image !== undefined ? data.image : (data.avatar !== undefined ? data.avatar : data.img))
    }

    try {
      const res = await api.post('/doctors', payload)
      return normalizeDoctor(res.data || res)
    } catch (err) {
      console.error('[doctorService.create] Lỗi thêm bác sĩ:', err)
      throw err
    }
  },

  async update(id, data) {
    const payload = {}
    if (data.name || data.hoten) payload.hoten = (data.name || data.hoten).trim()
    if (data.mack) payload.mack = Number(data.mack)
    if (data.title || data.hocham) payload.hocham = (data.title || data.hocham).trim()
    
    if (data.experience !== undefined || data.kinhnghiem !== undefined) {
      payload.kinhnghiem = typeof data.kinhnghiem === 'number' 
        ? data.kinhnghiem 
        : (parseInt(data.experience) || 0)
    }

    let phone = String(data.phone || data.sdt || '').replace(/\D/g, '')
    if (phone && phone.length === 10 && phone.startsWith('0')) {
      payload.sdt = phone
    }

    if (data.gender || data.gioitinh) {
      const g = String(data.gender || data.gioitinh).toLowerCase()
      payload.gioitinh = (g.includes('nu') || g.includes('nữ')) ? 'Nu' : (g.includes('khac') ? 'Khac' : 'Nam')
    }

    if (data.license || data.sogiayphephanhnghe) {
      payload.sogiayphephanhnghe = (data.license || data.sogiayphephanhnghe).trim()
    }

    if (data.birthday || data.ngaysinh) {
      payload.ngaysinh = String(data.birthday || data.ngaysinh).split('T')[0]
    }

    if (data.diachi) {
      payload.diachi = String(data.diachi).trim()
    }

    if (data.hinhanh !== undefined || data.image !== undefined || data.avatar !== undefined || data.img !== undefined) {
      payload.hinhanh = data.hinhanh !== undefined ? data.hinhanh : (data.image !== undefined ? data.image : (data.avatar !== undefined ? data.avatar : data.img))
    }

    try {
      const res = await api.put(`/doctors/${id}`, payload)
      return normalizeDoctor(res.data || res)
    } catch (err) {
      console.error('[doctorService.update] Lỗi cập nhật bác sĩ:', err)
      throw err
    }
  },

  async delete(id) {
    try {
      return await api.delete(`/doctors/${id}`)
    } catch (err) {
      console.error('[doctorService.delete] Lỗi xóa bác sĩ:', err)
      throw err
    }
  },

  async getSpecialties() {
    try {
      const res = await api.get('/specialties')
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (res?.data?.items || []))
      if (list && list.length > 0) {
        return list
      }
      return [
        { mack: 1, tenchuyenkhoa: 'Khoa Mắt Kỹ Thuật Cao' },
        { mack: 4, tenchuyenkhoa: 'Khoa Tim Mạch' },
        { mack: 5, tenchuyenkhoa: 'Khoa Nhi' },
        { mack: 6, tenchuyenkhoa: 'Khoa Thần Kinh' },
        { mack: 7, tenchuyenkhoa: 'Khoa Răng Hàm Mặt' },
        { mack: 8, tenchuyenkhoa: 'Khoa Nội Tổng Quát' },
        { mack: 9, tenchuyenkhoa: 'Khoa Tai Mũi Họng' }
      ]
    } catch {
      return [
        { mack: 1, tenchuyenkhoa: 'Khoa Mắt Kỹ Thuật Cao' },
        { mack: 4, tenchuyenkhoa: 'Khoa Tim Mạch' },
        { mack: 5, tenchuyenkhoa: 'Khoa Nhi' },
        { mack: 6, tenchuyenkhoa: 'Khoa Thần Kinh' },
        { mack: 7, tenchuyenkhoa: 'Khoa Răng Hàm Mặt' },
        { mack: 8, tenchuyenkhoa: 'Khoa Nội Tổng Quát' },
        { mack: 9, tenchuyenkhoa: 'Khoa Tai Mũi Họng' }
      ]
    }
  }
}

export default doctorService
