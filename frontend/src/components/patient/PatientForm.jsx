import { useState, useEffect } from 'react'

export default function PatientForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    code: '',
    fullName: '',
    phone: '',
    email: '',
    gender: 'Nam',
    birthYear: '1995',
    idCard: '',
    insuranceNumber: '',
    address: '',
    city: 'TP. Hồ Chí Minh',
    bloodGroup: 'O+',
    allergies: '',
    medicalHistory: '',
    notes: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        gender: initialData.gender || 'Nam',
        birthYear: initialData.birthYear || '1995',
        idCard: initialData.idCard || '',
        insuranceNumber: initialData.insuranceNumber || '',
        address: initialData.address || '',
        city: initialData.city || 'TP. Hồ Chí Minh',
        bloodGroup: initialData.bloodGroup || 'O+',
        allergies: initialData.allergies || '',
        medicalHistory: initialData.medicalHistory || '',
        notes: initialData.notes || ''
      })
    } else {
      // Tự sinh mã bệnh nhân mẫu cho hồ sơ mới
      setFormData(prev => ({
        ...prev,
        code: `BN-${Math.floor(100 + Math.random() * 900)}`
      }))
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      alert('Vui lòng điền họ tên và số điện thoại bệnh nhân!')
      return
    }
    if (onSubmit) onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column flex-grow-1 m-0 patient-admin-form" style={{ minHeight: 0, overflow: 'hidden' }}>
      {/* KHUNG CUỘN NỘI DUNG FORM - GHIM TIÊU ĐỀ VÀ NÚT BẤM */}
      <div 
        className="modal-body p-4 bg-white" 
        style={{ 
          overflowY: 'auto', 
          maxHeight: 'calc(90vh - 135px)',
          flex: '1 1 auto',
          overscrollBehavior: 'contain',
          fontSize: '13.5px'
        }}
      >
        {/* KHỐI 1: THÔNG TIN ĐỊNH DANH & HÀNH CHÍNH */}
        <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
          <div className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
            <i className="bi bi-person-vcard fs-6"></i>
          </div>
          <span className="fw-bold text-dark text-uppercase small" style={{ letterSpacing: '0.5px' }}>
            1. Thông Tin Cá Nhân & Hành Chính
          </span>
        </div>

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-semibold text-secondary">Mã bệnh nhân</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted">
                <i className="bi bi-qr-code"></i>
              </span>
              <input 
                type="text" 
                className="form-control fw-bold text-primary" 
                name="code" 
                value={formData.code} 
                onChange={handleChange}
                placeholder="BN-001"
              />
            </div>
          </div>

          <div className="col-md-8">
            <label className="form-label small fw-semibold text-secondary">
              Họ và tên bệnh nhân <span className="text-danger">*</span>
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted">
                <i className="bi bi-person"></i>
              </span>
              <input 
                type="text" 
                className="form-control" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                required 
                placeholder="Ví dụ: Nguyễn Văn An"
              />
            </div>
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-semibold text-secondary">
              Số điện thoại liên hệ <span className="text-danger">*</span>
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted">
                <i className="bi bi-telephone"></i>
              </span>
              <input 
                type="tel" 
                className="form-control" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
                placeholder="0901 234 567"
              />
            </div>
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-semibold text-secondary">Giới tính</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted">
                <i className="bi bi-gender-ambiguous"></i>
              </span>
              <select className="form-select" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-semibold text-secondary">Năm sinh</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted">
                <i className="bi bi-calendar3"></i>
              </span>
              <input 
                type="number" 
                className="form-control" 
                name="birthYear" 
                value={formData.birthYear} 
                onChange={handleChange} 
                min="1900" 
                max="2026"
                placeholder="1995"
              />
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold text-secondary">Số CMND / CCCD</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted">
                <i className="bi bi-card-heading"></i>
              </span>
              <input 
                type="text" 
                className="form-control" 
                name="idCard" 
                value={formData.idCard} 
                onChange={handleChange} 
                placeholder="12 chữ số căn cước"
              />
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold text-secondary">Mã số thẻ BHYT (nếu có)</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted">
                <i className="bi bi-shield-check text-success"></i>
              </span>
              <input 
                type="text" 
                className="form-control" 
                name="insuranceNumber" 
                value={formData.insuranceNumber} 
                onChange={handleChange} 
                placeholder="BHYT-DN479..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* KHỐI 2: ĐỊA CHỈ & LIÊN LẠC */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
          <div className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
            <i className="bi bi-geo-alt fs-6"></i>
          </div>
          <span className="fw-bold text-dark text-uppercase small" style={{ letterSpacing: '0.5px' }}>
            2. Địa Chỉ & Nơi Cư Trú
          </span>
        </div>

        <div className="row g-3">
          <div className="col-md-8">
            <label className="form-label small fw-semibold text-secondary">Địa chỉ thường trú</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted">
                <i className="bi bi-house"></i>
              </span>
              <input 
                type="text" 
                className="form-control" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
              />
            </div>
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-semibold text-secondary">Tỉnh / Thành phố</label>
            <select className="form-select form-select-sm" name="city" value={formData.city} onChange={handleChange}>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Bình Dương">Bình Dương</option>
              <option value="Đồng Nai">Đồng Nai</option>
              <option value="Long An">Long An</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Tỉnh thành khác">Tỉnh thành khác</option>
            </select>
          </div>

          <div className="col-12">
            <label className="form-label small fw-semibold text-secondary">Email nhận thông báo y tế</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted">
                <i className="bi bi-envelope"></i>
              </span>
              <input 
                type="email" 
                className="form-control" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="benhnhan@example.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KHỐI 3: TIỀN SỬ Y TẾ & SINH HIỆU */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
          <div className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
            <i className="bi bi-heart-pulse fs-6"></i>
          </div>
          <span className="fw-bold text-dark text-uppercase small" style={{ letterSpacing: '0.5px' }}>
            3. Tiền Sử Y Tế & Ghi Chú Sức Khỏe
          </span>
        </div>

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-semibold text-secondary">Nhóm máu</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-danger">
                <i className="bi bi-droplet-fill"></i>
              </span>
              <select className="form-select" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                <option value="A+">Nhóm A (Rh+)</option>
                <option value="A-">Nhóm A (Rh-)</option>
                <option value="B+">Nhóm B (Rh+)</option>
                <option value="B-">Nhóm B (Rh-)</option>
                <option value="AB+">Nhóm AB (Rh+)</option>
                <option value="AB-">Nhóm AB (Rh-)</option>
                <option value="O+">Nhóm O (Rh+)</option>
                <option value="O-">Nhóm O (Rh-)</option>
              </select>
            </div>
          </div>

          <div className="col-md-8">
            <label className="form-label small fw-semibold text-secondary">Tiền sử dị ứng (nếu có)</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-warning">
                <i className="bi bi-exclamation-triangle"></i>
              </span>
              <input 
                type="text" 
                className="form-control" 
                name="allergies" 
                value={formData.allergies} 
                onChange={handleChange} 
                placeholder="Ví dụ: Dị ứng Penicillin, kháng sinh NSAIDs..."
              />
            </div>
          </div>

          <div className="col-12">
            <label className="form-label small fw-semibold text-secondary">Ghi chú bệnh lý hoặc tiền sử bệnh án</label>
            <textarea 
              className="form-control form-control-sm" 
              name="notes" 
              rows="2" 
              value={formData.notes} 
              onChange={handleChange}
              placeholder="Tiền sử tăng huyết áp, tiểu đường, hen suyễn, bệnh lý mãn tính cần lưu ý..."
            ></textarea>
          </div>
        </div>
      </div>
      </div>

      {/* FOOTER GHIM CỐ ĐỊNH Ở ĐÁY VỚI NÚT THÊM / HỦY ĐỒNG BỘ */}
      <div className="modal-footer p-3 bg-light border-top flex-shrink-0 d-flex justify-content-end gap-2">
        {onCancel && (
          <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={onCancel}>
            Hủy Bỏ
          </button>
        )}
        <button 
          type="submit" 
          className="btn btn-primary btn-sm px-4 d-flex align-items-center"
          style={{ background: 'linear-gradient(135deg, #175cdd 0%, #10b981 100%)', border: 'none' }}
        >
          <i className="bi bi-check2-circle fs-6 me-1"></i>
          <span>{initialData ? 'Cập Nhật Hồ Sơ' : 'Lưu Hồ Sơ Bệnh Nhân'}</span>
        </button>
      </div>
    </form>
  )
}
