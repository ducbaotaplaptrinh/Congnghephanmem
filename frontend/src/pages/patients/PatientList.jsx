import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import PatientTable from '../../components/patient/PatientTable'
import usePatients from '../../hooks/usePatients'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function PatientList() {
  const { patients, loading, error, deletePatient } = usePatients()
  const [search, setSearch] = useState('')

  const filteredPatients = patients.filter(p => 
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search) ||
    p.code?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bệnh nhân này?')) return
    try { await deletePatient(id) } catch (err) { alert('Không thể xóa bệnh nhân: ' + err.message) }
  }

  return (
    <AdminLayout title="Quản Lý Hồ Sơ Bệnh Nhân">
      {/* 1. Thanh Công Cụ & Thêm Mới */}
      <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="input-group input-group-sm" style={{ maxWidth: '380px' }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Tìm theo tên, SĐT, mã bệnh nhân..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small d-none d-sm-inline">
                Tổng cộng: <strong>{filteredPatients.length}</strong> bệnh nhân
              </span>
              <span className="text-muted small">Thêm và sửa bệnh nhân chưa được hỗ trợ.</span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">Không thể tải bệnh nhân: {error}</div>}

      {/* 2. Bảng Danh Sách Bệnh Nhân */}
      <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4">
              <LoadingSpinner text="Đang tải danh sách bệnh nhân..." />
            </div>
          ) : (
            <PatientTable 
              patients={filteredPatients}
              onDelete={handleDelete}
              onView={(p) => alert(`Hồ sơ bệnh nhân: ${p.fullName} - SĐT: ${p.phone} - Nhóm máu: ${p.bloodGroup || 'O+'}`)}
            />
          )}
        </div>
      </div>

    </AdminLayout>
  )
}
