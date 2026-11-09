import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import userService from '../../services/userService'
import { doctorService } from '../../services/doctorService'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function UserList() {
  const [users, setUsers] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [showAddModal, setShowAddModal] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    hoten: '',
    vaitro: 'LeTan',
    sdt: '',
    gioitinh: 'Nam',
    mack: 1,
    hocham: 'Bác sĩ CKI',
    sogiayphephanhnghe: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadUsers = async () => {
    try {
      setLoading(true)
      const [data, specs] = await Promise.all([
        userService.getAll(),
        doctorService.getSpecialties().catch(() => [])
      ])
      setUsers(data)
      if (specs && specs.length > 0) {
        setSpecialties(specs)
        setFormData(prev => ({ ...prev, mack: specs[0].mack }))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleToggleStatus = async (user) => {
    const action = user.status === 'ACTIVE' ? 'khóa' : 'mở khóa'
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản "${user.username}"?`)) {
      return
    }

    try {
      await userService.toggleStatus(user.id)
      showToast(`Đã ${action} tài khoản "${user.username}" thành công!`)
      loadUsers()
    } catch (err) {
      alert(`Không thể ${action} tài khoản: ` + (err.message || 'Lỗi kết nối'))
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    if (!formData.username.trim()) {
      alert('Vui lòng nhập tên đăng nhập!')
      return
    }

    try {
      setIsSubmitting(true)
      await userService.create(formData)
      showToast(`Tạo tài khoản "${formData.username}" thành công!`)
      setShowAddModal(false)
      setFormData({
        username: '',
        password: '',
        hoten: '',
        vaitro: 'LeTan',
        sdt: '',
        gioitinh: 'Nam'
      })
      loadUsers()
    } catch (err) {
      alert('Lỗi tạo tài khoản: ' + (err.response?.data?.message || err.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = users.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.chuyenkhoa || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').includes(search)

    const matchesRole = roleFilter === 'ALL' || String(u.role || '').toLowerCase() === String(roleFilter).toLowerCase()
    return matchesSearch && matchesRole
  })

  const roleBadge = (role, username = '') => {
    const u = String(username).toLowerCase()
    const r = String(role).toUpperCase()

    if (r === 'ADMIN' || u === 'admin') {
      return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1.5"><i className="bi bi-shield-lock-fill me-1"></i> Quản Trị Viên</span>
    }
    if (r === 'BACSI' || r === 'DOCTOR') {
      return <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1.5"><i className="bi bi-heart-pulse-fill me-1"></i> Bác Sĩ</span>
    }
    if (r === 'LETAN' || u.includes('ketoan') || u.includes('accountant') || u.includes('thungan')) {
      return <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5"><i className="bi bi-cash-coin me-1"></i> Kế Toán / Thu Ngân</span>
    }
    if (r === 'YTA') {
      return <span className="badge bg-info-subtle text-info border border-info-subtle px-2.5 py-1.5"><i className="bi bi-bandaid-fill me-1"></i> Y Tá / Điều Dưỡng</span>
    }
    return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2.5 py-1.5"><i className="bi bi-person-fill me-1"></i> Bệnh Nhân</span>
  }

  return (
    <AdminLayout title="Quản Trị Tài Khoản & Phân Quyền">
      {toastMessage && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className="alert alert-success shadow-lg border-0 d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill fs-5"></i>
            <div>{toastMessage}</div>
          </div>
        </div>
      )}

      {/* 1. Thanh Công Cụ & Thêm Mới - Đồng bộ độ cao và nút bấm chuẩn Admin */}
      <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1" style={{ maxWidth: '650px' }}>
              <div className="input-group input-group-sm" style={{ maxWidth: '350px' }}>
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0" 
                  placeholder="Tìm theo tên, username, sđt..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select 
                className="form-select form-select-sm" 
                style={{ width: 'auto', minWidth: '180px' }}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="Admin">Quản trị viên</option>
                <option value="BacSi">Bác sĩ</option>
                <option value="LeTan">Kế toán / Thu ngân</option>
                <option value="YTa">Y tá / Điều dưỡng</option>
                <option value="BenhNhan">Bệnh nhân</option>
              </select>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small d-none d-sm-inline">
                Tổng cộng: <strong>{filtered.length}</strong> tài khoản
              </span>
              <button 
                className="btn btn-primary btn-sm px-3 d-flex align-items-center"
                onClick={() => setShowAddModal(true)}
              >
                <i className="bi bi-person-plus-fill me-1"></i>
                <span>Thêm Tài Khoản Mới</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bảng Danh Sách Tài Khoản Trực Tiếp Từ Database - Không bị cắt xén nội dung */}
      <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-5 text-center">
              <LoadingSpinner />
              <div className="text-muted mt-2">Đang nạp danh sách tài khoản từ Supabase Database...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <i className="bi bi-people display-4 text-secondary mb-2 d-block"></i>
              Không tìm thấy tài khoản nào phù hợp với bộ lọc tìm kiếm!
            </div>
          ) : (
            <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table className="table table-hover align-middle mb-0" style={{ minWidth: '980px', width: '100%', fontSize: '13.5px' }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center', whiteSpace: 'nowrap' }}>STT</th>
                    <th style={{ minWidth: '220px', whiteSpace: 'nowrap' }}>Họ và Tên / Chủ Tài Khoản</th>
                    <th style={{ minWidth: '130px', whiteSpace: 'nowrap' }}>Tên Đăng Nhập</th>
                    <th style={{ minWidth: '180px', whiteSpace: 'nowrap' }}>Email Liên Hệ</th>
                    <th style={{ minWidth: '140px', whiteSpace: 'nowrap' }}>Vai Trò</th>
                    <th style={{ minWidth: '110px', whiteSpace: 'nowrap' }}>Trạng Thái</th>
                    <th style={{ minWidth: '130px', whiteSpace: 'nowrap' }}>Ngày Tạo</th>
                    <th style={{ width: '110px', minWidth: '110px', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, idx) => (
                    <tr key={u.id}>
                      <td className="text-muted text-center fw-medium">{idx + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2.5">
                          {u.hinhanh ? (
                            <img 
                              src={u.hinhanh} 
                              alt={u.name} 
                              className="rounded-circle object-fit-cover border shadow-xs flex-shrink-0" 
                              style={{ width: '36px', height: '36px' }}
                            />
                          ) : (
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0"
                              style={{ 
                                width: '36px', 
                                height: '36px', 
                                backgroundColor: u.role === 'Admin' ? '#ef4444' : u.role === 'BacSi' ? '#3b82f6' : u.role === 'LeTan' ? '#10b981' : '#64748b',
                                fontSize: '13px'
                              }}
                            >
                              {(u.name || u.username).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="fw-bold text-dark text-nowrap">{u.name}</div>
                            {u.chuyenkhoa && (
                              <div className="text-primary small text-nowrap fw-medium" style={{ fontSize: '11.5px' }}>
                                <i className="bi bi-hospital me-1"></i>{u.chuyenkhoa}
                              </div>
                            )}
                            {u.phone && <div className="text-muted small text-nowrap"><i className="bi bi-telephone me-1"></i>{u.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <code className="text-primary fw-bold bg-primary-subtle px-2 py-1 rounded text-nowrap">
                          {u.username}
                        </code>
                      </td>
                      <td className="text-muted small text-nowrap">{u.email}</td>
                      <td className="text-nowrap">{roleBadge(u.role, u.username)}</td>
                      <td className="text-nowrap">
                        <span className={`badge ${u.status === 'ACTIVE' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'} px-2.5 py-1`}>
                          <i className={`bi ${u.status === 'ACTIVE' ? 'bi-check-circle' : 'bi-slash-circle'} me-1`}></i>
                          {u.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                      </td>
                      <td className="text-muted small text-nowrap">{u.lastLogin || 'Mới khởi tạo'}</td>
                      <td className="text-center text-nowrap">
                        <button 
                          className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'} px-2.5 py-1`}
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 'ACTIVE' ? 'Khóa tài khoản này' : 'Mở khóa tài khoản'}
                          style={{ fontSize: '12.5px' }}
                        >
                          <i className={`bi ${u.status === 'ACTIVE' ? 'bi-lock me-1' : 'bi-unlock me-1'}`}></i>
                          {u.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Thêm Tài Khoản Mới - Chuẩn giao diện Admin với Header & Footer ghim cố định */}
      {showAddModal && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(3px)', zIndex: 1050 }}
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: '600px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden d-flex flex-column" style={{ maxHeight: '90vh' }}>
              
              {/* THANH TIÊU ĐỀ GRADIENT THƯƠNG HIỆU - GHIM CỐ ĐỊNH */}
              <div 
                className="modal-header py-3 px-4 text-white border-0 flex-shrink-0 no-print"
                style={{ background: 'linear-gradient(135deg, #175cdd 0%, #10b981 100%)' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <i className="bi bi-person-plus-fill fs-5 text-white"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-white mb-0" style={{ fontSize: '1.05rem' }}>
                      Thêm Tài Khoản Mới Vào Database
                    </h5>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
                      Phòng Khám Đa Khoa Phú Lợi Bảo • Quản trị người dùng & phân quyền
                    </span>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowAddModal(false)}
                  aria-label="Đóng"
                ></button>
              </div>

              {/* FORM NHẬP THÔNG TIN TÀI KHOẢN VỚI BODY CUỘN & FOOTER GHIM CỐ ĐỊNH */}
              <form onSubmit={handleCreateUser} className="d-flex flex-column flex-grow-1 m-0" style={{ minHeight: 0, overflow: 'hidden' }}>
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
                  {/* Họ tên */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Họ và Tên Chủ Tài Khoản <span className="text-danger">*</span>
                    </label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light text-muted">
                        <i className="bi bi-person"></i>
                      </span>
                      <input 
                        type="text" 
                        className="form-control" 
                        required
                        placeholder="Ví dụ: Nguyễn Thị Mai"
                        value={formData.hoten}
                        onChange={(e) => setFormData({ ...formData, hoten: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Username & Password */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Tên Đăng Nhập <span className="text-danger">*</span>
                      </label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-light text-muted">
                          <i className="bi bi-at"></i>
                        </span>
                        <input 
                          type="text" 
                          className="form-control" 
                          required
                          placeholder="VD: ketoan02, bs_tuan"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Mật Khẩu <span className="text-danger">*</span>
                      </label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-light text-muted">
                          <i className="bi bi-key"></i>
                        </span>
                        <input 
                          type="password" 
                          className="form-control" 
                          required
                          placeholder="Mặc định: 123456"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vai trò phân quyền & Giới tính */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-7">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Vai Trò Phân Quyền <span className="text-danger">*</span>
                      </label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-light text-muted">
                          <i className="bi bi-shield-lock"></i>
                        </span>
                        <select 
                          className="form-select form-select-sm"
                          value={formData.vaitro}
                          onChange={(e) => setFormData({ ...formData, vaitro: e.target.value })}
                        >
                          <option value="LeTan">💰 Kế toán / Thu ngân viện phí</option>
                          <option value="BacSi">🩺 Bác sĩ khám lâm sàng</option>
                          <option value="YTa">🩹 Y tá / Điều dưỡng</option>
                          <option value="Admin">🛡️ Quản trị viên hệ thống (Admin)</option>
                          <option value="BenhNhan">👤 Bệnh nhân</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-md-5">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Giới Tính
                      </label>
                      <select 
                        className="form-select form-select-sm"
                        value={formData.gioitinh}
                        onChange={(e) => setFormData({ ...formData, gioitinh: e.target.value })}
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nu">Nữ</option>
                      </select>
                    </div>
                  </div>

                  {/* Số điện thoại */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Số Điện Thoại Liên Hệ
                    </label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light text-muted">
                        <i className="bi bi-telephone"></i>
                      </span>
                      <input 
                        type="tel" 
                        className="form-control" 
                        placeholder="0912 345 678"
                        value={formData.sdt}
                        onChange={(e) => setFormData({ ...formData, sdt: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* THÔNG TIN BÁC SĨ (KHI CHỌN VAI TRÒ BÁC SĨ) */}
                  {formData.vaitro === 'BacSi' && (
                    <div className="p-3 rounded-3 mb-3 border shadow-xs" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                      <div className="d-flex align-items-center gap-2 mb-2 text-success fw-bold small">
                        <i className="bi bi-hospital fs-6"></i>
                        <span>Thiết Lập Hồ Sơ Lâm Sàng Cho Bác Sĩ</span>
                      </div>
                      <div className="row g-2">
                        <div className="col-md-7">
                          <label className="form-label small fw-semibold text-secondary mb-1">
                            Chuyên Khoa Phụ Trách <span className="text-danger">*</span>
                          </label>
                          <select 
                            className="form-select form-select-sm"
                            value={formData.mack || 1}
                            onChange={(e) => setFormData({ ...formData, mack: Number(e.target.value) })}
                          >
                            {specialties.map(s => (
                              <option key={s.mack} value={s.mack}>{s.tenchuyenkhoa}</option>
                            ))}
                            {specialties.length === 0 && (
                              <option value="1">Khoa Mắt Kỹ Thuật Cao</option>
                            )}
                          </select>
                        </div>
                        <div className="col-md-5">
                          <label className="form-label small fw-semibold text-secondary mb-1">
                            Học Hàm / Chức Danh
                          </label>
                          <select 
                            className="form-select form-select-sm"
                            value={formData.hocham || 'Bác sĩ CKI'}
                            onChange={(e) => setFormData({ ...formData, hocham: e.target.value })}
                          >
                            <option value="Bác sĩ CKI">Bác sĩ CKI</option>
                            <option value="Bác sĩ CKII">Bác sĩ CKII</option>
                            <option value="Thạc sĩ, Bác sĩ CKI">Thạc sĩ, Bác sĩ CKI</option>
                            <option value="Tiến sĩ Bác sĩ">Tiến sĩ Bác sĩ</option>
                            <option value="Bác sĩ chuyên khoa">Bác sĩ chuyên khoa</option>
                          </select>
                        </div>
                        <div className="col-12 mt-1">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <label className="form-label small fw-semibold text-secondary mb-0">
                              Số Chứng Chỉ Hành Nghề (CCHN)
                            </label>
                            <span className="text-muted" style={{ fontSize: '11px' }}>Tự động cấp nếu để trống</span>
                          </div>
                          <input 
                            type="text" 
                            className="form-control form-control-sm font-monospace"
                            placeholder="Ví dụ: CCHN-123456"
                            value={formData.sogiayphephanhnghe || ''}
                            onChange={(e) => setFormData({ ...formData, sogiayphephanhnghe: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="small text-muted mt-2" style={{ fontSize: '11.5px' }}>
                        <i className="bi bi-check-circle-fill text-success me-1"></i>
                        Bác sĩ sẽ tự động xuất hiện đồng thời tại mục <strong>Bác Sĩ (/doctors-manage)</strong> và kích hoạt phân quyền khám bệnh.
                      </div>
                    </div>
                  )}

                  <div className="form-text text-muted small mt-2">
                    <i className="bi bi-info-circle me-1"></i>
                    Tài khoản sẽ được tự động đồng bộ vào CSDL Supabase PostgreSQL với mật khẩu bảo mật Bcrypt.
                  </div>
                </div>

                {/* MODAL FOOTER - GHIM CỐ ĐỊNH Ở ĐÁY */}
                <div className="modal-footer p-3 bg-light border-top flex-shrink-0 d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm px-3"
                    onClick={() => setShowAddModal(false)}
                  >
                    Hủy Bỏ
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-sm px-4 d-flex align-items-center"
                    disabled={isSubmitting}
                    style={{ background: 'linear-gradient(135deg, #175cdd 0%, #10b981 100%)', border: 'none' }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1.5"></span>
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle me-1"></i>
                        <span>Lưu Tài Khoản Mới</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
