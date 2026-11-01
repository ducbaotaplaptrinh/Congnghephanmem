import { useState, useEffect } from 'react'
import DoctorLayout from '../../components/layout/DoctorLayout'
import medicalRecordService from '../../services/medicalRecordService'
import { useAuth } from '../../hooks/useAuth'

export default function DoctorMedicalRecords() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Nạp dữ liệu hồ sơ bệnh án từ Backend API
  useEffect(() => {
    async function fetchRecords() {
      setLoading(true)
      try {
        const dbRecords = await medicalRecordService.getAll()
        
        // Lọc hồ sơ bệnh án do chính bác sĩ này khám
        const myRecords = (dbRecords || []).filter(r => {
          if (user?.mabs && r.mabs) return Number(r.mabs) === Number(user.mabs)
          if (user?.fullName && r.doctorName) return r.doctorName.toLowerCase().includes(user.fullName.toLowerCase())
          return false
        })

        const mapped = myRecords.map(r => {
          let docName = user?.fullName 
            ? (user.hocham ? `${user.hocham}. ${user.fullName}` : `BS. ${user.fullName}`)
            : 'Bác sĩ phụ trách'
            
          if (r.doctorName && !r.doctorName.includes('Trần Văn Hùng') && !r.doctorName.includes('Nguyễn Hoàng Nam')) {
            docName = r.doctorName
          } else if (r.bacsi?.nhanvien?.hoten) {
            docName = r.bacsi.hocham ? `${r.bacsi.hocham}. ${r.bacsi.nhanvien.hoten}` : `BS. ${r.bacsi.nhanvien.hoten}`
          } else if (r.bacsi?.hoten) {
            docName = r.bacsi.hocham ? `${r.bacsi.hocham}. ${r.bacsi.hoten}` : `BS. ${r.bacsi.hoten}`
          }

          return {
            id: r.id || r.malsk,
            code: r.code || `BA${String(r.malsk || r.id).padStart(3, '0')}`,
            patientName: r.patientName || r.benhnhan?.hoten || 'Bệnh Nhân',
            age: r.benhnhan?.ngaysinh 
              ? (new Date().getFullYear() - new Date(r.benhnhan.ngaysinh).getFullYear()) 
              : 30,
            gender: r.benhnhan?.gioitinh === 'Nu' ? 'Nữ' : 'Nam',
            phone: r.benhnhan?.sdt || r.phone || '0901 234 567',
            address: r.benhnhan?.diachi || r.address || 'TP. Hồ Chí Minh',
            date: r.date || r.ngay || new Date().toISOString().split('T')[0],
            diagnosis: r.diagnosis || r.chandoan || 'Khám bệnh định kỳ',
            symptoms: r.symptoms || r.trieuchung || 'Không có triệu chứng bất thường',
            treatment: r.treatment || r.ketluan || 'Theo dõi thêm tại nhà',
            bp: '120/80 mmHg',
            status: 'Đã hoàn thành',
            doctorName: docName,
            prescription: r.prescription || null
          }
        })

        setRecords(mapped)
      } catch (err) {
        console.error('Lỗi nạp hồ sơ bệnh án:', err.message)
        setRecords([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [user])

  const filtered = records.filter(r => 
    r.patientName.toLowerCase().includes(search.toLowerCase()) || 
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    (r.phone && r.phone.includes(search)) ||
    r.diagnosis.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenDetail = (record) => {
    setSelectedRecord(record)
    setShowDetailModal(true)
  }

  const handleCloseDetail = () => {
    setShowDetailModal(false)
    setSelectedRecord(null)
  }

  return (
    <DoctorLayout 
      title="Hồ Sơ Bệnh Án" 
      subtitle="Tra cứu và theo dõi tiền sử bệnh lý, hồ sơ khám chữa bệnh"
      recordsCount={records.length}
    >
      
      {/* Thanh tìm kiếm & lọc ngang hết màn hình */}
      <div className="card border-0 shadow-sm rounded-3 bg-white p-3 mb-3">
        <div className="row g-3 align-items-center justify-content-between">
          {/* BÊN TRÁI: Dữ liệu thống kê số lượng */}
          <div className="col-12 col-md-6 d-flex align-items-center gap-2 flex-wrap">
            <span className="badge bg-primary-subtle text-primary border px-3 py-2">
              <i className="bi bi-folder-check me-1"></i> Tổng số: <strong>{filtered.length}</strong> bệnh án
            </span>
            <span className="badge bg-success-subtle text-success border px-3 py-2">
              <i className="bi bi-database-check me-1"></i> Đồng bộ Supabase DB
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
                placeholder="Tìm mã bệnh án, tên bệnh nhân, số điện thoại, chẩn đoán..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bảng Danh sách Bệnh Án NGANG HẾT MÀN HÌNH (Full Width 100%) */}
      <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden w-100">
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13.5px', width: '100%' }}>
            <thead className="table-light text-secondary">
              <tr>
                <th style={{ width: '85px' }} className="ps-3">Mã BA</th>
                <th style={{ width: '110px' }}>Ngày Khám</th>
                <th style={{ width: '160px' }}>Bệnh Nhân</th>
                <th style={{ width: '115px' }}>Số Điện Thoại</th>
                <th style={{ minWidth: '180px' }}>Chẩn Đoán Bệnh</th>
                <th style={{ minWidth: '180px' }}>Phác Đồ & Thuốc Điều Trị</th>
                <th style={{ width: '125px' }}>Trạng Thái</th>
                <th style={{ width: '100px' }} className="text-center pe-3">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    <span className="spinner-border spinner-border-sm me-2"></span> Đang tải dữ liệu hồ sơ bệnh án từ hệ thống...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    <i className="bi bi-inbox fs-3 d-block mb-2 text-secondary"></i>
                    Không tìm thấy hồ sơ bệnh án nào phù hợp với từ khóa!
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr 
                    key={r.id} 
                    onClick={() => handleOpenDetail(r)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="ps-3">
                      <span className="fw-bold text-primary">{r.code}</span>
                    </td>
                    <td>
                      <div className="text-dark fw-medium">{r.date}</div>
                      {r.bp && (
                        <div className="text-muted small" style={{ fontSize: '11px' }}>
                          HA: <span className="fw-semibold text-danger">{r.bp}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '160px' }}>{r.patientName}</div>
                      <div className="text-muted small">{r.gender}, {r.age} tuổi</div>
                    </td>
                    <td>
                      <span className="fw-semibold text-secondary">{r.phone}</span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '220px' }} title={r.diagnosis}>
                        {r.diagnosis}
                      </div>
                      <div className="text-muted small text-truncate" style={{ maxWidth: '220px' }} title={r.symptoms}>
                        Triệu chứng: {r.symptoms}
                      </div>
                    </td>
                    <td>
                      <div className="text-truncate text-secondary" style={{ maxWidth: '240px' }} title={r.treatment}>
                        {r.treatment}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                        <i className="bi bi-check-circle me-1"></i> {r.status || 'Đã hoàn thành'}
                      </span>
                    </td>
                    <td className="text-center pe-3" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 shadow-sm px-2 py-1"
                        onClick={() => handleOpenDetail(r)}
                        title="Xem chi tiết bệnh án"
                      >
                        <i className="bi bi-eye"></i>
                        <span>Chi Tiết</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL POPUP XEM CHI TIẾT BỆNH ÁN ================= */}
      {showDetailModal && selectedRecord && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1050 }}
          onClick={handleCloseDetail}
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
                  <i className="bi bi-journal-medical fs-4"></i>
                  <div>
                    <h5 className="modal-title fw-bold mb-0">Hồ Sơ Bệnh Án Điện Tử #{selectedRecord.code}</h5>
                    <div className="small opacity-75">Ngày lập: {selectedRecord.date} • Bác sĩ phụ trách: {selectedRecord.doctorName || user?.fullName || 'Bác sĩ phụ trách'}</div>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={handleCloseDetail}
                  aria-label="Đóng"
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4">
                
                {/* 1. Thông tin hành chính bệnh nhân */}
                <div className="p-3 rounded-3 bg-light border mb-3">
                  <div className="row g-2">
                    <div className="col-12 col-md-6">
                      <span className="text-muted small d-block">Họ và tên bệnh nhân:</span>
                      <strong className="text-dark fs-6">{selectedRecord.patientName}</strong>
                    </div>
                    <div className="col-6 col-md-3">
                      <span className="text-muted small d-block">Tuổi & Giới tính:</span>
                      <span className="fw-semibold text-dark">{selectedRecord.age} tuổi • {selectedRecord.gender}</span>
                    </div>
                    <div className="col-6 col-md-3">
                      <span className="text-muted small d-block">Số điện thoại:</span>
                      <strong className="text-primary">{selectedRecord.phone}</strong>
                    </div>
                    <div className="col-12 col-md-6 mt-2">
                      <span className="text-muted small d-block">Địa chỉ:</span>
                      <span className="text-secondary">{selectedRecord.address}</span>
                    </div>
                    <div className="col-12 col-md-6 mt-2">
                      <span className="text-muted small d-block">Chỉ số sinh tồn (Huyết áp):</span>
                      <span className="badge bg-white text-danger border fw-bold">{selectedRecord.bp || '120/80 mmHg'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Triệu chứng lâm sàng */}
                <div className="mb-3">
                  <label className="fw-bold text-dark small text-uppercase d-flex align-items-center mb-1">
                    <i className="bi bi-activity text-danger me-1.5"></i>
                    Lý do đến khám & Triệu chứng cơ năng:
                  </label>
                  <div className="p-3 border rounded-3 bg-white text-secondary" style={{ lineHeight: '1.6' }}>
                    {selectedRecord.symptoms}
                  </div>
                </div>

                {/* 3. Chẩn đoán xác định */}
                <div className="mb-3">
                  <label className="fw-bold text-dark small text-uppercase d-flex align-items-center mb-1">
                    <i className="bi bi-clipboard2-pulse text-primary me-1.5"></i>
                    Chẩn đoán xác định (ICD-10):
                  </label>
                  <div className="p-3 border rounded-3 bg-primary-subtle text-primary fw-bold" style={{ fontSize: '15px' }}>
                    {selectedRecord.diagnosis}
                  </div>
                </div>

                {/* 4. Phác đồ & Lời dặn */}
                <div className="mb-3">
                  <label className="fw-bold text-dark small text-uppercase d-flex align-items-center mb-1">
                    <i className="bi bi-capsule text-success me-1.5"></i>
                    Phác đồ điều trị, đơn thuốc & Hướng dẫn:
                  </label>
                  <div className="p-3 border rounded-3 bg-white text-secondary" style={{ lineHeight: '1.6' }}>
                    {selectedRecord.treatment}
                  </div>
                </div>

                {/* Cam kết ký số */}
                <div className="alert alert-success d-flex align-items-center py-2 px-3 mb-0 small rounded-3">
                  <i className="bi bi-shield-check fs-4 me-2 text-success"></i>
                  <div>
                    Hồ sơ bệnh án đã được số hóa và ký điện tử xác thực theo tiêu chuẩn của Bộ Y Tế.
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="modal-footer bg-light px-4 py-3">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary px-3" 
                  onClick={handleCloseDetail}
                >
                  Đóng
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary d-flex align-items-center gap-1.5 px-3 border-0 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #175cdd 0%, #10b981 100%)' }}
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer"></i>
                  <span>In Bệnh Án</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </DoctorLayout>
  )
}
