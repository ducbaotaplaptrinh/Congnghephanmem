import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import PageTitle from '../components/PageTitle'

export default function About() {
  useEffect(() => {
    AOS.refresh()
    window.scrollTo(0, 0)
  }, [])

  const values = [
    { icon: 'bi-heart-pulse', title: 'Tận Tâm', desc: 'Cung cấp dịch vụ chăm sóc với sự đồng cảm và thấu hiểu nhu cầu riêng biệt của từng bệnh nhân.' },
    { icon: 'bi-shield-check', title: 'Xuất Sắc', desc: 'Duy trì tiêu chuẩn chăm sóc y tế cao nhất thông qua học hỏi liên tục và đổi mới sáng tạo.' },
    { icon: 'bi-people', title: 'Chính Trực', desc: 'Xây dựng niềm tin thông qua giao tiếp trung thực và các thực hành đạo đức trong mọi hoạt động.' },
    { icon: 'bi-lightbulb', title: 'Đổi Mới', desc: 'Ứng dụng công nghệ và phương pháp điều trị tiên tiến để cải thiện kết quả điều trị cho bệnh nhân.' },
  ]

  return (
    <>
      <PageTitle
        title="Giới Thiệu"
        description="Hơn hai thập kỷ tận tâm phục vụ cộng đồng với dịch vụ chăm sóc y tế chất lượng cao, kết hợp công nghệ hiện đại với sự quan tâm chân thành."
        breadcrumb="Giới Thiệu"
      />

      {/* About Section */}
      <section id="about" className="about section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-6" data-aos="fade-right" data-aos-delay="100">
              <div className="about-content">
                <h2>Chăm Sóc Tận Tâm Cho Mọi Gia Đình</h2>
                <p className="lead">
                  Hơn hai thập kỷ qua, chúng tôi đã tận tâm cung cấp dịch vụ chăm sóc sức khỏe xuất sắc
                  cho cộng đồng. Cam kết của chúng tôi vượt ra ngoài điều trị y tế—chúng tôi tin vào việc
                  xây dựng mối quan hệ lâu dài với bệnh nhân và gia đình họ.
                </p>
                <p>
                  Đội ngũ chuyên gia của chúng tôi không ngừng nỗ lực để đảm bảo mỗi bệnh nhân nhận được
                  sự chăm sóc toàn diện và cá nhân hóa. Từ các dịch vụ phòng ngừa đến điều trị các bệnh
                  lý phức tạp, chúng tôi luôn đặt sức khỏe của bạn lên hàng đầu.
                </p>

                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">15.000+</span>
                    <span className="stat-label">Bệnh Nhân Được Điều Trị</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">25+</span>
                    <span className="stat-label">Năm Kinh Nghiệm</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">50+</span>
                    <span className="stat-label">Chuyên Gia Y Tế</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-left" data-aos-delay="200">
              <div className="image-wrapper">
                <div className="main-image">
                  <img
                    src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=450&fit=crop"
                    className="img-fluid"
                    alt="Cơ Sở Y Tế"
                  />
                </div>
                <div className="floating-image" data-aos="zoom-in" data-aos-delay="400">
                  <img
                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=160&h=160&fit=crop&crop=face"
                    className="img-fluid"
                    alt="Đội Ngũ Y Tế"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="values-section" data-aos="fade-up" data-aos-delay="300">
            <div className="row">
              <div className="col-lg-12 text-center">
                <h3>Giá Trị Cốt Lõi Của Chúng Tôi</h3>
                <p className="section-description">
                  Những nguyên tắc này hướng dẫn mọi hoạt động trong cam kết của chúng tôi với dịch vụ y tế xuất sắc
                </p>
              </div>
            </div>

            <div className="row gy-4">
              {values.map((value, i) => (
                <div key={i} className="col-lg-6 col-md-6" data-aos="fade-up" data-aos-delay={100 * (i + 1)}>
                  <div className="value-item">
                    <div className="value-icon">
                      <i className={`bi ${value.icon}`}></i>
                    </div>
                    <h4>{value.title}</h4>
                    <p>{value.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications Section */}
          <div className="certifications-section" data-aos="fade-up" data-aos-delay="400">
            <div className="row">
              <div className="col-lg-12 text-center">
                <h3>Chứng Nhận & Công Nhận</h3>
                <p className="section-description">
                  Được công nhận bởi các tổ chức y tế hàng đầu vì cam kết chất lượng chăm sóc
                </p>
              </div>
            </div>

            <div className="row justify-content-center" style={{ marginTop: '30px', gap: '15px', flexWrap: 'wrap' }}>
              {[
                'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&h=60&fit=crop',
                'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=100&h=60&fit=crop',
                'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=100&h=60&fit=crop',
                'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=100&h=60&fit=crop',
                'https://images.unsplash.com/photo-1542736705-b3232e60f2f4?w=100&h=60&fit=crop',
              ].map((img, i) => (
                <div key={i} data-aos="zoom-in" data-aos-delay={100 * (i + 1)} style={{ minWidth: '120px' }}>
                  <div className="certification-item">
                    <img src={img} className="img-fluid" alt={`Chứng nhận ${i + 1}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: '50px', padding: '40px', background: 'linear-gradient(135deg, #175cdd, #0d47a1)', borderRadius: '20px', color: '#fff' }} data-aos="fade-up">
            <h3 style={{ color: '#fff', fontSize: '26px', marginBottom: '15px' }}>Sẵn Sàng Đặt Lịch Khám?</h3>
            <p style={{ opacity: 0.85, marginBottom: '25px' }}>Liên hệ với chúng tôi để được tư vấn và đặt lịch khám ngay hôm nay</p>
            <Link to="/dat-lich-kham" style={{
              display: 'inline-block',
              background: '#fff',
              color: '#175cdd',
              padding: '14px 30px',
              borderRadius: '50px',
              fontWeight: '700',
              fontSize: '15px',
              textDecoration: 'none',
              transition: '0.3s'
            }}>
              Đặt Lịch Khám Ngay
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
