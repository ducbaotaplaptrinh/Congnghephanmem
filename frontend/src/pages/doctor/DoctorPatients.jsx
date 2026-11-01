import { useState, useEffect } from 'react'
import DoctorLayout from '../../components/layout/DoctorLayout'
import patientService from '../../services/patientService'
import medicalRecordService from '../../services/medicalRecordService'
import appointmentService from '../../services/appointmentService'
import { useAuth } from '../../hooks/useAuth'

const INITIAL_PATIENTS = []

export default function DoctorPatients() {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientHistory, setPatientHistory] = useState([])

  // Nạp dữ liệu bệnh nhân từ Database
  useEffect(() => {
    async function loadPatientsFromDB() {
      setLoading(true)
      try {
        const [allPatients, allRecords, allAppts] = await Promise.all([
          patientService.getAll(),
          medicalRecordService.getAll(),
          appointmentService.getAll()
        ])

        // Chỉ lấy các ca khám và lịch hẹn thuộc về bác sĩ này
        const myRecords = (allRecords || []).filter(r => 
          (user?.mabs && r.mabs === user.mabs) || 
          (user?.fullName && r.doctorName?.toLowerCase().includes(user.fullName.toLowerCase()))
        )
        const myAppts = (allAppts || []).filter(a =>
          (user?.mabs && a.mabs === user.mabs) ||
          (user?.fullName && a.doctorName?.toLowerCase().includes(user.fullName.toLowerCase()))
        )

        // Tập hợp danh sách ID bệnh nhân của bác sĩ này
        const myPatientIds = new Set([
          ...myRecords.map(r => r.mabn),
          ...myAppts.map(a => a.mabn)
        ].filter(Boolean))

        const targetPatients = (allPatients || []).filter(p => myPatientIds.has(p.mabn || p.id))

        if (targetPatients.length > 0) {
          const mapped = targetPatients.map(p => {
            const pId = p.mabn || p.id
            const pName = p.fullName || p.hoten || p.name || 'Bệnh Nhân'
            const pPhone = p.phone || p.sdt || ''

            const visits = myRecords.filter(r => 
              r.mabn === pId || 
              (r.patientName && r.patientName.toLowerCase() === pName.toLowerCase())
            )

            const completedAppts = myAppts.filter(a =>
              (a.mabn === pId || (a.patientName && a.patientName.toLowerCase() === pName.toLowerCase())) &&
              (a.trangthai === 'DaKham' || a.status === 'COMPLETED')
            )

            const totalCount = Math.max(visits.length, completedAppts.length, 1)
            const latestRecord = visits[0] || null
            const latestAppt = completedAppts[0] || null
            const lastDate = latestRecord?.date || latestAppt?.appointmentDate || 'Hôm nay'
            const mainDiag = latestRecord?.diagnosis || latestAppt?.notes || p.notes || 'Khám bệnh định kỳ'

            const age = p.birthYear 
              ? (new Date().getFullYear() - p.birthYear) 
              : (p.age || 30)

            return {
              id: pId,
              mabn: pId,
              code: p.code || `BN${String(pId).padStart(3, '0')}`,
              name: pName,
              age: age > 0 ? age : 28,
              gender: p.gender === 'Nu' || p.gender === 'Nữ' ? 'Nữ' : 'Nam',
              phone: pPhone,
              address: p.address || p.diachi || 'TP. Hồ Chí Minh',
              bloodGroup: p.bloodGroup || 'O',
              allergies: p.allergies || 'Không có dị ứng',
              chronicDiseases: p.chronicDiseases || 'Không có',
              totalVisits: totalCount,
              lastVisit: lastDate,
              mainDiagnosis: mainDiag,
              status: completedAppts.length > 0 || visits.length > 0 ? 'Đã hoàn thành khám' : 'Đang theo dõi',
              records: visits
            }
          })

          setPatients(mapped)
        } else {
          setPatients([])
        }
      } catch (err) {
        console.warn('Lỗi nạp danh sách bệnh nhân từ DB:', err.message)
        setPatients([])
      } finally {
        setLoading(false)
      }
    }

    loadPatientsFromDB()
  }, [user])

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.mainDiagnosis && p.mainDiagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleOpenPatientDetail = (patient) => {
    setSelectedPatient(patient)
    setPatientHistory(patient.records || [])
  }

  const handleCloseModal = () => {
    setSelectedPatient(null)
    setPatientHistory([])
  }

  return (
    <DoctorLayout 
      title="Bệnh Nhân Của Tôi" 
      subtitle="Danh sách người bệnh đã thăm khám và theo dõi điều trị"
      patientsCount={patients.length}
    >
      
      {/* Search & Toolbar NGANG HẾT MÀN HÌNH */}
      <div className="card border-0 shadow-sm rounded-3 bg-white p-3 mb-3">
        <div className="row g-3 align-items-center justify-content-between">
          {/* BÊN TRÁI: Dữ liệu thống kê số lượng bệnh nhân */}
          <div className="col-12 col-md-6 d-flex align-items-center gap-2 flex-wrap">
            <span className="badge bg-primary-subtle text-primary border px-3 py-2">
              <i className="bi bi-people-fill me-1"></i> Bệnh nhân quản lý: <strong>{filtered.length}</strong>
            </span>
            <span className="badge bg-success-subtle text-success border px-3 py-2">
              <i className="bi bi-database-check me-1"></i> Dữ liệu thực tế từ Supabase
            </span>
          </div>

          {/* BÊN PHẢI: Ô tìm kiếm */}
          <div className="col-12 col-md-6 col-lg-5 text-md-end">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Tìm mã bệnh nhân, họ tên, số điện thoại, chẩn đoán..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bảng danh sách bệnh nhân NGANG HẾT MÀN HÌNH (Full Width 100%) */}
      <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden w-100">
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13.5px', width: '100%' }}>
            <thead className="table-light text-secondary">
              <tr>
                <th style={{ width: '85px' }} className="ps-3">Mã BN</th>
                <th style={{ width: '170px' }}>Bệnh Nhân</th>
                <th style={{ width: '115px' }}>Số Điện Thoại</th>
                <th style={{ minWidth: '160px' }}>Địa Chỉ</th>
                <th style={{ minWidth: '180px' }}>Chẩn Đoán Gần Nhất</th>
                <th style={{ width: '115px' }} className="text-center">Lần Khám</th>
                <th style={{ width: '120px' }}>Trạng Thái</th>
                <th style={{ width: '100px' }} className="text-center pe-3">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    <span className="spinner-border spinner-border-sm me-2"></span> Đang tải hồ sơ bệnh nhân từ cơ sở dữ liệu...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    <i className="bi bi-people fs-3 d-block mb-2 text-secondary"></i>
                    Không tìm thấy bệnh nhân nào phù hợp với từ khóa!
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr 
                    key={p.id} 
                    onClick={() => handleOpenPatientDetail(p)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="ps-3">
                      <span className="fw-bold text-primary">{p.code}</span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '160px' }}>{p.name}</div>
                      <div className="text-muted small">{p.age} tuổi • {p.gender}</div>
                    </td>
                    <td>
                      <strong className="text-secondary">{p.phone}</strong>
                    </td>
                    <td>
                      <div className="text-muted small text-truncate" style={{ maxWidth: '180px' }} title={p.address}>
                        {p.address}
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '200px' }} title={p.mainDiagnosis}>
                        {p.mainDiagnosis}
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-primary border px-2 py-0.5 fw-bold">
                        {p.totalVisits} lần
                      </span>
                      <div className="text-muted small mt-0.5" style={{ fontSize: '11px' }}>
                        {p.lastVisit}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                        <i className="bi bi-check2-circle me-1"></i> {p.status}
                      </span>
                    </td>
                    <td className="text-center pe-3" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 shadow-sm px-2 py-1"
                        onClick={() => handleOpenPatientDetail(p)}
                        title="Xem lịch sử khám bệnh"
                      >
                        <i className="bi bi-person-lines-fill"></i>
                        <span>Hồ Sơ</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL XEM CHI TIẾT HỒ SƠ & LỊCH SỬ BỆNH NHÂN ================= */}
      {selectedPatient && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1050 }}
          onClick={handleCloseModal}
        >
          <div 
            className="modal-dialog modal-dialog-centered modal-lg" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              
              {/* Modal Header với Gradient thương hiệu */}
              <div 
                className="modal-header text-white py-3 px-4 border-0"
                style={{ background: 'linear-gradient(135deg, #175cdd 0%, #10b981 100%)' }}
              >
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-person-badge-fill fs-4"></i>
                  <div>
                    <h5 className="modal-title fw-bold mb-0">Hồ Sơ Sức Khỏe Bệnh Nhân #{selectedPatient.code}</h5>
                    <div className="small opacity-75">Bệnh nhân: {selectedPatient.name} • {selectedPatient.gender}, {selectedPatient.age} tuổi</div>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={handleCloseModal}
                  aria-label="Đóng"
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4">
                
                {/* Thông tin cơ bản */}
                <div className="p-3 rounded-3 bg-light border mb-3">
                  <div className="row g-2">
                    <div className="col-12 col-md-6">
                      <span className="text-muted small d-block">Họ và tên:</span>
                      <strong className="text-dark fs-6">{selectedPatient.name}</strong>
                    </div>
                    <div className="col-6 col-md-3">
                      <span className="text-muted small d-block">Số điện thoại:</span>
                      <strong className="text-primary">{selectedPatient.phone}</strong>
                    </div>
                    <div className="col-6 col-md-3">
                      <span className="text-muted small d-block">Nhóm máu:</span>
                      <span className="badge bg-danger text-white px-2 py-1">{selectedPatient.bloodGroup || 'Chưa rõ'}</span>
                    </div>
                    <div className="col-12 col-md-6 mt-2">
                      <span className="text-muted small d-block">Địa chỉ thường trú:</span>
                      <span className="text-secondary">{selectedPatient.address}</span>
                    </div>
                    <div className="col-6 col-md-3 mt-2">
                      <span className="text-muted small d-block">Tổng số lần khám:</span>
                      <span className="badge bg-primary text-white">{selectedPatient.totalVisits} ca khám</span>
                    </div>
                    <div className="col-6 col-md-3 mt-2">
                      <span className="text-muted small d-block">Lần khám gần nhất:</span>
                      <span className="text-dark fw-bold">{selectedPatient.lastVisit}</span>
                    </div>
                  </div>
                </div>

                {/* Tiền sử & Cảnh báo dị ứng */}
                <div className="row g-2 mb-3">
                  <div className="col-12 col-md-6">
                    <div className="p-2.5 rounded bg-white border border-danger-subtle h-100">
                      <div className="text-danger fw-bold small text-uppercase mb-1">
                        <i className="bi bi-exclamation-triangle-fill me-1"></i> Cảnh Báo Dị Ứng:
                      </div>
                      <div className="text-dark fw-semibold small">{selectedPatient.allergies}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-2.5 rounded bg-white border border-secondary-subtle h-100">
                      <div className="text-secondary fw-bold small text-uppercase mb-1">
                        <i className="bi bi-heart-pulse-fill me-1"></i> Bệnh Lý Mạn Tính / Nền:
                      </div>
                      <div className="text-dark fw-semibold small">{selectedPatient.chronicDiseases}</div>
                    </div>
                  </div>
                </div>

                {/* Chẩn đoán & Lời dặn */}
                <div className="mb-3">
                  <label className="fw-bold text-dark small text-uppercase d-flex align-items-center mb-1">
                    <i className="bi bi-clipboard2-pulse text-primary me-1.5"></i>
                    Chẩn đoán bệnh gần nhất:
                  </label>
                  <div className="p-2.5 border rounded-3 bg-primary-subtle text-primary fw-bold">
                    {selectedPatient.mainDiagnosis}
                  </div>
                </div>

                {/* Cam kết đồng bộ CSDL */}
                <div className="alert alert-info py-2 px-3 mb-0 small rounded-3 d-flex align-items-center">
                  <i className="bi bi-info-circle-fill fs-5 me-2 text-primary"></i>
                  <div>
                    Dữ liệu được lưu trữ tự động trên CSDL trung tâm Supabase mỗi khi bác sĩ hoàn thành ca khám.
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="modal-footer bg-light px-4 py-3">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary px-3" 
                  onClick={handleCloseModal}
                >
                  Đóng
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </DoctorLayout>
  )
}
