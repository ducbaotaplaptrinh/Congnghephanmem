import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import PageTitle from '../components/PageTitle'

const services = [
  { icon: 'bi-heart-pulse', title: 'Tim Mạch', desc: 'Chẩn đoán và điều trị các bệnh lý tim mạch với công nghệ can thiệp tối thiểu xâm lấn, giúp bệnh nhân hồi phục nhanh chóng.' },
  { icon: 'bi-cpu', title: 'Thần Kinh', desc: 'Điều trị các bệnh lý não bộ và hệ thần kinh với hệ thống hình ảnh MRI tiên tiến nhất và phẫu thuật robot.' },
  { icon: 'bi-shield-plus', title: 'Cơ Xương Khớp', desc: 'Phẫu thuật nội soi và thay khớp nhân tạo với độ chính xác cao, thời gian hồi phục ngắn.' },
  { icon: 'bi-people', title: 'Nhi Khoa', desc: 'Chăm sóc sức khỏe toàn diện cho trẻ em từ sơ sinh đến 18 tuổi, bao gồm tiêm chủng và theo dõi phát triển.' },
  { icon: 'bi-activity', title: 'Ung Bướu', desc: 'Điều trị ung thư với phác đồ cá nhân hóa, bao gồm hóa trị, xạ trị và liệu pháp miễn dịch hiện đại.' },
  { icon: 'bi-capsule', title: 'Da Liễu', desc: 'Khám và điều trị các bệnh lý da, thẩm mỹ da với laser công nghệ cao và các phương pháp không xâm lấn.' },
  { icon: 'bi-eye', title: 'Nhãn Khoa', desc: 'Phẫu thuật mắt Lasik, điều trị các bệnh về mắt và kiểm tra thị lực định kỳ cho cả gia đình.' },
  { icon: 'bi-bandaid', title: 'Cấp Cứu 24/7', desc: 'Khoa cấp cứu hoạt động liên tục với đội ngũ bác sĩ chuyên nghiệp và trang thiết bị hiện đại.' },
  { icon: 'bi-droplet', title: 'Nội Tiết', desc: 'Chẩn đoán và điều trị các bệnh lý tuyến giáp, đái tháo đường, và các rối loạn nội tiết khác.' },
  { icon: 'bi-lungs', title: 'Hô Hấp', desc: 'Điều trị các bệnh phổi và đường hô hấp bao gồm hen suyễn, COPD, và các bệnh lý phổi phức tạp.' },
  { icon: 'bi-reception-4', title: 'Tiêu Hóa', desc: 'Nội soi chẩn đoán và điều trị các bệnh lý đường tiêu hóa với hệ thống nội soi hiện đại.' },
  { icon: 'bi-gender-female', title: 'Sản Phụ Khoa', desc: 'Chăm sóc sức khỏe phụ nữ toàn diện từ khám phụ khoa đến hỗ trợ sinh sản và chăm sóc thai sản.' },
]

export default function Services() {
  useEffect(() => {
    AOS.refresh()
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <PageTitle
        title="Dịch Vụ"
        description="Chúng tôi cung cấp đầy đủ các dịch vụ y tế chuyên sâu với trang thiết bị hiện đại và đội ngũ chuyên gia giàu kinh nghiệm."
        breadcrumb="Dịch Vụ"
      />

      <section id="services" className="services section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {services.map((service, i) => (
              <div key={i} className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay={100 * (i % 4 + 1)}>
                <div className="service-card">
                  <div className="service-icon">
                    <i className={`bi ${service.icon}`}></i>
                  </div>
                  <h4>{service.title}</h4>
                  <p>{service.desc}</p>
                  <Link to="/dat-lich-kham" className="service-link">
                    Đặt Lịch <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Process Section */}
          <div style={{ marginTop: '70px', textAlign: 'center' }} data-aos="fade-up">
            <h2 style={{ fontSize: '30px', fontWeight: '700', marginBottom: '12px' }}>Quy Trình Khám Chữa Bệnh</h2>
            <p style={{ color: '#666', marginBottom: '40px' }}>Đơn giản, nhanh chóng và hiệu quả</p>

            <div className="row">
              {[
                { step: '01', icon: 'bi-calendar-check', title: 'Đặt Lịch', desc: 'Đặt lịch trực tuyến hoặc gọi điện để đặt giờ khám phù hợp với thời gian của bạn' },
                { step: '02', icon: 'bi-person-badge', title: 'Đăng Ký', desc: 'Đến phòng khám và hoàn thành thủ tục đăng ký với thông tin cá nhân và bảo hiểm y tế' },
                { step: '03', icon: 'bi-stethoscope', title: 'Khám Bệnh', desc: 'Gặp bác sĩ chuyên khoa để được thăm khám và tư vấn về tình trạng sức khỏe' },
                { step: '04', icon: 'bi-clipboard2-check', title: 'Điều Trị', desc: 'Nhận phác đồ điều trị cá nhân hóa và theo dõi tiến trình phục hồi sức khỏe' },
              ].map((proc, i) => (
                <div key={i} className="col-lg-3 col-md-6" style={{ marginBottom: '20px' }}>
                  <div style={{ padding: '30px 20px', background: '#fff', borderRadius: '16px', boxShadow: '0 5px 25px rgba(0,0,0,0.06)', height: '100%', transition: '0.3s', position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      right: '20px',
                      fontSize: '50px',
                      fontWeight: '900',
                      color: 'rgba(23,92,221,0.06)',
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: 1
                    }}>{proc.step}</div>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'rgba(23,92,221,0.1)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#175cdd',
                      fontSize: '26px',
                      margin: '0 auto 18px'
                    }}>
                      <i className={`bi ${proc.icon}`}></i>
                    </div>
                    <h5 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px' }}>{proc.title}</h5>
                    <p style={{ fontSize: '13px', color: '#666', margin: 0, lineHeight: '1.6' }}>{proc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: '50px', background: 'linear-gradient(135deg, #175cdd, #0d47a1)', borderRadius: '20px', padding: '40px', color: '#fff', textAlign: 'center' }} data-aos="fade-up">
            <h3 style={{ color: '#fff', marginBottom: '15px' }}>Bạn Cần Thêm Thông Tin?</h3>
            <p style={{ opacity: 0.85, marginBottom: '25px' }}>Liên hệ ngay để được tư vấn miễn phí về các dịch vụ y tế phù hợp với nhu cầu của bạn</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/dat-lich-kham" style={{ display: 'inline-block', background: '#fff', color: '#175cdd', padding: '13px 28px', borderRadius: '50px', fontWeight: '700', textDecoration: 'none' }}>
                Đặt Lịch Khám
              </Link>
              <Link to="/lien-he" style={{ display: 'inline-block', border: '2px solid rgba(255,255,255,0.5)', color: '#fff', padding: '13px 28px', borderRadius: '50px', fontWeight: '600', textDecoration: 'none' }}>
                Liên Hệ Chúng Tôi
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
