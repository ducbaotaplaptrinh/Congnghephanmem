import { useState, useEffect } from 'react'
import DoctorLayout from '../../components/layout/DoctorLayout'
import appointmentService from '../../services/appointmentService'
import { useAuth } from '../../hooks/useAuth'

export default function DoctorAppointments() {
  const { user } = useAuth()
  const todayStr = new Date().toISOString().split('T')[0]
  
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState(todayStr)

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const data = await appointmentService.getAll()
      // Nếu là Bác sĩ đăng nhập, chỉ hiển thị lịch hẹn của chính bác sĩ đó
      let doctorApts = data || []
      if (user?.role === 'DOCTOR') {
        doctorApts = (data || []).filter(a => {
          if (user?.mabs && a.mabs) return Number(a.mabs) === Number(user.mabs)
          if (user?.fullName && a.doctorName) return a.doctorName.toLowerCase().includes(user.fullName.toLowerCase())
          return false
        })
      }
      setAppointments(doctorApts)
    } catch (err) {
      console.warn('Lỗi tải lịch khám:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [user])

  const filtered = appointments.filter(a => {
    const aptDate = a.appointmentDate || a.date
    const matchSearch = (a.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (a.phone || '').includes(searchTerm) ||
      (a.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter
    const matchDate = selectedDate ? aptDate === selectedDate : true
    return matchSearch && matchStatus && matchDate
  })

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await appointmentService.updateStatus(id, newStatus)
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err)
    }
  }

  return (
    <DoctorLayout title="Lịch Khám Của Tôi" subtitle="Danh sách bệnh nhân hẹn khám trước được phân công cho bác sĩ">
      
      {/* Thống kê nhanh */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 bg-white p-3 border-start border-primary border-4">
            <div className="text-muted small">Tổng ca hôm nay</div>
            <div className="fw-bold fs-4 text-dark">{appointments.length}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 bg-white p-3 border-start border-success border-4">
            <div className="text-muted small">Đã xác nhận</div>
            <div className="fw-bold fs-4 text-success">{appointments.filter(a => a.status === 'CONFIRMED').length}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 bg-white p-3 border-start border-warning border-4">
            <div className="text-muted small">Chờ xác nhận</div>
            <div className="fw-bold fs-4 text-warning-emphasis">{appointments.filter(a => a.status === 'PENDING').length}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 bg-white p-3 border-start border-danger border-4">
            <div className="text-muted small">Hủy / Vắng mặt</div>
            <div className="fw-bold fs-4 text-danger">{appointments.filter(a => a.status === 'CANCELLED').length}</div>
          </div>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="card border-0 shadow-sm rounded-3 bg-white p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Tìm tên bệnh nhân hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <input 
              type="date" 
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-3">
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div className="col-12 col-md-2 text-md-end">
            <button 
              className="btn btn-outline-secondary w-100"
              onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setSelectedDate(''); }}
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i> Tất cả ngày
            </button>
          </div>
        </div>
      </div>

      {/* Bảng danh sách lịch hẹn */}
      <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13.5px' }}>
            <thead className="table-light">
              <tr>
                <th style={{ width: '90px' }}>Mã hẹn</th>
                <th>Khung Giờ</th>
                <th>Bệnh Nhân</th>
                <th>Điện Thoại</th>
                <th>Phân Loại</th>
                <th>Ghi Chú Triệu Chứng</th>
                <th style={{ width: '130px' }} className="text-center">Trạng Thái</th>
                <th style={{ width: '140px' }} className="text-end pe-3">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="fw-bold text-primary">{item.code}</td>
                  <td>
                    <span className="badge bg-light text-dark border px-2 py-1">
                      <i className="bi bi-clock me-1 text-primary"></i>{item.timeSlot}
                    </span>
                  </td>
                  <td>
                    <div className="fw-semibold text-dark">{item.patientName}</div>
                  </td>
                  <td>{item.phone}</td>
                  <td>
                    <span className="badge bg-info-subtle text-info border">
                      {item.type}
                    </span>
                  </td>
                  <td className="text-secondary text-truncate" style={{ maxWidth: '220px' }} title={item.notes}>
                    {item.notes}
                  </td>
                  <td className="text-center">
                    {item.status === 'CONFIRMED' && (
                      <span className="badge bg-success-subtle text-success border border-success">
                        Đã xác nhận
                      </span>
                    )}
                    {item.status === 'PENDING' && (
                      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning">
                        Chờ xác nhận
                      </span>
                    )}
                    {item.status === 'CANCELLED' && (
                      <span className="badge bg-danger-subtle text-danger border border-danger">
                        Đã hủy
                      </span>
                    )}
                  </td>
                  <td className="text-end pe-3">
                    {item.status === 'PENDING' && (
                      <button 
                        className="btn btn-sm btn-success me-1 py-1 px-2"
                        onClick={() => handleUpdateStatus(item.id, 'CONFIRMED')}
                        title="Tiếp nhận lịch"
                      >
                        <i className="bi bi-check-lg"></i>
                      </button>
                    )}
                    <button 
                      className="btn btn-sm btn-outline-danger py-1 px-2"
                      onClick={() => handleUpdateStatus(item.id, 'CANCELLED')}
                      title="Hủy lịch"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    Không tìm thấy lịch hẹn nào theo điều kiện lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </DoctorLayout>
  )
}
