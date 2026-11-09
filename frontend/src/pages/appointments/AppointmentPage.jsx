import { useEffect, useState, useMemo } from 'react'
import AOS from 'aos'
import PageTitle from '../../components/common/PageTitle'
import appointmentService from '../../services/appointmentService'
import doctorService from '../../services/doctorService'

// Danh mục loại hình dịch vụ khám
const SERVICE_TYPES = [
  { id: 'standard', name: 'Khám Chuyên Khoa', desc: 'Khám theo chuyên khoa tiêu chuẩn', icon: 'bi-stethoscope', badge: 'Phổ biến', price: '150.000đ' },
  { id: 'insurance', name: 'Khám BHYT', desc: 'Áp dụng thẻ BHYT toàn quốc', icon: 'bi-shield-check', badge: 'Hỗ trợ BHYT', price: 'Đúng tuyến BHYT' },
  { id: 'vip', name: 'Khám Chuyên Gia', desc: 'Thăm khám cùng Trưởng/Phó khoa', icon: 'bi-star-fill', badge: 'Ưu tiên', price: '300.000đ' },
  { id: 'general_checkup', name: 'Gói Tổng Quát', desc: 'Tầm soát sức khỏe toàn diện', icon: 'bi-clipboard2-pulse', badge: 'Tiết kiệm', price: 'Từ 950.000đ' },
  { id: 'follow_up', name: 'Tái Khám Theo Hẹn', desc: 'Theo dõi lộ trình điều trị', icon: 'bi-arrow-repeat', badge: 'Nhanh chóng', price: 'Theo chỉ định' },
]

// Danh mục chuyên khoa
const DEPARTMENTS = [
  { id: 'all', name: 'Tất Cả Chuyên Khoa', icon: 'bi-grid-fill' },
  { id: 'cardiology', name: 'Khoa Tim Mạch', icon: 'bi-heart-pulse' },
  { id: 'pediatrics', name: 'Khoa Nhi', icon: 'bi-emoji-smile' },
  { id: 'neurology', name: 'Khoa Thần Kinh', icon: 'bi-diagram-3' },
  { id: 'orthopedics', name: 'Cơ Xương Khớp', icon: 'bi-person-walking' },
  { id: 'ophthalmology', name: 'Khoa Mắt', icon: 'bi-eye' },
  { id: 'dermatology', name: 'Khoa Da Liễu', icon: 'bi-stars' },
  { id: 'dental', name: 'Răng Hàm Mặt', icon: 'bi-shield-plus' },
  { id: 'obstetrics', name: 'Sản Phụ Khoa', icon: 'bi-gender-female' },
  { id: 'general', name: 'Nội Tổng Quát', icon: 'bi-capsule' },
]

// Danh sách bác sĩ tiêu biểu có hình ảnh và đánh giá
const DOCTOR_LIST = [
  {
    id: 1,
    name: 'BS. CKII. Trần Văn Hùng',
    title: 'Trưởng khoa Tim Mạch',
    deptId: 'cardiology',
    deptName: 'Khoa Tim Mạch',
    experience: '15+ năm KN',
    rating: 4.9,
    reviews: 142,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face'
  },
  {
    id: 2,
    name: 'ThS. BS. Nguyễn Thị Lan',
    title: 'Phó khoa Nhi',
    deptId: 'pediatrics',
    deptName: 'Khoa Nhi',
    experience: '10+ năm KN',
    rating: 5.0,
    reviews: 198,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face'
  },
  {
    id: 3,
    name: 'TS. BS. Lê Hoàng Nam',
    title: 'Chuyên gia Thần Kinh',
    deptId: 'neurology',
    deptName: 'Khoa Thần Kinh',
    experience: '12+ năm KN',
    rating: 4.8,
    reviews: 88,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face'
  },
  {
    id: 4,
    name: 'BS. CKI. Phạm Minh Tuấn',
    title: 'Bác sĩ chuyên khoa Mắt',
    deptId: 'ophthalmology',
    deptName: 'Khoa Mắt',
    experience: '9+ năm KN',
    rating: 4.9,
    reviews: 110,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face'
  },
  {
    id: 5,
    name: 'ThS. BS. Vũ Đức Anh',
    title: 'Trưởng khoa Nha',
    deptId: 'dental',
    deptName: 'Răng Hàm Mặt',
    experience: '8+ năm KN',
    rating: 4.9,
    reviews: 95,
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face'
  },
  {
    id: 6,
    name: 'BS. Hoàng Kim Yến',
    title: 'Bác sĩ Nội Tổng Quát',
    deptId: 'general',
    deptName: 'Nội Tổng Quát',
    experience: '7+ năm KN',
    rating: 4.8,
    reviews: 76,
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face'
  },
  {
    id: 7,
    name: 'BS. Lê Quang Hùng',
    title: 'Phẫu thuật viên Xương Khớp',
    deptId: 'orthopedics',
    deptName: 'Cơ Xương Khớp',
    experience: '18+ năm KN',
    rating: 4.9,
    reviews: 160,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face'
  },
  {
    id: 8,
    name: 'BS. Nguyễn Thị Bảo Châu',
    title: 'Chuyên gia Sản Phụ Khoa',
    deptId: 'obstetrics',
    deptName: 'Sản Phụ Khoa',
    experience: '13+ năm KN',
    rating: 5.0,
    reviews: 135,
    avatar: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=200&h=200&fit=crop&crop=face'
  },
  {
    id: 9,
    name: 'BS. Hoàng Văn Đức',
    title: 'Bác sĩ Da Liễu & Laser',
    deptId: 'dermatology',
    deptName: 'Khoa Da Liễu',
    experience: '14+ năm KN',
    rating: 4.9,
    reviews: 120,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face'
  }
]

// Ca sáng & Ca chiều
const MORNING_SLOTS = [
  { time: '07:30', status: 'available' },
  { time: '08:15', status: 'available' },
  { time: '09:00', status: 'busy' }, // Giờ đông đúc đã kín
  { time: '09:45', status: 'available' },
  { time: '10:30', status: 'available' },
  { time: '11:15', status: 'available' }
]

const AFTERNOON_SLOTS = [
  { time: '13:30', status: 'available' },
  { time: '14:15', status: 'available' },
  { time: '15:00', status: 'available' },
  { time: '15:45', status: 'available' },
  { time: '16:30', status: 'available' },
  { time: '17:15', status: 'available' }
]

export default function Appointment() {
  const [doctorList, setDoctorList] = useState(DOCTOR_LIST)

  useEffect(() => {
    AOS.refresh()
    window.scrollTo(0, 0)

    doctorService.getAll().then(apiDoctors => {
      if (apiDoctors && apiDoctors.length > 0) {
        const mapped = apiDoctors.map(d => {
          const dept = d.department || d.chuyenkhoa || ''
          let deptId = 'general'
          if (/mắt/i.test(dept)) deptId = 'ophthalmology'
          else if (/tim/i.test(dept)) deptId = 'cardiology'
          else if (/nhi/i.test(dept)) deptId = 'pediatrics'
          else if (/thần kinh/i.test(dept)) deptId = 'neurology'
          else if (/khớp|xương/i.test(dept)) deptId = 'orthopedics'
          else if (/da/i.test(dept)) deptId = 'dermatology'
          else if (/răng|nha/i.test(dept)) deptId = 'dental'
          else if (/sản/i.test(dept)) deptId = 'obstetrics'

          return {
            id: d.id || d.mabs,
            name: d.name || d.hoten,
            title: d.title || 'Bác sĩ chuyên khoa',
            deptId,
            deptName: dept,
            experience: d.experience || '10+ năm KN',
            rating: d.rating || 5.0,
            reviews: d.reviewsCount || 120,
            avatar: d.img || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face'
          }
        })

        // Kết hợp bác sĩ từ DB lên đầu danh sách
        const combined = [...mapped]
        DOCTOR_LIST.forEach(fallbackDoc => {
          if (!combined.some(c => c.name === fallbackDoc.name || c.id === fallbackDoc.id)) {
            combined.push(fallbackDoc)
          }
        })
        setDoctorList(combined)
      }
    }).catch(() => {})
  }, [])

  // Helper tính ngày
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const getOffsetDate = (offsetDays) => {
    const d = new Date()
    d.setDate(d.getDate() + offsetDays)
    return d.toISOString().split('T')[0]
  }

  // State lựa chọn tương tác (Visual Chips & Cards)
  const [selectedService, setSelectedService] = useState('standard')
  const [selectedDept, setSelectedDept] = useState('cardiology')
  const [selectedDoctor, setSelectedDoctor] = useState(null) // null = Chưa chọn, 0 = Tự động xếp, ID = Bác sĩ cụ thể
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [selectedTime, setSelectedTime] = useState('08:15')

  // State thông tin bệnh nhân
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    phone: '',
    email: '',
    note: ''
  })

  const [loading, setLoading] = useState(false)
  const [successTicket, setSuccessTicket] = useState(null)

  // Danh sách bác sĩ lọc theo chuyên khoa đã chọn
  const filteredDoctors = useMemo(() => {
    if (selectedDept === 'all') return doctorList
    return doctorList.filter(d => d.deptId === selectedDept || (selectedDept === 'ophthalmology' && /mắt/i.test(d.deptName)))
  }, [selectedDept, doctorList])

  // Lấy chi tiết thông tin đang chọn để cập nhật phiếu Live Preview
  const currentServiceObj = useMemo(() => {
    return SERVICE_TYPES.find(s => s.id === selectedService) || SERVICE_TYPES[0]
  }, [selectedService])

  const currentDoctorObj = useMemo(() => {
    if (selectedDoctor === null || selectedDoctor === undefined) {
      return null
    }
    if (selectedDoctor === 0) {
      return {
        id: 0,
        name: 'Phòng khám tự động điều phối',
        title: 'Bác sĩ chuyên khoa giàu kinh nghiệm',
        avatar: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&h=200&fit=crop&crop=face',
        deptName: DEPARTMENTS.find(d => d.id === selectedDept)?.name || 'Đa Khoa',
        experience: 'Chu đáo - Không chờ đợi',
        rating: 5.0
      }
    }
    return doctorList.find(d => d.id === selectedDoctor) || null
  }, [selectedDoctor, selectedDept, doctorList])

  const handleInputChange = (e) => {
    setPatientInfo({ ...patientInfo, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!patientInfo.name || !patientInfo.phone) {
      alert('Vui lòng nhập Họ tên và Số điện thoại để hoàn tất đặt lịch.')
      return
    }

    if (selectedDoctor === null || selectedDoctor === undefined) {
      alert('Vui lòng chọn Bác sĩ trực tiếp thăm khám (hoặc chọn "Để phòng khám tự động sắp xếp") ở Bước 3 trước khi xác nhận đặt lịch!')
      return
    }

    setLoading(true)

    try {
      const doctorId = currentDoctorObj && currentDoctorObj.id > 0 
        ? currentDoctorObj.id 
        : (currentDoctorObj?.mabs || 1)

      const payload = {
        mabs: doctorId,
        name: patientInfo.name,
        phone: patientInfo.phone,
        email: patientInfo.email,
        doctorName: currentDoctorObj?.name || 'Phòng khám tự động điều phối',
        department: currentDoctorObj?.deptName || 'Đa Khoa',
        date: selectedDate,
        time: selectedTime,
        notes: `[${currentServiceObj.name}] ${patientInfo.note || 'Không có ghi chú'}`
      }

      const res = await appointmentService.create(payload)

      // Tạo mã phiếu khám điện tử từ DB
      const ticketCode = res.code || `LH${String(res.malh || res.id).padStart(3, '0')}`
      setSuccessTicket({
        code: ticketCode,
        patientName: patientInfo.name,
        phone: patientInfo.phone,
        serviceName: currentServiceObj.name,
        doctorName: currentDoctorObj?.name || 'Phòng khám tự động điều phối',
        department: currentDoctorObj?.deptName || 'Đa Khoa',
        date: selectedDate,
        time: selectedTime,
        price: currentServiceObj.price
      })
    } catch (err) {
      console.error('Lỗi đặt lịch khám:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tạo lịch hẹn. Vui lòng kiểm tra lại khung giờ và thông tin!'
      alert(`Đặt lịch không thành công: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleResetBooking = () => {
    setSuccessTicket(null)
    setPatientInfo({ name: '', phone: '', email: '', note: '' })
    setSelectedTime('08:15')
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  return (
    <>
      <PageTitle
        title="Đặt Lịch Khám Thông Minh"
        description="Chủ động chọn Bác sĩ, chuyên khoa và khung giờ theo ý muốn. Khám nhanh chóng, không phải chờ đợi."
        breadcrumb="Đặt Lịch Khám"
      />

      <section className="pk-booking-section">
        <div className="container">

          {/* Thanh Tiến Trình Trực Quan */}
          <div className="pk-steps-progress" data-aos="fade-up">
            <div className={`pk-step-item ${!successTicket ? 'active' : ''}`}>
              <div className="pk-step-number">1</div>
              <div className="pk-step-info">
                <h5>Chọn Dịch Vụ & Khoa</h5>
                <p>Nhu cầu thăm khám</p>
              </div>
            </div>
            <i className="bi bi-chevron-right pk-step-arrow"></i>
            <div className={`pk-step-item ${!successTicket ? 'active' : ''}`}>
              <div className="pk-step-number">2</div>
              <div className="pk-step-info">
                <h5>Bác Sĩ & Giờ Khám</h5>
                <p>Khung giờ linh hoạt</p>
              </div>
            </div>
            <i className="bi bi-chevron-right pk-step-arrow"></i>
            <div className={`pk-step-item ${successTicket ? 'active' : ''}`}>
              <div className="pk-step-number">3</div>
              <div className="pk-step-info">
                <h5>Nhận Phiếu Khám</h5>
                <p>Mã tiếp đón ưu tiên</p>
              </div>
            </div>
          </div>

          {/* NẾU ĐÃ ĐẶT LỊCH THÀNH CÔNG: HIỂN THỊ THẺ PHIẾU KHÁM ĐIỆN TỬ */}
          {successTicket ? (
            <div className="pk-ticket-container" data-aos="zoom-in">
              <div className="pk-ticket-banner">
                <i className="bi bi-check-circle-fill"></i>
                <h3>ĐẶT LỊCH KHÁM THÀNH CÔNG!</h3>
                <p style={{ margin: 0, fontSize: '13.5px', opacity: 0.9 }}>
                  Mã tiếp đón của bạn đã được kích hoạt trên hệ thống phòng khám.
                </p>
              </div>

              <div className="pk-ticket-body">
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                    Mã Tiếp Đón Ưu Tiên
                  </span>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#1f60d0', letterSpacing: '2px', fontFamily: 'monospace', marginTop: '2px' }}>
                    {successTicket.code}
                  </div>
                  <div style={{ fontSize: '12px', color: '#18a94f', fontWeight: 600, marginTop: '4px' }}>
                    <i className="bi bi-patch-check-fill" style={{ marginRight: '4px' }}></i> Đã xác nhận giữ chỗ
                  </div>
                </div>

                <div className="pk-ticket-grid">
                  <div className="pk-ticket-field">
                    <label>Người khám</label>
                    <span>{successTicket.patientName}</span>
                  </div>
                  <div className="pk-ticket-field">
                    <label>Số điện thoại</label>
                    <span>{successTicket.phone}</span>
                  </div>
                  <div className="pk-ticket-field">
                    <label>Chuyên khoa</label>
                    <span>{successTicket.department}</span>
                  </div>
                  <div className="pk-ticket-field">
                    <label>Bác sĩ phụ trách</label>
                    <span>{successTicket.doctorName}</span>
                  </div>
                  <div className="pk-ticket-field">
                    <label>Ngày khám</label>
                    <span>{successTicket.date}</span>
                  </div>
                  <div className="pk-ticket-field">
                    <label>Khung giờ</label>
                    <span style={{ color: '#1f60d0' }}>{successTicket.time}</span>
                  </div>
                  <div className="pk-ticket-field">
                    <label>Loại hình khám</label>
                    <span>{successTicket.serviceName}</span>
                  </div>
                  <div className="pk-ticket-field">
                    <label>Chi phí dự kiến</label>
                    <span style={{ color: '#059652' }}>{successTicket.price}</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px dashed #cbd5e1', fontSize: '13px', color: '#475569' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    <i className="bi bi-geo-alt-fill" style={{ color: '#1f60d0', marginRight: '6px' }}></i>
                    Hướng dẫn khi đến khám:
                  </div>
                  Vui lòng có mặt trước 10 phút tại <strong>Quầy tiếp đón số 01 (Tầng Trệt)</strong> và xuất trình mã <strong>{successTicket.code}</strong> để được vào thẳng phòng khám, không cần bốc số.
                </div>

                <div className="pk-ticket-actions">
                  <button className="pk-ticket-btn-primary" onClick={() => window.print()}>
                    <i className="bi bi-printer"></i> In Phiếu Khám
                  </button>
                  <button className="pk-ticket-btn-secondary" onClick={handleResetBooking}>
                    <i className="bi bi-calendar-plus"></i> Đặt Lịch Mới
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* GIAO DIỆN CHÍNH: FORM 2 CỘT VỚI VISUAL CHIPS & CARDS */
            <div className="pk-booking-layout">

              {/* CỘT TRÁI: CÁC KHỐI CHIPS TƯƠNG TÁC & THÔNG TIN BỆNH NHÂN */}
              <div className="pk-booking-form-area">

                {/* 1. CHỌN LOẠI HÌNH KHÁM (SERVICE TYPE CHIPS) */}
                <div className="pk-card-block" data-aos="fade-up">
                  <div className="pk-block-title">
                    <i className="bi bi-tags-fill"></i>
                    <span>1. Chọn Loại Hình Thăm Khám</span>
                  </div>
                  <p className="pk-block-desc">Lựa chọn nhu cầu thăm khám để phòng khám chuẩn bị hồ sơ tốt nhất</p>

                  <div className="pk-service-chips">
                    {SERVICE_TYPES.map((service) => (
                      <div
                        key={service.id}
                        className={`pk-service-chip ${selectedService === service.id ? 'active' : ''}`}
                        onClick={() => setSelectedService(service.id)}
                      >
                        <div className="pk-service-chip-header">
                          <div className="pk-service-chip-icon">
                            <i className={`bi ${service.icon}`}></i>
                          </div>
                          <span className="pk-service-badge">{service.badge}</span>
                        </div>
                        <h4 className="pk-service-name">{service.name}</h4>
                        <p className="pk-service-desc">{service.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. CHỌN CHUYÊN KHOA (DEPARTMENT VISUAL PILLS) */}
                <div className="pk-card-block" data-aos="fade-up" data-aos-delay="50">
                  <div className="pk-block-title">
                    <i className="bi bi-hospital"></i>
                    <span>2. Chọn Chuyên Khoa Phù Hợp</span>
                  </div>
                  <p className="pk-block-desc">Chọn khoa phòng bạn cần thăm khám hoặc kiểm tra sức khỏe</p>

                  <div className="pk-dept-chips">
                    {DEPARTMENTS.map((dept) => (
                      <button
                        type="button"
                        key={dept.id}
                        className={`pk-dept-chip ${selectedDept === dept.id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedDept(dept.id)
                          setSelectedDoctor(null)
                        }}
                      >
                        <i className={`bi ${dept.icon}`}></i>
                        {dept.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. CHỌN BÁC SĨ (DOCTOR VISUAL CARDS) */}
                <div className="pk-card-block" data-aos="fade-up" data-aos-delay="100">
                  <div className="pk-block-title">
                    <i className="bi bi-person-badge-fill"></i>
                    <span>3. Chọn Bác Sĩ Trực Tiếp Thăm Khám</span>
                  </div>
                  
                  <div className="pk-doctor-filter-note">
                    <span>Đội ngũ bác sĩ đầu ngành với chuyên môn cao</span>
                    <span>Hiển thị {filteredDoctors.length} bác sĩ</span>
                  </div>

                  <div className="pk-doctor-cards-grid">
                    {/* Tùy chọn 0: Phòng khám tự động sắp xếp */}
                    <div
                      className={`pk-doctor-auto-card ${selectedDoctor === 0 ? 'active' : ''}`}
                      onClick={() => setSelectedDoctor(0)}
                    >
                      <div className="pk-auto-icon">
                        <i className="bi bi-lightning-charge-fill"></i>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                          Để phòng khám sắp xếp Bác sĩ phù hợp nhất
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Phòng khám sẽ phân bổ bác sĩ chuyên khoa còn nhiều thời gian nhất để bạn không phải đợi.
                        </div>
                      </div>
                      {selectedDoctor === 0 && (
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#1f60d0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                          <i className="bi bi-check-lg"></i>
                        </div>
                      )}
                    </div>

                    {/* Danh sách thẻ bác sĩ */}
                    {filteredDoctors.map((doc) => (
                      <div
                        key={doc.id}
                        className={`pk-doctor-card ${selectedDoctor === doc.id ? 'active' : ''}`}
                        onClick={() => setSelectedDoctor(doc.id)}
                      >
                        {selectedDoctor === doc.id && (
                          <div className="pk-doctor-check-badge">
                            <i className="bi bi-check-lg"></i>
                          </div>
                        )}
                        <div className="pk-doctor-top">
                          <div className="pk-doctor-avatar-wrap">
                            <img src={doc.avatar} alt={doc.name} className="pk-doctor-avatar" />
                            <span className="pk-doctor-dot" title="Sẵn sàng tiếp nhận"></span>
                          </div>
                          <div className="pk-doctor-meta">
                            <h4 className="pk-doctor-name" title={doc.name}>{doc.name}</h4>
                            <p className="pk-doctor-title">{doc.title}</p>
                          </div>
                        </div>

                        <div className="pk-doctor-badge-row">
                          <span className="pk-doctor-rating">
                            <i className="bi bi-star-fill"></i> {doc.rating} ({doc.reviews})
                          </span>
                          <span className="pk-doctor-exp">{doc.experience}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. CHỌN NGÀY & KHUNG GIỜ (DATE PILLS & TIME SLOT CHIPS) */}
                <div className="pk-card-block" data-aos="fade-up" data-aos-delay="150">
                  <div className="pk-block-title">
                    <i className="bi bi-clock-history"></i>
                    <span>4. Chọn Ngày & Khung Giờ Khám</span>
                  </div>
                  <p className="pk-block-desc">Chọn nhanh ngày khám hoặc chỉ định ngày bạn mong muốn</p>

                  {/* Quick Date Pills */}
                  <div className="pk-quick-dates">
                    <div
                      className={`pk-date-pill ${selectedDate === todayStr ? 'active' : ''}`}
                      onClick={() => setSelectedDate(todayStr)}
                    >
                      <span className="pk-date-day">Hôm Nay</span>
                      <span className="pk-date-sub">{todayStr.split('-').reverse().slice(0, 2).join('/')}</span>
                    </div>

                    <div
                      className={`pk-date-pill ${selectedDate === getOffsetDate(1) ? 'active' : ''}`}
                      onClick={() => setSelectedDate(getOffsetDate(1))}
                    >
                      <span className="pk-date-day">Ngày Mai</span>
                      <span className="pk-date-sub">{getOffsetDate(1).split('-').reverse().slice(0, 2).join('/')}</span>
                    </div>

                    <div
                      className={`pk-date-pill ${selectedDate === getOffsetDate(2) ? 'active' : ''}`}
                      onClick={() => setSelectedDate(getOffsetDate(2))}
                    >
                      <span className="pk-date-day">Ngày Kia</span>
                      <span className="pk-date-sub">{getOffsetDate(2).split('-').reverse().slice(0, 2).join('/')}</span>
                    </div>

                    <div style={{ flex: 1, minWidth: '160px', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="date"
                        className="form-control"
                        min={todayStr}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ height: '44px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: '600' }}
                      />
                    </div>
                  </div>

                  {/* Time Chips: Ca Sáng */}
                  <div className="pk-time-session">
                    <div className="pk-session-label">
                      <i className="bi bi-sun-fill"></i>
                      <span>Ca Sáng (07:30 - 11:30)</span>
                    </div>
                    <div className="pk-time-chips">
                      {MORNING_SLOTS.map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={slot.status === 'busy'}
                          className={`pk-time-chip ${selectedTime === slot.time ? 'active' : ''} ${slot.status === 'busy' ? 'busy' : ''}`}
                          onClick={() => setSelectedTime(slot.time)}
                        >
                          <i className="bi bi-clock"></i>
                          {slot.time}
                          {slot.status === 'busy' && <span style={{ fontSize: '10px', marginLeft: '4px' }}>(Hết chỗ)</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Chips: Ca Chiều */}
                  <div className="pk-time-session" style={{ marginTop: '18px' }}>
                    <div className="pk-session-label">
                      <i className="bi bi-sunset-fill" style={{ color: '#f97316' }}></i>
                      <span>Ca Chiều (13:30 - 17:30)</span>
                    </div>
                    <div className="pk-time-chips">
                      {AFTERNOON_SLOTS.map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={slot.status === 'busy'}
                          className={`pk-time-chip ${selectedTime === slot.time ? 'active' : ''} ${slot.status === 'busy' ? 'busy' : ''}`}
                          onClick={() => setSelectedTime(slot.time)}
                        >
                          <i className="bi bi-clock"></i>
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. THÔNG TIN BỆNH NHÂN */}
                <div className="pk-card-block" data-aos="fade-up" data-aos-delay="200">
                  <div className="pk-block-title">
                    <i className="bi bi-person-lines-fill"></i>
                    <span>5. Thông Tin Người Thăm Khám</span>
                  </div>
                  <p className="pk-block-desc">Thông tin sẽ dùng để tạo hồ sơ bệnh án điện tử và gửi tin nhắn nhắc hẹn</p>

                  <form onSubmit={handleSubmit}>
                    <div className="row gy-3">
                      <div className="col-md-6">
                        <label className="pk-label">Họ và Tên Bệnh Nhân <span style={{ color: '#dc2626' }}>*</span></label>
                        <div className="pk-input-box">
                          <span className="pk-input-icon"><i className="bi bi-person"></i></span>
                          <input
                            type="text"
                            name="name"
                            className="pk-input"
                            placeholder="Ví dụ: Nguyễn Văn A"
                            required
                            value={patientInfo.name}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="pk-label">Số Điện Thoại <span style={{ color: '#dc2626' }}>*</span></label>
                        <div className="pk-input-box">
                          <span className="pk-input-icon"><i className="bi bi-telephone"></i></span>
                          <input
                            type="tel"
                            name="phone"
                            className="pk-input"
                            placeholder="Ví dụ: 0912 345 678"
                            required
                            value={patientInfo.phone}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="col-md-12">
                        <label className="pk-label">Địa Chỉ Email (Nhận hồ sơ điện tử - Không bắt buộc)</label>
                        <div className="pk-input-box">
                          <span className="pk-input-icon"><i className="bi bi-envelope"></i></span>
                          <input
                            type="email"
                            name="email"
                            className="pk-input"
                            placeholder="email@example.com"
                            value={patientInfo.email}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="pk-label">Mô tả triệu chứng hoặc ghi chú thêm</label>
                        <textarea
                          name="note"
                          rows="3"
                          className="form-control"
                          placeholder="Mô tả sơ lược triệu chứng khó chịu (đau ngực, sốt, ngứa...), tiền sử dị ứng thuốc nếu có..."
                          value={patientInfo.note}
                          onChange={handleInputChange}
                          style={{ borderRadius: '12px', border: '1.5px solid #cbd5e1', padding: '12px 14px', fontSize: '13.5px' }}
                        ></textarea>
                      </div>

                      <div className="col-12" style={{ marginTop: '20px' }}>
                        <button
                          type="submit"
                          disabled={loading}
                          className="pk-submit-btn"
                          style={{ height: '52px', fontSize: '16px' }}
                        >
                          {loading ? (
                            <>
                              <i className="bi bi-hourglass-split" style={{ animation: 'spin 1s linear infinite' }}></i>
                              Đang Khởi Tạo Phiếu Hẹn...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle-fill"></i>
                              Xác Nhận & Đặt Lịch Khám Ngay
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

              </div>

              {/* CỘT PHẢI: PHIẾU KHÁM TRỰC TIẾP (LIVE PREVIEW PASS - STICKY) */}
              <div className="pk-booking-sidebar">
                <div className="pk-live-pass-card" data-aos="fade-left">
                  <div className="pk-pass-header">
                    <div className="pk-pass-brand">
                      <span className="pk-pass-title">PHÒNG KHÁM PHÚ LỢI BẢO</span>
                      <span className="pk-pass-code">TẠM TÍNH</span>
                    </div>
                    <h3 className="pk-pass-h3">Phiếu Hẹn Khám Điện Tử</h3>
                  </div>

                  <div className="pk-pass-body">
                    {/* Bác sĩ phụ trách Box */}
                    {currentDoctorObj ? (
                      <div className="pk-pass-doctor-box">
                        <img src={currentDoctorObj.avatar} alt={currentDoctorObj.name} className="pk-pass-doctor-avatar" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>BÁC SĨ PHỤ TRÁCH</div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {currentDoctorObj.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#1f60d0', fontWeight: 600 }}>
                            {currentDoctorObj.deptName}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="pk-pass-doctor-box" style={{ border: '1.5px dashed #cbd5e1', background: '#f8fafc' }}>
                        <div style={{ 
                          width: '44px', 
                          height: '44px', 
                          borderRadius: '50%', 
                          background: '#f1f5f9', 
                          color: '#94a3b8', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '18px',
                          border: '1px dashed #cbd5e1'
                        }}>
                          <i className="bi bi-person"></i>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>BÁC SĨ PHỤ TRÁCH</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                            Chưa chọn bác sĩ
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#d97706', fontWeight: 500 }}>
                            (Vui lòng chọn ở mục 3)
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pk-pass-row">
                      <span className="pk-pass-label">Dịch vụ</span>
                      <span className="pk-pass-value" style={{ color: '#1f60d0' }}>{currentServiceObj.name}</span>
                    </div>

                    <div className="pk-pass-row">
                      <span className="pk-pass-label">Ngày khám</span>
                      <span className="pk-pass-value">{selectedDate}</span>
                    </div>

                    <div className="pk-pass-row">
                      <span className="pk-pass-label">Khung giờ</span>
                      <span className="pk-pass-value" style={{ color: '#059652', fontWeight: 800 }}>{selectedTime}</span>
                    </div>

                    <div className="pk-pass-row">
                      <span className="pk-pass-label">Người khám</span>
                      <span className="pk-pass-value">{patientInfo.name || 'Chưa nhập'}</span>
                    </div>

                    <div className="pk-pass-row">
                      <span className="pk-pass-label">Số điện thoại</span>
                      <span className="pk-pass-value">{patientInfo.phone || 'Chưa nhập'}</span>
                    </div>

                    <div className="pk-pass-row">
                      <span className="pk-pass-label">Chi phí khám</span>
                      <span className="pk-pass-value" style={{ color: '#16a34a', fontSize: '14px', fontWeight: 800 }}>
                        {currentServiceObj.price}
                      </span>
                    </div>

                    {/* Lợi ích cam kết */}
                    <div className="pk-pass-benefits">
                      <div className="pk-pass-benefit-item">
                        <i className="bi bi-shield-check"></i>
                        <span>Ưu tiên không bốc số xếp hàng</span>
                      </div>
                      <div className="pk-pass-benefit-item">
                        <i className="bi bi-clock"></i>
                        <span>Giữ lịch hẹn trong 24 giờ</span>
                      </div>
                      <div className="pk-pass-benefit-item">
                        <i className="bi bi-award"></i>
                        <span>Hỗ trợ thanh toán BHYT toàn quốc</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                      <i className="bi bi-telephone-inbound" style={{ marginRight: '6px', color: '#1f60d0' }}></i>
                      Cần hỗ trợ gấp? Gọi ngay: <strong style={{ color: '#1f60d0' }}>1900 6868</strong>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* KHỐI LIÊN HỆ & THÔNG TIN CẤP CỨU NHANH */}
          <div className="row" style={{ marginTop: '48px', gap: '0' }} data-aos="fade-up">
            {[
              { icon: 'bi-telephone-forward-fill', title: 'Hotline Hỗ Trợ Đặt Lịch', info: '1900 6868 / 028 3838 9999', desc: 'Hỗ trợ 24/7 giải đáp thắc mắc' },
              { icon: 'bi-hospital-fill', title: 'Địa Điểm Phòng Khám', info: 'Phú Lợi Bảo Medical Center', desc: '123 Đường Lê Lợi, Quận 1, TP.HCM' },
              { icon: 'bi-shield-shaded', title: 'Chính Sách BHYT', info: 'Thông Tuyến Toàn Quốc', desc: 'Áp dụng mọi loại thẻ BHYT hợp lệ' }
            ].map((card, i) => (
              <div key={i} className="col-lg-4 col-md-6" style={{ marginBottom: '20px' }}>
                <div style={{ textAlign: 'center', padding: '24px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                  <div style={{ width: '52px', height: '52px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1f60d0', fontSize: '22px', margin: '0 auto 14px' }}>
                    <i className={`bi ${card.icon}`}></i>
                  </div>
                  <h5 style={{ fontSize: '14.5px', fontWeight: '700', marginBottom: '6px', color: '#0f172a' }}>{card.title}</h5>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#1f60d0', marginBottom: '4px' }}>{card.info}</p>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
