import api from './api'

export const userService = {
  async getAll() {
    try {
      const res = await api.get('/auth/users')
      const list = res.data || (Array.isArray(res) ? res : [])
      return Array.isArray(list) ? list : []
    } catch (err) {
      console.warn('[userService] Lỗi tải danh sách người dùng:', err.message)
      return []
    }
  },

  async toggleStatus(id) {
    try {
      const res = await api.put(`/auth/users/${id}/status`)
      return res.data || res
    } catch (err) {
      console.warn('[userService] Lỗi đổi trạng thái tài khoản:', err.message)
      throw err
    }
  },

  async create(userData) {
    try {
      const res = await api.post('/auth/users', userData)
      return res.data || res
    } catch (err) {
      console.warn('[userService] Lỗi tạo tài khoản mới:', err.message)
      throw err
    }
  }
}

export default userService
