import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import PageTitle from '../components/PageTitle'

const departments = [
  {
    icon: 'bi-heart-pulse',
    title: 'Tim Mạch',
    desc: 'Chẩn đoán và điều trị toàn diện các bệnh lý tim mạch với công nghệ hình ảnh tiên tiến và các thủ thuật can thiệp hiện đại.',
    img: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=200&fit=crop',
    services: ['Siêu âm tim', 'Điện tâm đồ', 'Thông tim', 'Phẫu thuật tim']
  },
  {
    icon: 'bi-cpu',
    title: 'Thần Kinh',
    desc: 'Chuyên khoa điều trị các bệnh lý não bộ, tủy sống và hệ thần kinh với đội ngũ chuyên gia hàng đầu.',
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=200&fit=crop',
    services: ['MRI não bộ', 'Điện não đồ', 'Phẫu thuật thần kinh', 'Điều trị đột quỵ']
  },
  {
    icon: 'bi-shield-plus',
    title: 'Cơ Xương Khớp',
    desc: 'Chăm sóc toàn diện các bệnh lý cơ xương khớp từ chẩn đoán đến phẫu thuật nội soi và thay khớp nhân tạo.',
    img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
    services: ['Phẫu thuật nội soi', 'Thay khớp gối/hông', 'Phẫu thuật cột sống', 'Thể thao y học']
  },
  {
    icon: 'bi-people',
    title: 'Nhi Khoa',
    desc: 'Dịch vụ chăm sóc sức khỏe toàn diện cho trẻ em từ sơ sinh đến tuổi vị thành niên với phương pháp hướng đến gia đình.',
    img: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=200&fit=crop',
    services: ['Chăm sóc sơ sinh', 'Tiêm chủng', 'Nhi khoa phát triển', 'Phẫu thuật nhi']
  },
  {
    icon: 'bi-activity',
    title: 'Ung Bướu',
    desc: 'Chương trình điều trị ung thư toàn diện với các liệu pháp tiên tiến nhất, cá nhân hóa theo từng bệnh nhân.',
    img: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=200&fit=crop',
    services: ['Hóa trị', 'Xạ trị', 'Liệu pháp miễn dịch', 'Y học chính xác']
  },
  {
    icon: 'bi-capsule',
    title: 'Da Liễu',
    desc: 'Khám và điều trị toàn diện các bệnh lý da với công nghệ laser và các phương pháp thẩm mỹ hiện đại.',
    img: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=200&fit=crop',
    services: ['Điều trị mụn trứng cá', 'Laser trị liệu', 'Điều trị vảy nến', 'Thẩm mỹ da']
  },
  {
    icon: 'bi-eye',
    title: 'Nhãn Khoa',
    desc: 'Chăm sóc mắt toàn diện từ khám thị lực đến phẫu thuật mắt với công nghệ laser tiên tiến nhất.',
    img: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=200&fit=crop',
    services: ['Phẫu thuật Lasik', 'Thay thủy tinh thể', 'Điều trị Glaucoma', 'Khám mắt trẻ em']
  },
  {
    icon: 'bi-bandaid',
    title: 'Cấp Cứu',
    desc: 'Khoa cấp cứu hoạt động 24/7 với đội ngũ bác sĩ và y tá được đào tạo bài bản, sẵn sàng ứng phó mọi tình huống.',
    img: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=400&h=200&fit=crop',
    services: ['Cấp cứu đa chấn thương', 'Hồi sức tim phổi', 'Cấp cứu tim mạch', 'Cấp cứu nhi']
  },
]

export default function Departments() {
  useEffect(() => {
    AOS.refresh()
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <PageTitle
        title="Khoa Phòng"
        description="Hệ thống các khoa phòng hiện đại với đội ngũ chuyên gia hàng đầu, sẵn sàng phục vụ mọi nhu cầu chăm sóc sức khỏe của bạn và gia đình."
        breadcrumb="Khoa Phòng"
      />

      <section id="departments" className="departments section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {departments.map((dept, i) => (
              <div key={i} className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay={100 * (i % 4 + 1)}>
                <div className="dept-card">
                  <div className="dept-image">
                    <img src={dept.img} alt={dept.title} className="img-fluid" />
                    <div className="dept-overlay">
                      <i className={`bi ${dept.icon}`}></i>
                    </div>
                  </div>
                  <div className="dept-content">
                    <h4>{dept.title}</h4>
                    <p>{dept.desc}</p>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '15px' }}>
                      {dept.services.map((svc, j) => (
                        <li key={j} style={{ fontSize: '13px', color: '#666', padding: '3px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <i className="bi bi-check-circle-fill" style={{ color: '#28a745', fontSize: '11px' }}></i>
                          {svc}
                        </li>
                      ))}
                    </ul>
                    <Link to="/dat-lich-kham" className="dept-link">
                      Đặt Lịch Khám <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="emergency-banner" style={{ marginTop: '50px' }} data-aos="fade-up">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <div className="emergency-content">
                  <h3>Cần Tư Vấn Về Khoa Phòng?</h3>
                  <p>Liên hệ ngay với chúng tôi để được tư vấn và hướng dẫn đến khoa phòng phù hợp nhất với tình trạng sức khỏe của bạn.</p>
                </div>
              </div>
              <div className="col-lg-4 text-lg-end">
                <Link to="/dat-lich-kham" className="emergency-btn" style={{ background: '#fff', color: '#cc0000' }}>
                  <i className="bi bi-calendar-check"></i>
                  Đặt Lịch Khám
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
