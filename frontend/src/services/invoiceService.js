import api from './api'

function normalizeInvoice(inv) {
  if (!inv) return null

  const isPaid = inv.trangthaithanhtoan === 'DaThanhToan' || inv.status === 'PAID'
  const dateStr = inv.ngaylap 
    ? (typeof inv.ngaylap === 'string' ? inv.ngaylap.split('T')[0] : new Date(inv.ngaylap).toISOString().split('T')[0]) 
    : (inv.date || new Date().toISOString().split('T')[0])

  const items = (inv.chitiethoadon || inv.items || []).map((it, idx) => ({
    id: it.macthd || idx + 1,
    name: it.ten || it.tendichvu || it.tenthuoc || it.dichvu?.tendichvu || it.thuoc?.tenthuoc || it.name || 'Dịch vụ y tế',
    price: Number(it.dongia || it.price || 0),
    dongia: Number(it.dongia || it.price || 0),
    quantity: Number(it.soluong || it.quantity || 1),
    soluong: Number(it.soluong || it.quantity || 1),
    subtotal: Number(it.thanhtien || (Number(it.dongia || it.price || 0) * Number(it.soluong || it.quantity || 1)))
  }))

  const methodMap = {
    TienMat: 'Tiền mặt',
    ChuyenKhoan: 'Chuyển khoản (VietQR)',
    TheThanhToan: 'Thẻ thanh toán (POS)',
    ViDienTu: 'Ví điện tử'
  }

  const patientName = inv.benhnhan?.hoten || inv.patientName || 'Bệnh Nhân'
  const patientPhone = inv.benhnhan?.sdt || inv.phone || ''

  return {
    id: inv.mahd || inv.id,
    mahd: inv.mahd || inv.id,
    malsk: inv.malsk,
    mabn: inv.mabn,
    code: inv.code || `HD${String(inv.mahd || inv.id).padStart(3, '0')}`,
    patientName,
    phone: patientPhone,
    date: dateStr,
    ngaylap: dateStr,
    totalAmount: Number(inv.tongtien || inv.totalAmount || 0),
    tongtien: Number(inv.tongtien || inv.totalAmount || 0),
    status: isPaid ? 'PAID' : 'UNPAID',
    trangthaithanhtoan: inv.trangthaithanhtoan || (isPaid ? 'DaThanhToan' : 'ChuaThanhToan'),
    paymentMethod: methodMap[inv.phuongthuctt] || inv.paymentMethod || (isPaid ? 'Tiền mặt' : 'Chưa thanh toán'),
    phuongthuctt: inv.phuongthuctt || 'TienMat',
    lichsukham: inv.lichsukham || null,
    items
  }
}

export const invoiceService = {
  async getAll(params = {}) {
    try {
      const res = await api.get('/invoices', params)
      const list = Array.isArray(res) 
        ? res 
        : (Array.isArray(res?.data) 
            ? res.data 
            : (Array.isArray(res?.invoices) ? res.invoices : []))
      return list.map(normalizeInvoice)
    } catch (err) {
      console.error('[invoiceService.getAll] Lỗi nạp hóa đơn từ backend:', err.message)
      return []
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/invoices/${id}`)
      return normalizeInvoice(res.data || res)
    } catch (err) {
      console.error(`[invoiceService.getById] Lỗi nạp chi tiết hóa đơn #${id}:`, err.message)
      return null
    }
  },

  async updatePayment(id, paymentData = {}) {
    const payload = {
      phuongthuctt: paymentData.phuongthuctt || (paymentData.paymentMethod === 'Tiền mặt' ? 'TienMat' : 'ChuyenKhoan'),
      trangthaithanhtoan: 'DaThanhToan'
    }
    const res = await api.put(`/invoices/${id}/payment`, payload)
    return normalizeInvoice(res.data || res)
  },

  async updateStatus(id, status) {
    return this.updatePayment(id, { 
      phuongthuctt: status === 'PAID' ? 'TienMat' : 'ChuyenKhoan',
      paymentMethod: status === 'PAID' ? 'Tiền mặt' : 'Chuyển khoản' 
    })
  }
}

export default invoiceService
