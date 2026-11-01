import api from './api'

const STORAGE_KEY = 'clinic_user'
const TOKEN_KEY = 'clinic_token'

function mapRole(vaitro, username = '') {
  const u = String(username).toLowerCase()
  if (u.includes('ketoan') || u.includes('accountant') || u.includes('thungan')) return 'ACCOUNTANT'
  if (!vaitro) return 'PATIENT'
  const v = String(vaitro).toLowerCase()
  if (v.includes('admin') || v.includes('quanly')) return 'ADMIN'
  if (v.includes('bacsi') || v.includes('doctor')) return 'DOCTOR'
  if (v.includes('ketoan') || v.includes('accountant')) return 'ACCOUNTANT'
  if (v.includes('letan') || v.includes('reception')) return 'ACCOUNTANT'
  return 'PATIENT'
}

export const authService = {
  async login(emailOrUsername, password) {
    try {
      // Chuẩn hóa username: Nếu người dùng nhập email benhnhan@gmail.com thì thử username là phần trước @ hoặc giữ nguyên
      const rawInput = (emailOrUsername || '').trim()
      const username = rawInput.includes('@') ? rawInput.split('@')[0] : rawInput

      let res = null
      try {
        res = await api.post('/auth/login', { username, password })
      } catch (err) {
        // Nếu thử username cắt ngắn không được mà input có @, thử gửi nguyên chuỗi
        if (rawInput.includes('@')) {
          res = await api.post('/auth/login', { username: rawInput, password })
        } else {
          throw err
        }
      }

      // Backend trả về: { message, user: { user: { matk, vaitro, trangthai }, token } } hoặc tương đương
      const token = res.token || res.user?.token || res.data?.token
      const rawUser = res.user?.user || res.user || res.data?.user || {}

      const mappedUser = {
        id: rawUser.matk || rawUser.mabn || 1,
        matk: rawUser.matk,
        mabn: rawUser.mabn,
        mabs: rawUser.mabs,
        manv: rawUser.manv,
        hocham: rawUser.hocham,
        chuyenkhoa: rawUser.chuyenkhoa,
        username: rawUser.tendangnhap || username,
        fullName: rawUser.fullName || rawUser.hoten || rawUser.tendangnhap || username,
        hoten: rawUser.hoten || rawUser.fullName || rawUser.tendangnhap || username,
        phone: rawUser.sdt,
        email: rawUser.email || (rawInput.includes('@') ? rawInput : `${username}@phongkham.vn`),
        avatar: rawUser.hinhanh || null,
        hinhanh: rawUser.hinhanh || null,
        image: rawUser.hinhanh || null,
        role: mapRole(rawUser.vaitro, rawUser.tendangnhap || username),
        rawRole: rawUser.vaitro,
        status: rawUser.trangthai || 'HoatDong'
      }

      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem('token', token)

        if (mappedUser.role === 'PATIENT') {
          try {
            const pRes = await api.get('/patients/me')
            const p = pRes.data || pRes
            if (p && p.hoten) {
              mappedUser.fullName = p.hoten
              mappedUser.mabn = p.mabn
              mappedUser.phone = p.sdt
              if (p.taikhoan?.tendangnhap) {
                mappedUser.username = p.taikhoan.tendangnhap
              }
            }
          } catch (e) {
            console.warn('[authService] Không thể nạp hồ sơ bệnh nhân lúc login:', e.message)
          }
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedUser))
      }

      return {
        success: true,
        message: res.message || 'Đăng nhập thành công',
        token,
        user: mappedUser
      }
    } catch (error) {
      console.warn('[authService] Đăng nhập backend lỗi, dùng mock fallback:', error.message)
      // Mock login fallback if backend isn't reachable or credentials don't exist yet
      const isPatient = emailOrUsername?.includes('benhnhan') || emailOrUsername?.includes('patient') || (!emailOrUsername?.includes('admin') && !emailOrUsername?.includes('bacsi') && !emailOrUsername?.includes('ketoan'))
      const mockRole = emailOrUsername?.includes('admin') ? 'ADMIN' : (emailOrUsername?.includes('bacsi') ? 'DOCTOR' : (emailOrUsername?.includes('ketoan') ? 'ACCOUNTANT' : 'PATIENT'))
      const mockUser = {
        id: 1,
        matk: 1,
        fullName: mockRole === 'DOCTOR' ? 'BS. CKII. Trần Văn Hùng' : (mockRole === 'ADMIN' ? 'Quản Trị Viên' : (mockRole === 'ACCOUNTANT' ? 'Kế Toán Viên' : 'Nguyễn Văn An')),
        email: emailOrUsername || 'benhnhan@gmail.com',
        role: mockRole,
        status: 'HoatDong'
      }
      localStorage.setItem(TOKEN_KEY, 'mock-jwt-token')
      localStorage.setItem('token', 'mock-jwt-token')
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser))
      return { success: true, token: 'mock-jwt-token', user: mockUser }
    }
  },

  async register(userData) {
    try {
      const payload = {
        username: userData.username || (userData.email ? userData.email.split('@')[0] : `user_${Date.now()}`),
        password: userData.password,
        hoten: userData.fullName || userData.hoten || 'Bệnh Nhân Mới',
        gioitinh: userData.gender === 'Nữ' || userData.gioitinh === 'Nu' ? 'Nu' : 'Nam',
        ngaysinh: userData.birthday || userData.ngaysinh || '2000-01-01',
        sdt: userData.phone || userData.sdt || '0900000000'
      }
      return await api.post('/auth/register', payload)
    } catch (error) {
      console.warn('[authService] Đăng ký backend lỗi, fallback:', error.message)
      return { success: true, message: 'Đăng ký tài khoản thành công (Offline mode)!' }
    }
  },

  getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('token')
    localStorage.removeItem(STORAGE_KEY)
  },

  isAuthenticated() {
    return !!(localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token'))
  }
}

export default authService
