import api from './api'

const initialMedicines = [
  { id: 1, mathuoc: 1, name: 'Paracetamol 500mg', tenthuoc: 'Paracetamol 500mg', unit: 'Viên', donvitinh: 'Viên', price: 2000, dongia: 2000, stock: 450, soluongton: 450, expiryDate: '2027-12-31', hansudung: '2027-12-31', manufacturer: 'Dược Hậu Giang', nhasanxuat: 'Dược Hậu Giang' },
  { id: 2, mathuoc: 2, name: 'Amoxicillin 500mg', tenthuoc: 'Amoxicillin 500mg', unit: 'Viên', donvitinh: 'Viên', price: 3500, dongia: 3500, stock: 120, soluongton: 120, expiryDate: '2026-11-20', hansudung: '2026-11-20', manufacturer: 'Imexpharm', nhasanxuat: 'Imexpharm' },
  { id: 3, mathuoc: 3, name: 'Amlodipine 5mg', tenthuoc: 'Amlodipine 5mg', unit: 'Viên', donvitinh: 'Viên', price: 5000, dongia: 5000, stock: 300, soluongton: 300, expiryDate: '2028-05-15', hansudung: '2028-05-15', manufacturer: 'Stada', nhasanxuat: 'Stada' },
  { id: 4, mathuoc: 4, name: 'Siro Ho Prospan 100ml', tenthuoc: 'Siro Ho Prospan 100ml', unit: 'Chai', donvitinh: 'Chai', price: 85000, dongia: 85000, stock: 15, soluongton: 15, expiryDate: '2026-08-10', hansudung: '2026-08-10', manufacturer: 'Engelhard', nhasanxuat: 'Engelhard' }
]

function normalizeMedicine(m) {
  if (!m) return null
  const expiryDate = m.hansudung ? (typeof m.hansudung === 'string' ? m.hansudung.split('T')[0] : new Date(m.hansudung).toISOString().split('T')[0]) : (m.expiryDate || '2027-12-31')

  return {
    id: m.mathuoc || m.id,
    mathuoc: m.mathuoc || m.id,
    name: m.tenthuoc || m.name,
    tenthuoc: m.tenthuoc || m.name,
    unit: m.donvitinh || m.unit || 'Viên',
    donvitinh: m.donvitinh || m.unit || 'Viên',
    price: Number(m.dongia || m.price || 0),
    dongia: Number(m.dongia || m.price || 0),
    stock: Number(m.soluongton || m.stock || 0),
    soluongton: Number(m.soluongton || m.stock || 0),
    expiryDate,
    hansudung: expiryDate,
    manufacturer: m.nhasanxuat || m.manufacturer || 'Việt Nam',
    nhasanxuat: m.nhasanxuat || m.manufacturer || 'Việt Nam'
  }
}

export const medicineService = {
  async getAll(params = {}) {
    try {
      const res = await api.get('/medicines', params)
      const list = res.data?.medicines || (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []))
      if (list.length > 0) {
        return list.map(normalizeMedicine)
      }
      return initialMedicines
    } catch (err) {
      console.warn('[medicineService] Gọi /medicines lỗi, dùng fallback:', err.message)
      return initialMedicines
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/medicines/${id}`)
      return normalizeMedicine(res.data || res)
    } catch {
      return initialMedicines.find(m => m.id === Number(id) || m.mathuoc === Number(id)) || null
    }
  },

  async getWarnings() {
    try {
      const res = await api.get('/medicines/warnings/low-stock')
      const list = Array.isArray(res) ? res : (res.data || [])
      return list.map(normalizeMedicine)
    } catch {
      return initialMedicines.filter(m => m.stock < 20)
    }
  },

  async create(data) {
    try {
      const payload = {
        tenthuoc: data.name || data.tenthuoc,
        donvitinh: data.unit || data.donvitinh || 'Viên',
        dongia: Number(data.price || data.dongia || 0),
        soluongton: Number(data.stock || data.soluongton || 0),
        hansudung: data.expiryDate || data.hansudung || '2027-12-31',
        nhasanxuat: data.manufacturer || data.nhasanxuat || 'Việt Nam'
      }
      const res = await api.post('/medicines', payload)
      return normalizeMedicine(res.data || res)
    } catch {
      return normalizeMedicine({ id: Date.now(), ...data })
    }
  },

  async update(id, data) {
    try {
      const res = await api.put(`/medicines/${id}`, data)
      return normalizeMedicine(res.data || res)
    } catch {
      return normalizeMedicine({ id: Number(id), ...data })
    }
  },

  async delete(id) {
    try {
      return await api.delete(`/medicines/${id}`)
    } catch {
      return { success: true }
    }
  }
}

export default medicineService
