import api from './api'

const fallbackOverview = {
  totalPatients: 1420,
  totalAppointments: 380,
  totalDoctors: 24,
  monthlyRevenue: 125000000,
  completedAppointments: 320,
  pendingAppointments: 45,
  growthRate: '+12.5%'
}

export const statisticService = {
  async getOverview() {
    try {
      const res = await api.get('/statistics/overview')
      return res.data || res || fallbackOverview
    } catch {
      return fallbackOverview
    }
  },

  async getRevenue(params = {}) {
    try {
      const res = await api.get('/statistics/revenue', params)
      return res.data || res || []
    } catch {
      return [
        { month: 'T1', revenue: 85000000 },
        { month: 'T2', revenue: 92000000 },
        { month: 'T3', revenue: 105000000 },
        { month: 'T4', revenue: 110000000 },
        { month: 'T5', revenue: 125000000 }
      ]
    }
  },

  async getAppointmentStats() {
    try {
      const res = await api.get('/statistics/appointments')
      return res.data || res
    } catch {
      return {
        confirmed: 210,
        completed: 140,
        pending: 30
      }
    }
  }
}

export default statisticService
