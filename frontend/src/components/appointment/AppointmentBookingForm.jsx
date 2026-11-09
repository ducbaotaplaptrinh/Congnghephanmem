import { useState } from 'react'

export default function AppointmentBookingForm({ onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    department: 'general',
    doctor: '1',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(formData)
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="alert alert-success p-4 rounded-4 shadow-sm text-center">
        <i className="bi bi-check-circle-fill text-success fs-1 d-block mb-3"></i>
        <h4 className="alert-heading fw-bold">Đặt lịch khám thành công!</h4>
        <p className="mb-3">
          Cảm ơn bạn <strong>{formData.name}</strong>. Phòng khám sẽ liên hệ qua số điện thoại <strong>{formData.phone}</strong> để xác nhận lịch hẹn trong thời gian sớm nhất.
        </p>
        <button 
          className="btn btn-outline-success btn-sm rounded-pill" 
          onClick={() => {
            setSubmitted(false)
            setFormData({
              name: '',
              email: '',
              phone: '',
              date: '',
              department: 'general',
              doctor: '1',
              message: ''
            })
          }}
        >
          Đặt lịch khác
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 p-md-5 bg-white shadow-sm rounded-4 border">
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label fw-semibold small">Họ và tên *</label>
          <input
            type="text"
            name="name"
            className="form-control"
            placeholder="Họ và tên của bạn"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label fw-semibold small">Địa chỉ Email *</label>
          <input
            type="email"
            className="form-control"
            name="email"
            placeholder="Email liên hệ"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label fw-semibold small">Số điện thoại *</label>
          <input
            type="tel"
            className="form-control"
            name="phone"
            placeholder="Số điện thoại"
            required
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label fw-semibold small">Ngày hẹn khám *</label>
          <input
            type="datetime-local"
            name="date"
            className="form-control"
            required
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label fw-semibold small">Chọn chuyên khoa *</label>
          <select
            name="department"
            className="form-select"
            required
            value={formData.department}
            onChange={handleChange}
          >
            <option value="general">Khoa Nội Tổng Quát</option>
            <option value="cardiology">Khoa Tim Mạch</option>
            <option value="pediatrics">Khoa Nhi</option>
            <option value="ophthalmology">Khoa Mắt</option>
            <option value="dentistry">Khoa Răng Hàm Mặt</option>
            <option value="neurology">Khoa Thần Kinh</option>
            <option value="orthopedics">Khoa Chấn Thương Chỉnh Hình</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label fw-semibold small">Chọn bác sĩ</label>
          <select
            name="doctor"
            className="form-select"
            value={formData.doctor}
            onChange={handleChange}
          >
            <option value="1">BS. Trần Văn Hùng - Tim Mạch</option>
            <option value="2">BS. Nguyễn Thị Lan - Khoa Nhi</option>
            <option value="3">BS. Lê Hoàng Nam - Thần Kinh</option>
            <option value="4">BS. Phạm Minh Tuấn - Mắt</option>
            <option value="5">BS. Vũ Đức Anh - Răng Hàm Mặt</option>
          </select>
        </div>

        <div className="col-12">
          <label className="form-label fw-semibold small">Mô tả triệu chứng / Ghi chú</label>
          <textarea
            className="form-control"
            name="message"
            rows="4"
            placeholder="Mô tả sơ lược tình trạng sức khỏe hoặc yêu cầu đặc biệt..."
            value={formData.message}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="col-12 text-center mt-4">
          <button type="submit" className="btn btn-primary px-5 py-2 rounded-pill fw-semibold" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Xác Nhận Đặt Lịch'}
          </button>
        </div>
      </div>
    </form>
  )
}
