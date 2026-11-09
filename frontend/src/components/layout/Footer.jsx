import { Link } from 'react-router-dom'
import logo from '../../assets/logo.jpg'
export default function Footer() {
  return (
    <footer id="footer" className="footer position-relative">
      <div className="container">
        <div className="footer-main">
          <div className="row gy-4 align-items-start">
            {/* Brand Section */}
            <div className="col-lg-4 col-md-12 mb-4 mb-lg-0">
              <div className="brand-section">
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
                <p className="brand-description">
                  Chúng tôi cam kết mang đến dịch vụ y tế chất lượng cao, kết hợp công nghệ tiên tiến
                  với sự chăm sóc tận tâm để bảo vệ sức khỏe cho bạn và gia đình.
                </p>

                <div className="contact-info">
                  <div className="contact-item">
                    <i className="bi bi-geo-alt"></i>
                    <span>123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</span>
                  </div>
                  <div className="contact-item">
                    <i className="bi bi-telephone"></i>
                    <span>+84 28 3838 9999</span>
                  </div>
                  <div className="contact-item">
                    <i className="bi bi-envelope"></i>
                    <span>lienhe@phongkham.vn</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="col-lg-8 col-md-12">
              <div className="footer-nav-wrapper">
                <div className="row gy-4 gx-3 gx-lg-4">
                  <div className="col-6 col-md-3 col-lg-3">
                    <div className="nav-column">
                      <h6>Phòng Khám</h6>
                      <nav className="footer-nav">
                        <Link to="/gioi-thieu">Giới Thiệu</Link>
                        <Link to="/khoa-phong">Khoa Phòng</Link>
                        <Link to="/bac-si">Đội Ngũ Bác Sĩ</Link>
                        <Link to="/dat-lich-kham">Đặt Lịch Khám</Link>
                        <Link to="/lien-he">Liên Hệ</Link>
                      </nav>
                    </div>
                  </div>

                  <div className="col-6 col-md-3 col-lg-3">
                    <div className="nav-column">
                      <h6>Dịch Vụ</h6>
                      <nav className="footer-nav">
                        <Link to="/dich-vu">Tim Mạch</Link>
                        <Link to="/dich-vu">Thần Kinh</Link>
                        <Link to="/dich-vu">Nhi Khoa</Link>
                        <Link to="/dich-vu">Cơ Xương Khớp</Link>
                        <Link to="/dich-vu">Da Liễu</Link>
                      </nav>
                    </div>
                  </div>

                  <div className="col-6 col-md-3 col-lg-3">
                    <div className="nav-column">
                      <h6>Hỗ Trợ</h6>
                      <nav className="footer-nav">
                        <a href="#!">Câu Hỏi Thường Gặp</a>
                        <a href="#!">Quy Trình Khám</a>
                        <a href="#!">Bảng Giá Dịch Vụ</a>
                        <a href="#!">Bảo Hiểm Y Tế</a>
                        <a href="#!">Hướng Dẫn Đường Đi</a>
                      </nav>
                    </div>
                  </div>

                  <div className="col-6 col-md-3 col-lg-3">
                    <div className="nav-column">
                      <h6>Kết Nối</h6>
                      <nav className="footer-nav">
                        <a href="#!">Facebook</a>
                        <a href="#!">Zalo</a>
                        <a href="#!">YouTube</a>
                        <a href="#!">Đặt Lịch Online</a>
                        <a href="#!">Hotline 24/7</a>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="bottom-content">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="copyright">
                  <p>© <span className="sitename">Phòng Khám Phú Lợi Bảo</span>. Bản quyền thuộc về Hệ Thống Phòng Khám.</p>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="legal-links">
                  <a href="#!">Chính Sách Bảo Mật</a>
                  <a href="#!">Điều Khoản Sử Dụng</a>
                  <a href="#!">Chính Sách Cookie</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
