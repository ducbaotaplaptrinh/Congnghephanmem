import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import prescriptionService from '../../services/prescriptionService'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedPrescription, setSelectedPrescription] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await prescriptionService.getAll()
        setPrescriptions(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = prescriptions.filter(p => 
    p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    p.code?.toLowerCase().includes(search.toLowerCase()) ||
    p.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
    p.diagnosis?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Quản Lý Đơn Thuốc">
      {/* 1. Thanh Công Cụ & Thống Kê Nhanh - Đồng bộ chuẩn Admin */}
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
                placeholder="Tìm theo tên bệnh nhân, mã đơn, bác sĩ, chẩn đoán..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className="text-muted small d-none d-sm-inline">
                Tổng cộng: <strong>{filtered.length}</strong> đơn thuốc
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bảng Danh Sách Đơn Thuốc Trực Tiếp Từ Database */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4">
              <LoadingSpinner text="Đang tải danh sách đơn thuốc từ hệ thống..." />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Mã Đơn</th>
                    <th>Bệnh Nhân</th>
                    <th>Chẩn Đoán</th>
                    <th>Bác Sĩ Kê Đơn</th>
                    <th>Ngày Kê</th>
                    <th>Số Thuốc</th>
                    <th className="text-end pe-4">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <i className="bi bi-clipboard2-x fs-1 d-block mb-2 text-secondary"></i>
                        Không tìm thấy đơn thuốc nào phù hợp với từ khóa tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filtered.map(p => (
                      <tr key={p.id}>
                        <td className="ps-4">
                          <span className="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1.5 rounded-3">
                            #{p.code}
                          </span>
                        </td>
                        <td className="fw-bold text-dark">{p.patientName}</td>
                        <td>
                          <span className="text-truncate d-inline-block" style={{ maxWidth: '240px' }} title={p.diagnosis}>
                            {p.diagnosis || 'Khám bệnh theo đơn'}
                          </span>
                        </td>
                        <td className="text-secondary">{p.doctorName}</td>
                        <td>{p.date}</td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {p.medicines?.length || p.totalMedicines || 0} loại thuốc
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <button 
                            className="btn btn-outline-primary btn-sm px-3 rounded-pill"
                            onClick={() => setSelectedPrescription(p)}
                          >
                            <i className="bi bi-file-earmark-medical me-1"></i> Xem Đơn
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

      {/* 3. MODAL CHI TIẾT ĐƠN THUỐC VỚI THANH TIÊU ĐỀ GRADIENT THƯƠNG HIỆU */}
      {selectedPrescription && (
        <div 
          className="modal show d-block prescription-modal-backdrop" 
          tabIndex="-1"
          style={{ zIndex: 1050 }}
          onClick={() => setSelectedPrescription(null)}
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
                    <i className="bi bi-capsule fs-5 text-white"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-white mb-0" style={{ fontSize: '1.05rem' }}>
                      Chi Tiết Đơn Thuốc #{selectedPrescription.code}
                    </h5>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)' }}>
                      Phòng Khám Đa Khoa Phú Lợi Bảo • Dữ liệu đơn thuốc điện tử DB
                    </span>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setSelectedPrescription(null)}
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
                    <div className="row g-2">
                      <div className="col-md-6">
                        <small className="text-muted d-block">Bệnh nhân:</small>
                        <strong className="text-dark fs-6">{selectedPrescription.patientName}</strong>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted d-block">Bác sĩ kê đơn:</small>
                        <strong className="text-primary fs-6">{selectedPrescription.doctorName}</strong>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted d-block">Ngày kê đơn:</small>
                        <span>{selectedPrescription.date}</span>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted d-block">Chẩn đoán y khoa:</small>
                        <span className="text-danger fw-semibold">{selectedPrescription.diagnosis || 'Khám bệnh theo đơn'}</span>
                      </div>
                    </div>
                  </div>

                  <h6 className="fw-bold text-dark mb-2">
                    <i className="bi bi-list-check me-1 text-primary"></i> Danh Mục Thuốc Điều Trị
                  </h6>

                  <div className="table-responsive mb-3">
                    <table className="table table-bordered align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '45px', textAlign: 'center' }}>STT</th>
                          <th>Tên Thuốc / Hàm Lượng</th>
                          <th style={{ width: '110px', textAlign: 'center' }}>Số Lượng</th>
                          <th>Cách Dùng & Liều Lượng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPrescription.medicines?.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center py-3 text-muted">Không có thông tin thuốc</td>
                          </tr>
                        ) : (
                          selectedPrescription.medicines?.map((m, idx) => (
                            <tr key={idx}>
                              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                              <td className="fw-semibold text-dark">{m.name || m.tenthuoc}</td>
                              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                {m.quantity} {m.unit || m.donvitinh || 'Viên'}
                              </td>
                              <td className="text-secondary fst-italic">
                                {m.usage || m.lieudung || 'Theo chỉ định của bác sĩ'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {selectedPrescription.notes && (
                    <div className="alert alert-warning py-2.5 px-3 small mb-0 rounded-3">
                      <strong><i className="bi bi-info-circle me-1"></i> Lời dặn của bác sĩ:</strong> {selectedPrescription.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* FOOTER MODAL - GHIM CỐ ĐỊNH Ở ĐÁY */}
              <div className="modal-footer p-3 bg-light border-top flex-shrink-0 d-flex justify-content-end gap-2 no-print">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary btn-sm px-3" 
                  onClick={() => setSelectedPrescription(null)}
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
                  <span>In Đơn Thuốc</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
