import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import logo from '../../assets/logo.jpg'

export default function Header() {
  const { user, logout } = useAuth()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setMobileNavOpen(false)
    setUserMenuOpen(false)
  }, [location])

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileNavOpen])

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileNavOpen(false)
        setUserMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header id="header" className={`header fixed-top ${scrolled ? 'scrolled' : ''}`}>
      {/* Mobile Drawer Backdrop */}
      <div 
        className={`mobile-nav-backdrop ${mobileNavOpen ? 'active' : ''}`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />

      {/* Top Bar */}
      <div className="topbar d-flex align-items-center dark-background">
        <div className="container">
          <div className="topbar-inner">
            <div className="contact-info d-flex align-items-center">
              <i className="bi bi-envelope d-flex align-items-center">
                <a href="mailto:lienhe@phongkham.vn">lienhe@phongkham.vn</a>
              </i>
              <i className="bi bi-phone d-flex align-items-center ms-4">
                <span>+84 28 3838 9999</span>
              </i>
            </div>
            <div className="social-links d-none d-md-flex align-items-center">
              <a href="#!" className="twitter" aria-label="Twitter"><i className="bi bi-twitter-x"></i></a>
              <a href="#!" className="facebook" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
              <a href="#!" className="instagram" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
              <a href="#!" className="linkedin" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>
        </div>
      </div>

      {/* Branding & Nav */}
      <div className="branding d-flex align-items-center">
        <div className="container">
          <div className="header-inner">
            <Link to="/" className="logo d-flex align-items-center" aria-label="Trang chủ">
              <img src={logo} alt="Logo Phòng Khám Phú Lợi Bảo" className="brand-logo" />
              <div className="brand-text">
                <span className="brand-title-top">Phòng Khám</span>
                <span className="brand-title-bottom">
                  <span className="brand-blue">Phú Lợi</span>
                  <span className="brand-space" aria-hidden="true"> </span>
                  <span className="brand-green">Bảo</span>
                </span>
                <span className="brand-slogan">Tận tâm • Uy tín • Trách nhiệm</span>
              </div>
            </Link>

            <nav id="navmenu" className={`navmenu ${mobileNavOpen ? 'active' : ''}`}>
              {/* Drawer Top Header (Mobile only) */}
              <div className="drawer-header d-xl-none">
                <div className="drawer-brand">
                  <img src={logo} alt="Logo" className="drawer-logo" />
                  <div className="drawer-brand-text">
                    <span className="drawer-brand-top">Phòng Khám</span>
                    <span className="drawer-brand-title">
                      <span className="brand-blue">Phú Lợi</span>{' '}
                      <span className="brand-green">Bảo</span>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Đóng menu"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              {/* Drawer User / Guest Section (Mobile only) */}
              <div className="drawer-user-section d-xl-none">
                {user ? (
                  <div className="drawer-user-card">
                    <div className="drawer-avatar">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="drawer-user-details">
                      <div className="drawer-user-name">{user.fullName || 'Người Dùng'}</div>
                      <div className="drawer-user-email">{user.email}</div>
                      <div className="mt-1">
                        <span
                          className={`pk-portal-badge ${
                            user.role === 'ADMIN'
                              ? 'pk-portal-badge-danger'
                              : user.role === 'DOCTOR'
                              ? 'pk-portal-badge-success'
                              : 'pk-portal-badge-primary'
                          }`}
                          style={{ fontSize: '11px', padding: '2px 8px' }}
                        >
                          <i className={`bi ${user.role === 'ADMIN' ? 'bi-shield-lock-fill' : user.role === 'DOCTOR' ? 'bi-heart-pulse-fill' : 'bi-person-check-fill'} me-1`}></i>
                          {user.role === 'ADMIN' ? 'Quản Trị Viên' : user.role === 'DOCTOR' ? 'Bác Sĩ' : 'Bệnh Nhân'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="drawer-guest-card">
                    <div className="d-flex align-items-center mb-2">
                      <div className="drawer-guest-icon me-2">
                        <i className="bi bi-person-circle"></i>
                      </div>
                      <div>
                        <div className="drawer-guest-title">Chào mừng quý khách</div>
                        <div className="drawer-guest-desc">Đăng nhập để theo dõi hồ sơ & đặt khám</div>
                      </div>
                    </div>
                    <Link
                      to="/login"
                      className="btn-drawer-login"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <i className="bi bi-box-arrow-in-right me-1"></i> Đăng Nhập / Đăng Ký
                    </Link>
                  </div>
                )}
              </div>

              {/* Scrollable Nav Items */}
              <div className="drawer-body">
                <ul className="drawer-nav-list">
                  <li className="drawer-section-label d-xl-none">Menu Chính</li>
                  <li>
                    <NavLink to="/" end className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileNavOpen(false)}>
                      <span className="drawer-nav-icon d-xl-none"><i className="bi bi-house-door"></i></span>
                      <span className="drawer-nav-text">Trang Chủ</span>
                      <i className="bi bi-chevron-right drawer-chevron d-xl-none"></i>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/gioi-thieu" className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileNavOpen(false)}>
                      <span className="drawer-nav-icon d-xl-none"><i className="bi bi-info-circle"></i></span>
                      <span className="drawer-nav-text">Giới Thiệu</span>
                      <i className="bi bi-chevron-right drawer-chevron d-xl-none"></i>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/khoa-phong" className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileNavOpen(false)}>
                      <span className="drawer-nav-icon d-xl-none"><i className="bi bi-hospital"></i></span>
                      <span className="drawer-nav-text">Khoa Phòng</span>
                      <i className="bi bi-chevron-right drawer-chevron d-xl-none"></i>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/dich-vu" className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileNavOpen(false)}>
                      <span className="drawer-nav-icon d-xl-none"><i className="bi bi-heart-pulse"></i></span>
                      <span className="drawer-nav-text">Dịch Vụ</span>
                      <i className="bi bi-chevron-right drawer-chevron d-xl-none"></i>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/bac-si" className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileNavOpen(false)}>
                      <span className="drawer-nav-icon d-xl-none"><i className="bi bi-person-badge"></i></span>
                      <span className="drawer-nav-text">Bác Sĩ</span>
                      <i className="bi bi-chevron-right drawer-chevron d-xl-none"></i>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/dat-lich-kham" className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileNavOpen(false)}>
                      <span className="drawer-nav-icon d-xl-none"><i className="bi bi-calendar-plus"></i></span>
                      <span className="drawer-nav-text">Đặt Lịch Khám</span>
                      <i className="bi bi-chevron-right drawer-chevron d-xl-none"></i>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/lien-he" className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileNavOpen(false)}>
                      <span className="drawer-nav-icon d-xl-none"><i className="bi bi-telephone"></i></span>
                      <span className="drawer-nav-text">Liên Hệ</span>
                      <i className="bi bi-chevron-right drawer-chevron d-xl-none"></i>
                    </NavLink>
                  </li>

                  {/* Mobile Portal items for logged-in user */}
                  {user && (
                    <>
                      <li className="drawer-section-label d-xl-none mt-3">Hồ Sơ Y Tế</li>
                      <li className="d-xl-none">
                        <NavLink to="/ho-so-ca-nhan?tab=records" className="drawer-nav-link" onClick={() => setMobileNavOpen(false)}>
                          <span className="drawer-nav-icon text-primary bg-primary-subtle"><i className="bi bi-journal-medical"></i></span>
                          <span className="drawer-nav-text">Sổ Khám & Bệnh Án</span>
                          <i className="bi bi-chevron-right drawer-chevron"></i>
                        </NavLink>
                      </li>
                      <li className="d-xl-none">
                        <NavLink to="/ho-so-ca-nhan?tab=appointments" className="drawer-nav-link" onClick={() => setMobileNavOpen(false)}>
                          <span className="drawer-nav-icon text-success bg-success-subtle"><i className="bi bi-calendar-check"></i></span>
                          <span className="drawer-nav-text">Lịch Hẹn Của Tôi</span>
                          <i className="bi bi-chevron-right drawer-chevron"></i>
                        </NavLink>
                      </li>
                      <li className="d-xl-none">
                        <NavLink to="/ho-so-ca-nhan?tab=prescriptions" className="drawer-nav-link" onClick={() => setMobileNavOpen(false)}>
                          <span className="drawer-nav-icon text-info bg-info-subtle"><i className="bi bi-capsule"></i></span>
                          <span className="drawer-nav-text">Đơn Thuốc Điện Tử</span>
                          <i className="bi bi-chevron-right drawer-chevron"></i>
                        </NavLink>
                      </li>
                      <li className="d-xl-none">
                        <NavLink to="/ho-so-ca-nhan?tab=profile" className="drawer-nav-link" onClick={() => setMobileNavOpen(false)}>
                          <span className="drawer-nav-icon text-secondary bg-secondary-subtle"><i className="bi bi-gear"></i></span>
                          <span className="drawer-nav-text">Cài Đặt Hồ Sơ Y Tế</span>
                          <i className="bi bi-chevron-right drawer-chevron"></i>
                        </NavLink>
                      </li>

                      {user.role === 'DOCTOR' && (
                        <li className="d-xl-none">
                          <NavLink to="/doctor/ban-kham" className="drawer-nav-link" onClick={() => setMobileNavOpen(false)}>
                            <span className="drawer-nav-icon text-success bg-success-subtle"><i className="bi bi-heart-pulse-fill"></i></span>
                            <span className="drawer-nav-text">Cổng Bác Sĩ & Bàn Khám</span>
                            <i className="bi bi-chevron-right drawer-chevron"></i>
                          </NavLink>
                        </li>
                      )}

                      {(user.role === 'ADMIN' || user.role === 'STAFF' || user.role === 'ACCOUNTANT') && (
                        <>
                          <li className="d-xl-none">
                            <NavLink to="/dashboard" className="drawer-nav-link" onClick={() => setMobileNavOpen(false)}>
                              <span className="drawer-nav-icon text-danger bg-danger-subtle"><i className="bi bi-speedometer2"></i></span>
                              <span className="drawer-nav-text">Cổng Quản Trị Hệ Thống</span>
                              <i className="bi bi-chevron-right drawer-chevron"></i>
                            </NavLink>
                          </li>
                          <li className="d-xl-none">
                            <NavLink to="/accountant" className="drawer-nav-link" onClick={() => setMobileNavOpen(false)}>
                              <span className="drawer-nav-icon text-primary bg-primary-subtle"><i className="bi bi-wallet2"></i></span>
                              <span className="drawer-nav-text">Cổng Kế Toán</span>
                              <i className="bi bi-chevron-right drawer-chevron"></i>
                            </NavLink>
                          </li>
                        </>
                      )}

                      <li className="d-xl-none mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMobileNavOpen(false)
                            logout()
                          }}
                          className="drawer-logout-btn"
                        >
                          <i className="bi bi-box-arrow-right me-2"></i> Đăng Xuất
                        </button>
                      </li>
                    </>
                  )}

                  {/* Desktop User Menu Dropdown (>= 1200px) */}
                  {user ? (
                    <li className="position-relative ms-2 user-dropdown-container d-none d-xl-block" ref={userMenuRef}>
                      <button
                        type="button"
                        className="btn-user-trigger d-flex align-items-center"
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        aria-expanded={userMenuOpen}
                        title="Tài khoản cá nhân"
                      >
                        <div className="user-avatar-badge">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="d-flex flex-column text-start ms-2 me-1 user-name-box d-none d-sm-flex">
                          <span className="user-display-name text-truncate">
                            {user.fullName || 'Tài khoản'}
                          </span>
                          <span className="user-role-label">
                            {user.role === 'ADMIN' ? 'Quản Trị Viên' : user.role === 'DOCTOR' ? 'Bác Sĩ' : 'Bệnh Nhân'}
                          </span>
                        </div>
                        <i className={`bi bi-chevron-down ms-1 dropdown-chevron ${userMenuOpen ? 'open' : ''}`}></i>
                      </button>

                      {/* Dropdown Menu Box */}
                      {userMenuOpen && (
                        <div className="pk-user-dropdown-menu shadow-lg">
                          {/* Header Inside Dropdown */}
                          <div className="dropdown-user-header">
                            <div className="dropdown-user-header-inner">
                              <div className="user-avatar-lg">
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div className="dropdown-user-info">
                                <h4 className="dropdown-user-name">
                                  {user.fullName || 'Người Dùng'}
                                </h4>
                                <p className="dropdown-user-email">
                                  {user.email}
                                </p>
                                <div style={{ marginTop: '4px' }}>
                                  <span
                                    className={`pk-portal-badge ${
                                      user.role === 'ADMIN'
                                        ? 'pk-portal-badge-danger'
                                        : user.role === 'DOCTOR'
                                        ? 'pk-portal-badge-success'
                                        : 'pk-portal-badge-primary'
                                    }`}
                                    style={{ fontSize: '11px', padding: '2px 8px' }}
                                  >
                                    <i className={`bi ${user.role === 'ADMIN' ? 'bi-shield-lock-fill' : user.role === 'DOCTOR' ? 'bi-heart-pulse-fill' : 'bi-person-check-fill'}`} style={{ marginRight: '4px' }}></i>
                                    {user.role === 'ADMIN' ? 'Quản Trị Viên' : user.role === 'DOCTOR' ? 'Bác Sĩ' : 'Bệnh Nhân'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="dropdown-divider"></div>

                          {/* Menu Items */}
                          <div className="dropdown-user-body">
                            <Link
                              to="/ho-so-ca-nhan?tab=records"
                              className="dropdown-user-item text-decoration-none"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <div className="icon-wrapper text-primary bg-primary-subtle">
                                <i className="bi bi-journal-medical"></i>
                              </div>
                              <div style={{ marginLeft: '12px' }}>
                                <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', lineHeight: '1.3' }}>
                                  Sổ Khám & Bệnh Án
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                  Theo dõi lịch sử khám bệnh
                                </div>
                              </div>
                            </Link>

                            <Link
                              to="/ho-so-ca-nhan?tab=appointments"
                              className="dropdown-user-item text-decoration-none"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <div className="icon-wrapper text-success bg-success-subtle">
                                <i className="bi bi-calendar-check"></i>
                              </div>
                              <div style={{ marginLeft: '12px' }}>
                                <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', lineHeight: '1.3' }}>
                                  Lịch Hẹn Của Tôi
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                  Tra cứu & quản lý lịch khám
                                </div>
                              </div>
                            </Link>

                            <Link
                              to="/ho-so-ca-nhan?tab=prescriptions"
                              className="dropdown-user-item text-decoration-none"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <div className="icon-wrapper text-info bg-info-subtle">
                                <i className="bi bi-capsule"></i>
                              </div>
                              <div style={{ marginLeft: '12px' }}>
                                <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', lineHeight: '1.3' }}>
                                  Đơn Thuốc Điện Tử
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                  Toa thuốc & hướng dẫn liều dùng
                                </div>
                              </div>
                            </Link>

                            <Link
                              to="/ho-so-ca-nhan?tab=profile"
                              className="dropdown-user-item text-decoration-none"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <div className="icon-wrapper text-secondary bg-secondary-subtle">
                                <i className="bi bi-gear"></i>
                              </div>
                              <div style={{ marginLeft: '12px' }}>
                                <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', lineHeight: '1.3' }}>
                                  Cài Đặt Hồ Sơ Y Tế
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                  Nhóm máu, dị ứng & liên hệ
                                </div>
                              </div>
                            </Link>

                            {user.role === 'DOCTOR' && (
                              <>
                                <div className="dropdown-divider"></div>
                                <Link
                                  to="/doctor/ban-kham"
                                  className="dropdown-user-item text-decoration-none"
                                  onClick={() => setUserMenuOpen(false)}
                                >
                                  <div className="icon-wrapper text-success bg-success-subtle">
                                    <i className="bi bi-heart-pulse-fill"></i>
                                  </div>
                                  <div style={{ marginLeft: '12px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', lineHeight: '1.3' }}>
                                      Cổng Bác Sĩ & Bàn Khám
                                    </div>
                                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                      Tiếp nhận, chẩn đoán & kê đơn
                                    </div>
                                  </div>
                                </Link>
                              </>
                            )}

                            {(user.role === 'ADMIN' || user.role === 'STAFF' || user.role === 'ACCOUNTANT') && (
                              <>
                                <div className="dropdown-divider"></div>
                                <Link
                                  to="/dashboard"
                                  className="dropdown-user-item text-decoration-none"
                                  onClick={() => setUserMenuOpen(false)}
                                >
                                  <div className="icon-wrapper text-danger bg-danger-subtle">
                                    <i className="bi bi-speedometer2"></i>
                                  </div>
                                  <div style={{ marginLeft: '12px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', lineHeight: '1.3' }}>
                                      Cổng Quản Trị Hệ Thống
                                    </div>
                                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                      Quản lý phòng khám & bệnh nhân
                                    </div>
                                  </div>
                                </Link>

                                <Link
                                  to="/accountant"
                                  className="dropdown-user-item text-decoration-none"
                                  onClick={() => setUserMenuOpen(false)}
                                >
                                  <div className="icon-wrapper text-primary bg-primary-subtle">
                                    <i className="bi bi-wallet2"></i>
                                  </div>
                                  <div style={{ marginLeft: '12px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', lineHeight: '1.3' }}>
                                      Cổng Kế Toán
                                    </div>
                                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                      Thu viện phí, hóa đơn & sổ quỹ
                                    </div>
                                  </div>
                                </Link>
                              </>
                            )}
                          </div>

                          <div className="dropdown-divider"></div>

                          {/* Logout Button */}
                          <div className="dropdown-logout-wrapper">
                            <button
                              type="button"
                              onClick={() => {
                                setUserMenuOpen(false)
                                logout()
                              }}
                              className="btn-dropdown-logout"
                            >
                              <i className="bi bi-box-arrow-right" style={{ fontSize: '16px' }}></i>
                              <span>Đăng Xuất</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ) : (
                    <li className="d-none d-xl-block">
                      <NavLink
                        to="/login"
                        className="btn-getstarted d-inline-block ms-2 text-white text-decoration-none"
                        style={{ background: '#1977cc', padding: '7px 20px', borderRadius: '50px', fontSize: '13px', fontWeight: '600' }}
                      >
                        <i className="bi bi-person me-1"></i> Đăng Nhập
                      </NavLink>
                    </li>
                  )}
                </ul>
              </div>

              {/* Drawer Bottom Footer (Mobile only) */}
              <div className="drawer-footer d-xl-none">
                <Link
                  to="/dat-lich-kham"
                  className="btn-drawer-cta"
                  onClick={() => setMobileNavOpen(false)}
                >
                  <i className="bi bi-calendar2-check me-2"></i> Đặt Lịch Khám Nhanh
                </Link>
                <div className="drawer-quick-contacts">
                  <a href="tel:02838389999" className="drawer-contact-item">
                    <i className="bi bi-telephone-fill text-primary me-1"></i>
                    <span>028 3838 9999</span>
                  </a>
                  <a href="tel:115" className="drawer-contact-item emergency">
                    <i className="bi bi-hospital-fill text-danger me-1"></i>
                    <span>Cấp Cứu 115</span>
                  </a>
                </div>
              </div>
            </nav>

            <button
              className={`mobile-nav-toggle d-xl-none ${mobileNavOpen ? 'active' : ''}`}
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Toggle navigation"
            >
              <i className={`bi ${mobileNavOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
