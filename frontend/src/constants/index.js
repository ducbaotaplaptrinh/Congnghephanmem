export const USER_ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  STAFF: 'STAFF',
  PATIENT: 'PATIENT'
}

export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
}

export const INVOICE_STATUS = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  PARTIAL: 'PARTIAL'
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
