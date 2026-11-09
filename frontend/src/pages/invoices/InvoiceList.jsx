import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import StatusBadge from '../../components/common/StatusBadge'
import invoiceService from '../../services/invoiceService'
import { formatCurrency } from '../../utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await invoiceService.getAll()
        setInvoices(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = invoices.filter(inv => 
    inv.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    inv.code?.toLowerCase().includes(search.toLowerCase()) ||
    (inv.phone && inv.phone.includes(search))
  )

  const handlePay = async (id) => {
    try {
      await invoiceService.updateStatus(id, 'PAID')
      setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'PAID', paymentMethod: 'Đã thanh toán tại quầy' } : i))
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice(prev => ({ ...prev, status: 'PAID', paymentMethod: 'Đã thanh toán tại quầy' }))
      }
      setToastMsg('Đã xác nhận thanh toán viện phí thành công!')
      setTimeout(() => setToastMsg(''), 3000)
    } catch (err) {
      alert('Không thể cập nhật trạng thái thanh toán: ' + err.message)
    }
  }

  return (
    <AdminLayout title="Quản Lý Hóa Đơn & Thu Phí">
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
                placeholder="Tìm theo mã HĐ, tên bệnh nhân, SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className="text-muted small d-none d-sm-inline">
                Tổng cộng: <strong>{filtered.length}</strong> hóa đơn
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bảng Danh Sách Hóa Đơn Trực Tiếp Từ Database */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4">
              <LoadingSpinner text="Đang tải danh sách hóa đơn từ hệ thống..." />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Mã HĐ</th>
                    <th>Bệnh Nhân</th>
                    <th>Ngày Tạo</th>
                    <th>Tổng Tiền</th>
                    <th>Phương Thức</th>
                    <th>Trạng Thái</th>
                    <th className="text-end pe-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <i className="bi bi-receipt-cutoff fs-1 d-block mb-2 text-secondary"></i>
                        Không tìm thấy hóa đơn nào trong cơ sở dữ liệu.
                      </td>
                    </tr>
                  ) : (
                    filtered.map(inv => (
                      <tr key={inv.id}>
                        <td className="ps-4">
                          <span className="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1.5 rounded-3">
                            #{inv.code}
                          </span>
                        </td>
                        <td className="fw-bold text-dark">{inv.patientName}</td>
                        <td>{inv.date}</td>
                        <td className="fw-bold text-success">{formatCurrency(inv.totalAmount)}</td>
                        <td>
                          <span className="badge bg-light text-secondary border">
                            {inv.paymentMethod}
                          </span>
                        </td>
                        <td><StatusBadge status={inv.status} /></td>
                        <td className="text-end pe-4">
                          <button 
                            className="btn btn-outline-primary btn-sm rounded-pill px-3 me-1.5"
                            onClick={() => setSelectedInvoice(inv)}
                          >
                            <i className="bi bi-receipt me-1"></i> Chi Tiết
                          </button>
                          {inv.status === 'UNPAID' && (
                            <button 
                              className="btn btn-success btn-sm rounded-pill px-3 shadow-sm"
                              onClick={() => handlePay(inv.id)}
                            >
                              <i className="bi bi-check2-circle me-1"></i> Thu Tiền
                            </button>
                          )}
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

      {/* 3. MODAL CHI TIẾT HÓA ĐƠN VỚI THANH TIÊU ĐỀ GRADIENT THƯƠNG HIỆU */}
      {selectedInvoice && (
        <div 
          className="modal show d-block prescription-modal-backdrop" 
          tabIndex="-1"
          style={{ zIndex: 1050 }}
          onClick={() => setSelectedInvoice(null)}
        >
          <div 
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: '640px' }}
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
                    <i className="bi bi-receipt fs-5 text-white"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-white mb-0" style={{ fontSize: '1.05rem' }}>
                      Chi Tiết Hóa Đơn #{selectedInvoice.code}
                    </h5>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)' }}>
                      Phòng Khám Đa Khoa Phú Lợi Bảo • Viện phí điện tử
                    </span>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setSelectedInvoice(null)}
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
                  <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                    <div>
                      <strong className="text-dark fs-6">{selectedInvoice.patientName}</strong>
                      <div className="text-muted small">Ngày xuất: {selectedInvoice.date}</div>
                    </div>
                    <div className="text-end">
                      <StatusBadge status={selectedInvoice.status} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted fw-bold text-uppercase d-block mb-2">Khoản mục thanh toán</small>
                    <div className="list-group list-group-flush border-top border-bottom">
                      {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                        selectedInvoice.items.map((item, idx) => (
                          <div key={idx} className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                            <div>
                              <div className="fw-semibold text-dark">{item.name}</div>
                              <small className="text-muted">Số lượng: {item.quantity}</small>
                            </div>
                            <span className="fw-semibold text-dark">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                          <div>
                            <div className="fw-semibold text-dark">Chi phí khám bệnh & Tiền thuốc theo đơn</div>
                            <small className="text-muted">Đơn giá trọn gói</small>
                          </div>
                          <span className="fw-semibold text-dark">
                            {formatCurrency(selectedInvoice.totalAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2 mb-3">
                    <h6 className="fw-bold m-0 text-dark">Tổng Cộng Thanh Toán:</h6>
                    <h5 className="fw-bold text-danger m-0">{formatCurrency(selectedInvoice.totalAmount)}</h5>
                  </div>

                  {/* Mã QR thanh toán nếu chưa thanh toán */}
                  {selectedInvoice.status === 'UNPAID' && (
                    <div className="text-center p-3 bg-light rounded-3 border">
                      <div className="small text-muted mb-2">Quét mã VietQR để thanh toán trực tiếp:</div>
                      <img 
                        src={`https://api.vietqr.io/image/970422-02838389999-compact2.jpg?amount=${selectedInvoice.totalAmount}&addInfo=TT%20HOA%20DON%20${selectedInvoice.code}&accountName=PHONG%20KHAM%20PHU%20LOI%20BAO`}
                        alt="VietQR"
                        style={{ width: '110px', height: '110px', objectFit: 'contain', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px', background: '#fff' }}
                      />
                      <div className="small fw-bold mt-2 text-dark">MB BANK: 02838389999</div>
                    </div>
                  )}
                </div>
              </div>

              {/* FOOTER MODAL - GHIM CỐ ĐỊNH Ở ĐÁY */}
              <div className="modal-footer p-3 bg-light border-top flex-shrink-0 d-flex justify-content-end gap-2 no-print">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary btn-sm px-3" 
                  onClick={() => setSelectedInvoice(null)}
                >
                  Đóng
                </button>
                {selectedInvoice.status === 'UNPAID' && (
                  <button 
                    type="button" 
                    className="btn btn-success btn-sm px-3 d-flex align-items-center"
                    onClick={() => handlePay(selectedInvoice.id)}
                  >
                    <i className="bi bi-check2-circle me-1"></i>
                    <span>Thu Tiền</span>
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm px-4 d-flex align-items-center"
                  style={{ background: 'linear-gradient(135deg, #175cdd 0%, #10b981 100%)', border: 'none' }}
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer me-1"></i>
                  <span>In Hóa Đơn</span>
                </button>
              </div>

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
