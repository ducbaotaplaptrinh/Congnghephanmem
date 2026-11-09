const statusColors = {
  // Appointment status
  'PENDING': 'warning',
  'CONFIRMED': 'primary',
  'COMPLETED': 'success',
  'CANCELLED': 'danger',
  // Invoice status
  'PAID': 'success',
  'UNPAID': 'danger',
  'PARTIAL': 'warning',
  // Generic
  'ACTIVE': 'success',
  'INACTIVE': 'secondary'
}

const statusLabels = {
  'PENDING': 'Chờ xác nhận',
  'CONFIRMED': 'Đã xác nhận',
  'COMPLETED': 'Hoàn thành',
  'CANCELLED': 'Đã hủy',
  'PAID': 'Đã thanh toán',
  'UNPAID': 'Chưa thanh toán',
  'PARTIAL': 'Thanh toán một phần',
  'ACTIVE': 'Đang hoạt động',
  'INACTIVE': 'Ngừng hoạt động'
}

export default function StatusBadge({ status }) {
  const color = statusColors[status] || 'secondary'
  const label = statusLabels[status] || status

  return (
    <span className={`badge bg-${color} px-2 py-1 rounded-pill`}>
      {label}
    </span>
  )
}
