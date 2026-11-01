import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import logo from '../../assets/logo.jpg'

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('ADMIN')
  const [email, setEmail] = useState('admin')
  const [password, setPassword] = useState('123456')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSelectRole = (role) => {
    setSelectedRole(role)
    setError('')
    if (role === 'ADMIN') {
      setEmail('admin')
      setPassword('123456')
    } else if (role === 'DOCTOR') {
      setEmail('bs_hoangnam')
      setPassword('Password123@')
    } else if (role === 'ACCOUNTANT') {
      setEmail('ketoan')
      setPassword('123456')
    } else if (role === 'PATIENT') {
      setEmail('bao01')
      setPassword('123456')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(email, password)
      const userRole = res?.user?.role
      const username = (res?.user?.username || email).toLowerCase()

      if (userRole === 'ACCOUNTANT' || username.includes('ketoan') || username.includes('accountant')) {
        navigate('/accountant')
      } else if (userRole === 'PATIENT') {
        navigate('/ho-so-ca-nhan')
      } else if (userRole === 'DOCTOR') {
        navigate('/doctor/ban-kham')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pk-auth-wrapper">
      <div className="pk-auth-card">
        {/* Header với Logo & Thương hiệu Phú Lợi Bảo */}
        <div className="pk-auth-header">
          <Link to="/" className="pk-auth-logo-link" title="Quay lại trang chủ">
            <img src={logo} alt="Logo Phòng Khám Phú Lợi Bảo" className="pk-auth-logo-img" />
            <span className="pk-auth-brand-top">Phòng Khám</span>
            <div className="pk-auth-brand-name">
              <span className="pk-auth-blue">Phú Lợi</span>
              <span className="pk-auth-green">Bảo</span>
            </div>
            <span className="pk-auth-brand-slogan">Tận tâm • Uy tín • Trách nhiệm</span>
          </Link>

          <div className="pk-auth-divider"></div>

          <h2 className="pk-auth-title">Đăng Nhập</h2>
          <p className="pk-auth-subtitle">Hệ thống Quản lý Y tế & Đặt lịch khám thông minh</p>
        </div>

        {/* Tab chọn vai trò đăng nhập */}
        <div className="pk-role-tabs" role="tablist" aria-label="Chọn vai trò đăng nhập">
          <button
            type="button"
            className={`pk-role-tab tab-admin ${selectedRole === 'ADMIN' ? 'active' : ''}`}
            onClick={() => handleSelectRole('ADMIN')}
            title="Đăng nhập tài khoản Quản trị viên"
          >
            <i className="bi bi-shield-lock-fill"></i>
            <span>Quản trị viên</span>
          </button>
          <button
            type="button"
            className={`pk-role-tab tab-doctor ${selectedRole === 'DOCTOR' ? 'active' : ''}`}
            onClick={() => handleSelectRole('DOCTOR')}
            title="Đăng nhập tài khoản Bác sĩ"
          >
            <i className="bi bi-heart-pulse-fill"></i>
            <span>Bác sĩ</span>
          </button>
          <button
            type="button"
            className={`pk-role-tab tab-accountant ${selectedRole === 'ACCOUNTANT' ? 'active' : ''}`}
            onClick={() => handleSelectRole('ACCOUNTANT')}
            title="Đăng nhập tài khoản Kế toán / Thu ngân"
          >
            <i className="bi bi-cash-coin"></i>
            <span>Kế toán</span>
          </button>
          <button
            type="button"
            className={`pk-role-tab tab-patient ${selectedRole === 'PATIENT' ? 'active' : ''}`}
            onClick={() => handleSelectRole('PATIENT')}
            title="Đăng nhập tài khoản Bệnh nhân"
          >
            <i className="bi bi-person-fill"></i>
            <span>Bệnh nhân</span>
          </button>
        </div>

        {error && (
          <div className="pk-auth-alert pk-alert-error">
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="pk-auth-form">
          <div className="pk-form-group">
            <label className="pk-label">Email / Tên đăng nhập</label>
            <div className="pk-input-box">
              <span className="pk-input-icon"><i className="bi bi-envelope"></i></span>
              <input
                type="text"
                className="pk-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập tên đăng nhập hoặc email"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="pk-form-group">
            <label className="pk-label">Mật khẩu</label>
            <div className="pk-input-box">
              <span className="pk-input-icon"><i className="bi bi-shield-lock"></i></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="pk-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pk-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Ẩn hiện mật khẩu"
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="pk-options-row">
            <label className="pk-checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <a
              href="#!"
              className="pk-forgot-link"
              onClick={(e) => { e.preventDefault(); alert('Vui lòng liên hệ hotline 028 3838 9999 để được hỗ trợ cấp lại mật khẩu!'); }}
            >
              Quên mật khẩu?
            </a>
          </div>

          <button type="submit" className="pk-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Đăng Nhập</span>
              </>
            )}
          </button>
        </form>

        <div className="pk-auth-switch">
          <span>Chưa có tài khoản?</span>
          <Link to="/register" className="pk-switch-link">Đăng ký tài khoản ngay</Link>
        </div>

        <Link to="/" className="pk-back-home">
          <i className="bi bi-arrow-left"></i>
          <span>Trở về Trang chủ phòng khám</span>
        </Link>
      </div>
    </div>
  )
}
