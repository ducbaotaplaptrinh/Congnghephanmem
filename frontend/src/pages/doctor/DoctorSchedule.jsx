import DoctorLayout from '../../components/layout/DoctorLayout'
import { useAuth } from '../../hooks/useAuth'

const WEEK_SCHEDULE = [
  { day: 'Thứ Hai', date: '05/10/2026', morning: { room: 'P.102 - Phòng Khám Bệnh', time: '07:30 - 11:30', status: 'COMPLETED' }, afternoon: { room: 'P.102 - Phòng Khám Bệnh', time: '13:30 - 17:00', status: 'COMPLETED' } },
  { day: 'Thứ Ba', date: '06/10/2026', morning: { room: 'P.102 - Phòng Khám Bệnh', time: '07:30 - 11:30', status: 'COMPLETED' }, afternoon: { room: 'Hội Chẩn Chuyên Môn', time: '14:00 - 16:30', status: 'COMPLETED' } },
  { day: 'Thứ Tư', date: '07/10/2026', morning: { room: 'P.102 - Phòng Khám Bệnh', time: '07:30 - 11:30', status: 'COMPLETED' }, afternoon: { room: 'Nghỉ ca', time: '-', status: 'OFF' } },
  { day: 'Thứ Năm', date: '08/10/2026', morning: { room: 'P.102 - Phòng Khám Bệnh', time: '07:30 - 11:30', status: 'COMPLETED' }, afternoon: { room: 'P.102 - Phòng Khám Bệnh', time: '13:30 - 17:00', status: 'COMPLETED' } },
  { day: 'Thứ Sáu', date: '09/10/2026', morning: { room: 'P.102 - Phòng Khám Bệnh', time: '07:30 - 11:30', status: 'COMPLETED' }, afternoon: { room: 'P.102 - Phòng Khám Bệnh', time: '13:30 - 17:00', status: 'COMPLETED' } },
  { day: 'Thứ Bảy (Hôm nay)', date: '10/10/2026', morning: { room: 'P.102 - Phòng Khám Bệnh', time: '07:30 - 11:30', status: 'ACTIVE' }, afternoon: { room: 'Trực Khối Nội Viện', time: '13:30 - 17:00', status: 'UPCOMING' } },
  { day: 'Chủ Nhật', date: '11/10/2026', morning: { room: 'Nghỉ cuối tuần', time: '-', status: 'OFF' }, afternoon: { room: 'Nghỉ cuối tuần', time: '-', status: 'OFF' } }
]

export default function DoctorSchedule() {
  const { user } = useAuth()
  return (
    <DoctorLayout title="Lịch Trực & Ca Làm" subtitle="Lịch phân công trực phòng khám và ca lâm sàng theo tuần">
      
      <div className="card border-0 shadow-sm rounded-3 bg-white p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <h6 className="fw-bold text-dark mb-0">Lịch phân công ca làm việc phòng khám</h6>
            <div className="text-muted small mt-1">
              {user?.chuyenkhoa || 'Phòng Khám Đa Khoa'} • {user?.fullName ? (user.hocham ? `${user.hocham}. ${user.fullName}` : `BS. ${user.fullName}`) : 'Bác Sĩ'}
            </div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-primary" onClick={() => alert('Yêu cầu đổi ca đã gửi tới Trưởng Khoa!')}>
              <i className="bi bi-arrow-left-right me-1"></i> Đăng Ký Đổi Ca
            </button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => window.print()}>
              <i className="bi bi-printer me-1"></i> In Lịch Trực
            </button>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-bordered align-middle mb-0" style={{ fontSize: '13.5px' }}>
            <thead className="table-light text-center">
              <tr>
                <th style={{ width: '180px' }}>Thứ / Ngày</th>
                <th>Ca Sáng (07:30 - 11:30)</th>
                <th>Ca Chiều (13:30 - 17:00)</th>
              </tr>
            </thead>
            <tbody>
              {WEEK_SCHEDULE.map((s, idx) => (
                <tr key={idx} className={s.morning.status === 'ACTIVE' ? 'table-warning-subtle' : ''}>
                  <td className="fw-bold text-dark">
                    <div>{s.day}</div>
                    <div className="text-muted small fw-normal">{s.date}</div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="fw-semibold text-dark">{s.morning.room}</div>
                        <div className="text-muted small"><i className="bi bi-clock me-1"></i>{s.morning.time}</div>
                      </div>
                      <div>
                        {s.morning.status === 'ACTIVE' && (
                          <span className="badge bg-success text-white border">Đang trực</span>
                        )}
                        {s.morning.status === 'COMPLETED' && (
                          <span className="badge bg-light text-secondary border">Đã xong</span>
                        )}
                        {s.morning.status === 'OFF' && (
                          <span className="badge bg-light text-muted border">Nghỉ</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="fw-semibold text-dark">{s.afternoon.room}</div>
                        <div className="text-muted small"><i className="bi bi-clock me-1"></i>{s.afternoon.time}</div>
                      </div>
                      <div>
                        {s.afternoon.status === 'UPCOMING' && (
                          <span className="badge bg-primary text-white border">Sắp tới</span>
                        )}
                        {s.afternoon.status === 'COMPLETED' && (
                          <span className="badge bg-light text-secondary border">Đã xong</span>
                        )}
                        {s.afternoon.status === 'OFF' && (
                          <span className="badge bg-light text-muted border">Nghỉ</span>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </DoctorLayout>
  )
}
