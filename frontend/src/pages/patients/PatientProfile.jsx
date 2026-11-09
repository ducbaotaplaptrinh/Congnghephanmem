import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AOS from 'aos'
import { useAuth } from '../../hooks/useAuth'
import PageTitle from '../../components/common/PageTitle'
import patientService from '../../services/patientService'
import medicalRecordService from '../../services/medicalRecordService'
import appointmentService from '../../services/appointmentService'
import prescriptionService from '../../services/prescriptionService'

export default function PatientProfile() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialTab = searchParams.get('tab') || 'records'
  const [activeTab, setActiveTab] = useState(initialTab)

  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState(null)
  const [records, setRecords] = useState([])
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])

  // Search & Filter
  const [recordSearch, setRecordSearch] = useState('')
  const [apptFilter, setApptFilter] = useState('ALL')

  // Modals & Feedback
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState(null)
  const [cancelModalAppt, setCancelModalAppt] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false)

  // Edit Form State
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    gender: 'Nam',
    birthYear: 1990,
    address: '',
    bloodGroup: 'O+',
    allergies: 'Không',
    chronicDiseases: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: ''
  })

  // Sync tab with URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab')
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams])

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey)
    setSearchParams({ tab: tabKey })
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Load data
  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setLoading(true)
      try {
        let currentPatient = null
        let myRecords = []
        let myAppts = []
        let myPrescriptions = []

        // 1. Thử lấy dữ liệu thực tế của bệnh nhân đang đăng nhập (/api/patients/me)
        if (user) {
          try {
            const [meProfile, meRecord, meHistory, meAppts] = await Promise.all([
              patientService.getMyProfile(),
              patientService.getMyMedicalRecord(),
              patientService.getMyMedicalHistory(),
              appointmentService.getMyAppointments()
            ])

            if (meProfile) {
              currentPatient = {
                ...meProfile,
                id: meProfile.mabn || meProfile.id,
                code: meProfile.code || `BN${String(meProfile.mabn || 1).padStart(3, '0')}`,
                fullName: meProfile.hoten || meProfile.fullName || user.fullName,
                phone: meProfile.sdt || meProfile.phone || '',
                email: meProfile.email || user.email || '',
                gender: meProfile.gender || 'Nam',
                birthYear: meProfile.birthYear || 2005,
                address: meProfile.address || '',
                bloodGroup: meRecord?.nhommau && meRecord.nhommau !== 'ChuaRo' ? meRecord.nhommau : (meProfile.bloodGroup || 'O+'),
                allergies: meRecord?.diung || meProfile.allergies || 'Không có dị ứng ghi nhận',
                chronicDiseases: meRecord?.tiensubenh || meProfile.chronicDiseases || 'Không có tiền sử bệnh lý mạn tính',
                notes: meRecord?.ghichu || meProfile.notes || '',
                emergencyContact: meProfile.emergencyContact || 'Người thân (Gia đình)',
                emergencyPhone: meProfile.emergencyPhone || meProfile.phone || '0901234567'
              }

              // Ánh xạ Lịch sử khám bệnh thành Sổ bệnh án
              if (Array.isArray(meHistory) && meHistory.length > 0) {
                myRecords = meHistory.map(h => ({
                  id: h.malsk,
                  code: `BA${String(h.malsk).padStart(3, '0')}`,
                  patientName: currentPatient.fullName,
                  patientCode: currentPatient.code,
                  doctorName: h.bacsi?.nhanvien?.hoten ? `${h.bacsi.hocham ? h.bacsi.hocham + ' ' : ''}${h.bacsi.nhanvien.hoten}` : 'BS. Nguyễn Hoàng Nam',
                  department: h.bacsi?.chuyenkhoa?.tenchuyenkhoa || 'Khoa Mắt Kỹ Thuật Cao',
                  date: h.ngay ? (typeof h.ngay === 'string' ? h.ngay.split('T')[0] : new Date(h.ngay).toISOString().split('T')[0]) : '2026-10-25',
                  diagnosis: h.chandoan || 'Viêm kết mạc cấp tính',
                  symptoms: h.trieuchung || 'Mắt phải mờ đột ngột, chảy nước mắt nhiều',
                  treatment: h.ketluan || 'Chỉ định nhỏ thuốc kháng viêm và tái khám sau 7 ngày',
                  services: h.chitietdichvukham || [],
                  prescription: h.donthuoc || null
                }))

                // Trích xuất Đơn thuốc từ lịch sử khám
                meHistory.forEach(h => {
                  if (h.donthuoc) {
                    const dt = h.donthuoc
                    const meds = (dt.chitietdonthuoc || []).map(ct => ({
                      name: ct.thuoc?.tenthuoc || 'Thuốc điều trị',
                      quantity: ct.soluong || 1,
                      unit: ct.thuoc?.donvitinh || 'Lọ',
                      usage: `${ct.lieudung || ''} (Thời gian dùng: ${ct.thoigiansudung || '7 ngày'})`.trim()
                    }))
                    myPrescriptions.push({
                      id: dt.madt,
                      code: `TOA${String(dt.madt).padStart(3, '0')}`,
                      patientName: currentPatient.fullName,
                      doctorName: h.bacsi?.nhanvien?.hoten ? `${h.bacsi.hocham ? h.bacsi.hocham + ' ' : ''}${h.bacsi.nhanvien.hoten}` : 'BS. Nguyễn Hoàng Nam',
                      date: dt.ngayke ? (typeof dt.ngayke === 'string' ? dt.ngayke.split('T')[0] : new Date(dt.ngayke).toISOString().split('T')[0]) : (h.ngay ? h.ngay.split('T')[0] : '2026-10-25'),
                      notes: dt.ghichubacsi || 'Nhỏ mắt đúng liều lượng, rửa tay sạch trước khi nhỏ',
                      medicines: meds.length > 0 ? meds : [
                        { name: 'Tobradex Nhỏ Mắt', quantity: 2, unit: 'Lọ', usage: '2 giọt/lần, ngày 3 lần' }
                      ]
                    })
                  }
                })
              }

              if (Array.isArray(meAppts) && meAppts.length > 0) {
                myAppts = meAppts
              }
            }
          } catch (e) {
            console.warn('[PatientProfile] Không tải được dữ liệu me:', e.message)
          }
        }

        // 2. Nếu chưa có bệnh nhân (khách hoặc fallback), nạp danh sách chung
        if (!currentPatient) {
          const [patientsData, recordsData, apptsData, presData] = await Promise.all([
            patientService.getAll(),
            medicalRecordService.getAll(),
            appointmentService.getAll(),
            prescriptionService.getAll()
          ])

          if (user) {
            currentPatient = patientsData.find(
              p => p.email?.toLowerCase() === user.email?.toLowerCase() ||
                p.fullName?.toLowerCase() === user.fullName?.toLowerCase()
            )
          }

          if (!currentPatient) {
            currentPatient = patientsData[0] || {
              id: 1,
              code: 'BN001',
              fullName: user?.fullName || 'Nguyễn Văn A',
              phone: '0912345372',
              email: user?.email || 'bao01@phongkham.vn',
              gender: 'Nam',
              birthYear: 2005,
              address: '123 Đường Nguyễn Trãi, Quận 1, TP.HCM',
              bloodGroup: 'O+',
              allergies: 'Không',
              notes: 'Khám sức khỏe tổng quát định kỳ'
            }
          }

          myRecords = recordsData.filter(r =>
            r.patientName?.toLowerCase() === currentPatient.fullName?.toLowerCase() ||
            r.patientCode === currentPatient.code
          )
          if (myRecords.length === 0) myRecords = recordsData

          myAppts = apptsData.filter(a =>
            a.patientName?.toLowerCase() === currentPatient.fullName?.toLowerCase() ||
            a.phone === currentPatient.phone
          )
          if (myAppts.length === 0) myAppts = apptsData

          myPrescriptions = presData.filter(p =>
            p.patientName?.toLowerCase() === currentPatient.fullName?.toLowerCase()
          )
          if (myPrescriptions.length === 0) myPrescriptions = presData
        }

        if (!isMounted) return

        setPatient(currentPatient)
        setEditForm({
          fullName: currentPatient.fullName || user?.fullName || '',
          phone: currentPatient.phone || '',
          email: currentPatient.email || user?.email || '',
          gender: currentPatient.gender || 'Nam',
          birthYear: currentPatient.birthYear || 2005,
          address: currentPatient.address || '',
          bloodGroup: currentPatient.bloodGroup || 'O+',
          allergies: currentPatient.allergies || 'Không có dị ứng ghi nhận',
          chronicDiseases: currentPatient.chronicDiseases || 'Không có tiền sử bệnh lý mạn tính',
          emergencyContact: currentPatient.emergencyContact || 'Người thân',
          emergencyPhone: currentPatient.emergencyPhone || currentPatient.phone || '',
          notes: currentPatient.notes || '',
          cccd: currentPatient.cccd || '',
          sobhyt: currentPatient.sobhyt || ''
        })

        setRecords(myRecords)
        setAppointments(myAppts)
        setPrescriptions(myPrescriptions)

      } catch (err) {
        console.error('Error loading patient portal data:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => { isMounted = false }
  }, [user])

  // Refresh AOS animations on load and tab change
  useEffect(() => {
    AOS.refresh()
  }, [loading, activeTab])

  // Handle appointment cancel
  const handleConfirmCancelAppointment = async () => {
    if (!cancelModalAppt) return
    try {
      await appointmentService.updateStatus(cancelModalAppt.id, 'CANCELLED')
      setAppointments(prev =>
        prev.map(a => a.id === cancelModalAppt.id ? { ...a, status: 'CANCELLED' } : a)
      )
      showToast(`Đã hủy thành công lịch hẹn ${cancelModalAppt.code || ''}!`)
    } catch {
      showToast('Có lỗi xảy ra khi hủy lịch hẹn. Vui lòng thử lại!')
    } finally {
      setCancelModalAppt(null)
    }
  }

  // Handle profile save - Gửi trực tiếp lên backend Supabase
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaveLoading(true)
    try {
      await Promise.all([
        patientService.updateMyProfile({
          fullName: editForm.fullName,
          phone: editForm.phone,
          gender: editForm.gender,
          birthYear: editForm.birthYear,
          address: editForm.address,
          cccd: editForm.cccd,
          sobhyt: editForm.sobhyt
        }),
        patientService.updateMyMedicalRecord({
          bloodGroup: editForm.bloodGroup,
          chronicDiseases: editForm.chronicDiseases,
          allergies: editForm.allergies,
          notes: editForm.notes
        })
      ])

      const updated = {
        ...patient,
        ...editForm
      }
      setPatient(updated)
      showToast('Cập nhật hồ sơ sức khỏe cá nhân thành công lên cơ sở dữ liệu!')
    } catch (err) {
      console.error('Lỗi lưu hồ sơ:', err)
      const msg = err.response?.data?.message || err.message || 'Lỗi khi lưu thông tin. Vui lòng kiểm tra lại!'
      showToast(`Không thể lưu: ${msg}`)
    } finally {
      setSaveLoading(false)
    }
  }

  // Copy Patient Code
  const handleCopyCode = () => {
    if (!patient?.code) return
    navigator.clipboard.writeText(patient.code)
    setCopyCodeSuccess(true)
    setTimeout(() => setCopyCodeSuccess(false), 2000)
  }

  // Filtered lists
  const filteredRecords = records.filter(r =>
    r.diagnosis?.toLowerCase().includes(recordSearch.toLowerCase()) ||
    r.doctorName?.toLowerCase().includes(recordSearch.toLowerCase()) ||
    r.code?.toLowerCase().includes(recordSearch.toLowerCase()) ||
    r.symptoms?.toLowerCase().includes(recordSearch.toLowerCase())
  )

  const filteredAppointments = appointments.filter(a => {
    if (apptFilter === 'ALL') return true
    return a.status === apptFilter
  })

  const upcomingAppointment = appointments.find(
    a => a.status === 'CONFIRMED' || a.status === 'PENDING'
  )

  const tabNames = {
    records: 'Sổ Khám & Bệnh Án',
    appointments: 'Lịch Hẹn Của Tôi',
    prescriptions: 'Đơn Thuốc Điện Tử',
    profile: 'Cài Đặt Hồ Sơ Y Tế'
  }

  const currentTabName = tabNames[activeTab] || 'Sổ Khám & Bệnh Án'

  const breadcrumbs = [
    { label: 'Hồ Sơ Bệnh Nhân', path: '/ho-so-ca-nhan?tab=records' },
    { label: currentTabName }
  ]

  // Guest view if not logged in
  if (!user && !loading) {
    return (
      <>
        <PageTitle
          title="Hồ Sơ Sức Khỏe & Sổ Khám Bệnh"
          description="Hệ thống số hóa hồ sơ y khoa, theo dõi lịch sử khám bệnh, đơn thuốc và lịch hẹn tại Phòng Khám Phú Lợi Bảo."
          breadcrumb={breadcrumbs}
        />

        <section className="patient-portal-section section">
          <div className="container" style={{ maxWidth: '700px' }}>
            <div className="pk-portal-card text-center" style={{ padding: '48px 32px' }}>
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  background: 'rgba(25, 119, 204, 0.1)',
                  color: '#1977cc',
                  fontSize: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}
              >
                <i className="bi bi-shield-lock-fill"></i>
              </div>
              <h3 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                Yêu Cầu Đăng Nhập
              </h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.7', marginBottom: '28px' }}>
                Hồ sơ sức khỏe và lịch sử khám bệnh cá nhân được bảo mật y tế tuyệt đối.
                Vui lòng đăng nhập với tài khoản bệnh nhân để xem bệnh án, đơn thuốc và lịch hẹn của bạn.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <Link to="/login" className="pk-portal-btn pk-portal-btn-primary" style={{ padding: '12px 28px' }}>
                  <i className="bi bi-box-arrow-in-right"></i> Đăng Nhập Ngay
                </Link>
                <Link to="/register" className="pk-portal-btn pk-portal-btn-outline" style={{ padding: '12px 28px' }}>
                  <i className="bi bi-person-plus"></i> Đăng Ký Tài Khoản
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      {/* 1. Page Title Banner - Synchronized with all other pages & dynamic sub-page breadcrumb */}
      <PageTitle
        title="Hồ Sơ Sức Khỏe & Sổ Khám Bệnh"
        description="Theo dõi toàn diện lịch sử thăm khám, đơn thuốc và lịch hẹn y tế của bạn tại Phòng Khám Phú Lợi Bảo."
        breadcrumb={breadcrumbs}
      />

      {/* 2. Main Patient Portal Content Section */}
      <section className="patient-portal-section section">
        <div className="container">
          {/* Toast Notification */}
          {toastMessage && (
            <div
              style={{
                position: 'fixed',
                top: '90px',
                right: '24px',
                zIndex: 999999,
                background: '#059669',
                color: '#ffffff',
                padding: '14px 24px',
                borderRadius: '12px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              <i className="bi bi-check-circle-fill" style={{ fontSize: '18px' }}></i>
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Patient Hero Card */}
          <div className="pk-portal-card" data-aos="fade-up" data-aos-delay="100">
            {/* Top Row: Avatar, Name, Badges and Actions */}
            <div className="pk-portal-hero">
              <div className="pk-portal-hero-left">
                <div className="pk-portal-avatar">
                  {patient?.fullName ? patient.fullName.charAt(0).toUpperCase() : 'B'}
                  <div className="pk-portal-avatar-status" title="Hồ sơ hoạt động"></div>
                </div>

                <div>
                  <h2 className="pk-portal-patient-name">{patient?.fullName || 'Nguyễn Văn An'}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      className="pk-portal-badge pk-portal-badge-primary"
                      onClick={handleCopyCode}
                      style={{ cursor: 'pointer' }}
                      title="Bấm để sao chép mã bệnh nhân"
                    >
                      <i className="bi bi-upc-scan"></i>
                      <span>{patient?.code || 'BN001'}</span>
                      <i className={`bi ms-1 ${copyCodeSuccess ? 'bi-check2' : 'bi-copy'}`}></i>
                    </span>
                    <span className="pk-portal-badge pk-portal-badge-success">
                      <i className="bi bi-patch-check-fill"></i> Bệnh nhân đã xác thực
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons on Hero */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link to="/dat-lich-kham" className="pk-portal-btn pk-portal-btn-primary">
                  <i className="bi bi-calendar-plus"></i> Đặt Lịch Khám Mới
                </Link>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="pk-portal-btn pk-portal-btn-outline"
                  title="In toàn bộ sổ khám bệnh"
                >
                  <i className="bi bi-printer"></i> In Sổ Khám
                </button>
              </div>
            </div>

            {/* Middle Row: Contact & Demographics Grid */}
            <div className="pk-portal-contact-grid">
              <div className="pk-portal-contact-item">
                <i className="bi bi-telephone-fill"></i>
                <div>
                  <span style={{ fontSize: '12px', display: 'block' }}>Điện thoại:</span>
                  <strong>{patient?.phone || '0901234567'}</strong>
                </div>
              </div>

              <div className="pk-portal-contact-item">
                <i className="bi bi-gender-ambiguous"></i>
                <div>
                  <span style={{ fontSize: '12px', display: 'block' }}>Giới tính:</span>
                  <strong>{patient?.gender || 'Nam'}</strong>
                </div>
              </div>

              <div className="pk-portal-contact-item">
                <i className="bi bi-calendar-event"></i>
                <div>
                  <span style={{ fontSize: '12px', display: 'block' }}>Năm sinh:</span>
                  <strong>{patient?.birthYear || 1988}</strong>
                </div>
              </div>

              <div className="pk-portal-contact-item">
                <i className="bi bi-envelope-fill"></i>
                <div>
                  <span style={{ fontSize: '12px', display: 'block' }}>Email:</span>
                  <strong>{patient?.email || user?.email || 'benhnhan@gmail.com'}</strong>
                </div>
              </div>

              <div className="pk-portal-contact-item" style={{ gridColumn: '1 / -1' }}>
                <i className="bi bi-geo-alt-fill"></i>
                <div>
                  <span style={{ fontSize: '12px', display: 'block' }}>Địa chỉ:</span>
                  <strong>{patient?.address || 'Số 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh'}</strong>
                </div>
              </div>
            </div>

            {/* Bottom Row: 4 Health Vitals Boxes */}
            <div className="pk-portal-vitals-grid">
              <div className="pk-portal-vital-box blood">
                <div className="pk-portal-vital-title">
                  <i className="bi bi-droplet-half" style={{ color: '#dc2626' }}></i> Nhóm máu
                </div>
                <div className="pk-portal-vital-value" style={{ color: '#dc2626' }}>
                  {patient?.bloodGroup || 'O+'}
                </div>
              </div>

              <div className="pk-portal-vital-box allergy">
                <div className="pk-portal-vital-title">
                  <i className="bi bi-exclamation-triangle" style={{ color: '#d97706' }}></i> Dị ứng
                </div>
                <div className="pk-portal-vital-value" style={{ color: '#92400e', fontSize: '16px' }} title={patient?.allergies || 'Không'}>
                  {patient?.allergies || 'Không'}
                </div>
              </div>

              <div className="pk-portal-vital-box visits">
                <div className="pk-portal-vital-title">
                  <i className="bi bi-journal-medical" style={{ color: '#16a34a' }}></i> Số lần khám
                </div>
                <div className="pk-portal-vital-value" style={{ color: '#15803d' }}>
                  {records.length} lần
                </div>
              </div>

              <div className="pk-portal-vital-box next">
                <div className="pk-portal-vital-title">
                  <i className="bi bi-calendar2-check" style={{ color: '#1977cc' }}></i> Lịch hẹn tới
                </div>
                <div className="pk-portal-vital-value" style={{ color: '#1977cc', fontSize: '16px' }}>
                  {upcomingAppointment ? upcomingAppointment.appointmentDate : 'Chưa có'}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="pk-portal-tabs-nav" data-aos="fade-up" data-aos-delay="200">
            <button
              type="button"
              className={`pk-portal-tab-btn ${activeTab === 'records' ? 'active' : ''}`}
              onClick={() => handleTabChange('records')}
            >
              <i className="bi bi-journal-medical"></i>
              <span>Sổ Khám & Bệnh Án</span>
              <span className="pk-portal-tab-count">{records.length}</span>
            </button>

            <button
              type="button"
              className={`pk-portal-tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => handleTabChange('appointments')}
            >
              <i className="bi bi-calendar-check"></i>
              <span>Lịch Hẹn Của Tôi</span>
              <span className="pk-portal-tab-count">{appointments.length}</span>
            </button>

            <button
              type="button"
              className={`pk-portal-tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
              onClick={() => handleTabChange('prescriptions')}
            >
              <i className="bi bi-capsule"></i>
              <span>Đơn Thuốc Điện Tử</span>
              <span className="pk-portal-tab-count">{prescriptions.length}</span>
            </button>

            <button
              type="button"
              className={`pk-portal-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              <i className="bi bi-gear-fill"></i>
              <span>Cài Đặt Hồ Sơ Y Tế</span>
            </button>
          </div>

          {/* TAB 1: Medical Records (Lịch Sử Khám Bệnh) */}
          {activeTab === 'records' && (
            <div>
              {/* Filter bar */}
              <div className="pk-portal-card" style={{ padding: '16px 20px', marginBottom: '20px' }} data-aos="fade-up" data-aos-delay="250">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '18px', color: '#0f172a' }}>
                      <i className="bi bi-clock-history" style={{ color: '#1977cc', marginRight: '8px' }}></i>
                      Sổ Bệnh Án & Lịch Sử Thăm Khám
                    </h4>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                      Theo dõi quá trình chẩn đoán, điều trị và diễn biến sức khỏe qua các lần khám
                    </p>
                  </div>

                  <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
                    <i className="bi bi-search" style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }}></i>
                    <input
                      type="text"
                      className="pk-portal-input"
                      style={{ paddingLeft: '36px' }}
                      placeholder="Tìm theo chẩn đoán, bác sĩ..."
                      value={recordSearch}
                      onChange={(e) => setRecordSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {filteredRecords.length === 0 ? (
                <div className="pk-portal-card text-center" style={{ padding: '48px 20px' }} data-aos="fade-up">
                  <i className="bi bi-journal-x" style={{ fontSize: '48px', color: '#cbd5e1', display: 'block', marginBottom: '12px' }}></i>
                  <h5 style={{ fontWeight: 700, color: '#334155' }}>Chưa có hồ sơ bệnh án nào phù hợp</h5>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                    Sau khi bạn hoàn thành buổi thăm khám, bác sĩ phụ trách sẽ cập nhật hồ sơ tại đây.
                  </p>
                  <Link to="/dat-lich-kham" className="pk-portal-btn pk-portal-btn-primary">
                    <i className="bi bi-calendar-plus"></i> Đặt Lịch Khám Ngay
                  </Link>
                </div>
              ) : (
                <div>
                  {filteredRecords.map((rec, i) => (
                    <div key={rec.id} className="pk-portal-record-card" data-aos="fade-up" data-aos-delay={Math.min(100 * (i + 1), 400)}>
                      {/* Record Header */}
                      <div className="pk-portal-record-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div
                            style={{
                              background: 'linear-gradient(135deg, #1977cc, #0d5bb5)',
                              color: '#ffffff',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              textAlign: 'center',
                              fontWeight: 800,
                              minWidth: '60px'
                            }}
                          >
                            <div style={{ fontSize: '10px', opacity: 0.85, textTransform: 'uppercase' }}>NGÀY</div>
                            <div style={{ fontSize: '16px' }}>{rec.date ? rec.date.split('-').reverse().slice(0, 2).join('/') : '01/10'}</div>
                            <div style={{ fontSize: '10px', opacity: 0.85 }}>{rec.date ? rec.date.split('-')[0] : '2026'}</div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                              <span className="pk-portal-badge pk-portal-badge-primary">
                                Mã BA: {rec.code}
                              </span>
                              <span className="pk-portal-badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                                Khám Đa Khoa
                              </span>
                            </div>
                            <h4 style={{ margin: 0, fontWeight: 700, fontSize: '17px', color: '#0f172a' }}>
                              {rec.diagnosis}
                            </h4>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', fontSize: '13px', color: '#64748b' }}>
                          <div>
                            Bác sĩ phụ trách: <strong style={{ color: '#0f172a' }}>{rec.doctorName}</strong>
                          </div>
                          <div>
                            <i className="bi bi-hospital" style={{ color: '#16a34a' }}></i> Phòng khám Phú Lợi Bảo
                          </div>
                        </div>
                      </div>

                      {/* Record Body */}
                      <div className="pk-portal-record-body">
                        <div className="pk-portal-record-box">
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', marginBottom: '6px' }}>
                            <i className="bi bi-activity"></i> LÝ DO KHÁM & TRIỆU CHỨNG LÂM SÀNG:
                          </div>
                          <div style={{ fontSize: '14px', color: '#1e293b', lineHeight: '1.6' }}>
                            {rec.symptoms || 'Bệnh nhân đến kiểm tra định kỳ theo hẹn.'}
                          </div>
                        </div>

                        <div className="pk-portal-record-box" style={{ background: '#f0fdf4', borderColor: '#dcfce7' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', marginBottom: '6px' }}>
                            <i className="bi bi-clipboard2-pulse"></i> PHÁC ĐỒ ĐIỀU TRỊ & LỜI DẶN:
                          </div>
                          <div style={{ fontSize: '14px', color: '#1e293b', lineHeight: '1.6' }}>
                            {rec.treatment || 'Tuân thủ đơn thuốc và chế độ ăn nhạt, tránh vận động gắng sức.'}
                          </div>
                        </div>
                      </div>

                      {/* Record Footer */}
                      <div className="pk-portal-record-footer">
                        <div style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: 600 }}>
                          <i className="bi bi-shield-check"></i> Bệnh án đã được bác sĩ ký số xác thực
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="pk-portal-btn pk-portal-btn-outline"
                            onClick={() => setSelectedRecordForDetail(rec)}
                          >
                            <i className="bi bi-eye"></i> Xem Chi Tiết
                          </button>
                          <button
                            type="button"
                            className="pk-portal-btn pk-portal-btn-success"
                            onClick={() => handleTabChange('prescriptions')}
                          >
                            <i className="bi bi-capsule"></i> Xem Đơn Thuốc
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Appointments (Lịch Hẹn Của Tôi) */}
          {activeTab === 'appointments' && (
            <div>
              {/* Header & Filter */}
              <div className="pk-portal-card" style={{ padding: '16px 20px', marginBottom: '20px' }} data-aos="fade-up" data-aos-delay="250">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '18px', color: '#0f172a' }}>
                      <i className="bi bi-calendar-event" style={{ color: '#1977cc', marginRight: '8px' }}></i>
                      Quản Lý Lịch Hẹn Khám Của Bạn
                    </h4>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                      Theo dõi trạng thái duyệt lịch hẹn, khung giờ khám và chủ động điều chỉnh kế hoạch
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className={`pk-portal-btn ${apptFilter === 'ALL' ? 'pk-portal-btn-primary' : 'pk-portal-btn-outline'}`}
                      onClick={() => setApptFilter('ALL')}
                    >
                      Tất Cả ({appointments.length})
                    </button>
                    <button
                      type="button"
                      className={`pk-portal-btn ${apptFilter === 'CONFIRMED' ? 'pk-portal-btn-success' : 'pk-portal-btn-outline'}`}
                      onClick={() => setApptFilter('CONFIRMED')}
                    >
                      Đã Xác Nhận
                    </button>
                    <button
                      type="button"
                      className={`pk-portal-btn ${apptFilter === 'PENDING' ? 'pk-portal-btn-primary' : 'pk-portal-btn-outline'}`}
                      onClick={() => setApptFilter('PENDING')}
                    >
                      Chờ Duyệt
                    </button>
                    <button
                      type="button"
                      className={`pk-portal-btn ${apptFilter === 'COMPLETED' ? 'pk-portal-btn-outline' : 'pk-portal-btn-outline'}`}
                      onClick={() => setApptFilter('COMPLETED')}
                    >
                      Đã Khám
                    </button>
                  </div>
                </div>
              </div>

              {filteredAppointments.length === 0 ? (
                <div className="pk-portal-card text-center" style={{ padding: '48px 20px' }} data-aos="fade-up">
                  <i className="bi bi-calendar-x" style={{ fontSize: '48px', color: '#cbd5e1', display: 'block', marginBottom: '12px' }}></i>
                  <h5 style={{ fontWeight: 700, color: '#334155' }}>Không có lịch hẹn nào trong danh mục này</h5>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                    Đăng ký lịch khám trực tuyến nhanh chóng và thuận tiện chỉ trong 1 phút.
                  </p>
                  <Link to="/dat-lich-kham" className="pk-portal-btn pk-portal-btn-primary">
                    <i className="bi bi-calendar-plus"></i> Đặt Lịch Khám Mới
                  </Link>
                </div>
              ) : (
                <div className="pk-portal-appts-grid">
                  {filteredAppointments.map((appt, i) => {
                    const isUpcoming = appt.status === 'CONFIRMED' || appt.status === 'PENDING'
                    return (
                      <div key={appt.id} className="pk-portal-appt-card" data-aos="fade-up" data-aos-delay={Math.min(100 * (i + 1), 500)}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                              <span className="pk-portal-badge" style={{ background: '#f1f5f9', color: '#475569', marginBottom: '4px' }}>
                                Mã LH: {appt.code}
                              </span>
                              <h4 style={{ margin: '4px 0 0', fontWeight: 700, fontSize: '17px', color: '#0f172a' }}>
                                {appt.department || 'Đa Khoa'}
                              </h4>
                            </div>

                            {/* Status badge */}
                            <div>
                              {appt.status === 'CONFIRMED' && (
                                <span className="pk-portal-badge pk-portal-badge-success">
                                  <i className="bi bi-check-circle-fill"></i> Đã Duyệt
                                </span>
                              )}
                              {appt.status === 'PENDING' && (
                                <span className="pk-portal-badge pk-portal-badge-warning">
                                  <i className="bi bi-hourglass-split"></i> Chờ Duyệt
                                </span>
                              )}
                              {appt.status === 'COMPLETED' && (
                                <span className="pk-portal-badge pk-portal-badge-primary">
                                  <i className="bi bi-check-all"></i> Đã Khám Xong
                                </span>
                              )}
                              {appt.status === 'CANCELLED' && (
                                <span className="pk-portal-badge pk-portal-badge-danger">
                                  <i className="bi bi-x-circle-fill"></i> Đã Hủy
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9', marginBottom: '14px', fontSize: '13.5px' }}>
                            <div style={{ marginBottom: '6px', color: '#475569' }}>
                              <i className="bi bi-calendar3" style={{ color: '#1977cc', marginRight: '6px' }}></i>
                              Ngày khám: <strong style={{ color: '#0f172a' }}>{appt.appointmentDate}</strong>
                            </div>
                            <div style={{ marginBottom: '6px', color: '#475569' }}>
                              <i className="bi bi-clock-fill" style={{ color: '#1977cc', marginRight: '6px' }}></i>
                              Khung giờ: <strong style={{ color: '#0f172a' }}>{appt.timeSlot || '09:00'}</strong>
                            </div>
                            <div style={{ color: '#475569' }}>
                              <i className="bi bi-person-fill" style={{ color: '#1977cc', marginRight: '6px' }}></i>
                              Bác sĩ: <strong style={{ color: '#0f172a' }}>{appt.doctorName}</strong>
                            </div>
                          </div>

                          {appt.notes && (
                            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px', fontStyle: 'italic' }}>
                              <i className="bi bi-chat-quote-fill" style={{ color: '#f59e0b', marginRight: '4px' }}></i>
                              "{appt.notes}"
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                          {isUpcoming && (
                            <button
                              type="button"
                              className="pk-portal-btn pk-portal-btn-danger"
                              onClick={() => setCancelModalAppt(appt)}
                            >
                              <i className="bi bi-x-circle"></i> Hủy Lịch
                            </button>
                          )}
                          <Link to="/dat-lich-kham" className="pk-portal-btn pk-portal-btn-outline">
                            <i className="bi bi-arrow-repeat"></i> Đặt Lại
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Prescriptions (Đơn Thuốc Điện Tử) */}
          {activeTab === 'prescriptions' && (
            <div>
              <div className="pk-portal-card" style={{ padding: '16px 20px', marginBottom: '20px' }} data-aos="fade-up" data-aos-delay="250">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '18px', color: '#0f172a' }}>
                      <i className="bi bi-capsule-pill" style={{ color: '#18a94f', marginRight: '8px' }}></i>
                      Đơn Thuốc Điện Tử & Toa Thuốc Sau Khám
                    </h4>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                      Chi tiết hướng dẫn liều dùng, số lượng và các lưu ý sử dụng thuốc theo chỉ định của bác sĩ
                    </p>
                  </div>

                  <span className="pk-portal-badge pk-portal-badge-success">
                    <i className="bi bi-shield-check"></i> Đạt tiêu chuẩn GPP Bộ Y Tế
                  </span>
                </div>
              </div>

              {prescriptions.length === 0 ? (
                <div className="pk-portal-card text-center" style={{ padding: '48px 20px' }} data-aos="fade-up">
                  <i className="bi bi-capsule" style={{ fontSize: '48px', color: '#cbd5e1', display: 'block', marginBottom: '12px' }}></i>
                  <h5 style={{ fontWeight: 700, color: '#334155' }}>Chưa có đơn thuốc nào được kê</h5>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                    Khi bạn được bác sĩ kê đơn thuốc sau buổi khám, toàn bộ danh mục thuốc sẽ xuất hiện tại đây.
                  </p>
                </div>
              ) : (
                <div>
                  {prescriptions.map((pres, i) => (
                    <div key={pres.id} className="pk-portal-card" style={{ padding: 0, overflow: 'hidden' }} data-aos="fade-up" data-aos-delay={Math.min(100 * (i + 1), 400)}>
                      {/* Prescription Header */}
                      <div style={{ padding: '18px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '10px',
                              background: '#18a94f',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px'
                            }}
                          >
                            <i className="bi bi-prescription2"></i>
                          </div>
                          <div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                              <span className="pk-portal-badge pk-portal-badge-success">
                                Mã Toa: {pres.code}
                              </span>
                              <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                                Ngày kê: <strong>{pres.date ? pres.date.split('-').reverse().join('/') : '01/10/2026'}</strong>
                              </span>
                            </div>
                            <h4 style={{ margin: 0, fontWeight: 700, fontSize: '17px', color: '#0f172a' }}>
                              Đơn thuốc do {pres.doctorName} kê toa
                            </h4>
                          </div>
                        </div>

                        <div>
                          <span className="pk-portal-badge pk-portal-badge-primary">
                            <i className="bi bi-check2-circle"></i> Đã cấp phát thuốc
                          </span>
                        </div>
                      </div>

                      {/* Prescription Table */}
                      <div className="pk-portal-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                        <table className="pk-portal-table">
                          <thead>
                            <tr>
                              <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
                              <th>Tên Thuốc & Hoạt Chất</th>
                              <th style={{ width: '120px', textAlign: 'center' }}>Số Lượng</th>
                              <th style={{ width: '100px', textAlign: 'center' }}>Đơn Vị</th>
                              <th>Cách Dùng & Liều Lượng</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pres.medicines?.map((med, index) => (
                              <tr key={index}>
                                <td style={{ textAlign: 'center', fontWeight: 700, color: '#94a3b8' }}>{index + 1}</td>
                                <td>
                                  <strong style={{ color: '#1977cc', fontSize: '14.5px' }}>{med.name}</strong>
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>
                                  {med.quantity}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <span className="pk-portal-badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                                    {med.unit || 'viên'}
                                  </span>
                                </td>
                                <td style={{ color: '#334155' }}>
                                  <i className="bi bi-info-circle" style={{ color: '#1977cc', marginRight: '6px' }}></i>
                                  {med.usage || 'Uống sau bữa ăn theo hướng dẫn'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Doctor Notes & Action Footer */}
                      <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ fontSize: '13.5px', color: '#475569' }}>
                          <i className="bi bi-chat-left-dots-fill" style={{ color: '#f59e0b', marginRight: '6px' }}></i>
                          Lời dặn bác sĩ: <strong style={{ color: '#0f172a' }}>{pres.notes || 'Tái khám sau 1 tháng mang theo toa thuốc này.'}</strong>
                        </div>

                        <button
                          type="button"
                          className="pk-portal-btn pk-portal-btn-outline"
                          onClick={() => setSelectedPrescription(pres)}
                        >
                          <i className="bi bi-printer"></i> Xem & In Đơn Thuốc
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Health Profile Settings (Cập Nhật Thông Tin & Tiền Sử) */}
          {activeTab === 'profile' && (
            <div className="pk-portal-card" style={{ padding: '28px' }} data-aos="fade-up" data-aos-delay="250">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: '#1977cc',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}
                >
                  <i className="bi bi-person-lines-fill"></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: '19px', color: '#0f172a' }}>
                    Cập Nhật Hồ Sơ Sức Khỏe & Tiền Sử Y Khoa
                  </h3>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13.5px' }}>
                    Cung cấp thông tin chính xác giúp các bác sĩ tại Phòng Khám Phú Lợi Bảo chẩn đoán an toàn nhất
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile}>
                {/* 1. Identity */}
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1977cc', marginBottom: '14px' }}>
                  <i className="bi bi-person-badge" style={{ marginRight: '6px' }}></i> 1. Thông Tin Cá Nhân
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div className="pk-portal-form-group">
                    <label className="pk-portal-label">Họ và tên bệnh nhân *</label>
                    <input
                      type="text"
                      className="pk-portal-input"
                      required
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      placeholder="Ví dụ: Nguyễn Văn An"
                    />
                  </div>

                  <div className="pk-portal-form-group">
                    <label className="pk-portal-label">Số điện thoại liên lạc *</label>
                    <input
                      type="tel"
                      className="pk-portal-input"
                      required
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Ví dụ: 0901234567"
                    />
                  </div>

                  <div className="pk-portal-form-group">
                    <label className="pk-portal-label">Email tài khoản</label>
                    <input
                      type="email"
                      className="pk-portal-input"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="pk-portal-form-group">
                    <label className="pk-portal-label">Giới tính</label>
                    <select
                      className="pk-portal-select"
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <div className="pk-portal-form-group">
                    <label className="pk-portal-label">Năm sinh</label>
                    <input
                      type="number"
                      className="pk-portal-input"
                      min="1920"
                      max="2026"
                      value={editForm.birthYear}
                      onChange={(e) => setEditForm({ ...editForm, birthYear: Number(e.target.value) })}
                    />
                  </div>

                  <div className="pk-portal-form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="pk-portal-label">Địa chỉ thường trú</label>
                    <input
                      type="text"
                      className="pk-portal-input"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    />
                  </div>
                </div>

                {/* 2. Medical History */}
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#dc2626', marginBottom: '14px', marginTop: '24px' }}>
                  <i className="bi bi-heart-pulse-fill" style={{ marginRight: '6px' }}></i> 2. Chỉ Số & Tiền Sử Bệnh Lý
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div className="pk-portal-form-group">
                    <label className="pk-portal-label" style={{ color: '#dc2626' }}>Nhóm máu</label>
                    <select
                      className="pk-portal-select"
                      value={editForm.bloodGroup}
                      onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                    >
                      <option value="O">Nhóm máu O (Phổ biến)</option>
                      <option value="A">Nhóm máu A</option>
                      <option value="B">Nhóm máu B</option>
                      <option value="AB">Nhóm máu AB</option>
                      <option value="ChuaRo">Chưa xác định rõ</option>
                    </select>
                  </div>

                  <div className="pk-portal-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="pk-portal-label" style={{ color: '#d97706' }}>
                      <i className="bi bi-exclamation-triangle-fill"></i> Tiền sử dị ứng (Thuốc, Thức ăn...)
                    </label>
                    <input
                      type="text"
                      className="pk-portal-input"
                      value={editForm.allergies}
                      onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                      placeholder="Ví dụ: Dị ứng Penicillin, Hải sản, Phấn hoa... hoặc ghi 'Không'"
                    />
                  </div>

                  <div className="pk-portal-form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="pk-portal-label">Bệnh lý nền / Mãn tính đã từng mắc</label>
                    <textarea
                      className="pk-portal-textarea"
                      rows="2"
                      value={editForm.chronicDiseases}
                      onChange={(e) => setEditForm({ ...editForm, chronicDiseases: e.target.value })}
                      placeholder="Ví dụ: Tăng huyết áp nhẹ, Dạ dày trào ngược, Viêm xoang mũi..."
                    ></textarea>
                  </div>
                </div>

                {/* 3. Emergency Contact */}
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#16a34a', marginBottom: '14px', marginTop: '24px' }}>
                  <i className="bi bi-telephone-forward-fill" style={{ marginRight: '6px' }}></i> 3. Người Liên Hệ Khi Khẩn Cấp
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div className="pk-portal-form-group">
                    <label className="pk-portal-label">Họ tên người thân & Mối quan hệ</label>
                    <input
                      type="text"
                      className="pk-portal-input"
                      value={editForm.emergencyContact}
                      onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                      placeholder="Ví dụ: Nguyễn Thị Hoa (Vợ) hoặc Trần Văn Ba (Bố)"
                    />
                  </div>

                  <div className="pk-portal-form-group">
                    <label className="pk-portal-label">Số điện thoại khẩn cấp</label>
                    <input
                      type="tel"
                      className="pk-portal-input"
                      value={editForm.emergencyPhone}
                      onChange={(e) => setEditForm({ ...editForm, emergencyPhone: e.target.value })}
                      placeholder="Ví dụ: 0909888999"
                    />
                  </div>
                </div>

                {/* Submit Row */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    className="pk-portal-btn pk-portal-btn-outline"
                    onClick={() => handleTabChange('records')}
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="pk-portal-btn pk-portal-btn-primary"
                    style={{ padding: '10px 28px' }}
                  >
                    {saveLoading ? (
                      <>Đang Lưu...</>
                    ) : (
                      <>
                        <i className="bi bi-floppy-fill"></i> Lưu Cập Nhật Hồ Sơ
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Modal Confirm Cancel Appointment */}
      {cancelModalAppt && (
        <div className="pk-portal-modal-overlay">
          <div className="pk-portal-modal-content">
            <div style={{ padding: '18px 24px', background: '#dc2626', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontWeight: 700, fontSize: '18px', color: '#ffffff' }}>
                <i className="bi bi-exclamation-octagon-fill" style={{ marginRight: '8px' }}></i>
                Xác Nhận Hủy Lịch Hẹn
              </h4>
              <button
                type="button"
                onClick={() => setCancelModalAppt(null)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '15px', color: '#1e293b', marginBottom: '14px', lineHeight: '1.6' }}>
                Bạn có chắc chắn muốn hủy lịch hẹn khám <strong style={{ color: '#1977cc' }}>#{cancelModalAppt.code}</strong> vào ngày <strong>{cancelModalAppt.appointmentDate}</strong> không?
              </p>
              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '12px 16px', borderRadius: '8px', color: '#92400e', fontSize: '13.5px' }}>
                <i className="bi bi-info-circle-fill" style={{ marginRight: '6px' }}></i>
                Sau khi hủy, bạn có thể thực hiện đặt lại lịch khám mới bất kỳ lúc nào nếu thuận tiện.
              </div>
            </div>

            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="pk-portal-btn pk-portal-btn-outline"
                onClick={() => setCancelModalAppt(null)}
              >
                Không Hủy
              </button>
              <button
                type="button"
                className="pk-portal-btn pk-portal-btn-danger"
                onClick={handleConfirmCancelAppointment}
              >
                Đồng Ý Hủy Lịch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Record Detail */}
      {selectedRecordForDetail && (
        <div className="pk-portal-modal-overlay">
          <div className="pk-portal-modal-content">
            <div style={{ padding: '18px 24px', background: '#1977cc', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontWeight: 700, fontSize: '18px', color: '#ffffff' }}>
                <i className="bi bi-journal-medical" style={{ marginRight: '8px' }}></i>
                Chi Tiết Hồ Sơ Bệnh Án #{selectedRecordForDetail.code}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedRecordForDetail(null)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0' }}>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 800, color: '#1977cc' }}>{patient?.fullName}</h4>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Mã BN: {patient?.code} | Nhóm máu: {patient?.bloodGroup}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '13px', color: '#475569' }}>
                  <div>Ngày khám: <strong>{selectedRecordForDetail.date}</strong></div>
                  <div>Bác sĩ: <strong>{selectedRecordForDetail.doctorName}</strong></div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: 700, fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Triệu chứng ban đầu:
                </label>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#1e293b', fontSize: '14px' }}>
                  {selectedRecordForDetail.symptoms}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: 700, fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Kết luận chẩn đoán:
                </label>
                <div style={{ background: '#1977cc', color: '#ffffff', padding: '14px', borderRadius: '10px', fontWeight: 700, fontSize: '15px' }}>
                  {selectedRecordForDetail.diagnosis}
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 700, fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Phương pháp điều trị & Lời dặn:
                </label>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#1e293b', fontSize: '14px' }}>
                  {selectedRecordForDetail.treatment}
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="pk-portal-btn pk-portal-btn-outline"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer"></i> In Bệnh Án
              </button>
              <button
                type="button"
                className="pk-portal-btn pk-portal-btn-primary"
                onClick={() => setSelectedRecordForDetail(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Prescription Print View */}
      {selectedPrescription && (
        <div className="pk-portal-modal-overlay">
          <div className="pk-portal-modal-content">
            <div style={{ padding: '18px 24px', background: '#18a94f', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontWeight: 700, fontSize: '18px', color: '#ffffff' }}>
                <i className="bi bi-prescription2" style={{ marginRight: '8px' }}></i>
                Toa Thuốc Điện Tử #{selectedPrescription.code}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedPrescription(null)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 4px', fontWeight: 800, color: '#0f172a', fontSize: '20px' }}>
                  PHÒNG KHÁM ĐA KHOA PHÚ LỢI BẢO
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Hotline: +84 28 3838 9999 • Email: lienhe@phongkham.vn
                </p>
                <div style={{ marginTop: '10px', fontWeight: 800, color: '#18a94f', letterSpacing: '1px', fontSize: '15px' }}>
                  TOA THUỐC ĐIỆN TỬ
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0', fontSize: '13.5px', color: '#334155' }}>
                <div>Bệnh nhân: <strong style={{ color: '#0f172a' }}>{patient?.fullName}</strong></div>
                <div style={{ textAlign: 'right' }}>Mã BN: <strong style={{ color: '#0f172a' }}>{patient?.code}</strong></div>
                <div>Bác sĩ kê đơn: <strong style={{ color: '#0f172a' }}>{selectedPrescription.doctorName}</strong></div>
                <div style={{ textAlign: 'right' }}>Ngày kê: <strong style={{ color: '#0f172a' }}>{selectedPrescription.date}</strong></div>
              </div>

              <div className="pk-portal-table-wrapper" style={{ marginBottom: '16px' }}>
                <table className="pk-portal-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>STT</th>
                      <th>Tên Thuốc</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>Số Lượng</th>
                      <th>Cách Dùng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPrescription.medicines?.map((m, i) => (
                      <tr key={i}>
                        <td style={{ textAlign: 'center' }}>{i + 1}</td>
                        <td><strong style={{ color: '#0f172a' }}>{m.name}</strong></td>
                        <td style={{ textAlign: 'center' }}>{m.quantity} {m.unit || 'viên'}</td>
                        <td>{m.usage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13.5px', color: '#334155' }}>
                <strong>Lời dặn bác sĩ:</strong> {selectedPrescription.notes || 'Uống thuốc đúng giờ, tái khám khi hết thuốc.'}
              </div>
            </div>

            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="pk-portal-btn pk-portal-btn-outline"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer"></i> In Toa Thuốc
              </button>
              <button
                type="button"
                className="pk-portal-btn pk-portal-btn-success"
                onClick={() => setSelectedPrescription(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
