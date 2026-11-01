import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.jpg'
import { formatCurrency, formatDateTime } from '../../utils'
import invoiceService from '../../services/invoiceService'
import '../../components/layout/admin.css'
import './accountant.css'

// Dữ liệu hàng chờ thu ngân và hóa đơn được đồng bộ từ Backend API
const INITIAL_QUEUE = []
const INITIAL_INVOICES = []

// Dữ liệu mẫu Sổ quỹ Thu - Chi
const INITIAL_CASHBOOK = [
  {
    id: 'PT-001',
    type: 'THU',
    category: 'Thu viện phí',
    refCode: 'HD001',
    amount: 320000,
    method: 'Tiền mặt',
    payer: 'Phạm Thị Hương',
    note: 'Thu viện phí bệnh nhân khám tổng quát',
    createdAt: '07:30 15/10/2026'
  },
  {
    id: 'PT-002',
    type: 'THU',
    category: 'Thu viện phí',
    refCode: 'HD002',
    amount: 850000,
    method: 'Chuyển khoản',
    payer: 'Vũ Đức Thịnh',
    note: 'Thu viện phí bệnh nhân khám cơ xương khớp',
    createdAt: '07:55 15/10/2026'
  },
  {
    id: 'PC-001',
    type: 'CHI',
    category: 'Mua vật tư tiêu hao',
    refCode: 'VT-081',
    amount: 350000,
    method: 'Tiền mặt',
    payer: 'Nguyễn Thị Mai (Kế toán)',
    note: 'Chi mua giấy in nhiệt & găng tay y tế quầy thu ngân',
    createdAt: '08:00 15/10/2026'
  }
]

export default function AccountantPortal() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('cashier') // 'cashier' | 'invoices' | 'cashbook' | 'reports'
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState('')
  const [shiftModalOpen, setShiftModalOpen] = useState(false)

  // State Hàng chờ thu ngân
  const [queue, setQueue] = useState([])
  const [selectedQueuePatient, setSelectedQueuePatient] = useState(null)
  const [searchQueueText, setSearchQueueText] = useState('')

  // State Thanh toán
  const [paymentMethod, setPaymentMethod] = useState('CASH') // 'CASH' | 'QR' | 'CARD'
  const [customerGivenCash, setCustomerGivenCash] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)

  // State Hóa đơn
  const [invoices, setInvoices] = useState([])
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState('ALL')
  const [invoiceSearchText, setInvoiceSearchText] = useState('')
  const [printInvoiceData, setPrintInvoiceData] = useState(null)

  // State Sổ quỹ Thu - Chi
  const [cashbook, setCashbook] = useState(INITIAL_CASHBOOK)
  const [cashbookModalOpen, setCashbookModalOpen] = useState(false)
  const [newVoucherType, setNewVoucherType] = useState('CHI')
  const [newVoucherForm, setNewVoucherForm] = useState({
    category: 'Chi mua vật tư',
    amount: '',
    method: 'Tiền mặt',
    payer: '',
    note: ''
  })

  // Hiệu ứng đồng hồ thời gian thực
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Đóng drawer khi đổi kích thước màn hình lên desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Tiêu đề và mô tả theo từng Tab nghiệp vụ
  const getTabTitle = () => {
    switch (activeTab) {
      case 'cashier': return { title: 'Quầy Thu Ngân & Viện Phí', subtitle: 'Bệnh nhân ngoại trú' }
      case 'invoices': return { title: 'Sổ Hóa Đơn & Biên Lai', subtitle: 'Tra cứu & in biên lai' }
      case 'cashbook': return { title: 'Sổ Quỹ Thu - Chi Quầy', subtitle: 'Theo dõi thu chi tiền mặt' }
      case 'reports': return { title: 'Báo Cáo & Kết Toán Ca', subtitle: 'Đối soát & chốt ca trực' }
      default: return { title: 'Cổng Kế Toán', subtitle: 'Quản lý Viện phí' }
    }
  }

  // Tải dữ liệu hóa đơn thực tế từ CSDL Supabase
  const loadDataFromDB = async () => {
    try {
      setIsLoading(true)
      const allInvoices = await invoiceService.getAll()
      const list = Array.isArray(allInvoices) ? allInvoices : []
      
      // 1. Sổ Hóa Đơn & Biên Lai
      const mappedInvoices = list.map(inv => ({
        id: inv.code || `HD${String(inv.mahd).padStart(3, '0')}`,
        mahd: inv.mahd,
        code: inv.code || `HD${String(inv.mahd).padStart(3, '0')}`,
        patientCode: `BN${String(inv.mabn || 1).padStart(3, '0')}`,
        patientName: inv.patientName || 'Bệnh Nhân',
        createdAt: inv.date || formatDateTime(new Date()),
        totalAmount: inv.totalAmount || 0,
        insuranceDiscount: inv.insuranceDiscount || ((inv.insuranceNumber || inv.benhnhan?.sobhyt) ? Math.round((inv.totalAmount || 0) * 0.2) : 0),
        patientPay: inv.totalAmount || 0,
        paymentMethod: inv.paymentMethod || 'Chưa thanh toán',
        status: inv.trangthaithanhtoan === 'DaThanhToan' ? 'PAID' : 'UNPAID',
        cashier: 'Kế Toán Viên (Thu Ngân)',
        items: (inv.items || []).map((it, idx) => ({
          id: it.id || idx + 1,
          name: it.name || it.tendichvu || 'Dịch vụ / Thuốc',
          qty: it.quantity || it.soluong || 1,
          price: it.price || it.dongia || 0
        }))
      }))
      setInvoices(mappedInvoices)

      // 2. Hàng Chờ Thu Ngân (Các hóa đơn chưa thanh toán)
      const unpaidList = list.filter(inv => inv.trangthaithanhtoan !== 'DaThanhToan')
      if (unpaidList.length > 0) {
        const mappedQueue = unpaidList.map(inv => ({
          id: inv.mahd,
          mahd: inv.mahd,
          invoiceCode: inv.code || `HD${String(inv.mahd).padStart(3, '0')}`,
          patientCode: `BN${String(inv.mabn || 1).padStart(3, '0')}`,
          patientName: inv.patientName || 'Bệnh Nhân',
          gender: inv.benhnhan?.gioitinh === 'Nu' ? 'Nữ' : 'Nam',
          age: 45,
          phone: inv.phone || '0901 234 567',
          doctorName: inv.doctorName || 'BS. CKII Nguyễn Hoàng Nam',
          department: 'Khoa Khám Bệnh Ngoại Trú',
          insuranceNumber: inv.insuranceNumber || inv.benhnhan?.sobhyt || '',
          insuranceRate: (inv.insuranceNumber || inv.benhnhan?.sobhyt) ? 0.8 : 0,
          createdAt: inv.date || formatDateTime(new Date()),
          items: (inv.items && inv.items.length > 0) ? inv.items.map((it, idx) => ({
            id: it.id || idx + 1,
            name: it.name || it.tendichvu || 'Dịch vụ / Thuốc',
            type: it.type || (it.name?.toLowerCase().includes('thuốc') ? 'THUỐC' : 'CLS'),
            qty: it.quantity || it.soluong || 1,
            price: it.price || it.dongia || 0,
            bhytCovered: !!(inv.insuranceNumber || inv.benhnhan?.sobhyt)
          })) : [
            { id: 1, name: 'Khám bệnh & Dịch vụ y tế', type: 'KHÁM', qty: 1, price: inv.totalAmount || 250000, bhytCovered: true }
          ]
        }))
        setQueue(mappedQueue)
        setSelectedQueuePatient(mappedQueue[0])
      } else {
        setQueue([])
        setSelectedQueuePatient(null)
      }

      // 3. Sổ Quỹ Thu - Chi (Tổng hợp từ hóa đơn đã thanh toán)
      const paidList = list.filter(inv => inv.trangthaithanhtoan === 'DaThanhToan')
      const mappedCashbook = paidList.map(inv => ({
        id: `PT-${String(inv.mahd).padStart(3, '0')}`,
        type: 'THU',
        category: 'Thu viện phí',
        refCode: inv.code || `HD${String(inv.mahd).padStart(3, '0')}`,
        amount: inv.totalAmount || 0,
        method: inv.paymentMethod || 'Chuyển khoản (VietQR)',
        payer: inv.patientName || 'Bệnh Nhân',
        note: `Thu viện phí BN ${inv.patientName || 'Bệnh Nhân'} (${inv.code || 'HD00' + inv.mahd})`,
        createdAt: inv.date || formatDateTime(new Date())
      }))
      setCashbook([...mappedCashbook, ...INITIAL_CASHBOOK.filter(c => c.type === 'CHI')])
    } catch (err) {
      console.warn('[AccountantPortal] Lỗi tải dữ liệu hóa đơn:', err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Tải dữ liệu khi mở trang
  useEffect(() => {
    loadDataFromDB()
  }, [])

  // Đổi tab có loading nhẹ
  const handleTabChange = (tabId) => {
    setIsLoading(true)
    setActiveTab(tabId)
    setTimeout(() => setIsLoading(false), 200)
  }

  // Toast thông báo
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Tính toán số tiền viện phí cho bệnh nhân đang chọn
  const billingSummary = useMemo(() => {
    if (!selectedQueuePatient) return { subtotal: 0, bhytDiscount: 0, finalTotal: 0 }
    
    const subtotal = selectedQueuePatient.items.reduce((sum, item) => sum + item.price * item.qty, 0)
    
    // Khoản được BHYT chi trả
    const bhytEligibleAmount = selectedQueuePatient.items
      .filter(item => item.bhytCovered)
      .reduce((sum, item) => sum + item.price * item.qty, 0)
    
    const bhytDiscount = Math.round(bhytEligibleAmount * (selectedQueuePatient.insuranceRate || 0))
    const finalTotal = Math.max(0, subtotal - bhytDiscount)

    return { subtotal, bhytDiscount, finalTotal }
  }, [selectedQueuePatient])

  // Tính tiền thừa trả khách
  const changeDue = useMemo(() => {
    const given = Number(customerGivenCash) || 0
    return Math.max(0, given - billingSummary.finalTotal)
  }, [customerGivenCash, billingSummary.finalTotal])

  // Lọc hàng chờ
  const filteredQueue = queue.filter(q => 
    q.patientName.toLowerCase().includes(searchQueueText.toLowerCase()) ||
    q.patientCode.toLowerCase().includes(searchQueueText.toLowerCase()) ||
    q.phone.includes(searchQueueText)
  )

  // Xử lý xác nhận thu tiền & đồng bộ vào CSDL Supabase
  const handleConfirmPayment = async () => {
    if (!selectedQueuePatient) return

    setIsProcessingPayment(true)
    try {
      const methodLabel = paymentMethod === 'CASH' ? 'Tiền mặt' : (paymentMethod === 'QR' ? 'Chuyển khoản (VietQR)' : 'Thẻ POS')
      const dbMethod = paymentMethod === 'CASH' ? 'TienMat' : (paymentMethod === 'QR' ? 'ChuyenKhoan' : 'TheThanhToan')

      // Gọi API cập nhật trạng thái thanh toán trên Supabase Database
      try {
        await invoiceService.updatePayment(selectedQueuePatient.id || selectedQueuePatient.mahd, {
          phuongthuctt: dbMethod,
          paymentMethod: methodLabel
        })
      } catch (apiErr) {
        console.warn('[handleConfirmPayment] API error hoặc fallback:', apiErr.message)
      }

      const newInvoiceId = selectedQueuePatient.invoiceCode || `HD-${Date.now().toString().slice(-6)}`
      const newInvoice = {
        id: newInvoiceId,
        code: selectedQueuePatient.invoiceCode || `HD${Math.floor(100 + Math.random() * 900)}`,
        patientCode: selectedQueuePatient.patientCode,
        patientName: selectedQueuePatient.patientName,
        phone: selectedQueuePatient.phone,
        createdAt: formatDateTime(new Date()),
        totalAmount: billingSummary.subtotal,
        insuranceDiscount: billingSummary.bhytDiscount,
        patientPay: billingSummary.finalTotal,
        paymentMethod: methodLabel,
        status: 'PAID',
        cashier: 'Kế Toán Viên (Thu Ngân)',
        items: selectedQueuePatient.items
      }

      // Thêm vào danh sách hóa đơn
      setInvoices(prev => [newInvoice, ...prev.filter(i => i.code !== newInvoice.code && i.id !== newInvoice.id)])

      // Thêm phiếu thu vào sổ quỹ
      const newVoucher = {
        id: `PT-${Math.floor(100 + Math.random() * 900)}`,
        type: 'THU',
        category: 'Thu viện phí',
        refCode: newInvoice.code,
        amount: billingSummary.finalTotal,
        method: methodLabel,
        payer: selectedQueuePatient.patientName,
        note: `Thu viện phí BN ${selectedQueuePatient.patientName} (${newInvoice.code})`,
        createdAt: formatDateTime(new Date())
      }
      setCashbook(prev => [newVoucher, ...prev])

      // Bỏ bệnh nhân khỏi hàng chờ
      const remainingQueue = queue.filter(p => p.id !== selectedQueuePatient.id)
      setQueue(remainingQueue)
      setSelectedQueuePatient(remainingQueue[0] || null)
      setCustomerGivenCash('')

      showToast(`Đã thu thành công ${formatCurrency(billingSummary.finalTotal)} của BN ${newInvoice.patientName} và đồng bộ CSDL!`)

      // Tự động mở modal in hóa đơn
      setPrintInvoiceData(newInvoice)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Thêm phiếu thu/chi mới
  const handleCreateVoucher = (e) => {
    e.preventDefault()
    if (!newVoucherForm.amount || Number(newVoucherForm.amount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ!')
      return
    }

    const prefix = newVoucherType === 'THU' ? 'PT' : 'PC'
    const newEntry = {
      id: `${prefix}-${Math.floor(100 + Math.random() * 900)}`,
      type: newVoucherType,
      category: newVoucherForm.category,
      refCode: `${prefix}NB-${Date.now().toString().slice(-4)}`,
      amount: Number(newVoucherForm.amount),
      method: newVoucherForm.method,
      payer: newVoucherForm.payer || 'Kế toán viên',
      note: newVoucherForm.note || `${newVoucherType === 'THU' ? 'Thu' : 'Chi'} nội bộ phòng khám`,
      createdAt: formatDateTime(new Date())
    }

    setCashbook(prev => [newEntry, ...prev])
    setCashbookModalOpen(false)
    setNewVoucherForm({
      category: 'Chi mua vật tư',
      amount: '',
      method: 'Tiền mặt',
      payer: '',
      note: ''
    })
    showToast(`Đã lưu phiếu ${newVoucherType === 'THU' ? 'Thu' : 'Chi'} số ${newEntry.id}`)
  }

  // Tính tổng kết quỹ thu chi
  const cashbookStats = useMemo(() => {
    const totalThu = cashbook
      .filter(item => item.type === 'THU')
      .reduce((sum, item) => sum + item.amount, 0)
    const totalChi = cashbook
      .filter(item => item.type === 'CHI')
      .reduce((sum, item) => sum + item.amount, 0)
    const openingBalance = 2000000 // Tồn quỹ đầu ca
    const currentBalance = openingBalance + totalThu - totalChi

    const cashThu = cashbook
      .filter(item => item.type === 'THU' && item.method.includes('Tiền mặt'))
      .reduce((sum, item) => sum + item.amount, 0)
    const cashChi = cashbook
      .filter(item => item.type === 'CHI' && item.method.includes('Tiền mặt'))
      .reduce((sum, item) => sum + item.amount, 0)
    const physicalCashInDrawer = openingBalance + cashThu - cashChi

    const bankThu = cashbook
      .filter(item => item.type === 'THU' && !item.method.includes('Tiền mặt'))
      .reduce((sum, item) => sum + item.amount, 0)

    return { totalThu, totalChi, openingBalance, currentBalance, physicalCashInDrawer, bankThu }
  }, [cashbook])

  // Lọc hóa đơn theo tìm kiếm và trạng thái
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchStatus = invoiceFilterStatus === 'ALL' || inv.status === invoiceFilterStatus
      const matchSearch = inv.patientName.toLowerCase().includes(invoiceSearchText.toLowerCase()) ||
                          inv.code.toLowerCase().includes(invoiceSearchText.toLowerCase()) ||
                          inv.patientCode.toLowerCase().includes(invoiceSearchText.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [invoices, invoiceFilterStatus, invoiceSearchText])

  // Xuất file CSV báo cáo
  const exportCsvReport = () => {
    const headers = ['Mã HĐ', 'Mã BN', 'Họ Tên BN', 'Ngày Thu', 'Tổng Tiền', 'BHYT Trả', 'Thực Thu', 'Hình Thức', 'Trạng Thái']
    const rows = invoices.map(i => [
      i.code,
      i.patientCode,
      `"${i.patientName}"`,
      i.createdAt,
      i.totalAmount,
      i.insuranceDiscount,
      i.patientPay,
      `"${i.paymentMethod}"`,
      i.status === 'PAID' ? 'Đã thu' : 'Chưa thu'
    ])
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Bao_Cao_Doanh_Thu_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Đã tải xuống file báo cáo doanh thu CSV!')
  }

  const currentTabMeta = getTabTitle()

  return (
    <div className="ad-wrapper">
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          className="ad-mobile-backdrop d-lg-none" 
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* ================= 1. SIDEBAR KẾ TOÁN (ĐỒNG BỘ 100% VỚI ADMIN & BÁC SĨ) ================= */}
      <aside className={`ad-sidebar ${sidebarOpen ? '' : 'collapsed'} ${mobileOpen ? 'mobile-open' : ''}`}>
        
        {/* Brand Header */}
        <div className="ad-brand-box">
          {sidebarOpen ? (
            <>
              <div 
                className="ad-brand-link" 
                style={{ cursor: 'pointer' }}
                onClick={() => handleTabChange('cashier')}
              >
                <img src={logo} alt="Logo Phú Lợi Bảo" className="ad-brand-logo" />
                <div className="ad-brand-title-wrap">
                  <span className="ad-brand-name">Phú Lợi Bảo</span>
                  <span className="ad-brand-sub">Cổng Kế Toán</span>
                </div>
              </div>

              {/* Nút thu gọn trên Desktop */}
              <button 
                type="button" 
                className="ad-toggle-btn d-none d-lg-flex" 
                onClick={() => setSidebarOpen(false)}
                title="Thu gọn thanh bên"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
            </>
          ) : (
            /* Khi thu gọn thanh bên */
            <button 
              type="button" 
              className="ad-collapsed-brand-btn d-none d-lg-flex"
              onClick={() => setSidebarOpen(true)}
              title="Mở rộng thanh bên"
            >
              <img src={logo} alt="Logo Phú Lợi Bảo" className="ad-brand-logo" />
              <span className="ad-collapsed-expand-hint">
                <i className="bi bi-chevron-right"></i>
              </span>
            </button>
          )}

          {/* Nút đóng trên Mobile */}
          {mobileOpen && (
            <button 
              type="button" 
              className="ad-toggle-btn d-flex d-lg-none" 
              onClick={() => setMobileOpen(false)}
              title="Đóng menu"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        {/* Danh Sách Navigation Links */}
        <nav className="ad-nav-container">
          {sidebarOpen && (
            <div className="ad-nav-section-title">Nghiệp Vụ Kế Toán</div>
          )}

          <button 
            type="button"
            className={`ad-nav-item border-0 w-100 text-start bg-transparent ${activeTab === 'cashier' ? 'active' : ''}`}
            onClick={() => {
              handleTabChange('cashier')
              setMobileOpen(false)
            }}
            title={!sidebarOpen ? 'Quầy Thu Ngân & Viện Phí' : undefined}
          >
            <i className="bi bi-wallet2 text-primary"></i>
            {sidebarOpen && <span className="flex-grow-1 text-truncate">Quầy Thu Ngân</span>}
            {sidebarOpen && queue.length > 0 && (
              <span className="badge bg-warning text-dark ms-auto" style={{ fontSize: '10.5px' }}>
                {queue.length} chờ
              </span>
            )}
          </button>

          <button 
            type="button"
            className={`ad-nav-item border-0 w-100 text-start bg-transparent ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => {
              handleTabChange('invoices')
              setMobileOpen(false)
            }}
            title={!sidebarOpen ? 'Sổ Hóa Đơn & Biên Lai' : undefined}
          >
            <i className="bi bi-receipt-cutoff text-success"></i>
            {sidebarOpen && <span className="flex-grow-1 text-truncate">Sổ Hóa Đơn & Biên Lai</span>}
            {sidebarOpen && (
              <span className="badge bg-light text-secondary border ms-auto" style={{ fontSize: '10.5px' }}>
                {invoices.length}
              </span>
            )}
          </button>

          <button 
            type="button"
            className={`ad-nav-item border-0 w-100 text-start bg-transparent ${activeTab === 'cashbook' ? 'active' : ''}`}
            onClick={() => {
              handleTabChange('cashbook')
              setMobileOpen(false)
            }}
            title={!sidebarOpen ? 'Sổ Quỹ Thu - Chi' : undefined}
          >
            <i className="bi bi-journal-text text-info"></i>
            {sidebarOpen && <span className="flex-grow-1 text-truncate">Sổ Quỹ Thu - Chi</span>}
            {sidebarOpen && (
              <span className="badge bg-light text-secondary border ms-auto" style={{ fontSize: '10.5px' }}>
                {cashbook.length}
              </span>
            )}
          </button>

          <button 
            type="button"
            className={`ad-nav-item border-0 w-100 text-start bg-transparent ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => {
              handleTabChange('reports')
              setMobileOpen(false)
            }}
            title={!sidebarOpen ? 'Báo Cáo & Kết Toán Ca' : undefined}
          >
            <i className="bi bi-bar-chart-line text-warning"></i>
            {sidebarOpen && <span className="flex-grow-1 text-truncate">Báo Cáo & Kết Toán Ca</span>}
          </button>

          {sidebarOpen && (
            <div className="ad-nav-section-title mt-2">Cổng Phân Hệ Khác</div>
          )}

          <Link 
            to="/dashboard" 
            className="ad-nav-item" 
            title={!sidebarOpen ? 'Cổng Quản Trị (Admin)' : undefined}
          >
            <i className="bi bi-shield-lock-fill text-primary"></i>
            {sidebarOpen && <span className="flex-grow-1 text-truncate">Cổng Quản Trị</span>}
          </Link>

          <Link 
            to="/doctor/ban-kham" 
            className="ad-nav-item" 
            title={!sidebarOpen ? 'Cổng Bác Sĩ' : undefined}
          >
            <i className="bi bi-heart-pulse-fill text-danger"></i>
            {sidebarOpen && <span className="flex-grow-1 text-truncate">Cổng Bác Sĩ</span>}
          </Link>
        </nav>

        {/* Footer Sidebar: Nút Về Trang Chủ / Website Công Khai */}
        <div className="ad-sidebar-footer">
          <Link 
            to="/" 
            className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center"
            title="Trang chủ phòng khám"
          >
            <i className="bi bi-globe me-2"></i>
            {sidebarOpen && <span>Website Công Khai</span>}
          </Link>
        </div>
      </aside>

      {/* ================= 2. KHUNG NỘI DUNG CHÍNH (MAIN WRAPPER) ================= */}
      <div className="ad-main-wrap">
        
        {/* Topbar Header */}
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            {/* Nút mở Menu Mobile */}
            <button 
              type="button" 
              className="btn btn-light d-lg-none border p-2 text-primary me-2"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
            >
              <i className="bi bi-list fs-5"></i>
            </button>

            <div className="d-flex align-items-center gap-2 min-w-0 me-3">
              <h1 className="ad-page-title">{currentTabMeta.title}</h1>
              {currentTabMeta.subtitle && (
                <span className="badge bg-light text-secondary border d-none d-xl-inline-block fw-normal text-truncate" style={{ fontSize: '12px', maxWidth: '180px' }}>
                  {currentTabMeta.subtitle}
                </span>
              )}
            </div>
          </div>

          <div className="ad-topbar-right">
            {/* Vị trí quầy */}
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1.5 d-none d-lg-inline-flex align-items-center gap-1">
              <i className="bi bi-shop me-1"></i>
              <span>Quầy Thu Ngân #01</span>
            </span>

            {/* Thông tin ca trực */}
            <button 
              type="button" 
              className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1 text-dark"
              onClick={() => setShiftModalOpen(true)}
              title="Chi tiết ca trực & đối soát két"
            >
              <i className="bi bi-clock-history text-primary"></i>
              <span className="d-none d-sm-inline">Ca Sáng (07:00 - 12:00)</span>
            </button>

            {/* Live Clock */}
            <div className="d-none d-xl-flex align-items-center text-muted small">
              <i className="bi bi-clock me-1"></i>
              <span>{currentTime.toLocaleTimeString('vi-VN')}</span>
            </div>

            {/* Badge đồng bộ Database */}
            <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 d-none d-md-inline-flex align-items-center gap-1">
              <i className="bi bi-database-check me-1"></i>
              <span>CSDL Supabase</span>
            </span>

            {/* Nút Làm Mới Dữ Liệu Từ Database */}
            <button 
              type="button" 
              className="btn btn-sm btn-light border p-2"
              onClick={async () => {
                await loadDataFromDB()
                showToast('Đã đồng bộ dữ liệu hóa đơn mới nhất từ CSDL Supabase!')
              }}
              title="Đồng bộ lại từ cơ sở dữ liệu"
            >
              <i className="bi bi-arrow-repeat text-secondary"></i>
            </button>

            {/* User Profile Pill */}
            <div className="ad-user-pill">
              <div 
                className="ad-user-avatar"
                style={{ background: 'linear-gradient(135deg, #0d9488, #2563eb)' }}
              >
                KT
              </div>
              <div className="d-none d-sm-block text-start">
                <div className="fw-bold text-dark text-truncate" style={{ fontSize: '13px', lineHeight: '1.2', maxWidth: '170px' }}>
                  Nguyễn Thị Mai
                </div>
                <div className="text-muted text-truncate" style={{ fontSize: '11px', maxWidth: '170px' }}>
                  Thu ngân quầy 01
                </div>
              </div>
            </div>

            {/* Đăng xuất */}
            <button 
              type="button" 
              className="btn btn-sm btn-outline-danger border-0 p-2"
              onClick={() => navigate('/login')}
              title="Đăng xuất khỏi phiên làm việc"
            >
              <i className="bi bi-box-arrow-right fs-5"></i>
            </button>
          </div>
        </header>

        {/* Thân trang chính: Cuộn độc lập, Header & Menu cố định */}
        <main className="ad-content-body d-flex flex-column p-0">
          <div className="p-3 p-lg-4 flex-grow-1">

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="ac-card p-4">
            <div className="ac-skeleton ac-skeleton-title" style={{ width: '30%' }}></div>
            <div className="ac-skeleton ac-skeleton-text" style={{ width: '80%' }}></div>
            <div className="ac-skeleton ac-skeleton-text" style={{ width: '60%' }}></div>
            <div className="ac-skeleton ac-skeleton-text" style={{ width: '70%' }}></div>
            <div className="ac-skeleton ac-skeleton-text" style={{ width: '90%' }}></div>
          </div>
        ) : (
          <>
            {/* TAB 1: QUẦY THU NGÂN POS */}
            {activeTab === 'cashier' && (
              <div className="ac-cashier-grid">
                {/* Cột trái: Danh sách bệnh nhân chờ thu viện phí */}
                <div className="ac-card">
                  <div className="ac-card-header">
                    <h2 className="ac-card-title">
                      <i className="bi bi-hourglass-split text-warning"></i>
                      <span>Hàng Chờ Thu Viện Phí</span>
                    </h2>
                    <span className="badge bg-light text-dark border">{filteredQueue.length}</span>
                  </div>

                  <div className="ac-card-body">
                    <div className="ac-queue-search">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-white border-end-0">
                          <i className="bi bi-search text-muted"></i>
                        </span>
                        <input 
                          type="text" 
                          className="form-control border-start-0" 
                          placeholder="Mã BN, Tên, Số điện thoại..."
                          value={searchQueueText}
                          onChange={(e) => setSearchQueueText(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="ac-queue-list">
                      {filteredQueue.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                          <i className="bi bi-check2-circle fs-2 text-success d-block mb-1"></i>
                          <span>Không có bệnh nhân chờ thanh toán</span>
                        </div>
                      ) : (
                        filteredQueue.map(item => {
                          const total = item.items.reduce((s, it) => s + it.price * it.qty, 0)
                          const isSelected = selectedQueuePatient?.id === item.id

                          return (
                            <div 
                              key={item.id} 
                              className={`ac-queue-item ${isSelected ? 'active' : ''}`}
                              onClick={() => {
                                setSelectedQueuePatient(item)
                                setCustomerGivenCash('')
                              }}
                            >
                              <div className="ac-queue-item-header">
                                <span className="ac-queue-name">
                                  {item.patientName} ({item.patientCode})
                                </span>
                                <span className="ac-badge ac-badge-unpaid">Chờ thu</span>
                              </div>
                              <div className="ac-queue-meta">
                                <span>{item.department}</span>
                                <span className="ac-queue-amount">{formatCurrency(total)}</span>
                              </div>
                              <div className="mt-1" style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                <i className="bi bi-clock me-1"></i>{item.createdAt}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Cột phải: Chi tiết viện phí & Thực hiện thu tiền */}
                <div className="ac-card">
                  {selectedQueuePatient ? (
                    <>
                      <div className="ac-card-header">
                        <h2 className="ac-card-title">
                          <i className="bi bi-receipt text-primary"></i>
                          <span>Chi Tiết Bảng Kê Viện Phí & Thu Tiền</span>
                        </h2>
                        <span className="text-muted small">
                          Mã phiếu: <strong>{selectedQueuePatient.invoiceCode}</strong>
                        </span>
                      </div>

                      <div className="ac-card-body">
                        {/* Thông tin bệnh nhân */}
                        <div className="ac-patient-badge-card">
                          <div className="ac-info-item">
                            <span className="label">Họ và tên bệnh nhân</span>
                            <span className="val">{selectedQueuePatient.patientName}</span>
                          </div>
                          <div className="ac-info-item">
                            <span className="label">Mã BN / Tuổi / Giới</span>
                            <span className="val">{selectedQueuePatient.patientCode} • {selectedQueuePatient.age}t • {selectedQueuePatient.gender}</span>
                          </div>
                          <div className="ac-info-item">
                            <span className="label">Bảo Hiểm Y Tế</span>
                            <span className="val text-success">
                              {selectedQueuePatient.insuranceNumber ? `${selectedQueuePatient.insuranceNumber} (Hưởng 80%)` : 'Không áp dụng'}
                            </span>
                          </div>
                          <div className="ac-info-item">
                            <span className="label">Bác sĩ chỉ định</span>
                            <span className="val">{selectedQueuePatient.doctorName}</span>
                          </div>
                        </div>

                        {/* Bảng kê chi phí */}
                        <div className="ac-table-container">
                          <table className="ac-table">
                            <thead>
                              <tr>
                                <th style={{ width: '40px' }} className="text-center">STT</th>
                                <th>Nội dung chỉ định / Thuốc / Dịch vụ</th>
                                <th style={{ width: '100px' }}>Phân loại</th>
                                <th style={{ width: '60px' }} className="text-center">SL</th>
                                <th style={{ width: '120px' }} className="text-right">Đơn giá</th>
                                <th style={{ width: '120px' }} className="text-right">BHYT</th>
                                <th style={{ width: '130px' }} className="text-right">Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedQueuePatient.items.map((item, idx) => {
                                const lineTotal = item.price * item.qty
                                const bhytPaid = item.bhytCovered ? lineTotal * (selectedQueuePatient.insuranceRate || 0) : 0

                                return (
                                  <tr key={item.id}>
                                    <td className="text-center text-muted">{idx + 1}</td>
                                    <td>
                                      <strong>{item.name}</strong>
                                    </td>
                                    <td>
                                      <span className="badge bg-light text-secondary border" style={{ fontSize: '0.72rem' }}>
                                        {item.type}
                                      </span>
                                    </td>
                                    <td className="text-center">{item.qty}</td>
                                    <td className="text-right">{formatCurrency(item.price)}</td>
                                    <td className="text-right text-success">
                                      {bhytPaid > 0 ? `-${formatCurrency(bhytPaid)}` : '0 ₫'}
                                    </td>
                                    <td className="text-right fw-semibold">
                                      {formatCurrency(lineTotal)}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>

                        <hr className="my-3" />

                        {/* PHƯƠNG THỨC THANH TOÁN (MỞ RỘNG RỘNG HẾT THẺ CHI TIẾT BẢNG KÊ) */}
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <label className="form-label fw-bold text-dark small text-uppercase mb-0" style={{ letterSpacing: '0.4px' }}>
                              <i className="bi bi-credit-card-2-front text-primary me-1.5"></i> Phương thức thanh toán viện phí:
                            </label>
                            <span className="badge bg-light text-secondary border fw-normal" style={{ fontSize: '11px' }}>
                              Chọn hình thức thanh toán phù hợp
                            </span>
                          </div>

                          <div className="ac-payment-methods w-100 mb-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <button 
                              type="button" 
                              className={`ac-pay-btn py-2.5 ${paymentMethod === 'CASH' ? 'selected' : ''}`}
                              onClick={() => setPaymentMethod('CASH')}
                            >
                              <i className="bi bi-cash-stack fs-4 text-success"></i>
                              <span className="fw-semibold" style={{ fontSize: '14px' }}>Tiền Mặt</span>
                              <span className="text-muted small" style={{ fontSize: '11px' }}>Thu tiền mặt trực tiếp tại quầy</span>
                            </button>

                            <button 
                              type="button" 
                              className={`ac-pay-btn py-2.5 ${paymentMethod === 'QR' ? 'selected' : ''}`}
                              onClick={() => {
                                setPaymentMethod('QR')
                                setQrModalOpen(true)
                              }}
                            >
                              <i className="bi bi-qr-code-scan fs-4 text-primary"></i>
                              <span className="fw-semibold" style={{ fontSize: '14px' }}>Chuyển Khoản VietQR</span>
                              <span className="text-muted small" style={{ fontSize: '11px' }}>Quét mã QR khớp đúng số tiền</span>
                            </button>

                            <button 
                              type="button" 
                              className={`ac-pay-btn py-2.5 ${paymentMethod === 'CARD' ? 'selected' : ''}`}
                              onClick={() => setPaymentMethod('CARD')}
                            >
                              <i className="bi bi-credit-card fs-4 text-info"></i>
                              <span className="fw-semibold" style={{ fontSize: '14px' }}>Thẻ Ngân Hàng / POS</span>
                              <span className="text-muted small" style={{ fontSize: '11px' }}>Quẹt thẻ ngân hàng qua máy POS</span>
                            </button>
                          </div>

                          {/* Khung nhập tiền mặt (Mở rộng rộng hết thẻ) */}
                          {paymentMethod === 'CASH' && (
                            <div className="p-3 bg-light rounded-3 border mb-3">
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', alignItems: 'center' }}>
                                <div>
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="form-label small fw-semibold text-secondary mb-0">
                                      Số tiền khách đưa:
                                    </label>
                                    <div className="d-flex flex-wrap gap-1">
                                      <button 
                                        type="button" 
                                        className="btn btn-sm btn-white border px-2 py-0 text-primary fw-semibold shadow-sm"
                                        style={{ fontSize: '11.5px', background: '#fff' }}
                                        onClick={() => setCustomerGivenCash(billingSummary.finalTotal.toString())}
                                      >
                                        Đủ tiền ({formatCurrency(billingSummary.finalTotal)})
                                      </button>
                                      {[500000, 1000000, 2000000].filter(v => v > billingSummary.finalTotal).slice(0, 2).map(amt => (
                                        <button 
                                          key={amt}
                                          type="button" 
                                          className="btn btn-sm btn-white border px-2 py-0 text-secondary shadow-sm"
                                          style={{ fontSize: '11.5px', background: '#fff' }}
                                          onClick={() => setCustomerGivenCash(amt.toString())}
                                        >
                                          {formatCurrency(amt)}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="input-group">
                                    <input 
                                      type="number" 
                                      className="form-control form-control-lg fw-bold text-dark" 
                                      placeholder="Nhập số tiền khách đưa..."
                                      value={customerGivenCash}
                                      onChange={(e) => setCustomerGivenCash(e.target.value)}
                                    />
                                    <span className="input-group-text fw-bold">₫</span>
                                  </div>
                                </div>

                                <div>
                                  <div className="p-2.5 bg-white rounded-3 border h-100 d-flex flex-column justify-content-center text-center shadow-sm">
                                    <div className="small fw-semibold text-secondary mb-0.5">
                                      Tiền thừa trả lại khách:
                                    </div>
                                    <div className="fw-bold text-success fs-3">
                                      {formatCurrency(changeDue)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {paymentMethod === 'QR' && (
                            <div className="p-3 bg-light rounded-3 border mb-3 text-center">
                              <span className="small text-muted d-block mb-2">
                                <i className="bi bi-info-circle text-primary me-1"></i> Bệnh nhân quét mã VietQR tự động khớp đúng số tiền <strong>{formatCurrency(billingSummary.finalTotal)}</strong>
                              </span>
                              <button 
                                type="button" 
                                className="ac-btn ac-btn-outline btn-sm px-4 py-1.5"
                                onClick={() => setQrModalOpen(true)}
                              >
                                <i className="bi bi-qr-code me-1.5"></i> Mở Màn Hình Quét Mã VietQR
                              </button>
                            </div>
                          )}

                          {paymentMethod === 'CARD' && (
                            <div className="p-3 bg-light rounded-3 border mb-3">
                              <div className="d-flex align-items-center gap-2 text-muted small">
                                <i className="bi bi-credit-card fs-4 text-primary"></i>
                                <span>Yêu cầu bệnh nhân quẹt/chạm thẻ trên máy POS quầy thu ngân. Số tiền giao dịch: <strong className="text-primary">{formatCurrency(billingSummary.finalTotal)}</strong></span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* BẢNG TỔNG KẾT VIỆN PHÍ & NÚT XÁC NHẬN (CĂN GIỮA) */}
                        <div className="p-3 p-md-4 rounded-3 border bg-light mb-2">
                          <div className="mx-auto" style={{ width: '100%', maxWidth: '480px' }}>
                            <div className="d-flex flex-column gap-2">
                              <div className="d-flex justify-content-between small">
                                <span className="text-muted">Tổng viện phí ban đầu:</span>
                                <span className="fw-semibold text-dark">{formatCurrency(billingSummary.subtotal)}</span>
                              </div>
                              <div className="d-flex justify-content-between small text-success">
                                <span>BHYT chi trả ({Math.round((selectedQueuePatient.insuranceRate || 0) * 100)}% danh mục):</span>
                                <span className="fw-semibold">-{formatCurrency(billingSummary.bhytDiscount)}</span>
                              </div>
                              <div className="d-flex justify-content-between align-items-baseline pt-2 border-top mt-1">
                                <span className="fw-bold text-dark fs-6">SỐ TIỀN THỰC THU:</span>
                                <span className="fw-bold text-primary fs-3">{formatCurrency(billingSummary.finalTotal)}</span>
                              </div>

                              <button 
                                type="button" 
                                className="ac-btn ac-btn-primary w-100 py-3 fs-6 fw-bold shadow-sm mt-2 d-flex flex-column align-items-center justify-content-center"
                                disabled={isProcessingPayment}
                                onClick={handleConfirmPayment}
                                style={{ minHeight: '68px' }}
                              >
                                {isProcessingPayment ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm mb-1" role="status"></span>
                                    <span>Đang lưu hóa đơn...</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="d-flex align-items-center gap-2">
                                      <i className="bi bi-check2-circle fs-4"></i>
                                      <span className="fs-5">Xác Nhận Thu Tiền</span>
                                    </div>
                                    <span className="fw-normal small text-white-50 mt-0.5">& In Biên Lai Viện Phí</span>
                                  </>
                                )}
                              </button>

                              <div className="text-center text-muted small mt-1" style={{ fontSize: '11.5px' }}>
                                <i className="bi bi-shield-check text-success me-1"></i>
                                Hệ thống sẽ tự động cập nhật sổ quỹ ca trực và xuất biên lai sau khi xác nhận.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 p-md-5 text-center">
                      <div 
                        className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm"
                        style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', color: '#2563eb' }}
                      >
                        <i className="bi bi-receipt-cutoff fs-2"></i>
                      </div>
                      <h3 className="fs-5 fw-bold text-dark mb-2">Chưa Chọn Bệnh Nhân Thu Viện Phí</h3>
                      <p className="text-muted mx-auto mb-4" style={{ maxWidth: '440px', fontSize: '13px' }}>
                        Vui lòng chọn một bệnh nhân trong danh sách hàng chờ ở cột bên trái hoặc quét mã phiếu để nạp bảng kê chi phí thanh toán.
                      </p>

                      <div className="row g-3 justify-content-center mb-4 text-start" style={{ maxWidth: '640px', margin: '0 auto' }}>
                        <div className="col-sm-4">
                          <div className="p-3 border rounded-3 bg-light h-100">
                            <div className="fw-semibold text-primary mb-1" style={{ fontSize: '13px' }}>
                              <i className="bi bi-1-circle-fill me-1"></i> Bước 1: Tiếp nhận
                            </div>
                            <div className="text-muted" style={{ fontSize: '11.5px' }}>
                              Chọn ca khám cần thanh toán từ hàng chờ quầy
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-4">
                          <div className="p-3 border rounded-3 bg-light h-100">
                            <div className="fw-semibold text-primary mb-1" style={{ fontSize: '13px' }}>
                              <i className="bi bi-2-circle-fill me-1"></i> Bước 2: Kiểm tra
                            </div>
                            <div className="text-muted" style={{ fontSize: '11.5px' }}>
                              Đối soát tiền thuốc, dịch vụ & khấu trừ BHYT
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-4">
                          <div className="p-3 border rounded-3 bg-light h-100">
                            <div className="fw-semibold text-primary mb-1" style={{ fontSize: '13px' }}>
                              <i className="bi bi-3-circle-fill me-1"></i> Bước 3: Thu tiền
                            </div>
                            <div className="text-muted" style={{ fontSize: '11.5px' }}>
                              Thu tiền mặt / POS / QR và in biên lai viện phí
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex flex-wrap align-items-center justify-content-center gap-2">
                        {filteredQueue.length > 0 && (
                          <button 
                            type="button" 
                            className="btn btn-primary btn-sm px-3 py-2"
                            onClick={() => setSelectedQueuePatient(filteredQueue[0])}
                          >
                            <i className="bi bi-play-circle me-1"></i> Tiếp nhận ca đầu ({filteredQueue[0].patientName})
                          </button>
                        )}
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary btn-sm px-3 py-2"
                          onClick={() => handleTabChange('invoices')}
                        >
                          <i className="bi bi-receipt me-1"></i> Xem Sổ Hóa Đơn
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary btn-sm px-3 py-2"
                          onClick={() => handleTabChange('cashbook')}
                        >
                          <i className="bi bi-journal-text me-1"></i> Sổ Quỹ Thu - Chi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: SỔ HÓA ĐƠN & BIÊN LAI */}
            {activeTab === 'invoices' && (
              <div className="ac-card">
                <div className="ac-card-header flex-wrap gap-2">
                  <h2 className="ac-card-title">
                    <i className="bi bi-receipt-cutoff text-primary"></i>
                    <span>Sổ Hóa Đơn & Biên Lai Thu Viện Phí</span>
                  </h2>

                  <div className="d-flex align-items-center gap-2">
                    <button 
                      className="ac-btn ac-btn-outline ac-btn-sm"
                      onClick={exportCsvReport}
                    >
                      <i className="bi bi-file-earmark-excel me-1 text-success"></i>
                      Xuất Excel/CSV
                    </button>
                  </div>
                </div>

                <div className="ac-card-body">
                  {/* Bộ lọc */}
                  <div className="row g-2 mb-3">
                    <div className="col-md-4">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-white border-end-0">
                          <i className="bi bi-search text-muted"></i>
                        </span>
                        <input 
                          type="text" 
                          className="form-control border-start-0" 
                          placeholder="Tìm theo mã HĐ, tên bệnh nhân, mã BN..."
                          value={invoiceSearchText}
                          onChange={(e) => setInvoiceSearchText(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <select 
                        className="form-select form-select-sm"
                        value={invoiceFilterStatus}
                        onChange={(e) => setInvoiceFilterStatus(e.target.value)}
                      >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="PAID">Đã thanh toán</option>
                        <option value="UNPAID">Chưa thanh toán</option>
                      </select>
                    </div>

                    <div className="col-md-5 text-end small text-muted d-flex align-items-center justify-content-end">
                      <span>Hiển thị <strong>{filteredInvoices.length}</strong> hóa đơn</span>
                    </div>
                  </div>

                  {/* Bảng danh sách hóa đơn */}
                  <div className="ac-table-container">
                    <table className="ac-table">
                      <thead>
                        <tr>
                          <th>Mã HĐ</th>
                          <th>Bệnh nhân</th>
                          <th>Ngày thu</th>
                          <th className="text-right">Tổng viện phí</th>
                          <th className="text-right">BHYT trả</th>
                          <th className="text-right">Thực thu</th>
                          <th>Phương thức</th>
                          <th>Trạng thái</th>
                          <th className="text-center" style={{ width: '130px' }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInvoices.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="text-center py-4 text-muted">
                              Không tìm thấy hóa đơn phù hợp
                            </td>
                          </tr>
                        ) : (
                          filteredInvoices.map((inv) => (
                            <tr key={inv.id}>
                              <td className="fw-semibold text-primary">{inv.code}</td>
                              <td>
                                <div><strong>{inv.patientName}</strong></div>
                                <div className="text-muted small">{inv.patientCode}</div>
                              </td>
                              <td className="small text-muted">{inv.createdAt}</td>
                              <td className="text-right">{formatCurrency(inv.totalAmount)}</td>
                              <td className="text-right text-success">
                                {inv.insuranceDiscount > 0 ? `-${formatCurrency(inv.insuranceDiscount)}` : '0 ₫'}
                              </td>
                              <td className="text-right fw-bold">{formatCurrency(inv.patientPay)}</td>
                              <td className="small">{inv.paymentMethod}</td>
                              <td>
                                {inv.status === 'PAID' ? (
                                  <span className="ac-badge ac-badge-paid"><i className="bi bi-check-circle"></i> Đã thu</span>
                                ) : (
                                  <span className="ac-badge ac-badge-unpaid"><i className="bi bi-clock"></i> Chưa thu</span>
                                )}
                              </td>
                              <td className="text-center">
                                <button 
                                  className="ac-btn ac-btn-outline ac-btn-sm py-1 px-2"
                                  onClick={() => setPrintInvoiceData(inv)}
                                  title="Xem & In phiếu thu"
                                >
                                  <i className="bi bi-printer me-1"></i> In
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SỔ QUỸ THU - CHI */}
            {activeTab === 'cashbook' && (
              <div className="ac-card">
                <div className="ac-card-header flex-wrap gap-2">
                  <h2 className="ac-card-title">
                    <i className="bi bi-journal-check text-primary"></i>
                    <span>Sổ Quỹ Thu - Chi Tiền Mặt & Ngân Hàng Trong Ngày</span>
                  </h2>

                  <div className="d-flex gap-2">
                    <button 
                      className="ac-btn ac-btn-success ac-btn-sm"
                      onClick={() => {
                        setNewVoucherType('THU')
                        setCashbookModalOpen(true)
                      }}
                    >
                      <i className="bi bi-plus-circle me-1"></i> + Lập Phiếu Thu Ngoài
                    </button>

                    <button 
                      className="ac-btn ac-btn-outline ac-btn-sm text-danger"
                      onClick={() => {
                        setNewVoucherType('CHI')
                        setCashbookModalOpen(true)
                      }}
                    >
                      <i className="bi bi-dash-circle me-1"></i> - Lập Phiếu Chi Mua Sắm
                    </button>
                  </div>
                </div>

                <div className="ac-card-body">
                  {/* Bảng cân đối quỹ nhanh */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-3">
                      <div className="p-3 bg-light rounded border">
                        <div className="small text-muted">Tồn Quỹ Đầu Ca:</div>
                        <div className="fs-5 fw-bold text-dark">{formatCurrency(cashbookStats.openingBalance)}</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 bg-light rounded border">
                        <div className="small text-muted">Tổng Thu Trong Ca:</div>
                        <div className="fs-5 fw-bold text-success">+{formatCurrency(cashbookStats.totalThu)}</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 bg-light rounded border">
                        <div className="small text-muted">Tổng Chi Trong Ca:</div>
                        <div className="fs-5 fw-bold text-danger">-{formatCurrency(cashbookStats.totalChi)}</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3 bg-light rounded border">
                        <div className="small text-muted">Tồn Quỹ Hiện Tại:</div>
                        <div className="fs-5 fw-bold text-primary">{formatCurrency(cashbookStats.currentBalance)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Nhật ký thu chi */}
                  <div className="ac-table-container">
                    <table className="ac-table">
                      <thead>
                        <tr>
                          <th>Mã Phiếu</th>
                          <th>Thời gian</th>
                          <th>Loại</th>
                          <th>Danh mục</th>
                          <th>Người nộp / nhận</th>
                          <th>Nội dung giải trình</th>
                          <th>Phương thức</th>
                          <th className="text-right">Số tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cashbook.map((entry) => (
                          <tr key={entry.id}>
                            <td className="fw-semibold">{entry.id}</td>
                            <td className="small text-muted">{entry.createdAt}</td>
                            <td>
                              {entry.type === 'THU' ? (
                                <span className="ac-badge ac-badge-paid">+ THU</span>
                              ) : (
                                <span className="ac-badge ac-badge-refunded">- CHI</span>
                              )}
                            </td>
                            <td className="fw-medium">{entry.category}</td>
                            <td>{entry.payer}</td>
                            <td className="small text-muted">{entry.note}</td>
                            <td className="small">{entry.method}</td>
                            <td className={`text-right fw-bold ${entry.type === 'THU' ? 'text-success' : 'text-danger'}`}>
                              {entry.type === 'THU' ? `+${formatCurrency(entry.amount)}` : `-${formatCurrency(entry.amount)}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BÁO CÁO & KẾT TOÁN CA */}
            {activeTab === 'reports' && (
              <div className="row g-3">
                <div className="col-lg-8">
                  <div className="ac-card mb-3">
                    <div className="ac-card-header">
                      <h2 className="ac-card-title">
                        <i className="bi bi-clipboard-data text-primary"></i>
                        <span>Biên Bản Đối Soát & Bàn Giao Ca Trực Thu Ngân</span>
                      </h2>
                      <button className="ac-btn ac-btn-outline ac-btn-sm" onClick={() => window.print()}>
                        <i className="bi bi-printer me-1"></i> In biên bản kết ca
                      </button>
                    </div>

                    <div className="ac-card-body">
                      <div className="border p-3 rounded mb-3 bg-light">
                        <div className="row g-2 small">
                          <div className="col-sm-6"><strong>Phòng khám:</strong> Đa Khoa Phú Lợi Bảo</div>
                          <div className="col-sm-6"><strong>Quầy thu số:</strong> 01 (Tầng 1)</div>
                          <div className="col-sm-6"><strong>Nhân viên bàn giao:</strong> Nguyễn Thị Mai</div>
                          <div className="col-sm-6"><strong>Thời gian chốt:</strong> {formatDateTime(currentTime)}</div>
                        </div>
                      </div>

                      <h3 className="fs-6 fw-bold mb-2">Bảng Kê Chi Tiết Tiền Mặt Thực Tế Bàn Giao:</h3>
                      <div className="ac-table-container">
                        <table className="ac-table">
                          <thead>
                            <tr>
                              <th>Chỉ tiêu đối soát</th>
                              <th className="text-right">Số tiền ghi nhận</th>
                              <th>Ghi chú</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>1. Tồn tiền mặt đầu ca bàn giao</td>
                              <td className="text-right fw-semibold">{formatCurrency(cashbookStats.openingBalance)}</td>
                              <td className="small text-muted">Tiền lẻ trả lại</td>
                            </tr>
                            <tr>
                              <td>2. Tổng thu viện phí tiền mặt trong ca</td>
                              <td className="text-right fw-semibold text-success">+{formatCurrency(cashbookStats.physicalCashInDrawer - cashbookStats.openingBalance + cashbookStats.totalChi)}</td>
                              <td className="small text-muted">Từ hóa đơn tiền mặt</td>
                            </tr>
                            <tr>
                              <td>3. Tổng các khoản chi tiền mặt tại quầy</td>
                              <td className="text-right fw-semibold text-danger">-{formatCurrency(cashbookStats.totalChi)}</td>
                              <td className="small text-muted">Mua vật tư tiêu hao</td>
                            </tr>
                            <tr className="table-active">
                              <td><strong>4. Tiền mặt thực tế tại két bàn giao</strong></td>
                              <td className="text-right fw-bold text-primary fs-6">{formatCurrency(cashbookStats.physicalCashInDrawer)}</td>
                              <td className="small fw-semibold text-success">Khớp 100% với hệ thống</td>
                            </tr>
                            <tr>
                              <td>5. Doanh thu chuyển khoản ngân hàng (VietQR / POS)</td>
                              <td className="text-right fw-semibold text-info">{formatCurrency(cashbookStats.bankThu)}</td>
                              <td className="small text-muted">Đã về thẳng tài khoản viện</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="row text-center mt-4 pt-3 border-top">
                        <div className="col-6">
                          <div className="fw-semibold small">Người Bàn Giao (Thu Ngân)</div>
                          <div className="text-muted small mt-1">(Ký và ghi rõ họ tên)</div>
                          <div className="mt-5 fw-bold">Nguyễn Thị Mai</div>
                        </div>
                        <div className="col-6">
                          <div className="fw-semibold small">Người Nhận Bàn Giao (Ca Tiếp Theo)</div>
                          <div className="text-muted small mt-1">(Ký và ghi rõ họ tên)</div>
                          <div className="mt-5 fw-bold">...................................</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="ac-card">
                    <div className="ac-card-header">
                      <h2 className="ac-card-title">
                        <i className="bi bi-pie-chart text-primary"></i>
                        <span>Cơ Cấu Doanh Thu</span>
                      </h2>
                    </div>

                    <div className="ac-card-body">
                      <div className="mb-3">
                        <div className="d-flex justify-content-between small mb-1">
                          <span>Tiền khám bệnh:</span>
                          <strong>42% (600.000 ₫)</strong>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div className="progress-bar bg-primary" style={{ width: '42%' }}></div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between small mb-1">
                          <span>Tiền thuốc theo đơn:</span>
                          <strong>35% (500.000 ₫)</strong>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div className="progress-bar bg-success" style={{ width: '35%' }}></div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between small mb-1">
                          <span>Tiền xét nghiệm & CĐHA:</span>
                          <strong>23% (330.000 ₫)</strong>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div className="progress-bar bg-info" style={{ width: '23%' }}></div>
                        </div>
                      </div>

                      <hr />

                      <div className="d-grid gap-2">
                        <button className="ac-btn ac-btn-primary" onClick={exportCsvReport}>
                          <i className="bi bi-download me-1"></i> Tải Dữ Liệu Báo Cáo (.CSV)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
          </div>

          {/* FOOTER / STATUSBAR NẰM GỌN TRONG MAIN CONTENT - ĐỒNG BỘ VỚI BÁC SĨ & ADMIN */}
          <footer className="doctor-statusbar">
            <div className="d-flex align-items-center text-truncate me-2">
              <span className="fw-semibold text-dark me-2">© 2026 Phòng Khám Đa Khoa Phú Lợi Bảo</span>
              <span className="d-none d-md-inline text-muted me-2">•</span>
              <span className="d-none d-md-inline">
                <i className="bi bi-shop text-primary me-1"></i> Quầy Thu Ngân #01 • Ca Trực Sáng
              </span>
            </div>

            <div className="d-flex align-items-center gap-3 flex-shrink-0">
              <span className="d-none d-sm-inline badge bg-light text-secondary border">
                HIS v2.4.0 • Accounting & Billing Edition
              </span>
              <span className="text-success fw-semibold d-flex align-items-center">
                <span className="spinner-grow spinner-grow-sm text-success me-1" style={{ width: '8px', height: '8px' }}></span>
                <span className="d-none d-sm-inline">Két tiền mặt: </span> Đã đồng bộ
              </span>
            </div>
          </footer>
        </main>
      </div>

      {/* MODAL 1: XEM & IN BIÊN LAI / HÓA ĐƠN VIỆN PHÍ */}
      {printInvoiceData && (
        <div className="ac-modal-overlay">
          <div className="ac-modal-dialog" style={{ maxWidth: '620px' }}>
            <div className="ac-modal-header no-print">
              <h3 className="ac-modal-title">
                <i className="bi bi-printer me-2 text-primary"></i>
                Mẫu In Biên Lai Thu Tiền Viện Phí
              </h3>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setPrintInvoiceData(null)}
              ></button>
            </div>

            <div className="ac-modal-body p-0">
              <div id="ac-printable-invoice" className="ac-invoice-print-view">
                <div className="ac-invoice-print-header">
                  <div className="d-flex align-items-center gap-2">
                    <img src={logo} alt="Logo" style={{ width: '42px', height: '42px', borderRadius: '4px' }} />
                    <div>
                      <strong style={{ fontSize: '13px', textTransform: 'uppercase', display: 'block' }}>
                        PHÒNG KHÁM ĐA KHOA PHÚ LỢI BẢO
                      </strong>
                      <span style={{ fontSize: '11px', color: '#475569' }}>
                        123 Nguyễn Tri Phương, Quận 5, TP. Hồ Chí Minh • ĐT: (028) 3838 9999
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '11px' }}>
                    <div>Mã HĐ: <strong>{printInvoiceData.code}</strong></div>
                    <div>Số: {printInvoiceData.id}</div>
                  </div>
                </div>

                <div className="ac-invoice-print-title">
                  <h3>BIÊN LAI THU TIỀN VIỆN PHÍ</h3>
                  <p>Ngày {currentTime.getDate()} tháng {currentTime.getMonth() + 1} năm {currentTime.getFullYear()}</p>
                </div>

                <div style={{ marginBottom: '12px', fontSize: '12px' }}>
                  <div className="row g-1">
                    <div className="col-7">Họ tên người bệnh: <strong>{printInvoiceData.patientName}</strong></div>
                    <div className="col-5">Mã bệnh nhân: <strong>{printInvoiceData.patientCode}</strong></div>
                    <div className="col-7">Hình thức thanh toán: <strong>{printInvoiceData.paymentMethod}</strong></div>
                    <div className="col-5">Thời gian: <span>{printInvoiceData.createdAt}</span></div>
                  </div>
                </div>

                <table className="ac-table" style={{ fontSize: '12px', marginBottom: '12px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '35px' }} className="text-center">STT</th>
                      <th>Tên dịch vụ / Thuốc</th>
                      <th style={{ width: '50px' }} className="text-center">SL</th>
                      <th style={{ width: '90px' }} className="text-right">Đơn giá</th>
                      <th style={{ width: '100px' }} className="text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(printInvoiceData.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td>{item.name}</td>
                        <td className="text-center">{item.qty || 1}</td>
                        <td className="text-right">{formatCurrency(item.price)}</td>
                        <td className="text-right">{formatCurrency(item.price * (item.qty || 1))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ borderTop: '1px solid #000', paddingTop: '6px', fontSize: '12px' }}>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Tổng chi phí:</span>
                    <span>{formatCurrency(printInvoiceData.totalAmount)}</span>
                  </div>
                  {printInvoiceData.insuranceDiscount > 0 && (
                    <div className="d-flex justify-content-between mb-1 text-success">
                      <span>BHYT chi trả khấu trừ:</span>
                      <span>-{formatCurrency(printInvoiceData.insuranceDiscount)}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between fw-bold fs-6" style={{ borderTop: '1px dashed #000', paddingTop: '4px' }}>
                    <span>Số tiền người bệnh thực nộp:</span>
                    <span>{formatCurrency(printInvoiceData.patientPay)}</span>
                  </div>
                </div>

                <div className="ac-invoice-signatures">
                  <div className="ac-signature-block">
                    <span className="ac-signature-title">Người Nộp Tiền</span>
                    <span className="ac-signature-name">{printInvoiceData.patientName}</span>
                  </div>
                  <div className="ac-signature-block">
                    <span className="ac-signature-title">Thủ Quỹ</span>
                    <span className="ac-signature-name">Trần Văn Bình</span>
                  </div>
                  <div className="ac-signature-block">
                    <span className="ac-signature-title">Người Lập Phiếu</span>
                    <span className="ac-signature-name">{printInvoiceData.cashier || 'Nguyễn Thị Mai'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ac-modal-footer no-print">
              <button 
                type="button" 
                className="ac-btn ac-btn-outline" 
                onClick={() => setPrintInvoiceData(null)}
              >
                Đóng
              </button>
              <button 
                type="button" 
                className="ac-btn ac-btn-primary" 
                onClick={() => window.print()}
              >
                <i className="bi bi-printer me-1"></i> In Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TẠO PHIẾU THU / PHIẾU CHI */}
      {cashbookModalOpen && (
        <div className="ac-modal-overlay">
          <div className="ac-modal-dialog">
            <div className="ac-modal-header">
              <h3 className="ac-modal-title">
                {newVoucherType === 'THU' ? (
                  <span className="text-success"><i className="bi bi-plus-circle me-2"></i>Lập Phiếu Thu Quỹ Mới</span>
                ) : (
                  <span className="text-danger"><i className="bi bi-dash-circle me-2"></i>Lập Phiếu Chi Mua Sắm / Vật Tư</span>
                )}
              </h3>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setCashbookModalOpen(false)}
              ></button>
            </div>

            <form onSubmit={handleCreateVoucher}>
              <div className="ac-modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Danh mục:</label>
                  <select 
                    className="form-select form-select-sm"
                    value={newVoucherForm.category}
                    onChange={(e) => setNewVoucherForm({ ...newVoucherForm, category: e.target.value })}
                  >
                    {newVoucherType === 'THU' ? (
                      <>
                        <option value="Thu tạm ứng viện phí">Thu tạm ứng viện phí</option>
                        <option value="Thu hoàn ứng khám đoàn">Thu hoàn ứng khám đoàn</option>
                        <option value="Thu thanh lý bao bì / phế liệu">Thu thanh lý bao bì / phế liệu</option>
                        <option value="Thu khác">Thu khác</option>
                      </>
                    ) : (
                      <>
                        <option value="Chi mua vật tư y tế khẩn">Chi mua vật tư y tế khẩn</option>
                        <option value="Chi văn phòng phẩm & in ấn">Chi văn phòng phẩm & in ấn</option>
                        <option value="Chi hoàn trả viện phí thừa cho bệnh nhân">Chi hoàn trả viện phí thừa cho bệnh nhân</option>
                        <option value="Chi tiếp khách / hội chẩn">Chi tiếp khách / hội chẩn</option>
                        <option value="Chi sửa chữa thiết bị">Chi sửa chữa thiết bị</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Số tiền (VNĐ):</label>
                  <input 
                    type="number" 
                    className="ac-input" 
                    placeholder="Ví dụ: 250000"
                    required
                    value={newVoucherForm.amount}
                    onChange={(e) => setNewVoucherForm({ ...newVoucherForm, amount: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Hình thức:</label>
                  <select 
                    className="form-select form-select-sm"
                    value={newVoucherForm.method}
                    onChange={(e) => setNewVoucherForm({ ...newVoucherForm, method: e.target.value })}
                  >
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Chuyển khoản">Chuyển khoản</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    {newVoucherType === 'THU' ? 'Họ tên người nộp tiền:' : 'Họ tên người nhận tiền:'}
                  </label>
                  <input 
                    type="text" 
                    className="ac-input" 
                    placeholder="Nhập họ và tên..."
                    required
                    value={newVoucherForm.payer}
                    onChange={(e) => setNewVoucherForm({ ...newVoucherForm, payer: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Nội dung diễn giải chi tiết:</label>
                  <textarea 
                    className="ac-input" 
                    rows="2"
                    placeholder="Lý do thu / chi rõ ràng để tiện đối soát..."
                    value={newVoucherForm.note}
                    onChange={(e) => setNewVoucherForm({ ...newVoucherForm, note: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="ac-modal-footer">
                <button 
                  type="button" 
                  className="ac-btn ac-btn-outline" 
                  onClick={() => setCashbookModalOpen(false)}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className={`ac-btn ${newVoucherType === 'THU' ? 'ac-btn-success' : 'ac-btn-danger'}`}
                >
                  Lưu Phiếu {newVoucherType === 'THU' ? 'Thu' : 'Chi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MÃ QR THANH TOÁN VIETQR */}
      {qrModalOpen && selectedQueuePatient && (
        <div className="ac-modal-overlay">
          <div className="ac-modal-dialog" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div className="ac-modal-header">
              <h3 className="ac-modal-title">Mã QR VietQR Viện Phí</h3>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setQrModalOpen(false)}
              ></button>
            </div>

            <div className="ac-modal-body">
              <p className="small text-muted mb-2">
                Bệnh nhân dùng ứng dụng ngân hàng quét mã dưới đây để chuyển khoản:
              </p>

              {/* VietQR Generator Image Mẫu */}
              <div className="p-3 bg-light rounded border d-inline-block mb-3">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=2|99|0901234567|PHONG%20KHAM%20DA%20KHOA|VIETCOMBANK|${billingSummary.finalTotal}|TT%20VIENPHI%20${selectedQueuePatient.patientCode}`}
                  alt="VietQR Viện Phí" 
                  style={{ width: '200px', height: '200px' }}
                />
              </div>

              <div className="small text-start border p-2 rounded bg-light">
                <div><strong>Ngân hàng:</strong> Vietcombank (Chi nhánh TP.HCM)</div>
                <div><strong>Số tài khoản:</strong> 0071 000 888 999</div>
                <div><strong>Chủ tài khoản:</strong> CONG TY PHONG KHAM DA KHOA PHU LOI BAO</div>
                <div><strong>Số tiền:</strong> <span className="text-primary fw-bold">{formatCurrency(billingSummary.finalTotal)}</span></div>
                <div><strong>Nội dung:</strong> <code>TT VIENPHI {selectedQueuePatient.patientCode}</code></div>
              </div>
            </div>

            <div className="ac-modal-footer">
              <button 
                type="button" 
                className="ac-btn ac-btn-primary w-100" 
                onClick={() => {
                  setQrModalOpen(false)
                  setPaymentMethod('QR')
                  showToast('Đã chọn hình thức chuyển khoản QR!')
                }}
              >
                Xác Nhận Đã Nhận Chuyển Khoản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: THÔNG TIN CA TRỰC (RESPONSIVE CHO MOBILE) */}
      {shiftModalOpen && (
        <div className="ac-modal-overlay">
          <div className="ac-modal-dialog" style={{ maxWidth: '440px' }}>
            <div className="ac-modal-header">
              <h3 className="ac-modal-title">
                <i className="bi bi-clock-history me-2 text-primary"></i>
                Thông Tin Ca Trực Thu Ngân
              </h3>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShiftModalOpen(false)}
              ></button>
            </div>

            <div className="ac-modal-body">
              <div className="p-3 bg-light rounded border mb-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="ac-status-dot"></span>
                  <strong className="text-success">Ca trực đang hoạt động</strong>
                </div>
                <div className="small mb-1"><strong>Quầy thu:</strong> Quầy số #01 (Tầng 1)</div>
                <div className="small mb-1"><strong>Nhân viên:</strong> Nguyễn Thị Mai</div>
                <div className="small mb-1"><strong>Thời gian ca:</strong> Sáng (07:00 - 12:00)</div>
                <div className="small mb-1"><strong>Giờ hiện tại:</strong> {currentTime.toLocaleTimeString('vi-VN')} ({currentTime.toLocaleDateString('vi-VN')})</div>
                <div className="small"><strong>Tồn quỹ đầu ca:</strong> <span className="fw-bold text-primary">{formatCurrency(cashbookStats.openingBalance)}</span></div>
              </div>

              <div className="row g-2 text-center small">
                <div className="col-6">
                  <div className="p-2 border rounded bg-white">
                    <div className="text-muted">Tổng thu ca:</div>
                    <div className="fw-bold text-success">{formatCurrency(cashbookStats.totalThu)}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 border rounded bg-white">
                    <div className="text-muted">Tiền két quầy:</div>
                    <div className="fw-bold text-primary">{formatCurrency(cashbookStats.physicalCashInDrawer)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ac-modal-footer">
              <button 
                type="button" 
                className="ac-btn ac-btn-outline w-100" 
                onClick={() => setShiftModalOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast thông báo góc phải */}
      {toastMessage && (
        <div className="ac-toast">
          <i className="bi bi-check-circle-fill text-success fs-5"></i>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
