import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import AppointmentTable from '../../components/appointment/AppointmentTable'
import useAppointments from '../../hooks/useAppointments'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function AppointmentList() {
  const { appointments, loading, updateStatus } = useAppointments()
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [search, setSearch] = useState('')

  const filtered = appointments.filter(a => {
    const matchStatus = filterStatus === 'ALL' || a.status === filterStatus
    const matchSearch = a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
                        a.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
                        a.phone?.includes(search)
    return matchStatus && matchSearch
  })

  return (
    <AdminLayout title="Quản Lý Lịch Hẹn Khám Bệnh">
      <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0" 
                  placeholder="Tìm theo tên bệnh nhân, bác sĩ, SĐT..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-6 d-flex gap-2 justify-content-md-end overflow-auto">
              {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  className={`btn btn-sm rounded-pill px-3 ${filterStatus === st ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setFilterStatus(st)}
                >
                  {st === 'ALL' ? 'Tất cả' : st === 'PENDING' ? 'Chờ xác nhận' : st === 'CONFIRMED' ? 'Đã xác nhận' : st === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner text="Đang tải danh sách lịch hẹn..." />
          ) : (
            <AppointmentTable 
              appointments={filtered} 
              onUpdateStatus={updateStatus}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
