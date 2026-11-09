import { useState, useEffect, useCallback } from 'react'
import patientService from '../services/patientService'

export function usePatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    try {
      const data = await patientService.getAll()
      setPatients(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const addPatient = async (patientData) => {
    const created = await patientService.create(patientData)
    setPatients(prev => [created, ...prev])
    return created
  }

  const deletePatient = async (id) => {
    await patientService.delete(id)
    setPatients(prev => prev.filter(p => p.id !== id))
  }

  return { patients, loading, error, refresh: fetchPatients, addPatient, deletePatient }
}

export default usePatients
