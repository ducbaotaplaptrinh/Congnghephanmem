import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import PatientTable from '../../components/patient/PatientTable'
import PatientForm from '../../components/patient/PatientForm'
import usePatients from '../../hooks/usePatients'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function PatientList() {
  const { patients, loading, addPatient, deletePatient } = usePatients()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [toastMsg, setToastMsg] = useState('')

  const filteredPatients = patients.filter(p => 
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search) ||
    p.code?.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreatePatient = async (data) => {
    await addPatient(data)
    setShowModal(false)
    setToastMsg(selectedPatient ? 'Đã cập nhật hồ sơ bệnh nhân!' : 'Đã thêm bệnh nhân mới thành công!')
    setTimeout(() => setToastMsg(''), 3000)
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
              <button 
                className="btn btn-primary btn-sm px-3 d-flex align-items-center"
                onClick={() => { setSelectedPatient(null); setShowModal(true) }}
              >
                <i className="bi bi-person-plus-fill me-1"></i>
                <span>Thêm Bệnh Nhân Mới</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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
              onDelete={deletePatient}
              onView={(p) => alert(`Hồ sơ bệnh nhân: ${p.fullName} - SĐT: ${p.phone} - Nhóm máu: ${p.bloodGroup || 'O+'}`)}
              onEdit={(p) => { setSelectedPatient(p); setShowModal(true) }}
            />
          )}
        </div>
      </div>

      {/* 3. MODAL THÊM / SỬA BỆNH NHÂN - GHIM THANH TIÊU ĐỀ & NÚT BẤM */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(3px)', zIndex: 1055 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered" style={{ maxWidth: '780px' }}>
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden d-flex flex-column" style={{ maxHeight: '90vh' }}>
              
              {/* NỀN TIÊU ĐỀ GRADIENT THƯƠNG HIỆU - GHIM CỐ ĐỊNH */}
              <div 
                className="modal-header py-3 px-4 text-white border-0 flex-shrink-0 no-print"
                style={{ 
                  background: 'linear-gradient(135deg, #175cdd 0%, #10b981 100%)'
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <i className="bi bi-person-plus-fill fs-5 text-white"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-white mb-0" style={{ fontSize: '1.05rem' }}>
                      {selectedPatient ? 'Chỉnh Sửa Hồ Sơ Bệnh Nhân' : 'Tiếp Nhận & Thêm Bệnh Nhân Mới'}
                    </h5>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)' }}>
                      Phòng Khám Đa Khoa Phú Lợi Bảo • Quản lý hồ sơ bệnh án điện tử
                    </span>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowModal(false)}
                  aria-label="Đóng"
                ></button>
              </div>

              {/* FORM BỆNH NHÂN VỚI BODY CUỘN VÀ FOOTER GHIM CỐ ĐỊNH */}
              <PatientForm 
                initialData={selectedPatient}
                onSubmit={handleCreatePatient}
                onCancel={() => setShowModal(false)}
              />

            </div>
          </div>
        </div>
      )}

      {/* Toast thông báo */}
      {toastMsg && (
        <div 
          className="position-fixed bottom-0 end-0 m-3 p-3 bg-dark text-white rounded-3 shadow"
          style={{ zIndex: 3000, fontSize: '13.5px' }}
        >
          <i className="bi bi-check-circle-fill text-success me-2 fs-5"></i>
          {toastMsg}
        </div>
      )}
    </AdminLayout>
  )
}
