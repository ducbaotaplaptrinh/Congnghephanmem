import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import logo from '../../assets/logo.jpg'
import './admin.css'
import '../../pages/doctor/doctor.css'

export default function DoctorLayout({ 
  children, 
  title = 'Bàn Khám Bệnh', 
  subtitle = 'Phân hệ Bác sĩ khám chữa bệnh',
  waitingCount = null,
  recordsCount = null,
  prescriptionsCount = null,
  patientsCount = null
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(() => new Date())

  // Đồng hồ thời gian thực
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const doctorNavItems = [
    {
      path: '/doctor/ban-kham',
      label: 'Bàn Khám Bệnh',
      icon: 'bi-heart-pulse-fill',
      badge: waitingCount !== null && waitingCount > 0 ? `${waitingCount} chờ` : null,
      badgeColor: 'bg-warning text-dark'
    },
    {
      path: '/doctor/lich-kham',
      label: 'Lịch Khám Của Tôi',
      icon: 'bi-calendar2-check-fill',
      badge: 'Hôm nay',
      badgeColor: 'bg-primary-subtle text-primary'
    },
    {
      path: '/doctor/benh-an',
      label: 'Hồ Sơ Bệnh Án',
      icon: 'bi-clipboard2-pulse-fill',
      badge: recordsCount !== null ? `${recordsCount}` : null,
      badgeColor: 'bg-info-subtle text-info border'
    },
    {
      path: '/doctor/ke-don',
      label: 'Kê Đơn Thuốc',
      icon: 'bi-capsule',
      badge: prescriptionsCount !== null ? `${prescriptionsCount}` : null,
      badgeColor: 'bg-primary-subtle text-primary border'
    },
    {
      path: '/doctor/benh-nhan',
      label: 'Bệnh Nhân Của Tôi',
      icon: 'bi-people-fill',
      badge: patientsCount !== null ? `${patientsCount}` : null,
      badgeColor: 'bg-success-subtle text-success border'
    },
    {
      path: '/doctor/lich-truc',
      label: 'Lịch Trực & Ca Làm',
      icon: 'bi-clock-history'
    }
  ]

  const rawName = user?.fullName || user?.hoten || 'Bác Sĩ'
  const prefix = user?.hocham ? `${user.hocham}. ` : (rawName.startsWith('BS') || rawName.startsWith('TS') ? '' : 'BS. ')
  const doctorName = rawName.startsWith('BS') || rawName.startsWith('TS') ? rawName : `${prefix}${rawName}`
  const doctorDepartment = user?.chuyenkhoa || user?.khoa || 'Phòng Khám Đa Khoa'
  const clinicRoom = user?.phongkham || `Bàn Khám ${doctorDepartment}`

  return (
    <div className="ad-wrapper">
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          className="ad-mobile-backdrop d-lg-none" 
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* ================= 1. SIDEBAR BÁC SĨ (ĐỒNG BỘ 100% VỚI ADMIN) ================= */}
      <aside className={`ad-sidebar ${sidebarOpen ? '' : 'collapsed'} ${mobileOpen ? 'mobile-open' : ''}`}>
        
        {/* Brand Header */}
        <div className="ad-brand-box">
          {sidebarOpen ? (
            <>
              <Link to="/doctor/ban-kham" className="ad-brand-link">
                <img src={logo} alt="Logo Phú Lợi Bảo" className="ad-brand-logo" />
                <div className="ad-brand-title-wrap">
                  <span className="ad-brand-name">Phú Lợi Bảo</span>
                  <span className="ad-brand-sub">Cổng Bác Sĩ & Điều Trị</span>
                </div>
              </Link>

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
            <div className="ad-nav-section-title">Nghiệp Vụ Bác Sĩ</div>
          )}

          {doctorNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `ad-nav-item ${isActive ? 'active' : ''}`}
              title={!sidebarOpen ? item.label : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <i className={`bi ${item.icon}`}></i>
              {sidebarOpen && <span className="flex-grow-1 text-truncate">{item.label}</span>}
              {sidebarOpen && item.badge && (
                <span className={`badge ${item.badgeColor || 'bg-secondary'} ms-auto`} style={{ fontSize: '10.5px' }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

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
            to="/accountant" 
            className="ad-nav-item" 
            title={!sidebarOpen ? 'Cổng Kế Toán' : undefined}
          >
            <i className="bi bi-cash-stack text-warning"></i>
            {sidebarOpen && <span className="flex-grow-1 text-truncate">Cổng Kế Toán</span>}
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

            <div className="d-flex flex-column justify-content-center min-w-0" style={{ height: '46px' }}>
              <h1 className="ad-page-title text-truncate" style={{ fontSize: '1.12rem', lineHeight: '1.2' }}>{title}</h1>
              {subtitle && (
                <div className="text-secondary text-truncate d-none d-md-block" style={{ fontSize: '11.5px', marginTop: '2px', maxWidth: '420px', lineHeight: '1.2' }}>
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          <div className="ad-topbar-right">
            {/* Vị trí phòng khám */}
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 d-none d-lg-inline-flex align-items-center gap-1">
              <i className="bi bi-geo-alt-fill text-danger me-1"></i>
              <span>{clinicRoom}</span>
            </span>

            {/* Thông báo ca chờ khám */}
            {waitingCount !== null && waitingCount > 0 && (
              <span className="badge bg-danger px-2.5 py-1.5 text-white d-inline-flex align-items-center gap-1 shadow-sm" style={{ fontSize: '11.5px' }}>
                <i className="bi bi-bell-fill"></i>
                <span>{waitingCount} ca chờ</span>
              </span>
            )}

            {/* Đồng hồ thời gian thực */}
            <div className="d-none d-xl-flex align-items-center text-muted small" style={{ minWidth: '75px' }}>
              <i className="bi bi-clock me-1"></i>
              <span>{currentTime.toLocaleTimeString('vi-VN')}</span>
            </div>

            {/* User Profile Pill */}
            <div className="ad-user-pill">
              <div 
                className="ad-user-avatar overflow-hidden p-0"
                style={{ background: 'linear-gradient(135deg, #175cdd, #10b981)' }}
              >
                {user?.hinhanh || user?.avatar || user?.image ? (
                  <img 
                    src={user.hinhanh || user.avatar || user.image} 
                    alt={doctorName} 
                    className="w-100 h-100 object-fit-cover" 
                  />
                ) : (
                  'BS'
                )}
              </div>
              <div className="d-none d-sm-block text-start">
                <div className="fw-bold text-dark text-truncate" style={{ fontSize: '13px', lineHeight: '1.2', maxWidth: '170px' }}>
                  {doctorName}
                </div>
                <div className="text-muted text-truncate" style={{ fontSize: '11px', maxWidth: '170px' }}>
                  {doctorDepartment}
                </div>
              </div>
            </div>

            {/* Đăng xuất */}
            <button 
              type="button" 
              className="btn btn-sm btn-outline-danger border-0 p-2"
              onClick={handleLogout}
              title="Đăng xuất khỏi phiên làm việc"
            >
              <i className="bi bi-box-arrow-right fs-5"></i>
            </button>
          </div>
        </header>

        {/* Thân trang chính: Chứa children & Footer nằm gọn bên trong */}
        <main className="ad-content-body d-flex flex-column p-0">
          {/* Vùng nội dung màn hình làm việc của bác sĩ */}
          <div className="p-3 p-lg-4 flex-grow-1">
            {children}
          </div>

          {/* FOOTER / STATUSBAR NẰM GỌN TRONG MAIN CONTENT - KHÔNG BAO GIỜ CHE MENU SIDEBAR */}
          <footer className="doctor-statusbar">
            <div className="d-flex align-items-center text-truncate me-2">
              <span className="fw-semibold text-dark me-2">© 2026 Phòng Khám Đa Khoa Phú Lợi Bảo</span>
              <span className="d-none d-md-inline text-muted me-2">•</span>
              <span className="d-none d-md-inline">
                <i className="bi bi-telephone-inbound text-primary me-1"></i> Hotline nội bộ: <strong>102</strong> (Tiếp đón) - <strong>105</strong> (Kho Dược)
              </span>
            </div>

            <div className="d-flex align-items-center gap-3 flex-shrink-0">
              <span className="d-none d-sm-inline badge bg-light text-secondary border">
                HIS v2.4.0 • Doctor Edition
              </span>
              <span className="text-success fw-semibold d-flex align-items-center">
                <span className="spinner-grow spinner-grow-sm text-success me-1" style={{ width: '8px', height: '8px' }}></span>
                <span className="d-none d-sm-inline">Máy chủ kết nối: </span> Bàn khám 102
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
