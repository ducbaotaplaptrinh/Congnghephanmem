import { useState, useEffect, useRef } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import doctorService from '../../services/doctorService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import '../../components/layout/admin.css'

export default function DoctorList() {
  const [doctors, setDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [toastMsg, setToastMsg] = useState('')
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const modalBodyRef = useRef(null)
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    mack: 1,
    title: 'Bác sĩ chuyên khoa',
    department: 'Khoa Mắt Kỹ Thuật Cao',
    experience: '5',
    kinhnghiem: 5,
    phone: '',
    gender: 'Nam',
    birthday: '1985-05-15',
    license: '',
    diachi: '',
    bio: '',
    hinhanh: '',
    status: 'ACTIVE'
  })

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP)!')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDim = 400
        let width = img.width
        let height = img.height
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85)
        setFormData(prev => ({ ...prev, hinhanh: compressedBase64 }))
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [docData, specData] = await Promise.all([
        doctorService.getAll(),
        doctorService.getSpecialties()
      ])
      setDoctors(docData)
      setSpecialties(specData)
    } catch (err) {
      console.error('Lỗi nạp danh sách bác sĩ:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Khóa cuộn trang nền khi mở modal để con lăn cuộn mượt mà bên trong modal
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [modalOpen])

  const departments = Array.from(new Set([
    ...specialties.map(s => s.tenchuyenkhoa),
    ...doctors.map(d => d.department)
  ])).filter(Boolean)

  const filtered = doctors.filter(d => {
    const matchName = d.name?.toLowerCase().includes(search.toLowerCase()) || 
                      d.title?.toLowerCase().includes(search.toLowerCase())
    const matchDept = selectedDept ? d.department === selectedDept : true
    return matchName && matchDept
  })

  // Mở modal thêm
  const handleOpenAdd = () => {
    setEditingDoctor(null)
    const firstSpec = specialties[0] || { mack: 1, tenchuyenkhoa: 'Khoa Mắt Kỹ Thuật Cao' }
    const generatedPhone = `090${Math.floor(1000000 + Math.random() * 9000000)}`
    setFormData({
      name: '',
      mack: firstSpec.mack,
      title: 'Bác sĩ CKI',
      department: firstSpec.tenchuyenkhoa,
      experience: '5',
      kinhnghiem: 5,
      phone: generatedPhone,
      gender: 'Nam',
      birthday: '1985-05-15',
      license: `CCHN-${Math.floor(100000 + Math.random() * 900000)}`,
      diachi: '',
      bio: 'Bác sĩ có nhiều năm kinh nghiệm thăm khám và điều trị chuyên sâu.',
      hinhanh: '',
      status: 'ACTIVE',
      createAccount: true,
      username: `bs_${generatedPhone.slice(-6)}`,
      password: 'password123'
    })
    setSubmitting(false)
    setModalOpen(true)
  }

  // Mở modal sửa
  const handleOpenEdit = (doc) => {
    setEditingDoctor(doc)
    const matchedSpec = specialties.find(s => s.mack === doc.mack || s.tenchuyenkhoa === doc.department)
    setFormData({
      name: doc.name || doc.hoten || '',
      mack: matchedSpec?.mack || doc.mack || 1,
      title: doc.title || doc.hocham || 'Bác sĩ chuyên khoa',
      department: doc.department || doc.chuyenkhoa || 'Khoa Mắt Kỹ Thuật Cao',
      experience: String(doc.kinhnghiem ?? (parseInt(doc.experience) || 5)),
      kinhnghiem: doc.kinhnghiem ?? (parseInt(doc.experience) || 5),
      phone: (doc.phone || doc.sdt || '').replace(/\D/g, ''),
      gender: doc.gender || doc.gioitinh || 'Nam',
      birthday: doc.birthday || doc.ngaysinh || '1985-05-15',
      license: doc.license || doc.sogiayphephanhnghe || '',
      diachi: doc.diachi || '',
      bio: doc.bio || '',
      hinhanh: doc.hinhanh || doc.image || (doc.img && !doc.img.includes('unsplash') ? doc.img : ''),
      status: doc.status || 'ACTIVE',
      createAccount: false
    })
    setSubmitting(false)
    setModalOpen(true)
  }

  // Lưu bác sĩ (gọi API thêm mới hoặc cập nhật từ backend)
  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Vui lòng nhập họ tên bác sĩ!')
      return
    }

    setSubmitting(true)

    try {
      if (editingDoctor) {
        const updated = await doctorService.update(editingDoctor.id, formData)
        setDoctors(prev => prev.map(d => d.id === editingDoctor.id ? { ...d, ...updated } : d))
        setToastMsg('Đã cập nhật thông tin bác sĩ trên hệ thống!')
      } else {
        const payload = { ...formData }
        if (!payload.createAccount) {
          delete payload.username
          delete payload.password
        } else {
          if (!payload.username || payload.username.trim().length < 4) {
            alert('Tên đăng nhập tài khoản phải từ 4 ký tự trở lên!')
            setSubmitting(false)
            return
          }
          if (!payload.password || payload.password.length < 6) {
            alert('Mật khẩu tài khoản phải từ 6 ký tự trở lên!')
            setSubmitting(false)
            return
          }
          payload.username = payload.username.trim()
        }

        const created = await doctorService.create(payload)
        setDoctors(prev => [created, ...prev.filter(d => d.id !== created.id)])
        
        if (payload.createAccount) {
          setToastMsg(`Đã thêm bác sĩ mới & cấp tài khoản thành công! (Tên đăng nhập: ${payload.username} / Mật khẩu: ${payload.password})`)
        } else {
          setToastMsg('Đã thêm bác sĩ mới thành công vào hệ thống!')
        }
      }
      setModalOpen(false)
      setTimeout(() => setToastMsg(''), 5000)
    } catch (err) {
      console.error('Lỗi khi lưu bác sĩ:', err)
      const msg = err.data?.message || err.message || 'Lỗi khi lưu thông tin bác sĩ vào máy chủ!'
      alert('Lỗi lưu bác sĩ: ' + msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Xóa bác sĩ (gọi API xóa từ backend)
  const handleDelete = async (id, name = '') => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bác sĩ "${name || id}" khỏi hệ thống?`)) {
      try {
        await doctorService.delete(id)
        setDoctors(prev => prev.filter(d => d.id !== id && d.mabs !== id))
        setToastMsg('Đã xóa bác sĩ khỏi hệ thống thành công!')
        setTimeout(() => setToastMsg(''), 3000)
      } catch (err) {
        console.error('Lỗi khi xóa bác sĩ:', err)
        const msg = err.data?.message || err.message || 'Không thể xóa bác sĩ!'
        alert('Lỗi xóa bác sĩ: ' + msg)
      }
    }
  }

  return (
    <AdminLayout title="Quản Lý Đội Ngũ Bác Sĩ">
      {/* 1. Header Toolbar Quản Trị & Nút Thêm Bác Sĩ Đồng Bộ Chuẩn Admin */}
      <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            {/* Cụm Tìm kiếm & Lọc chuyên khoa */}
            <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1" style={{ maxWidth: '650px' }}>
              <div className="input-group input-group-sm" style={{ minWidth: '220px', flex: 1 }}>
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0" 
                  placeholder="Tìm theo tên bác sĩ, học vị, chức danh..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select 
                className="form-select form-select-sm" 
                style={{ width: 'auto', minWidth: '180px' }}
                value={selectedDept} 
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="">Tất cả chuyên khoa</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Chế độ xem & NÚT THÊM BÁC SĨ ĐỒNG BỘ ĐỘ CAO VÀ CỠ CHỮ */}
            <div className="d-flex align-items-center gap-2 ms-auto">
              <span className="text-muted small d-none d-md-inline me-1">
                Tổng cộng: <strong>{filtered.length}</strong> bác sĩ
              </span>

              <div className="btn-group btn-group-sm" role="group">
                <button 
                  type="button" 
                  className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('grid')}
                  title="Chế độ xem Thẻ Lưới (2 cột/hàng)"
                >
                  <i className="bi bi-grid-fill"></i>
                </button>
                <button 
                  type="button" 
                  className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('table')}
                  title="Chế độ xem Danh Sách Bảng"
                >
                  <i className="bi bi-list-ul"></i>
                </button>
              </div>

              <button 
                type="button" 
                className="btn btn-primary btn-sm px-3 d-flex align-items-center"
                onClick={handleOpenAdd}
              >
                <i className="bi bi-person-plus-fill me-1"></i>
                <span>Thêm Bác Sĩ Mới</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Loading State */}
      {loading ? (
        <div className="card p-4 border-0 shadow-sm rounded-3">
          <LoadingSpinner text="Đang tải danh sách bác sĩ quản trị..." />
        </div>
      ) : (
        <>
          {/* CHẾ ĐỘ 1: DẠNG LƯỚI THẺ CHÍNH XÁC 1 HÀNG 2 BÁC SĨ (CSS GRID 2 COLS) */}
          {viewMode === 'grid' && (
            <div 
              className="ad-doctor-grid-2cols"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '1.25rem',
                width: '100%'
              }}
            >
              {filtered.map(doc => {
                const initialLetter = doc.name ? doc.name.replace(/^(Bác sĩ|BS|ThS|TS|CKI|CKII)\.?\s*/i, '').trim().charAt(0) : 'B'

                return (
                  <div key={doc.id} className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden bg-white hover-shadow transition-all">
                    <div className="card-body p-4 d-flex flex-column">
                      
                      {/* Hàng 1: Avatar, Tên bác sĩ đầy đủ, Khoa phòng, Trạng thái */}
                      <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                        <div className="d-flex align-items-center gap-3 min-w-0">
                          {doc.hinhanh || doc.image || (doc.img && !doc.img.includes('unsplash')) ? (
                            <img 
                              src={doc.hinhanh || doc.image || doc.img} 
                              alt={doc.name} 
                              className="rounded-circle object-fit-cover border shadow-sm flex-shrink-0" 
                              style={{ width: '64px', height: '64px' }}
                            />
                          ) : (
                            <div 
                              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold fs-3 border border-primary-subtle shadow-sm flex-shrink-0"
                              style={{ width: '64px', height: '64px' }}
                            >
                              {initialLetter}
                            </div>
                          )}

                          <div className="min-w-0">
                            <h3 className="fs-5 fw-bold mb-1 text-dark text-break">
                              {doc.name}
                            </h3>
                            <span className="text-primary fw-medium small d-block">
                              <i className="bi bi-award me-1"></i>{doc.title || 'Bác sĩ chuyên khoa'}
                            </span>
                          </div>
                        </div>

                        <div className="text-end flex-shrink-0">
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 mb-1 d-block" style={{ fontSize: '11.5px' }}>
                            {doc.department || 'Đa Khoa'}
                          </span>
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0" style={{ fontSize: '10.5px' }}>
                            <i className="bi bi-circle-fill me-1" style={{ fontSize: '7px' }}></i>Đang công tác
                          </span>
                        </div>
                      </div>

                      {/* Hàng 2: Mô tả / tiểu sử chuyên môn */}
                      <p className="small text-muted mb-3 flex-grow-1" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                        {doc.bio || 'Chuyên gia đầu ngành giàu kinh nghiệm khám, chẩn đoán và điều trị tại phòng khám.'}
                      </p>

                      {/* Hàng 3: Dải thông số chi tiết */}
                      <div className="p-2 px-3 bg-light rounded-3 border d-flex flex-wrap justify-content-between align-items-center small text-secondary mb-3" style={{ fontSize: '12px' }}>
                        <span>
                          <i className="bi bi-clock-history me-1 text-primary"></i>
                          Kinh nghiệm: <strong>{doc.experience || '8+ năm'}</strong>
                        </span>
                        <span>
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          Đánh giá: <strong>{doc.rating || '4.9'}</strong> ({doc.reviewsCount || 120}+ lượt)
                        </span>
                        <span>
                          <i className="bi bi-telephone me-1 text-success"></i>
                          {doc.phone || '0901 234 567'}
                        </span>
                      </div>

                      {/* Hàng 4: Nút thao tác quản trị */}
                      <div className="d-flex gap-2 pt-2 border-top">
                        <button 
                          className="btn btn-outline-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center py-2"
                          onClick={() => handleOpenEdit(doc)}
                        >
                          <i className="bi bi-pencil-square me-1"></i> Chỉnh Sửa Thông Tin
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm px-3 d-flex align-items-center justify-content-center"
                          onClick={() => handleDelete(doc.id)}
                          title="Xóa bác sĩ"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* CHẾ ĐỘ 2: DẠNG BẢNG QUẢN LÝ (TABLE VIEW) */}
          {viewMode === 'table' && (
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '13.5px' }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '60px' }} className="text-center">Avatar</th>
                      <th>Họ và Tên Bác Sĩ</th>
                      <th>Chức Danh & Học Vị</th>
                      <th>Chuyên Khoa</th>
                      <th>Kinh Nghiệm</th>
                      <th>Số Điện Thoại</th>
                      <th>Đánh Giá</th>
                      <th>Trạng Thái</th>
                      <th className="text-end" style={{ width: '130px' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(doc => {
                      const initialLetter = doc.name ? doc.name.replace(/^(Bác sĩ|BS|ThS|TS|CKI|CKII)\.?\s*/i, '').trim().charAt(0) : 'B'

                      return (
                        <tr key={doc.id}>
                          <td className="text-center">
                            {doc.hinhanh || doc.image || (doc.img && !doc.img.includes('unsplash')) ? (
                              <img 
                                src={doc.hinhanh || doc.image || doc.img} 
                                alt={doc.name} 
                                className="rounded-circle object-fit-cover border shadow-xs" 
                                style={{ width: '42px', height: '42px' }}
                              />
                            ) : (
                              <div 
                                className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center fw-bold"
                                style={{ width: '42px', height: '42px', fontSize: '15px' }}
                              >
                                {initialLetter}
                              </div>
                            )}
                          </td>
                          <td>
                            <strong className="text-dark d-block fs-6">{doc.name}</strong>
                            <span className="text-muted small">Mã BS: BS-0{doc.id}</span>
                          </td>
                          <td>{doc.title || 'Bác sĩ chuyên khoa'}</td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                              {doc.department || 'Đa Khoa'}
                            </span>
                          </td>
                          <td>{doc.experience || '8+ năm'}</td>
                          <td>{doc.phone || '0901 234 567'}</td>
                          <td>
                            <span className="text-warning"><i className="bi bi-star-fill me-1"></i>{doc.rating || '4.9'}</span>
                          </td>
                          <td>
                            <span className="badge bg-success-subtle text-success border border-success-subtle">
                              Đang công tác
                            </span>
                          </td>
                          <td className="text-end">
                            <button 
                              className="btn btn-sm btn-outline-primary me-1 py-1 px-2"
                              onClick={() => handleOpenEdit(doc)}
                              title="Chỉnh sửa"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger py-1 px-2"
                              onClick={() => handleDelete(doc.id)}
                              title="Xóa"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="card p-5 text-center text-muted border-0 shadow-sm rounded-3 bg-white">
              <i className="bi bi-person-x fs-1 d-block mb-2 text-secondary"></i>
              <span>Không tìm thấy bác sĩ phù hợp với tiêu chí lọc</span>
            </div>
          )}
        </>
      )}

      {/* 3. MODAL THÊM / SỬA BÁC SĨ - NỀN TIÊU ĐỀ XANH & CON LĂN CUỘN MƯỢT MÀ */}
      {modalOpen && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(2px)' }}
          onWheel={(e) => {
            if (modalBodyRef.current && !modalBodyRef.current.contains(e.target)) {
              modalBodyRef.current.scrollTop += e.deltaY
            }
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ maxHeight: '90vh' }}>
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden d-flex flex-column" style={{ maxHeight: '90vh' }}>
              
              {/* NỀN TIÊU ĐỀ GRADIENT THƯƠNG HIỆU */}
              <div 
                className="modal-header py-3 px-4 text-white border-0 flex-shrink-0 no-print"
                style={{ 
                  background: 'linear-gradient(135deg, #175cdd 0%, #10b981 100%)'
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <i className="bi bi-person-plus-fill fs-5 text-white"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-white mb-0" style={{ fontSize: '1.05rem' }}>
                      {editingDoctor ? 'Chỉnh Sửa Thông Tin Bác Sĩ' : 'Tiếp Nhận & Thêm Bác Sĩ Mới'}
                    </h5>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)' }}>
                      Phòng Khám Đa Khoa Phú Lợi Bảo • Quản trị nhân sự y tế
                    </span>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setModalOpen(false)}
                  aria-label="Đóng"
                ></button>
              </div>

              {/* THÂN MODAL VỚI CON LĂN CUỘN MƯỢT MÀ (KHÔNG BỊ KẸT) */}
              <form onSubmit={handleSave} className="d-flex flex-column flex-grow-1 m-0" style={{ minHeight: 0, overflow: 'hidden' }}>
                <div 
                  ref={modalBodyRef}
                  className="modal-body p-4 bg-white ad-modal-scrollable-body" 
                  style={{ 
                    overflowY: 'auto', 
                    maxHeight: 'calc(90vh - 135px)',
                    flex: '1 1 auto',
                    overscrollBehavior: 'contain',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  
                  {/* Khối 1: Thông tin cơ bản */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                      <div className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                        <i className="bi bi-person-badge fs-6"></i>
                      </div>
                      <span className="fw-bold text-dark text-uppercase small" style={{ letterSpacing: '0.5px' }}>
                        1. Thông Tin Nhận Diện Bác Sĩ
                      </span>
                    </div>

                    {/* Khối Ảnh Đại Diện Bác Sĩ */}
                    <div className="p-3 rounded-3 mb-4 border bg-light d-flex flex-column flex-sm-row align-items-center gap-3">
                      <div className="position-relative flex-shrink-0">
                        {formData.hinhanh ? (
                          <img 
                            src={formData.hinhanh} 
                            alt="Avatar Bác sĩ" 
                            className="rounded-circle object-fit-cover border border-2 border-primary shadow-sm"
                            style={{ width: '84px', height: '84px' }}
                          />
                        ) : (
                          <div 
                            className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold border border-2 border-primary-subtle shadow-sm"
                            style={{ width: '84px', height: '84px', fontSize: '30px' }}
                          >
                            {formData.name ? formData.name.replace(/^(Bác sĩ|BS|ThS|TS|CKI|CKII)\.?\s*/i, '').trim().charAt(0) : <i className="bi bi-person-fill"></i>}
                          </div>
                        )}
                        {formData.hinhanh && (
                          <span 
                            className="position-absolute bottom-0 end-0 badge rounded-pill bg-success p-1 border border-white"
                            title="Đã có ảnh đại diện"
                          >
                            <i className="bi bi-check-lg" style={{ fontSize: '10px' }}></i>
                          </span>
                        )}
                      </div>

                      <div className="flex-grow-1 text-center text-sm-start min-w-0">
                        <div className="fw-bold text-dark mb-1">Ảnh Đại Diện Bác Sĩ (Avatar)</div>
                        <div className="text-muted small mb-2" style={{ fontSize: '12px' }}>
                          Hình ảnh đại diện sẽ lưu trực tiếp trên database và đồng bộ hiển thị cho bệnh nhân, bác sĩ và đặt lịch.
                        </div>

                        <div className="d-flex flex-wrap align-items-center gap-2 justify-content-center justify-content-sm-start">
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            className="d-none" 
                            onChange={handleAvatarFileChange}
                          />
                          <button 
                            type="button" 
                            className="btn btn-sm btn-primary d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold shadow-xs"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <i className="bi bi-cloud-arrow-up-fill"></i>
                            {formData.hinhanh ? 'Đổi Ảnh Khác' : 'Tải Ảnh Lên'}
                          </button>

                          {formData.hinhanh && (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 px-2.5 py-1.5"
                              onClick={() => setFormData(prev => ({ ...prev, hinhanh: '' }))}
                              title="Xóa ảnh đại diện hiện tại"
                            >
                              <i className="bi bi-trash3-fill"></i>
                              Xóa Ảnh
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">
                          Họ và tên bác sĩ <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light text-muted">
                            <i className="bi bi-person"></i>
                          </span>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Ví dụ: BS. CKII. Nguyễn Văn A"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label small fw-semibold text-secondary">
                          Số điện thoại <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light text-muted">
                            <i className="bi bi-telephone"></i>
                          </span>
                          <input 
                            type="tel" 
                            className="form-control" 
                            placeholder="0901234567"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label small fw-semibold text-secondary">Giới tính</label>
                        <select 
                          className="form-select form-select-sm"
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nu">Nữ</option>
                          <option value="Khac">Khác</option>
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold text-secondary">Ngày sinh</label>
                        <input 
                          type="date" 
                          className="form-control form-control-sm"
                          value={formData.birthday}
                          onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold text-secondary">
                          Số CCHN (Chứng chỉ hành nghề)
                        </label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm"
                          placeholder="Ví dụ: CCHN-123456"
                          value={formData.license}
                          onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold text-secondary">Địa chỉ cư trú</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm"
                          placeholder="Địa chỉ liên hệ..."
                          value={formData.diachi}
                          onChange={(e) => setFormData({ ...formData, diachi: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Khối 2: Chuyên môn & Học vị */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                      <div className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                        <i className="bi bi-mortarboard fs-6"></i>
                      </div>
                      <span className="fw-bold text-dark text-uppercase small" style={{ letterSpacing: '0.5px' }}>
                        2. Chuyên Khoa & Học Vị
                      </span>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold text-secondary">Học vị / Chức vụ</label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light text-muted">
                            <i className="bi bi-award"></i>
                          </span>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="BS. CKI / ThS. BS / Trưởng khoa..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="col-md-5">
                        <label className="form-label small fw-semibold text-secondary">
                          Chuyên khoa trực thuộc <span className="text-danger">*</span>
                        </label>
                        <select 
                          className="form-select form-select-sm"
                          value={formData.mack}
                          onChange={(e) => {
                            const selectedId = Number(e.target.value)
                            const matched = specialties.find(s => s.mack === selectedId)
                            setFormData({
                              ...formData,
                              mack: selectedId,
                              department: matched?.tenchuyenkhoa || ''
                            })
                          }}
                        >
                          {specialties.map(spec => (
                            <option key={spec.mack} value={spec.mack}>
                              {spec.tenchuyenkhoa}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label small fw-semibold text-secondary">Kinh nghiệm (năm)</label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light text-muted">
                            <i className="bi bi-clock-history"></i>
                          </span>
                          <input 
                            type="number" 
                            className="form-control" 
                            min="0"
                            max="70"
                            placeholder="5"
                            value={formData.experience}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              experience: e.target.value,
                              kinhnghiem: Number(e.target.value) || 0
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Khối 3: Tiểu sử & Giới thiệu */}
                  <div className="mb-2">
                    <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                      <div className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                        <i className="bi bi-card-text fs-6"></i>
                      </div>
                      <span className="fw-bold text-dark text-uppercase small" style={{ letterSpacing: '0.5px' }}>
                        3. Tiểu Sử & Mô Tả Chuyên Môn
                      </span>
                    </div>

                    <div>
                      <textarea 
                        className="form-control form-control-sm" 
                        rows="3" 
                        placeholder="Mô tả quá trình đào tạo, chứng chỉ hành nghề, bệnh viện công tác trước đây..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      ></textarea>
                    </div>
                  </div>

                  {/* Khối 4: Cấp Tài Khoản Đăng Nhập Cổng Bác Sĩ (Chỉ hiện khi thêm mới) */}
                  {!editingDoctor && (
                    <div className="mb-2 p-3 rounded-3 border bg-light-subtle" style={{ borderColor: '#e2e8f0' }}>
                      <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle bg-success-subtle text-success p-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                            <i className="bi bi-shield-lock fs-6"></i>
                          </div>
                          <div>
                            <span className="fw-bold text-dark text-uppercase small" style={{ letterSpacing: '0.5px' }}>
                              4. Cấp Tài Khoản Đăng Nhập Cổng Bác Sĩ
                            </span>
                            <div className="text-muted" style={{ fontSize: '11.5px' }}>
                              Tài khoản phân quyền Bác sĩ để đăng nhập Cổng Bác sĩ (Doctor Portal)
                            </div>
                          </div>
                        </div>

                        <div className="form-check form-switch m-0">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            role="switch"
                            id="createAccountToggle"
                            checked={formData.createAccount || false}
                            onChange={(e) => setFormData({ ...formData, createAccount: e.target.checked })}
                            style={{ cursor: 'pointer', transform: 'scale(1.15)' }}
                          />
                        </div>
                      </div>

                      {formData.createAccount && (
                        <div className="row g-3 pt-2">
                          <div className="col-md-6">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <label className="form-label small fw-semibold text-secondary mb-0">
                                Tên đăng nhập (Username) <span className="text-danger">*</span>
                              </label>
                              <button 
                                type="button" 
                                className="btn btn-link btn-sm p-0 text-decoration-none"
                                style={{ fontSize: '11px' }}
                                onClick={() => {
                                  const phoneClean = (formData.phone || '').replace(/\D/g, '')
                                  if (phoneClean) {
                                    setFormData({ ...formData, username: `bs_${phoneClean.slice(-6)}` })
                                  }
                                }}
                              >
                                <i className="bi bi-magic me-1"></i>Lấy theo SĐT
                              </button>
                            </div>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text bg-light text-muted">
                                <i className="bi bi-person-fill-check"></i>
                              </span>
                              <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Ví dụ: bs_nam, bs_123456"
                                required={formData.createAccount}
                                value={formData.username || ''}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                              />
                            </div>
                            <div className="form-text" style={{ fontSize: '11px' }}>Tối thiểu 4 ký tự, viết liền không dấu.</div>
                          </div>

                          <div className="col-md-6">
                            <label className="form-label small fw-semibold text-secondary mb-1">
                              Mật khẩu đăng nhập <span className="text-danger">*</span>
                            </label>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text bg-light text-muted">
                                <i className="bi bi-key-fill"></i>
                              </span>
                              <input 
                                type="text" 
                                className="form-control font-monospace" 
                                placeholder="123456"
                                required={formData.createAccount}
                                value={formData.password || ''}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              />
                            </div>
                            <div className="form-text text-muted" style={{ fontSize: '11px' }}>
                              Tối thiểu 6 ký tự. Gợi ý: <span className="badge bg-secondary-subtle text-secondary px-1 py-0 font-monospace">123456</span>
                            </div>
                          </div>

                          <div className="col-12">
                            <div className="alert alert-info py-2 px-3 mb-0 d-flex align-items-center gap-2" style={{ fontSize: '12px' }}>
                              <i className="bi bi-info-circle-fill text-info fs-6"></i>
                              <div>
                                Hệ thống tự động cấp vai trò <strong>Bác sĩ (BacSi)</strong> và liên kết tài khoản với hồ sơ để đăng nhập ngay vào hệ thống khám chữa bệnh.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                <div className="modal-footer p-3 bg-light border-top flex-shrink-0 d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm px-3" 
                    onClick={() => setModalOpen(false)}
                    disabled={submitting}
                  >
                    Hủy Bỏ
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-sm px-4 d-flex align-items-center"
                    style={{ background: 'linear-gradient(135deg, #175cdd 0%, #10b981 100%)', border: 'none' }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle me-1"></i>
                        <span>{editingDoctor ? 'Cập Nhật Thông Tin' : 'Lưu Bác Sĩ Mới'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* Toast Thông Báo */}
      {toastMsg && (
        <div 
          className="position-fixed bottom-0 end-0 m-3 p-3 bg-dark text-white rounded-3 shadow"
          style={{ zIndex: 3000, fontSize: '13.5px' }}
        >
          <i className="bi bi-check-circle-fill text-success me-2 fs-5"></i>
          {toastMsg}
        </div>
      )}
    </AdminLayout>
  )
}
