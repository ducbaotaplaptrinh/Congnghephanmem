import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import logo from '../../assets/logo.jpg'
import './admin.css'

export default function AdminLayout({ children, title = 'Bảng Điều Khiển Tổng Quan' }) {
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

  // Đóng mobile drawer khi đổi cỡ màn hình
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navItems = [
    { path: '/dashboard', label: 'Tổng Quan', icon: 'bi-speedometer2', badge: null },
    { path: '/appointments', label: 'Lịch Hẹn', icon: 'bi-calendar-check', badge: 'Mới', badgeColor: 'bg-primary' },
    { path: '/patients', label: 'Bệnh Nhân', icon: 'bi-people', badge: null },
    { path: '/doctors-manage', label: 'Bác Sĩ', icon: 'bi-person-badge', badge: null },
    { path: '/medical-records', label: 'Hồ Sơ Bệnh Án', icon: 'bi-clipboard2-pulse', badge: null },
    { path: '/prescriptions', label: 'Đơn Thuốc', icon: 'bi-capsule', badge: null },
    { path: '/invoices', label: 'Hóa Đơn', icon: 'bi-receipt', badge: null },
    { path: '/accountant', label: 'Cổng Kế Toán', icon: 'bi-wallet2', badge: 'Hot', badgeColor: 'bg-success' },
    { path: '/users', label: 'Tài Khoản', icon: 'bi-shield-lock', badge: null },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="ad-wrapper">
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          className="ad-mobile-backdrop d-lg-none" 
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* 1. SIDEBAR QUẢN TRỊ - CỐ ĐỊNH, KHÔNG BỊ CO RÚM */}
      <aside className={`ad-sidebar ${sidebarOpen ? '' : 'collapsed'} ${mobileOpen ? 'mobile-open' : ''}`}>
        
        {/* Brand Header */}
        <div className="ad-brand-box">
          {sidebarOpen ? (
            <>
              <Link to="/dashboard" className="ad-brand-link">
                <img src={logo} alt="Logo Phú Lợi Bảo" className="ad-brand-logo" />
                <div className="ad-brand-title-wrap">
                  <span className="ad-brand-name">Phú Lợi Bảo</span>
                  <span className="ad-brand-sub">Quản Trị Phòng Khám</span>
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
            /* Khi thu gọn thanh bên: hiển thị logo vuông vức ở giữa kèm icon mở rộng */
            <button 
              type="button" 
              className="ad-collapsed-brand-btn d-none d-lg-flex"
              onClick={() => setSidebarOpen(true)}
              title="Bấm để mở rộng thanh bên"
            >
              <img src={logo} alt="Logo Phú Lợi Bảo" className="ad-brand-logo" />
              <span className="ad-collapsed-expand-hint">
                <i className="bi bi-chevron-right"></i>
              </span>
            </button>
          )}

          {/* Nút đóng trên Mobile (chỉ render khi drawer mobile đang mở) */}
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
            <div className="ad-nav-section-title">Quản Lý Vận Hành</div>
          )}

          {navItems.map((item) => (
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
                <span className={`badge ${item.badgeColor || 'bg-secondary'} ms-auto`} style={{ fontSize: '10px' }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          {sidebarOpen && (
            <div className="ad-nav-section-title mt-2">Cổng Phân Hệ Khác</div>
          )}

          <Link 
            to="/doctor/ban-kham" 
            className="ad-nav-item" 
            title={!sidebarOpen ? 'Cổng Bác Sĩ' : undefined}
          >
            <i className="bi bi-heart-pulse-fill text-success"></i>
            {sidebarOpen && <span className="flex-grow-1 text-truncate">Cổng Bác Sĩ</span>}
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

        {/* Footer Sidebar */}
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

      {/* 2. KHUNG NỘI DUNG CHÍNH (MAIN WRAPPER) */}
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

            <h1 className="ad-page-title">{title}</h1>
          </div>

          <div className="ad-topbar-right">
            {/* Trạng thái hệ thống */}
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 d-none d-md-inline-flex align-items-center gap-1">
              <span className="p-1 bg-success rounded-circle d-inline-block"></span>
              <span>Hệ thống trực tuyến</span>
            </span>

            {/* Đồng hồ */}
            <div className="d-none d-xl-flex align-items-center text-muted small">
              <i className="bi bi-clock me-1"></i>
              <span>{currentTime.toLocaleTimeString('vi-VN')}</span>
            </div>

            {/* User Profile Pill */}
            <div className="ad-user-pill">
              <div className="ad-user-avatar">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'AD'}
              </div>
              <div className="d-none d-sm-block text-start">
                <div className="fw-bold text-dark" style={{ fontSize: '13px', lineHeight: '1.2' }}>
                  {user?.fullName || 'Ban Giám Đốc'}
                </div>
                <div className="text-muted" style={{ fontSize: '11px' }}>Quản trị hệ thống</div>
              </div>
            </div>

            {/* Đăng xuất */}
            <button 
              type="button" 
              className="btn btn-sm btn-outline-danger border-0 p-2"
              onClick={handleLogout}
              title="Đăng xuất"
            >
              <i className="bi bi-box-arrow-right fs-5"></i>
            </button>
          </div>
        </header>

        {/* Nội dung bên trong trang */}
        <main className="ad-content-body">
          {children}
        </main>
      </div>
    </div>
  )
}
