import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../../services/authService'
import logo from '../../assets/logo.jpg'

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PATIENT'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!')
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự!')
      return
    }

    if (!agreed) {
      setError('Vui lòng đồng ý với Điều khoản sử dụng & Chính sách dịch vụ y tế!')
      return
    }

    setLoading(true)
    try {
      await authService.register({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
      setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng sang đăng nhập...')
      setTimeout(() => navigate('/login'), 1600)
    } catch (err) {
      setError(err.message || 'Đăng ký tài khoản không thành công. Vui lòng thử lại!')
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

          <h2 className="pk-auth-title">Đăng Ký Tài Khoản</h2>
          <p className="pk-auth-subtitle">Tạo tài khoản bệnh nhân để đặt lịch khám nhanh chóng</p>
        </div>

        {error && (
          <div className="pk-auth-alert pk-alert-error">
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="pk-auth-alert pk-alert-success">
            <i className="bi bi-check-circle-fill"></i>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="pk-auth-form">
          <div className="pk-form-group">
            <label className="pk-label">Họ và Tên</label>
            <div className="pk-input-box">
              <span className="pk-input-icon"><i className="bi bi-person"></i></span>
              <input
                type="text"
                className="pk-input"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Ví dụ: Nguyễn Văn An"
              />
            </div>
          </div>

          <div className="pk-form-row-2col">
            <div className="pk-form-group" style={{ marginBottom: 0 }}>
              <label className="pk-label">Số điện thoại</label>
              <div className="pk-input-box">
                <span className="pk-input-icon"><i className="bi bi-telephone"></i></span>
                <input
                  type="tel"
                  className="pk-input"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0912 345 678"
                />
              </div>
            </div>

            <div className="pk-form-group" style={{ marginBottom: 0 }}>
              <label className="pk-label">Email</label>
              <div className="pk-input-box">
                <span className="pk-input-icon"><i className="bi bi-envelope"></i></span>
                <input
                  type="email"
                  className="pk-input"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Tối thiểu 6 ký tự"
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

          <div className="pk-form-group">
            <label className="pk-label">Nhập lại Mật khẩu</label>
            <div className="pk-input-box">
              <span className="pk-input-icon"><i className="bi bi-shield-check"></i></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="pk-input"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Nhập lại mật khẩu"
              />
            </div>
          </div>

          <div className="pk-form-group" style={{ marginTop: '12px' }}>
            <label className="pk-checkbox-label">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span style={{ fontSize: '12.5px' }}>
                Tôi đồng ý với <a href="#!" className="pk-forgot-link" onClick={(e) => { e.preventDefault(); alert('Chính sách bảo mật: Toàn bộ thông tin y tế của bạn được cam kết bảo mật theo quy định của Bộ Y Tế.'); }}>Điều khoản & Chính sách</a> phòng khám
              </span>
            </label>
          </div>

          <button type="submit" className="pk-submit-btn" disabled={loading} style={{ marginTop: '18px' }}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span>Đang xử lý đăng ký...</span>
              </>
            ) : (
              <>
                <i className="bi bi-person-plus"></i>
                <span>Đăng Ký Tài Khoản</span>
              </>
            )}
          </button>
        </form>

        <div className="pk-auth-switch">
          <span>Đã có tài khoản?</span>
          <Link to="/login" className="pk-switch-link">Đăng nhập ngay</Link>
        </div>

        <Link to="/" className="pk-back-home">
          <i className="bi bi-arrow-left"></i>
          <span>Trở về Trang chủ phòng khám</span>
        </Link>
      </div>
    </div>
  )
}
