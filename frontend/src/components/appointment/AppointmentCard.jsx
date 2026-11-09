import StatusBadge from '../common/StatusBadge'

export default function AppointmentCard({ appointment, onStatusChange }) {
  if (!appointment) return null

  return (
    <div className="card h-100 shadow-sm border-0 rounded-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="fw-semibold text-primary">#{appointment.code || appointment.id}</span>
          <StatusBadge status={appointment.status} />
        </div>

        <h6 className="card-title fw-bold mb-1">{appointment.patientName}</h6>
        <div className="text-muted small mb-2"><i className="bi bi-telephone me-1"></i>{appointment.phone}</div>

        <div className="bg-light p-2 rounded mb-3 small">
          <div><strong>Bác sĩ:</strong> {appointment.doctorName || 'Chưa chỉ định'}</div>
          <div><strong>Khoa:</strong> {appointment.department || 'Đa Khoa'}</div>
          <div><strong>Thời gian:</strong> {appointment.appointmentDate} {appointment.timeSlot}</div>
        </div>

        {appointment.notes && (
          <p className="card-text text-muted small mb-3">
            <em>"{appointment.notes}"</em>
          </p>
        )}

        {onStatusChange && (
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-success btn-sm flex-grow-1"
              onClick={() => onStatusChange(appointment.id, 'CONFIRMED')}
            >
              Xác nhận
            </button>
            <button 
              className="btn btn-outline-danger btn-sm flex-grow-1"
              onClick={() => onStatusChange(appointment.id, 'CANCELLED')}
            >
              Hủy
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
