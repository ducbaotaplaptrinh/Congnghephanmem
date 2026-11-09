import { useState, useEffect, useCallback } from 'react'
import appointmentService from '../services/appointmentService'

export function useAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const data = await appointmentService.getAll()
      setAppointments(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const updateStatus = async (id, status) => {
    await appointmentService.updateStatus(id, status)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  return { appointments, loading, error, refresh: fetchAppointments, updateStatus }
}

export default useAppointments
