import api from './api'

const initialShifts = [
  { id: 1, date: '2026-10-26', shiftName: 'Ca sáng (07:30 - 11:30)', room: 'Phòng 101 - Khám Tim Mạch', role: 'Bác sĩ chính', status: 'Sắp tới' },
  { id: 2, date: '2026-10-27', shiftName: 'Ca chiều (13:30 - 17:00)', room: 'Phòng 101 - Khám Tim Mạch', role: 'Bác sĩ chính', status: 'Sắp tới' },
  { id: 3, date: '2026-10-28', shiftName: 'Ca trực cấp cứu (17:00 - 21:00)', room: 'Phòng Cấp Cứu', role: 'Bác sĩ trực', status: 'Sắp tới' }
]

export const shiftService = {
  async getAll(params = {}) {
    try {
      const res = await api.get('/shifts', params)
      const list = Array.isArray(res) ? res : (res.data || [])
      return list.length > 0 ? list : initialShifts
    } catch {
      return initialShifts
    }
  },

  async getMySchedule() {
    try {
      const res = await api.get('/shifts/my-schedule')
      const list = Array.isArray(res) ? res : (res.data || [])
      return list.length > 0 ? list : initialShifts
    } catch {
      return initialShifts
    }
  }
}

export default shiftService
