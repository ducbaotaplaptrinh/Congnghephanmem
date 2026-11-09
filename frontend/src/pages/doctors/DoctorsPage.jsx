import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import PageTitle from '../../components/common/PageTitle'
import doctorService from '../../services/doctorService'

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AOS.refresh()
    window.scrollTo(0, 0)

    async function fetchDoctors() {
      try {
        const list = await doctorService.getAll()
        setDoctors(list)
      } finally {
        setLoading(false)
        setTimeout(() => AOS.refresh(), 100)
      }
    }
    fetchDoctors()
  }, [])

  return (
    <>
      <PageTitle
        title="Đội Ngũ Bác Sĩ"
        description="Đội ngũ bác sĩ chuyên nghiệp, tâm huyết của chúng tôi luôn sẵn sàng mang đến dịch vụ chăm sóc sức khỏe tốt nhất cho bạn và gia đình."
        breadcrumb="Bác Sĩ"
      />

      <section id="doctors" className="doctors section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#175cdd' }}>
              <div className="spinner-border" role="status"></div>
              <p style={{ marginTop: '15px', color: '#666' }}>Đang tải danh sách bác sĩ từ hệ thống...</p>
            </div>
          ) : (
            <div className="row gy-4">
              {doctors.map((doc, i) => (
                <div key={doc.id || i} className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay={(i % 4) * 100 + 100}>
                  <div className="doctor-card">
                    <div className="doctor-image">
                      <img src={doc.img} alt={doc.name} className="img-fluid" />
                      <div className="doctor-overlay">
                        <div className="social-links">
                          <a href="#!" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
                          <a href="#!" aria-label="Email"><i className="bi bi-envelope"></i></a>
                          <a href={`tel:${doc.phone}`} aria-label="Điện thoại"><i className="bi bi-phone"></i></a>
                        </div>
                      </div>
                    </div>
                    <div className="doctor-content">
                      <h4>{doc.name}</h4>
                      <span className="specialty">{doc.specialty || doc.department}</span>
                      <p>{doc.desc || doc.bio}</p>
                      <div className="doctor-meta">
                        <div className="experience">
                          <i className="bi bi-award"></i>
                          <span>{doc.experience}</span>
                        </div>
                        <div className="department">
                          <i className="bi bi-building"></i>
                          <span>{doc.department || doc.dept}</span>
                        </div>
                      </div>
                      <Link to="/dat-lich-kham" className="btn-appointment">Đặt Lịch Khám</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{ marginTop: '60px', textAlign: 'center', padding: '45px 40px', background: 'linear-gradient(135deg, #f4f8ff, #e8f0ff)', borderRadius: '20px', border: '1px solid rgba(23,92,221,0.1)' }} data-aos="fade-up">
            <h3 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '12px' }}>Cần Tư Vấn Chuyên Khoa?</h3>
            <p style={{ color: '#666', marginBottom: '25px' }}>Hãy liên hệ với chúng tôi để được kết nối với bác sĩ chuyên khoa phù hợp nhất với tình trạng sức khỏe của bạn</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/dat-lich-kham" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#175cdd', color: '#fff', padding: '14px 30px',
                borderRadius: '50px', fontWeight: '700', textDecoration: 'none'
              }}>
                <i className="bi bi-calendar-check"></i> Đặt Lịch Khám
              </Link>
              <a href="tel:+842838389999" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                border: '2px solid #175cdd', color: '#175cdd', padding: '14px 30px',
                borderRadius: '50px', fontWeight: '600', textDecoration: 'none'
              }}>
                <i className="bi bi-telephone"></i> Gọi Ngay
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
