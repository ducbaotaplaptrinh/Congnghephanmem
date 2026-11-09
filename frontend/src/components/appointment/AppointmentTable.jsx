import StatusBadge from '../common/StatusBadge'

export default function AppointmentTable({ appointments = [], onUpdateStatus }) {
  if (!appointments.length) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>
        Không có lịch hẹn nào
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Mã</th>
            <th>Bệnh Nhân</th>
            <th>Điện Thoại</th>
            <th>Bác Sĩ</th>
            <th>Khoa</th>
            <th>Thời Gian</th>
            <th>Trạng Thái</th>
            <th className="text-end">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((item) => (
            <tr key={item.id}>
              <td className="fw-semibold text-primary">#{item.code || item.id}</td>
              <td className="fw-bold">{item.patientName}</td>
              <td>{item.phone}</td>
              <td>{item.doctorName}</td>
              <td>{item.department}</td>
              <td>
                <span className="d-block">{item.appointmentDate}</span>
                <small className="text-muted">{item.timeSlot || ''}</small>
              </td>
              <td>
                <StatusBadge status={item.status} />
              </td>
              <td className="text-end">
                <div className="btn-group btn-group-sm">
                  <button 
                    className="btn btn-outline-success" 
                    title="Xác nhận"
                    onClick={() => onUpdateStatus && onUpdateStatus(item.id, 'CONFIRMED')}
                  >
                    <i className="bi bi-check-lg"></i>
                  </button>
                  <button 
                    className="btn btn-outline-primary" 
                    title="Hoàn thành khám"
                    onClick={() => onUpdateStatus && onUpdateStatus(item.id, 'COMPLETED')}
                  >
                    <i className="bi bi-clipboard2-check"></i>
                  </button>
                  <button 
                    className="btn btn-outline-danger" 
                    title="Hủy lịch"
                    onClick={() => onUpdateStatus && onUpdateStatus(item.id, 'CANCELLED')}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
