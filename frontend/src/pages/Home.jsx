import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import doctorService from '../services/doctorService'

// Counter hook
function useCounter(end, duration = 2000, start = 0) {
  const countRef = useRef(null)

  useEffect(() => {
    const el = countRef.current
    if (!el) return

    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      el.textContent = Math.floor(progress * (end - start) + start).toLocaleString('vi-VN')
      if (progress < 1) requestAnimationFrame(step)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(step)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration, start])

  return countRef
}

function StatCounter({ end, label }) {
  const ref = useCounter(end)
  return (
    <div className="stat-item">
      <h3><span ref={ref}>0</span>+</h3>
      <p>{label}</p>
    </div>
  )
}

export default function Home() {
  const [doctors, setDoctors] = useState([
    { id: 1, name: 'BS. Nguyễn Hoàng Nam', specialty: 'Khoa Mắt Kỹ Thuật Cao', experience: '10 năm kinh nghiệm', rating: 5.0, reviews: 120, status: 'available', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=face' },
    { id: 2, name: 'BS. CKII. Trần Văn Hùng', specialty: 'Chuyên Gia Tim Mạch', experience: '15 năm kinh nghiệm', rating: 4.9, reviews: 142, status: 'available', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face' },
    { id: 3, name: 'ThS. BS. Nguyễn Thị Lan', specialty: 'Nhi Khoa', experience: '10 năm kinh nghiệm', rating: 5.0, reviews: 198, status: 'available', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face' }
  ])

  useEffect(() => {
    AOS.refresh()
    doctorService.getAll().then((list) => {
      if (list && list.length > 0) {
        setDoctors(list.map(d => ({
          id: d.id || d.mabs,
          name: d.name || d.hoten,
          specialty: d.specialty || d.department,
          experience: d.experience || '10 năm kinh nghiệm',
          rating: d.rating || 5.0,
          reviews: d.reviewsCount || 120,
          status: 'available',
          img: d.img || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=face'
        })))
      }
    }).catch(() => {})
  }, [])

  const renderStars = (rating) => {
    const stars = []
    const full = Math.floor(rating)
    const half = rating % 1 >= 0.5
    for (let i = 0; i < full; i++) stars.push(<i key={i} className="bi bi-star-fill"></i>)
    if (half) stars.push(<i key="half" className="bi bi-star-half"></i>)
    return stars
  }

  const statusLabel = { available: 'Có mặt', busy: 'Bận', offline: 'Nghỉ' }

  return (
    <>
      {/* ========== Hero Section ========== */}
      <section id="hero" className="hero section light-background">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="hero-content">
                <div className="trust-badges mb-4" data-aos="fade-right" data-aos-delay="200">
                  <div className="badge-item">
                    <i className="bi bi-shield-check"></i>
                    <span>Được Chứng Nhận</span>
                  </div>
                  <div className="badge-item">
                    <i className="bi bi-clock"></i>
                    <span>Cấp Cứu 24/7</span>
                  </div>
                  <div className="badge-item">
                    <i className="bi bi-star-fill"></i>
                    <span>Đánh Giá 4.9/5</span>
                  </div>
                </div>

                <h1 data-aos="fade-right" data-aos-delay="300">
                  Xuất Sắc Trong <span className="highlight">Chăm Sóc Sức Khỏe</span> Với Tấm Lòng Tận Tâm
                </h1>

                <p className="hero-description" data-aos="fade-right" data-aos-delay="400">
                  Chúng tôi cung cấp dịch vụ chăm sóc sức khỏe toàn diện với đội ngũ bác sĩ chuyên nghiệp,
                  trang thiết bị hiện đại và sự tận tâm trong từng ca khám chữa bệnh.
                </p>

                <div className="hero-stats mb-4" data-aos="fade-right" data-aos-delay="500">
                  <StatCounter end={15} label="Năm Kinh Nghiệm" />
                  <StatCounter end={5000} label="Bệnh Nhân Được Điều Trị" />
                  <StatCounter end={50} label="Chuyên Gia Y Tế" />
                </div>

                <div className="hero-actions" data-aos="fade-right" data-aos-delay="600">
                  <Link to="/dat-lich-kham" className="btn btn-primary">Đặt Lịch Khám</Link>
                  <a href="#!" className="btn btn-outline">
                    <i className="bi bi-play-circle me-2"></i>
                    Xem Câu Chuyện
                  </a>
                </div>

                <div className="emergency-contact" data-aos="fade-right" data-aos-delay="700">
                  <div className="emergency-icon">
                    <i className="bi bi-telephone-fill"></i>
                  </div>
                  <div className="emergency-info">
                    <small>Đường Dây Cấp Cứu</small>
                    <strong>+84 28 3838 9999</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="hero-visual" data-aos="fade-left" data-aos-delay="400">
                <div className="main-image">
                  <img
                    src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&h=450&fit=crop"
                    alt="Cơ Sở Y Tế Hiện Đại"
                    className="img-fluid"
                  />
                  <div className="floating-card appointment-card">
                    <div className="card-icon">
                      <i className="bi bi-calendar-check"></i>
                    </div>
                    <div className="card-content">
                      <h6>Lịch Khám Gần Nhất</h6>
                      <p>Hôm Nay 14:30</p>
                      <small>BS. Nguyễn Thị Hoa</small>
                    </div>
                  </div>
                  <div className="floating-card rating-card">
                    <div className="card-content">
                      <div className="rating-stars">
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                      </div>
                      <h6>4.9/5</h6>
                      <small>1.234 Đánh Giá</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== About Section ========== */}
      <section id="home-about" className="home-about section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0" data-aos="fade-right" data-aos-delay="200">
              <div className="about-content">
                <h2 className="section-heading">Chăm Sóc Tận Tâm, Y Học Tiên Tiến</h2>
                <p className="lead-text">
                  Hơn hai thập kỷ qua, chúng tôi đã không ngừng cống hiến cho việc cung cấp dịch vụ y tế
                  xuất sắc, kết hợp công nghệ y tế tiên tiến với sự chăm sóc cá nhân mà bệnh nhân xứng đáng được nhận.
                </p>
                <p>
                  Đội ngũ chuyên gia đa ngành của chúng tôi làm việc phối hợp chặt chẽ để đảm bảo mỗi bệnh nhân
                  nhận được sự chăm sóc toàn diện phù hợp với nhu cầu riêng của họ. Từ các dịch vụ phòng ngừa
                  đến các thủ thuật phức tạp, chúng tôi duy trì tiêu chuẩn y tế cao nhất.
                </p>

                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-number">15.000+</div>
                    <div className="stat-label">Bệnh Nhân Được Phục Vụ</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">25+</div>
                    <div className="stat-label">Năm Xuất Sắc</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">50+</div>
                    <div className="stat-label">Chuyên Gia Y Tế</div>
                  </div>
                </div>

                <div className="cta-section" style={{ marginTop: '25px' }}>
                  <Link to="/gioi-thieu" className="btn-primary">Tìm Hiểu Thêm Về Chúng Tôi</Link>
                </div>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-left" data-aos-delay="300">
              <div className="about-visual">
                <div className="main-image">
                  <img
                    src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=450&fit=crop"
                    alt="Cơ Sở Y Tế Hiện Đại"
                    className="img-fluid"
                  />
                </div>
                <div className="floating-card">
                  <div className="card-content">
                    <div className="icon">
                      <i className="bi bi-heart-pulse"></i>
                    </div>
                    <div className="card-text">
                      <h4>Cấp Cứu 24/7</h4>
                      <p>Luôn ở đây khi bạn cần nhất</p>
                    </div>
                  </div>
                </div>
                <div className="experience-badge">
                  <div className="badge-content">
                    <span className="years">25+</span>
                    <span className="text">Năm Tin Cậy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Featured Departments ========== */}
      <section id="featured-departments" className="featured-departments section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Khoa Phòng</h2>
          <p>Các Khoa Phòng Nổi Bật</p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row g-5">
            <div className="col-lg-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="specialty-card">
                <div className="specialty-content">
                  <div className="specialty-meta">
                    <span className="specialty-label">Chăm Sóc Chuyên Biệt</span>
                  </div>
                  <h3>Tim Mạch</h3>
                  <p>Chẩn đoán hình ảnh tiên tiến và các thủ thuật can thiệp toàn diện để quản lý sức khỏe tim mạch với các phác đồ điều trị cá nhân hóa.</p>
                  <div className="specialty-features">
                    <span><i className="bi bi-check-circle-fill"></i>Cấp Cứu Tim Mạch 24/7</span>
                    <span><i className="bi bi-check-circle-fill"></i>Thủ Thuật Xâm Lấn Tối Thiểu</span>
                  </div>
                  <Link to="/khoa-phong" className="specialty-link">
                    Khám Phá Tim Mạch <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
                <div className="specialty-visual">
                  <img
                    src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=220&h=300&fit=crop"
                    alt="Tim Mạch"
                    className="img-fluid"
                  />
                  <div className="visual-overlay">
                    <i className="bi bi-heart-pulse"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="specialty-card">
                <div className="specialty-content">
                  <div className="specialty-meta">
                    <span className="specialty-label">Chăm Sóc Chuyên Gia</span>
                  </div>
                  <h3>Thần Kinh Học</h3>
                  <p>Hình ảnh thần kinh và chuyên môn phẫu thuật thần kinh tiên tiến cho các bệnh lý não bộ và tủy sống phức tạp với các phương pháp điều trị sáng tạo.</p>
                  <div className="specialty-features">
                    <span><i className="bi bi-check-circle-fill"></i>Hình Ảnh Não Bộ Tiên Tiến</span>
                    <span><i className="bi bi-check-circle-fill"></i>Phẫu Thuật Robot</span>
                  </div>
                  <Link to="/khoa-phong" className="specialty-link">
                    Khám Phá Thần Kinh <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
                <div className="specialty-visual">
                  <img
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=220&h=300&fit=crop"
                    alt="Thần Kinh Học"
                    className="img-fluid"
                  />
                  <div className="visual-overlay">
                    <i className="bi bi-cpu"></i>
                  </div>
                </div>
              </div>
            </div>

            {[
              { icon: 'bi-shield-plus', title: 'Cơ Xương Khớp', desc: 'Chăm sóc cơ xương khớp toàn diện sử dụng kỹ thuật nội soi tiên tiến và các thủ thuật thay thế khớp.', items: ['Thể Thao Y Học', 'Thay Khớp', 'Phẫu Thuật Cột Sống'], delay: 100 },
              { icon: 'bi-people', title: 'Nhi Khoa', desc: 'Dịch vụ chăm sóc sức khỏe cho trẻ em từ sơ sinh đến tuổi vị thành niên với phương pháp hướng đến gia đình.', items: ['Chăm Sóc Sơ Sinh Tích Cực', 'Nhi Khoa Phát Triển', 'Phẫu Thuật Nhi'], delay: 200 },
              { icon: 'bi-activity', title: 'Điều Trị Ung Thư', desc: 'Chương trình ung bướu đa ngành cung cấp điều trị ung thư cá nhân hóa với các đổi mới trị liệu mới nhất.', items: ['Y Học Chính Xác', 'Liệu Pháp Miễn Dịch', 'Xạ Trị'], delay: 300 },
            ].map((dept, i) => (
              <div key={i} className="col-lg-4" data-aos="fade-up" data-aos-delay={dept.delay}>
                <div className="department-highlight">
                  <div className="highlight-icon">
                    <i className={`bi ${dept.icon}`}></i>
                  </div>
                  <h4>{dept.title}</h4>
                  <p>{dept.desc}</p>
                  <ul className="highlight-list">
                    {dept.items.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                  <Link to="/khoa-phong" className="highlight-cta">Tìm Hiểu Thêm</Link>
                </div>
              </div>
            ))}
          </div>

          <div className="emergency-banner" data-aos="fade-up" data-aos-delay="400">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <div className="emergency-content">
                  <h3>Dịch Vụ Cấp Cứu Hoạt Động 24/7</h3>
                  <p>Khoa cấp cứu của chúng tôi được trang bị công nghệ tiên tiến với đội ngũ bác sĩ được chứng nhận sẵn sàng cung cấp sự chăm sóc kịp thời.</p>
                </div>
              </div>
              <div className="col-lg-4 text-lg-end">
                <a href="tel:+842838389999" className="emergency-btn">
                  <i className="bi bi-telephone-fill"></i>
                  Gọi Cấp Cứu: 115
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Featured Services ========== */}
      <section id="featured-services" className="featured-services section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Dịch Vụ</h2>
          <p>Dịch Vụ Y Tế Nổi Bật</p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4 mb-5">
            <div className="col-lg-8" data-aos="fade-right" data-aos-delay="200">
              <div className="featured-service-main">
                <div className="service-image-wrapper">
                  <img
                    src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=250&fit=crop"
                    alt="Dịch Vụ Chăm Sóc Sức Khỏe Hàng Đầu"
                    className="img-fluid"
                  />
                  <div className="service-overlay">
                    <div className="service-badge">
                      <i className="bi bi-heart-pulse"></i>
                      <span>Cấp Cứu</span>
                    </div>
                  </div>
                </div>
                <div className="service-details">
                  <h2>Xuất Sắc Toàn Diện Trong Chăm Sóc Sức Khỏe</h2>
                  <p>Dịch vụ y tế của chúng tôi được thiết kế để phục vụ sức khỏe toàn diện cho bạn và gia đình. Với đội ngũ bác sĩ chuyên nghiệp và trang thiết bị hiện đại, chúng tôi cam kết mang lại chất lượng điều trị tốt nhất.</p>
                  <Link to="/dich-vu" className="main-cta">Khám Phá Dịch Vụ Của Chúng Tôi</Link>
                </div>
              </div>
            </div>

            <div className="col-lg-4" data-aos="fade-left" data-aos-delay="300">
              <div className="services-sidebar">
                {[
                  { icon: 'bi-capsule', title: 'Phòng Khám Da Liễu', desc: 'Chuyên khám và điều trị các bệnh lý da liễu với phác đồ điều trị hiện đại.' },
                  { icon: 'bi-bandaid', title: 'Trung Tâm Phẫu Thuật', desc: 'Phẫu thuật nội soi và mổ mở với đội ngũ phẫu thuật viên giàu kinh nghiệm.' },
                  { icon: 'bi-activity', title: 'Phòng Xét Nghiệm', desc: 'Xét nghiệm chẩn đoán đầy đủ với kết quả nhanh chóng và chính xác.' },
                ].map((service, i) => (
                  <div key={i} className="service-item" data-aos="fade-up" data-aos-delay={400 + i * 100}>
                    <div className="service-icon-wrapper">
                      <i className={`bi ${service.icon}`}></i>
                    </div>
                    <div className="service-info">
                      <h4>{service.title}</h4>
                      <p>{service.desc}</p>
                      <Link to="/dich-vu" className="service-link">Tìm Hiểu Thêm</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="specialties-grid" data-aos="fade-up" data-aos-delay="300">
            <div className="row gy-4 align-items-stretch">
              {[
                { title: 'Chăm Sóc Bà Mẹ', desc: 'Hỗ trợ mang thai & sinh con chuyên nghiệp', img: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=200&h=160&fit=crop' },
                { title: 'Tiêm Chủng', desc: 'Chương trình tiêm chủng đầy đủ', img: 'https://images.unsplash.com/photo-1542736705-b3232e60f2f4?w=200&h=160&fit=crop' },
                { title: 'Cấp Cứu', desc: 'Dịch vụ cấp cứu 24/7', img: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=200&h=160&fit=crop' },
                { title: 'Công Nghệ Tiên Tiến', desc: 'Thiết bị y tế hiện đại nhất', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&h=160&fit=crop' },
              ].map((spec, i) => (
                <div key={i} className="col-lg-3 col-md-6">
                  <div className="specialty-card">
                    <div className="specialty-image">
                      <img src={spec.img} alt={spec.title} className="img-fluid" />
                    </div>
                    <div className="specialty-content">
                      <h5>{spec.title}</h5>
                      <span>{spec.desc}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== Find A Doctor ========== */}
      <section id="find-a-doctor" className="find-a-doctor section light-background">
        <div className="container section-title" data-aos="fade-up">
          <h2>Bác Sĩ</h2>
          <p>Tìm Bác Sĩ Phù Hợp</p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row justify-content-center mb-5" data-aos="fade-up" data-aos-delay="200">
            <div className="col-lg-8 text-center">
              <div className="search-section">
                <h3 className="search-title">Tìm Nhà Cung Cấp Dịch Vụ Chăm Sóc Sức Khỏe Phù Hợp</h3>
                <p className="search-subtitle">Tìm kiếm trong danh mục đầy đủ các chuyên gia y tế giàu kinh nghiệm của chúng tôi</p>
                <form className="search-form" onSubmit={e => e.preventDefault()}>
                  <div className="search-input-group">
                    <div className="input-wrapper">
                      <i className="bi bi-person"></i>
                      <input type="text" className="form-control" name="doctor_name" placeholder="Nhập tên bác sĩ" />
                    </div>
                    <div className="select-wrapper">
                      <i className="bi bi-heart-pulse"></i>
                      <select className="form-select" name="specialty">
                        <option value="">Tất Cả Chuyên Khoa</option>
                        <option value="cardiology">Tim Mạch</option>
                        <option value="neurology">Thần Kinh</option>
                        <option value="orthopedics">Cơ Xương Khớp</option>
                        <option value="pediatrics">Nhi Khoa</option>
                        <option value="dermatology">Da Liễu</option>
                        <option value="oncology">Ung Bướu</option>
                      </select>
                    </div>
                    <button type="submit" className="search-btn">
                      <i className="bi bi-search"></i>
                      Tìm Bác Sĩ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="doctors-grid" data-aos="fade-up" data-aos-delay="300">
            {doctors.map((doc, i) => (
              <div key={doc.id} className="doctor-profile" data-aos="zoom-in" data-aos-delay={100 * (i + 1)}>
                <div className="profile-header">
                  <div className="doctor-avatar">
                    <img src={doc.img} alt={doc.name} className="img-fluid" />
                    <div className={`status-indicator ${doc.status}`} title={statusLabel[doc.status]}></div>
                  </div>
                  <div className="doctor-details">
                    <h4>{doc.name}</h4>
                    <span className="specialty-tag">{doc.specialty}</span>
                    <div className="experience-info">
                      <i className="bi bi-award"></i>
                      <span>{doc.experience}</span>
                    </div>
                  </div>
                </div>
                <div className="rating-section">
                  <div className="stars">{renderStars(doc.rating)}</div>
                  <span className="rating-score">{doc.rating}</span>
                  <span className="review-count">({doc.reviews} đánh giá)</span>
                </div>
                <div className="action-buttons">
                  <Link to="/bac-si" className="btn-secondary">Xem Chi Tiết</Link>
                  <Link to="/dat-lich-kham" className="btn-primary">Đặt Lịch</Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-5" data-aos="fade-up" data-aos-delay="700">
            <Link to="/bac-si" className="btn-view-all">
              Xem Tất Cả Bác Sĩ
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ========== Call To Action ========== */}
      <section id="call-to-action" className="call-to-action section light-background">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="hero-content">
            <div className="row gy-4 align-items-center">
              <div className="col-lg-6">
                <div className="content-wrapper" data-aos="fade-up" data-aos-delay="200">
                  <h1>Xuất Sắc Trong Chăm Sóc Y Tế, Mỗi Ngày</h1>
                  <p>Đội ngũ bác sĩ chuyên nghiệp của chúng tôi cam kết mang đến dịch vụ y tế tốt nhất,
                    với trang thiết bị hiện đại và phương pháp điều trị tiên tiến nhất.</p>
                  <div className="cta-wrapper">
                    <Link to="/dat-lich-kham" className="primary-cta">
                      <span>Đặt Lịch Tư Vấn</span>
                      <i className="bi bi-arrow-right"></i>
                    </Link>
                    <Link to="/dich-vu" className="secondary-cta">
                      <span>Khám Phá Dịch Vụ</span>
                      <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="image-container" data-aos="fade-left" data-aos-delay="300">
                  <img
                    src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=350&fit=crop"
                    alt="Xuất Sắc Y Tế"
                    className="img-fluid"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="features-section">
            <div className="row g-0">
              {[
                { icon: 'bi-shield-check', title: 'Công Nghệ Tiên Tiến', desc: 'Trang thiết bị y tế hiện đại nhất giúp chẩn đoán và điều trị chính xác, hiệu quả.' },
                { icon: 'bi-clock', title: 'Phục Vụ 24/7', desc: 'Đội ngũ y tế luôn sẵn sàng hỗ trợ bạn mọi lúc mọi nơi, kể cả trong những tình huống khẩn cấp.' },
                { icon: 'bi-people', title: 'Đội Ngũ Chuyên Gia', desc: 'Các bác sĩ được đào tạo bài bản và có nhiều năm kinh nghiệm trong các lĩnh vực chuyên môn.' },
              ].map((feat, i) => (
                <div key={i} className="col-lg-4">
                  <div className="feature-block" data-aos="fade-up" data-aos-delay={200 + i * 100}>
                    <div className="feature-icon">
                      <i className={`bi ${feat.icon}`}></i>
                    </div>
                    <h3>{feat.title}</h3>
                    <p>{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="contact-block">
            <div className="row gy-4 align-items-center">
              <div className="col-lg-8">
                <div className="contact-content" data-aos="fade-up" data-aos-delay="200">
                  <h2>Cần Hỗ Trợ Y Tế Khẩn Cấp?</h2>
                  <p>Đội ngũ phản ứng khẩn cấp của chúng tôi hoạt động suốt ngày đêm để cung cấp hỗ trợ y tế kịp thời khi bạn cần nhất.</p>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="contact-actions" data-aos="fade-up" data-aos-delay="300">
                  <a href="tel:115" className="emergency-call">
                    <i className="bi bi-telephone"></i>
                    <span>Cấp Cứu: 115</span>
                  </a>
                  <Link to="/lien-he" className="contact-link">Tìm Địa Chỉ</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
