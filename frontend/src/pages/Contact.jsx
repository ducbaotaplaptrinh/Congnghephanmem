import { useEffect, useState } from 'react'
import AOS from 'aos'
import PageTitle from '../components/PageTitle'

export default function Contact() {
  useEffect(() => {
    AOS.refresh()
    window.scrollTo(0, 0)
  }, [])

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    }, 1200)
  }

  const contactInfo = [
    { icon: 'bi-geo-alt', title: 'Địa Chỉ', lines: ['123 Đường Lê Lợi, Quận 1', 'TP. Hồ Chí Minh, Việt Nam'] },
    { icon: 'bi-telephone', title: 'Điện Thoại', lines: ['+84 28 3838 9999', 'Cấp cứu: 115'] },
    { icon: 'bi-envelope', title: 'Email', lines: ['lienhe@phongkham.vn', 'dichvu@phongkham.vn'] },
    { icon: 'bi-clock', title: 'Giờ Làm Việc', lines: ['Thứ 2 - Thứ 6: 7:00 - 20:00', 'Thứ 7 - CN: 8:00 - 17:00'] },
  ]

  return (
    <>
      <PageTitle
        title="Liên Hệ"
        description="Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi để được tư vấn và hỗ trợ kịp thời."
        breadcrumb="Liên Hệ"
      />

      <section id="contact" className="contact section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {/* Contact Info */}
            <div className="col-lg-5" data-aos="fade-right" data-aos-delay="200">
              <div className="contact-info-card">
                <h3>Thông Tin Liên Hệ</h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '25px', lineHeight: '1.6' }}>
                  Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ qua bất kỳ
                  kênh nào dưới đây để được phục vụ tốt nhất.
                </p>

                {contactInfo.map((info, i) => (
                  <div key={i} className="info-item">
                    <div className="info-icon">
                      <i className={`bi ${info.icon}`}></i>
                    </div>
                    <div className="info-content">
                      <h4>{info.title}</h4>
                      {info.lines.map((line, j) => <p key={j}>{line}</p>)}
                    </div>
                  </div>
                ))}

                {/* Social Links */}
                <div style={{ marginTop: '30px', paddingTop: '25px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <h5 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '15px' }}>Theo Dõi Chúng Tôi</h5>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[
                      { icon: 'bi-facebook', color: '#1877f2' },
                      { icon: 'bi-youtube', color: '#ff0000' },
                      { icon: 'bi-twitter-x', color: '#000' },
                      { icon: 'bi-instagram', color: '#e1306c' },
                    ].map((social, i) => (
                      <a key={i} href="#!" style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: `${social.color}18`,
                        color: social.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        transition: '0.3s'
                      }}>
                        <i className={`bi ${social.icon}`}></i>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="col-lg-7" data-aos="fade-left" data-aos-delay="300">
              <div className="contact-form">
                <h3>Gửi Tin Nhắn Cho Chúng Tôi</h3>

                {submitted ? (
                  <div className="sent-message">
                    <i className="bi bi-check-circle-fill" style={{ fontSize: '30px', display: 'block', marginBottom: '10px' }}></i>
                    Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi trong vòng 24 giờ. Cảm ơn bạn!
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="row gy-4">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Họ và Tên *</label>
                          <input type="text" name="name" className="form-control" placeholder="Nguyễn Văn A" required value={formData.name} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Email *</label>
                          <input type="email" name="email" className="form-control" placeholder="email@example.com" required value={formData.email} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Số Điện Thoại</label>
                          <input type="tel" name="phone" className="form-control" placeholder="0901 234 567" value={formData.phone} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Chủ Đề *</label>
                          <input type="text" name="subject" className="form-control" placeholder="Chủ đề tin nhắn" required value={formData.subject} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <label>Nội Dung Tin Nhắn *</label>
                          <textarea name="message" className="form-control" rows="5" placeholder="Nhập nội dung tin nhắn của bạn..." required value={formData.message} onChange={handleChange}></textarea>
                        </div>
                      </div>
                      <div className="col-12">
                        {loading ? (
                          <div style={{ padding: '15px', background: '#f0f4ff', borderRadius: '8px', textAlign: 'center', fontSize: '14px', color: '#175cdd' }}>
                            Đang gửi tin nhắn...
                          </div>
                        ) : (
                          <button type="submit" className="btn-submit">
                            <i className="bi bi-send"></i>
                            Gửi Tin Nhắn
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="map-section" data-aos="fade-up" style={{ marginTop: '50px' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4565905272074!2d106.70241587480895!3d10.77580258935789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc7%3A0x4db964d76bf6e18e!2zMTIzIMSQLiBM6qmBIEzhu6NpLCBCx6FuIE5naOG7hSwgUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1696487000000!5m2!1svi!2s"
              width="100%"
              height="400"
              style={{ border: 0, display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bản đồ phòng khám"
            ></iframe>
          </div>
        </div>
      </section>
    </>
  )
}
