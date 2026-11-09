import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import medicalRecordService from '../../services/medicalRecordService'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function MedicalRecordList() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await medicalRecordService.getAll()
        setRecords(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = records.filter(r => 
    r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    r.code?.toLowerCase().includes(search.toLowerCase()) ||
    r.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
    r.doctorName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Hồ Sơ Bệnh Án Điện Tử (EMR)">
      {/* 1. Thanh Công Cụ & Thống Kê - Đồng bộ chuẩn Admin */}
      <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="input-group input-group-sm" style={{ maxWidth: '420px' }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Tìm theo tên bệnh nhân, mã BA, chẩn đoán, bác sĩ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className="text-muted small d-none d-sm-inline">
                Tổng cộng: <strong>{filtered.length}</strong> bệnh án
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bảng Danh Sách Hồ Sơ Bệnh Án Từ Database */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4">
              <LoadingSpinner text="Đang tải danh sách hồ sơ bệnh án từ hệ thống..." />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Mã BA</th>
                    <th>Bệnh Nhân</th>
                    <th>Bác Sĩ Điều Trị</th>
                    <th>Ngày Khám</th>
                    <th>Chẩn Đoán Bệnh</th>
                    <th className="text-end pe-4">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <i className="bi bi-folder-x fs-1 d-block mb-2 text-secondary"></i>
                        Không có hồ sơ bệnh án nào phù hợp với tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filtered.map(r => (
                      <tr key={r.id}>
                        <td className="ps-4">
                          <span className="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1.5 rounded-3">
                            #{r.code}
                          </span>
                        </td>
                        <td className="fw-bold text-dark">{r.patientName}</td>
                        <td className="text-secondary">{r.doctorName}</td>
                        <td>{r.date}</td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {r.diagnosis}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <button 
                            className="btn btn-outline-primary btn-sm px-3 rounded-pill"
                            onClick={() => setSelectedRecord(r)}
                          >
                            <i className="bi bi-eye me-1"></i> Xem Hồ Sơ
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 3. MODAL CHI TIẾT BỆNH ÁN VỚI THANH TIÊU ĐỀ GRADIENT THƯƠNG HIỆU */}
      {selectedRecord && (
        <div 
          className="modal show d-block prescription-modal-backdrop" 
          tabIndex="-1"
          style={{ zIndex: 1050 }}
          onClick={() => setSelectedRecord(null)}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered"
            style={{ maxWidth: '780px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content rounded-3 border-0 shadow-lg overflow-hidden d-flex flex-column" style={{ maxHeight: '90vh' }}>
              
              {/* THANH TIÊU ĐỀ GRADIENT THƯƠNG HIỆU - GHIM CỐ ĐỊNH */}
              <div 
                className="modal-header py-3 px-4 text-white border-0 flex-shrink-0 no-print"
                style={{ background: 'linear-gradient(135deg, #175cdd 0%, #10b981 100%)' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <i className="bi bi-folder2-open fs-5 text-white"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-white mb-0" style={{ fontSize: '1.05rem' }}>
                      Hồ Sơ Bệnh Án Điện Tử #{selectedRecord.code}
                    </h5>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)' }}>
                      Phòng Khám Đa Khoa Phú Lợi Bảo • Trích xuất trực tiếp từ DB
                    </span>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setSelectedRecord(null)}
                  aria-label="Đóng"
                ></button>
              </div>

              {/* THÂN MODAL CUỘN MƯỢT MÀ */}
              <div 
                className="modal-body p-4 bg-white"
                style={{ 
                  overflowY: 'auto', 
                  maxHeight: 'calc(90vh - 135px)',
                  flex: '1 1 auto',
                  overscrollBehavior: 'contain',
                  fontSize: '13.5px'
                }}
              >
                <div className="prescription-paper-preview p-2">
                  <div className="p-3 bg-light rounded-3 mb-3 border">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <small className="text-muted d-block">Họ và tên bệnh nhân:</small>
                        <strong className="text-dark fs-6">{selectedRecord.patientName}</strong>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted d-block">Bác sĩ phụ trách điều trị:</small>
                        <strong className="text-primary fs-6">{selectedRecord.doctorName}</strong>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted d-block">Ngày khám bệnh:</small>
                        <span>{selectedRecord.date}</span>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted d-block">Chẩn đoán xác định:</small>
                        <span className="text-danger fw-semibold">{selectedRecord.diagnosis}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6 className="fw-bold text-dark d-flex align-items-center gap-1.5">
                      <i className="bi bi-activity text-primary"></i>
                      Lý Do Khám & Triệu Chứng Lâm Sàng
                    </h6>
                    <div className="bg-light p-3 rounded-3 small border text-secondary" style={{ lineHeight: '1.6' }}>
                      {selectedRecord.symptoms || 'Không ghi nhận triệu chứng bất thường.'}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6 className="fw-bold text-dark d-flex align-items-center gap-1.5">
                      <i className="bi bi-clipboard2-pulse text-success"></i>
                      Kết Luận & Hướng Dẫn Điều Trị
                    </h6>
                    <div className="bg-light p-3 rounded-3 small border text-secondary" style={{ lineHeight: '1.6' }}>
                      {selectedRecord.treatment || 'Theo dõi và tái khám theo chỉ định.'}
                    </div>
                  </div>

                  {selectedRecord.prescription && (
                    <div className="alert alert-info py-2.5 px-3 small rounded-3 mb-0">
                      <i className="bi bi-capsule me-1 text-primary"></i>
                      Đơn thuốc đi kèm: <strong>Mã #{selectedRecord.prescription.madt ? `DT${String(selectedRecord.prescription.madt).padStart(3, '0')}` : 'Đã kê'}</strong>
                      {selectedRecord.prescription.ghichubacsi && ` - Lời dặn: ${selectedRecord.prescription.ghichubacsi}`}
                    </div>
                  )}
                </div>
              </div>

              {/* FOOTER MODAL - GHIM CỐ ĐỊNH Ở ĐÁY */}
              <div className="modal-footer p-3 bg-light border-top flex-shrink-0 d-flex justify-content-end gap-2 no-print">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary btn-sm px-3" 
                  onClick={() => setSelectedRecord(null)}
                >
                  Đóng
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm px-4 d-flex align-items-center"
                  style={{ background: 'linear-gradient(135deg, #175cdd 0%, #10b981 100%)', border: 'none' }}
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer me-1"></i>
                  <span>In Hồ Sơ Bệnh Án</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
