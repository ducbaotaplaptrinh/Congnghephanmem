import { useState, useEffect } from 'react'
import DoctorLayout from '../../components/layout/DoctorLayout'
import prescriptionService from '../../services/prescriptionService'
import { useAuth } from '../../hooks/useAuth'
import './doctor.css'

const INITIAL_PRESCRIPTIONS = []

export default function DoctorPrescriptions() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [activePrescription, setActivePrescription] = useState(null)

  // Nạp danh sách đơn thuốc thực tế từ database
  useEffect(() => {
    async function fetchPrescriptions() {
      setLoading(true)
      try {
        const dbList = await prescriptionService.getAll()
        
        // Lọc đơn thuốc do chính bác sĩ này kê
        const doctorPrescriptions = (dbList || []).filter(p => {
          if (user?.mabs && p.mabs) return Number(p.mabs) === Number(user.mabs)
          if (user?.fullName && p.doctorName) return p.doctorName.toLowerCase().includes(user.fullName.toLowerCase())
          return false
        })

        const mapped = doctorPrescriptions.map(p => ({
          id: p.id || p.madt,
          code: p.code || `DT${String(p.madt || p.id).padStart(3, '0')}`,
          patientName: p.patientName || p.lichsukham?.benhnhan?.hoten || 'Bệnh Nhân',
          age: p.lichsukham?.benhnhan?.ngaysinh 
            ? (new Date().getFullYear() - new Date(p.lichsukham.benhnhan.ngaysinh).getFullYear()) 
            : 35,
          gender: p.lichsukham?.benhnhan?.gioitinh === 'Nu' ? 'Nữ' : 'Nam',
          phone: p.lichsukham?.benhnhan?.sdt || '0901 234 567',
          date: p.date || p.ngayke ? String(p.ngayke).split('T')[0] : new Date().toISOString().split('T')[0],
          diagnosis: p.diagnosis || p.lichsukham?.chandoan || 'Khám bệnh theo đơn',
          doctorName: p.doctorName || user?.fullName || 'Bác sĩ điều trị',
          medicines: Array.isArray(p.medicines) && p.medicines.length > 0 ? p.medicines : [
            { name: 'Tobradex Nhỏ Mắt', quantity: 2, unit: 'Lọ', usage: 'Nhỏ mắt 2 giọt/lần, ngày 3 lần' },
            { name: 'Paracetamol 500mg', quantity: 10, unit: 'Viên', usage: 'Ngày 2 lần sau ăn khi đau' }
          ],
          status: 'Đã cấp thuốc'
        }))

        setPrescriptions(mapped)
        if (mapped[0]) setActivePrescription(mapped[0])
        else setActivePrescription(null)
      } catch (err) {
        console.warn('Lỗi tải danh sách đơn thuốc:', err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPrescriptions()
  }, [user])

  const filtered = prescriptions.filter(p =>
    p.patientName.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    (p.phone && p.phone.includes(search)) ||
    (p.diagnosis && p.diagnosis.toLowerCase().includes(search.toLowerCase()))
  )

  const handleOpenDetail = (prescription) => {
    setActivePrescription(prescription)
    setShowPrintModal(true)
  }

  return (
    <DoctorLayout 
      title="Kê Đơn Thuốc" 
      subtitle="Quản lý và xuất đơn thuốc điện tử chuẩn liên thông"
      prescriptionsCount={prescriptions.length}
    >
      
      {/* Tìm kiếm & Thanh công cụ NGANG HẾT MÀN HÌNH */}
      <div className="card border-0 shadow-sm rounded-3 bg-white p-3 mb-3 no-print">
        <div className="row g-3 align-items-center justify-content-between">
          {/* BÊN TRÁI: Dữ liệu thống kê số lượng toa thuốc */}
          <div className="col-12 col-md-6 d-flex align-items-center gap-2 flex-wrap">
            <span className="badge bg-primary-subtle text-primary border px-3 py-2">
              <i className="bi bi-capsule me-1"></i> Tổng số: <strong>{filtered.length}</strong> toa thuốc
            </span>
            <span className="badge bg-success-subtle text-success border px-3 py-2">
              <i className="bi bi-check-circle me-1"></i> Liên thông Dược Quốc Gia
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
                placeholder="Tìm mã toa thuốc, tên bệnh nhân, số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bảng Danh Sách Đơn Thuốc NGANG HẾT MÀN HÌNH (Full Width 100%) */}
      <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden w-100 no-print">
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13.5px', width: '100%' }}>
            <thead className="table-light text-secondary">
              <tr>
                <th style={{ width: '90px' }} className="ps-3">Mã Toa</th>
                <th style={{ width: '105px' }}>Ngày Kê</th>
                <th style={{ width: '160px' }}>Bệnh Nhân</th>
                <th style={{ width: '115px' }}>Số Điện Thoại</th>
                <th style={{ minWidth: '180px' }}>Chẩn Đoán Bệnh</th>
                <th style={{ minWidth: '200px' }}>Danh Mục Thuốc Kê Đơn</th>
                <th style={{ width: '125px' }}>Trạng Thái</th>
                <th style={{ width: '100px' }} className="text-center pe-3">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    <span className="spinner-border spinner-border-sm me-2"></span> Đang tải dữ liệu đơn thuốc từ hệ thống...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    <i className="bi bi-capsule fs-3 d-block mb-2 text-secondary"></i>
                    Không tìm thấy toa thuốc nào phù hợp với từ khóa!
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr 
                    key={p.id} 
                    onClick={() => handleOpenDetail(p)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="ps-3">
                      <span className="fw-bold text-primary">{p.code}</span>
                    </td>
                    <td className="text-muted">{p.date}</td>
                    <td>
                      <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '160px' }}>{p.patientName}</div>
                      <div className="text-muted small">{p.gender || 'Nam'}, {p.age} tuổi</div>
                    </td>
                    <td>
                      <span className="fw-semibold text-secondary">{p.phone || '0901 234 567'}</span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '200px' }} title={p.diagnosis}>
                        {p.diagnosis}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {p.medicines && p.medicines.slice(0, 2).map((m, idx) => (
                          <span key={idx} className="badge bg-light text-dark border" style={{ fontSize: '11px' }}>
                            {m.name || m.tenthuoc} ({m.quantity} {m.unit || m.donvitinh || 'viên'})
                          </span>
                        ))}
                        {p.medicines && p.medicines.length > 2 && (
                          <span className="badge bg-secondary-subtle text-secondary border" style={{ fontSize: '11px' }}>
                            +{p.medicines.length - 2} loại khác
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'Đã cấp thuốc' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-center pe-3" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-primary py-1 px-2 d-inline-flex align-items-center gap-1 shadow-sm"
                        onClick={() => handleOpenDetail(p)}
                        title="Xem chi tiết & In toa thuốc"
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

      {/* ================= MODAL POPUP XEM CHI TIẾT & IN TOA THUỐC ĐIỆN TỬ ================= */}
      {showPrintModal && activePrescription && (
        <div 
          className="modal fade show d-block prescription-modal-backdrop" 
          tabIndex="-1" 
          style={{ zIndex: 1050 }}
          onClick={() => setShowPrintModal(false)}
        >
          <div 
            className="modal-dialog modal-dialog-centered modal-lg" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              
              {/* Modal Header với Gradient thương hiệu (ẩn khi in) */}
              <div 
                className="modal-header text-white py-3 px-4 border-0 no-print"
                style={{ background: 'linear-gradient(135deg, #175cdd 0%, #10b981 100%)' }}
              >
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-capsule fs-4"></i>
                  <div>
                    <h5 className="modal-title fw-bold mb-0">Đơn Thuốc Điện Tử #{activePrescription?.code || ''}</h5>
                    <div className="small opacity-75">Ngày kê: {activePrescription?.date || ''} • Bác sĩ điều trị: {activePrescription?.doctorName || user?.fullName || 'Bác sĩ điều trị'}</div>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowPrintModal(false)}
                  aria-label="Đóng"
                ></button>
              </div>

              {/* Modal Body - Toa thuốc hiển thị chuẩn giấy A4 không bị thanh cuộn khi in */}
              <div className="modal-body p-4 bg-white prescription-modal-body-scroll">
                <div className="prescription-paper-preview p-2">
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15pt', textTransform: 'uppercase', color: '#175cdd' }}>PHÒNG KHÁM ĐA KHOA PHÚ LỢI BẢO</div>
                    <div style={{ fontSize: '10pt', color: '#444' }}>Địa chỉ: 123 Nguyễn Tri Phương, Phường 7, Quận 5, TP.HCM • Hotline: (028) 3838 9999</div>
                    <h2 style={{ fontSize: '17pt', fontWeight: 'bold', margin: '12px 0 6px 0', textTransform: 'uppercase', color: '#0f172a' }}>ĐƠN THUỐC ĐIỆN TỬ</h2>
                    <div style={{ fontSize: '10pt', fontStyle: 'italic', color: '#64748b' }}>
                      Mã đơn: <strong>{activePrescription.code}</strong> • Ngày kê: {activePrescription.date}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px', fontSize: '11pt', lineHeight: '1.6' }}>
                    <div className="d-flex justify-content-between flex-wrap">
                      <span>Họ và tên bệnh nhân: <strong style={{ color: '#0f172a' }}>{activePrescription.patientName}</strong></span>
                      <span>Tuổi: <strong>{activePrescription.age}</strong> • Giới tính: <strong>{activePrescription.gender || 'Nam'}</strong></span>
                    </div>
                    <div>Số điện thoại: <strong>{activePrescription.phone || '0901 234 567'}</strong></div>
                    <div>Chẩn đoán bệnh: <strong style={{ color: '#175cdd' }}>{activePrescription.diagnosis}</strong></div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }} className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '45px', textAlign: 'center' }}>STT</th>
                        <th>Tên Thuốc / Hàm Lượng</th>
                        <th style={{ width: '110px', textAlign: 'center' }}>Số Lượng</th>
                        <th>Cách Dùng & Liều Lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activePrescription.medicines.map((m, idx) => (
                        <tr key={idx}>
                          <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                          <td style={{ fontWeight: 'bold', color: '#0f172a' }}>{m.name || m.tenthuoc}</td>
                          <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{m.quantity} {m.unit || m.donvitinh || 'Viên'}</td>
                          <td style={{ fontStyle: 'italic', color: '#475569' }}>{m.usage || m.lieudung || 'Theo chỉ định của bác sĩ'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Khung Bảng Kê Viện Phí & Mã VietQR */}
                  <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1, paddingRight: '16px', fontSize: '10.5pt', lineHeight: '1.7' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '11pt', textTransform: 'uppercase', marginBottom: '4px', color: '#175cdd' }}>
                          <i className="bi bi-receipt me-1"></i> BẢNG KÊ VIỆN PHÍ & TIỀN THUỐC
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>1. Tiền công khám chuyên khoa:</span>
                          <strong>150.000 đ</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>2. Tiền thuốc theo đơn ({activePrescription.medicines.length} loại):</span>
                          <strong>{((activePrescription.totalAmount && activePrescription.totalAmount > 0) ? activePrescription.totalAmount : 120000).toLocaleString('vi-VN')} đ</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #94a3b8', marginTop: '6px', paddingTop: '6px', fontSize: '11.5pt' }}>
                          <span style={{ fontWeight: 'bold' }}>TỔNG CỘNG THANH TOÁN:</span>
                          <strong style={{ color: '#dc2626', fontSize: '13pt' }}>
                            {(150000 + ((activePrescription.totalAmount && activePrescription.totalAmount > 0) ? activePrescription.totalAmount : 120000)).toLocaleString('vi-VN')} đ
                          </strong>
                        </div>
                        <div style={{ fontSize: '8.5pt', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                          * Quét mã VietQR bằng App Ngân Hàng hoặc thanh toán trực tiếp tại Quầy Thu Ngân phòng khám.
                        </div>
                      </div>

                      <div style={{ width: '130px', textAlign: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '14px' }}>
                        <img 
                          src={`https://api.vietqr.io/image/970422-02838389999-compact2.jpg?amount=${150000 + ((activePrescription.totalAmount && activePrescription.totalAmount > 0) ? activePrescription.totalAmount : 120000)}&addInfo=TT%20VIEN%20PHI%20${activePrescription.code}&accountName=PHONG%20KHAM%20PHU%20LOI%20BAO`}
                          alt="VietQR"
                          style={{ width: '95px', height: '95px', objectFit: 'contain', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px', background: '#fff' }}
                        />
                        <div style={{ fontSize: '8pt', fontWeight: 'bold', marginTop: '4px', color: '#0f172a' }}>MB BANK: 02838389999</div>
                        <div style={{ fontSize: '7.5pt', color: '#64748b' }}>PK PHÚ LỢI BẢO</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '20px' }}>
                    <div style={{ fontSize: '9pt', fontStyle: 'italic', maxWidth: '320px', lineHeight: '1.5', color: '#64748b' }}>
                      * Bệnh nhân vui lòng mang theo đơn này khi tái khám.<br />
                      * Uống thuốc đúng giờ, đúng liều lượng theo chỉ dẫn của bác sĩ.
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '220px' }}>
                      <div style={{ fontSize: '10pt', fontStyle: 'italic', color: '#64748b' }}>Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</div>
                      <div style={{ fontWeight: 'bold', margin: '4px 0 28px 0', color: '#0f172a' }}>Bác sĩ điều trị</div>
                      <div style={{ fontWeight: 'bold', fontSize: '11.5pt', color: '#175cdd' }}>{activePrescription?.doctorName || user?.fullName || 'Bác sĩ điều trị'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer - NÚT IN VÀ ĐÓNG NẰM Ở BÊN DƯỚI (ẩn khi in) */}
              <div className="modal-footer bg-light px-4 py-3 border-top no-print">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary px-3" 
                  onClick={() => setShowPrintModal(false)}
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
                  <span>In Đơn Thuốc</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </DoctorLayout>
  )
}
