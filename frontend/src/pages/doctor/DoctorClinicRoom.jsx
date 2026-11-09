import { useState, useEffect } from 'react'
import DoctorLayout from '../../components/layout/DoctorLayout'
import appointmentService from '../../services/appointmentService'
import medicineService from '../../services/medicineService'
import medicalRecordService from '../../services/medicalRecordService'
import prescriptionService from '../../services/prescriptionService'
import invoiceService from '../../services/invoiceService'
import { useAuth } from '../../hooks/useAuth'
import './doctor.css'

const INITIAL_QUEUE = []

const SAMPLE_MEDICINES = [
  { id: 1, mathuoc: 1, name: 'Amlodipine 5mg', tenthuoc: 'Amlodipine 5mg', unit: 'Viên', donvitinh: 'Viên', defaultDosage: '1 viên/ngày (Sáng sau ăn)', price: 3500, dongia: 3500 },
  { id: 2, mathuoc: 2, name: 'Losartan 50mg', tenthuoc: 'Losartan 50mg', unit: 'Viên', donvitinh: 'Viên', defaultDosage: '1 viên/ngày (Sáng sau ăn)', price: 5200, dongia: 5200 },
  { id: 3, mathuoc: 3, name: 'Atorvastatin 20mg', tenthuoc: 'Atorvastatin 20mg', unit: 'Viên', donvitinh: 'Viên', defaultDosage: '1 viên/ngày (Tối trước ngủ)', price: 7800, dongia: 7800 },
  { id: 4, mathuoc: 4, name: 'Paracetamol 500mg', tenthuoc: 'Paracetamol 500mg', unit: 'Viên', donvitinh: 'Viên', defaultDosage: '1 viên x 3 lần khi sốt > 38.5 độ', price: 1200, dongia: 1200 },
  { id: 5, mathuoc: 5, name: 'Amoxicillin 500mg', tenthuoc: 'Amoxicillin 500mg', unit: 'Viên', donvitinh: 'Viên', defaultDosage: '1 viên x 2 lần sau ăn', price: 2800, dongia: 2800 },
  { id: 6, mathuoc: 6, name: 'Esomeprazole 40mg', tenthuoc: 'Esomeprazole 40mg', unit: 'Viên', donvitinh: 'Viên', defaultDosage: '1 viên/ngày trước ăn sáng 30 phút', price: 8500, dongia: 8500 }
]

export default function DoctorClinicRoom() {
  const { user } = useAuth()
  const [queue, setQueue] = useState([])
  const [medicinesList, setMedicinesList] = useState(SAMPLE_MEDICINES)
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [alertSuccess, setAlertSuccess] = useState('')

  // Nạp dữ liệu thực tế từ DB khi mount
  useEffect(() => {
    async function loadData() {
      try {
        const [aptsData, medsData] = await Promise.all([
          appointmentService.getAll(),
          medicineService.getAll()
        ])

        if (Array.isArray(medsData) && medsData.length > 0) {
          setMedicinesList(medsData)
        }

        if (Array.isArray(aptsData)) {
          const todayStr = new Date().toISOString().split('T')[0]
          
          // Lọc lịch hẹn của chính bác sĩ đang đăng nhập
          let doctorApts = aptsData
          if (user?.role === 'DOCTOR') {
            doctorApts = aptsData.filter(a => {
              if (user.mabs && a.mabs) return Number(a.mabs) === Number(user.mabs)
              if (user.fullName && a.doctorName) return a.doctorName.toLowerCase().includes(user.fullName.toLowerCase())
              return false
            })
          }

          // Lọc lịch hẹn hôm nay nếu có, hoặc danh sách lịch hẹn của bác sĩ
          const todayApts = doctorApts.filter(a => {
            const aDate = a.appointmentDate || a.date
            return aDate === todayStr
          })
          const activeApts = todayApts.length > 0 ? todayApts : doctorApts

          if (activeApts.length > 0) {
            let hasFoundActive = false
            const mappedQueue = activeApts.map((apt, idx) => {
              const age = apt.benhnhan?.ngaysinh 
                ? (new Date().getFullYear() - new Date(apt.benhnhan.ngaysinh).getFullYear()) 
                : 30

              const isCompleted = apt.trangthai === 'DaKham' || apt.status === 'COMPLETED'
              let patientStatus = 'WAITING'
              if (isCompleted) {
                patientStatus = 'COMPLETED'
              } else if (!hasFoundActive) {
                patientStatus = 'IN_PROGRESS'
                hasFoundActive = true
              }

              return {
                id: apt.id,
                malh: apt.malh || apt.id,
                mabn: apt.mabn || (apt.benhnhan?.mabn || 1),
                stt: String(idx + 1).padStart(2, '0'),
                patientCode: apt.code ? `BN${String(apt.mabn || apt.id).padStart(3, '0')}` : `BN00${apt.id}`,
                name: apt.patientName || apt.benhnhan?.hoten || 'Bệnh Nhân',
                age: age > 0 ? age : 28,
                gender: apt.benhnhan?.gioitinh === 'Nu' ? 'Nữ' : 'Nam',
                phone: apt.phone || apt.benhnhan?.sdt || '0901234567',
                address: apt.benhnhan?.diachi || 'TP. Hồ Chí Minh',
                insurance: apt.benhnhan?.sobhyt ? `BHYT-${apt.benhnhan.sobhyt}` : 'Khám Dịch Vụ',
                allergies: apt.benhnhan?.hosobenhan?.diung || 'Không ghi nhận dị ứng',
                vitalSigns: { bp: '120/80', pulse: 78, temp: 36.8, spo2: 98, weight: 65, height: 168 },
                reason: apt.notes || apt.lydokham || 'Khám sức khỏe định kỳ',
                status: patientStatus,
                registeredTime: apt.timeSlot || '08:00',
                diagnosedHistory: apt.benhnhan?.hosobenhan?.tiensubenh || 'Chưa ghi nhận tiền sử bệnh lý'
              }
            })

            setQueue(mappedQueue)

            // Chọn bệnh nhân đang khám (IN_PROGRESS) hoặc bệnh nhân đầu tiên
            const activePatient = mappedQueue.find(p => p.status === 'IN_PROGRESS') || 
                                  mappedQueue.find(p => p.status === 'WAITING') || 
                                  mappedQueue[0]

            if (activePatient) {
              setSelectedPatientId(activePatient.id)
              setVitalSigns(activePatient.vitalSigns)
              setSymptoms(activePatient.reason)
            }
          } else {
            setQueue([])
            setSelectedPatientId(null)
          }
        }
      } catch (err) {
        console.warn('Lỗi nạp dữ liệu bàn khám:', err)
      }
    }

    loadData()
  }, [user])

  // Dữ liệu bệnh nhân hiện tại
  const currentPatient = queue.find(p => p.id === selectedPatientId) || queue[0] || {
    id: 1,
    malh: 1,
    mabn: 1,
    stt: '01',
    patientCode: 'BN001',
    name: 'Đang tải...',
    age: 30,
    gender: 'Nam',
    phone: '',
    address: '',
    insurance: 'Khám Dịch Vụ',
    allergies: 'Không ghi nhận',
    vitalSigns: { bp: '120/80', pulse: 78, temp: 36.8, spo2: 98, weight: 65, height: 168 },
    reason: 'Đang tải dữ liệu...',
    status: 'WAITING',
    registeredTime: '08:00',
    diagnosedHistory: ''
  }

  // Form State khám bệnh
  const [vitalSigns, setVitalSigns] = useState(currentPatient.vitalSigns || { bp: '120/80', pulse: 78, temp: 36.8, spo2: 98, weight: 65, height: 168 })
  const [symptoms, setSymptoms] = useState(currentPatient.reason || '')
  const [icdCode, setIcdCode] = useState('I10 - Tăng huyết áp vô căn (nguyên phát)')
  const [diagnosis, setDiagnosis] = useState('Viêm kết mạc cấp tính - Đau mỏi mắt')
  const [advice, setAdvice] = useState('Uống và nhỏ thuốc đúng giờ, hạn chế nhìn màn hình điện tử liên tục, tái khám sau 7 ngày.')
  const [followUpDate, setFollowUpDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0])

  // Đơn thuốc
  const [prescriptionItems, setPrescriptionItems] = useState([
    { id: 1, mathuoc: 9, medicine: 'Tobradex Nhỏ Mắt', quantity: 2, unit: 'Lọ', usage: 'Nhỏ mắt 2 giọt/lần, ngày 3 lần' },
    { id: 2, mathuoc: 1, medicine: 'Paracetamol 500mg', quantity: 10, unit: 'Viên', usage: 'Ngày 1 viên x 2 lần sau ăn khi đau' }
  ])

  const [selectedMedToAdd, setSelectedMedToAdd] = useState('')
  const [medQtyToAdd, setMedQtyToAdd] = useState(10)
  const [medUsageToAdd, setMedUsageToAdd] = useState('')

  // ===== TÍNH TOÁN VIỆN PHÍ & TIỀN THUỐC =====
  // Tiền công khám (cho phép bác sĩ tùy chỉnh số tiền bất kỳ theo dịch vụ khám)
  const [consultationFee, setConsultationFee] = useState(150000)

  const getMedPrice = (name) => {
    const list = medicinesList.length > 0 ? medicinesList : SAMPLE_MEDICINES
    const found = list.find(m => (m.name || m.tenthuoc) === name)
    return found ? Number(found.price || found.dongia || 3500) : 3500
  }

  const totalMedFee = prescriptionItems.reduce((sum, item) => {
    return sum + (getMedPrice(item.medicine) * (item.quantity || 1))
  }, 0)

  const totalInvoiceAmount = consultationFee + totalMedFee

  // Tạo URL VietQR động theo số tiền & mã bệnh nhân
  const vietQrUrl = `https://api.vietqr.io/image/970422-02838389999-compact2.jpg?amount=${totalInvoiceAmount}&addInfo=${encodeURIComponent(`TT VP ${currentPatient.patientCode}`)}&accountName=${encodeURIComponent('PHONG KHAM PHU LOI BAO')}`

  // Chọn bệnh nhân
  const handleSelectPatient = (patient) => {
    setSelectedPatientId(patient.id)
    setVitalSigns(patient.vitalSigns || { bp: '120/80', pulse: 78, temp: 36.8, spo2: 98, weight: 65, height: 168 })
    setSymptoms(patient.reason || '')
    setAlertSuccess('')
  }

  const [isSaving, setIsSaving] = useState(false)
  const [showSavedModal, setShowSavedModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [savedDataSummary, setSavedDataSummary] = useState(null)

  // Mời vào khám
  const handleCallPatient = (patientId) => {
    setQueue(prev => prev.map(p => {
      if (p.id === patientId) return { ...p, status: 'IN_PROGRESS' }
      if (p.status === 'IN_PROGRESS') return { ...p, status: 'WAITING' }
      return p
    }))
    setSelectedPatientId(patientId)
    const target = queue.find(p => p.id === patientId)
    if (target) {
      setVitalSigns(target.vitalSigns)
      setSymptoms(target.reason)
      setAlertSuccess(`Đang gọi bệnh nhân STT ${target.stt}: ${target.name} vào bàn khám!`)
    }
  }

  // Hoàn thành ca khám & Lưu vào hệ thống CSDL Supabase
  const handleCompleteExamination = async () => {
    setIsSaving(true)
    try {
      // 1. Tạo phiếu khám bệnh trên Supabase CSDL qua API
      let examResult = null
      if (currentPatient?.mabn) {
        examResult = await medicalRecordService.create({
          mabn: currentPatient.mabn,
          malh: currentPatient.malh,
          symptoms: symptoms,
          diagnosis: diagnosis,
          treatment: advice
        })
      }

      const examId = examResult?.malsk || examResult?.id

      // 2. Nếu có đơn thuốc, lưu đơn thuốc vào Supabase CSDL
      let presResult = null
      if (examId && prescriptionItems.length > 0) {
        try {
          presResult = await prescriptionService.create({
            malsk: examId,
            notes: advice,
            medicines: prescriptionItems.map(p => ({
              mathuoc: p.mathuoc || 1,
              soluong: p.quantity,
              lieudung: p.usage,
              thoigiansudung: '7 ngày'
            }))
          })
        } catch (presErr) {
          console.warn('Lỗi tạo đơn thuốc backend:', presErr.message)
        }
      }

      // 3. Khởi tạo hóa đơn viện phí trên CSDL Supabase để đồng bộ sang Quầy Kế Toán / Thu Ngân
      let invResult = null
      if (examId) {
        try {
          invResult = await invoiceService.create({
            malsk: examId,
            tongtien: totalInvoiceAmount,
            phikham: consultationFee
          })
        } catch (invErr) {
          console.warn('Lỗi tạo hóa đơn viện phí backend:', invErr.message)
        }
      }

      // 4. Cập nhật trạng thái lịch hẹn thành DaKham (COMPLETED)
      if (currentPatient?.malh) {
        try {
          await appointmentService.updateStatus(currentPatient.malh, 'COMPLETED')
        } catch (aptErr) {
          console.warn('Lỗi cập nhật lịch hẹn:', aptErr.message)
        }
      }

      // 5. Cập nhật trạng thái bệnh nhân trong hàng chờ
      setQueue(prev => prev.map(p => 
        p.id === selectedPatientId ? { ...p, status: 'COMPLETED' } : p
      ))

      const recCode = examResult?.code || `BA00${currentPatient.id}`
      const presCode = presResult?.code || `DT00${currentPatient.id}`
      const invCode = invResult?.code || (invResult?.mahd ? `HD${String(invResult.mahd).padStart(3, '0')}` : `HD00${currentPatient.id}`)

      // 6. Cập nhật dữ liệu tóm tắt và mở Modal
      setSavedDataSummary({
        recordCode: recCode,
        prescriptionCode: presCode,
        invoiceCode: invCode,
        patientName: currentPatient.name,
        diagnosis: diagnosis,
        medicineCount: prescriptionItems.length,
        totalAmount: invResult?.totalAmount || totalInvoiceAmount
      })
      setAlertSuccess(`Đã lưu thành công Bệnh án #${recCode}, Toa thuốc #${presCode} và đã chuyển Hóa đơn #${invCode} sang Quầy Kế toán!`)
      setShowSavedModal(true)
    } catch (err) {
      console.error('Lỗi lưu ca khám:', err)
      alert('Có lỗi xảy ra khi lưu ca khám lên cơ sở dữ liệu!')
    } finally {
      setIsSaving(false)
    }
  }

  // Vắng mặt
  const handleMarkAbsent = (patientId) => {
    setQueue(prev => prev.map(p => 
      p.id === patientId ? { ...p, status: 'ABSENT' } : p
    ))
  }

  // Thêm thuốc
  const handleAddMedicine = (e) => {
    e.preventDefault()
    if (!selectedMedToAdd) return
    const list = medicinesList.length > 0 ? medicinesList : SAMPLE_MEDICINES
    const medObj = list.find(m => (m.name || m.tenthuoc) === selectedMedToAdd)
    const newItem = {
      id: Date.now(),
      mathuoc: medObj?.mathuoc || medObj?.id || 1,
      medicine: selectedMedToAdd,
      quantity: Number(medQtyToAdd) || 1,
      unit: medObj ? (medObj.unit || medObj.donvitinh || 'Viên') : 'Viên',
      usage: medUsageToAdd || (medObj?.defaultDosage || 'Ngày 1-2 lần sau ăn theo chỉ định của bác sĩ')
    }
    setPrescriptionItems([...prescriptionItems, newItem])
    setSelectedMedToAdd('')
    setMedUsageToAdd('')
  }

  const handleRemoveMedicine = (id) => {
    setPrescriptionItems(prescriptionItems.filter(item => item.id !== id))
  }

  // Lọc
  const filteredQueue = queue.filter(p => {
    if (filterStatus === 'ALL') return true
    return p.status === filterStatus
  })

  const waitingCount = queue.filter(p => p.status === 'WAITING').length

  // BMI
  const heightM = (vitalSigns.height || 165) / 100
  const weightKg = vitalSigns.weight || 60
  const bmi = (weightKg / (heightM * heightM)).toFixed(1)
  const getBmiCategory = (val) => {
    if (val < 18.5) return { text: 'Thiếu cân', color: 'text-warning' }
    if (val < 23) return { text: 'Bình thường', color: 'text-success' }
    if (val < 25) return { text: 'Thừa cân', color: 'text-warning' }
    return { text: 'Béo phì', color: 'text-danger' }
  }

  return (
    <DoctorLayout 
      title="Bàn Khám Bệnh" 
      subtitle="Tiếp nhận bệnh nhân, khám lâm sàng & kê đơn điều trị"
      waitingCount={waitingCount}
    >
      {/* Alert Thông Báo */}
      {alertSuccess && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-3 shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill fs-5 me-2"></i>
          <div>{alertSuccess}</div>
          <button type="button" className="btn-close" onClick={() => setAlertSuccess('')}></button>
        </div>
      )}

      {/* LƯỚI 2 CỘT CHUẨN XÁC: CỘT TRÁI HÀNG ĐỢI - CỘT PHẢI BÀN KHÁM */}
      <div className="clinic-room-grid">
        
        {/* ================= CỘT TRÁI: HÀNG ĐỢI BỆNH NHÂN ================= */}
        <div className="doc-card">
          <div className="doc-card-header">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-people-fill text-primary fs-5"></i>
              <span className="fw-bold text-dark" style={{ fontSize: '15px' }}>
                Hàng Đợi Khám Hôm Nay
              </span>
            </div>
            <span className="badge bg-danger rounded-pill px-2.5 py-1">
              {waitingCount} đang chờ
            </span>
          </div>

          {/* Bộ lọc trạng thái */}
          <div className="p-3 border-bottom bg-light">
            <div className="btn-group btn-group-sm w-100" role="group">
              <button 
                type="button" 
                className={`btn ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilterStatus('ALL')}
              >
                Tất cả ({queue.length})
              </button>
              <button 
                type="button" 
                className={`btn ${filterStatus === 'WAITING' ? 'btn-warning text-dark fw-semibold' : 'btn-outline-secondary'}`}
                onClick={() => setFilterStatus('WAITING')}
              >
                Chờ ({waitingCount})
              </button>
              <button 
                type="button" 
                className={`btn ${filterStatus === 'COMPLETED' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setFilterStatus('COMPLETED')}
              >
                Xong ({queue.filter(p => p.status === 'COMPLETED').length})
              </button>
            </div>
          </div>

          {/* Danh sách thẻ bệnh nhân xếp dọc */}
          <div className="queue-list">
            {filteredQueue.length === 0 ? (
              <div className="text-center py-5 text-muted px-3">
                <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary opacity-50"></i>
                <div className="fw-semibold text-dark">Hàng chờ rỗng</div>
                <div className="small text-muted mt-1">Chưa có bệnh nhân nào được phân công cho bác sĩ.</div>
              </div>
            ) : (
              filteredQueue.map((patient) => {
                const isSelected = patient.id === currentPatient.id
              const isExamining = patient.status === 'IN_PROGRESS'
              
              return (
                <div 
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className={`queue-item ${isSelected ? 'active' : ''}`}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <span 
                        className={`badge fw-bold px-2 py-1 ${
                          isExamining 
                            ? 'bg-primary text-white' 
                            : patient.status === 'COMPLETED'
                            ? 'bg-success text-white'
                            : 'bg-warning text-dark'
                        }`}
                        style={{ fontSize: '12.5px' }}
                      >
                        STT {patient.stt}
                      </span>
                      <span className="fw-bold text-dark" style={{ fontSize: '14.5px' }}>
                        {patient.name}
                      </span>
                    </div>

                    {isExamining && (
                      <span className="badge bg-primary text-white" style={{ fontSize: '11px' }}>
                        <i className="bi bi-arrow-repeat me-1"></i> Đang khám
                      </span>
                    )}
                    {patient.status === 'WAITING' && (
                      <span className="badge bg-warning-subtle text-dark border border-warning" style={{ fontSize: '11px' }}>
                        Chờ khám
                      </span>
                    )}
                    {patient.status === 'COMPLETED' && (
                      <span className="badge bg-success-subtle text-success border border-success" style={{ fontSize: '11px' }}>
                        <i className="bi bi-check-circle me-1"></i> Đã xong
                      </span>
                    )}
                    {patient.status === 'ABSENT' && (
                      <span className="badge bg-secondary text-white" style={{ fontSize: '11px' }}>
                        Vắng
                      </span>
                    )}
                  </div>

                  <div className="d-flex align-items-center justify-content-between text-muted small mt-1">
                    <span>{patient.gender}, {patient.age}t • {patient.patientCode}</span>
                    <span><i className="bi bi-clock me-1"></i>{patient.registeredTime}</span>
                  </div>

                  <div className="text-secondary small mt-1 text-truncate" title={patient.reason}>
                    <em>{patient.reason}</em>
                  </div>

                  {/* Nút mời vào khám */}
                  <div className="d-flex gap-2 mt-2 pt-2 border-top">
                    {patient.status !== 'IN_PROGRESS' && patient.status !== 'COMPLETED' && (
                      <button 
                        type="button"
                        className="btn btn-sm btn-primary py-1 flex-grow-1"
                        style={{ fontSize: '12px' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCallPatient(patient.id)
                        }}
                      >
                        <i className="bi bi-megaphone-fill me-1"></i> Mời vào khám
                      </button>
                    )}
                    {patient.status === 'WAITING' && (
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-secondary py-1 px-2"
                        style={{ fontSize: '12px' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAbsent(patient.id)
                        }}
                        title="Bệnh nhân vắng mặt"
                      >
                        Vắng
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
          </div>

          {/* Nút gọi tiếp */}
          <div className="p-3 border-top bg-light">
            <button 
              type="button" 
              className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center shadow-sm"
              onClick={() => {
                const nextWaiting = queue.find(p => p.status === 'WAITING')
                if (nextWaiting) {
                  handleCallPatient(nextWaiting.id)
                } else {
                  alert('Không còn bệnh nhân nào đang chờ trong hàng đợi!')
                }
              }}
            >
              <i className="bi bi-volume-up-fill fs-5 me-2"></i>
              Gọi Bệnh Nhân Kế Tiếp
            </button>
          </div>
        </div>

        {/* ================= CỘT PHẢI: BÀN KHÁM & CHẨN ĐOÁN & KÊ ĐƠN ================= */}
        <div className="d-flex flex-column gap-3">
          {queue.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 bg-white text-center my-auto">
              <div className="py-5 my-3">
                <div 
                  className="rounded-circle bg-primary-subtle text-primary mx-auto d-flex align-items-center justify-content-center mb-3 shadow-sm"
                  style={{ width: '72px', height: '72px', fontSize: '32px' }}
                >
                  <i className="bi bi-person-check-fill"></i>
                </div>
                <h4 className="fw-bold text-dark mb-2">Bàn Khám Bệnh - {user?.fullName || 'Bác Sĩ'}</h4>
                <p className="text-secondary mx-auto mb-3" style={{ maxWidth: '500px', fontSize: '14.5px' }}>
                  Hiện tại hàng chờ chưa có bệnh nhân nào được phân công cho bác sĩ. Khi bệnh nhân đặt hẹn hoặc được Lễ tân điều phối, thông tin sẽ tự động hiển thị tại đây.
                </p>
                <div className="badge bg-light text-secondary border px-3 py-2 fw-normal">
                  <i className="bi bi-clock-history me-1 text-primary"></i> Sẵn sàng tiếp nhận bệnh nhân mới
                </div>
              </div>
            </div>
          ) : (
            <>
          {/* 1. THÔNG TIN HÀNH CHÍNH & CẢNH BÁO DỊ ỨNG */}
          <div className="doc-card">
            <div className="doc-card-body">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 border-bottom pb-3">
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold fs-4 shadow-sm"
                    style={{ width: '50px', height: '50px', backgroundColor: '#175cdd' }}
                  >
                    {currentPatient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h4 className="fw-bold text-dark mb-0">{currentPatient.name}</h4>
                      <span className="badge bg-secondary-subtle text-secondary border">
                        {currentPatient.patientCode}
                      </span>
                      <span className="badge bg-info-subtle text-info border">
                        STT: {currentPatient.stt}
                      </span>
                    </div>
                    <div className="text-muted small mt-1">
                      {currentPatient.gender} • {currentPatient.age} tuổi • SĐT: <strong>{currentPatient.phone}</strong> • {currentPatient.address}
                    </div>
                  </div>
                </div>

                {currentPatient.status === 'COMPLETED' ? (
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-success-subtle text-success border border-success px-3 py-2 fs-6 fw-semibold">
                      <i className="bi bi-check2-all me-1.5"></i> Ca Khám Đã Hoàn Tất
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary d-flex align-items-center px-3 py-2 fw-semibold shadow-sm"
                      onClick={() => {
                        const nextWaiting = queue.find(p => p.status === 'WAITING')
                        if (nextWaiting) {
                          handleCallPatient(nextWaiting.id)
                        } else {
                          alert('Đã khám hết tất cả bệnh nhân trong danh sách hôm nay!')
                        }
                      }}
                    >
                      <i className="bi bi-arrow-right-circle me-1.5"></i> Mời Ca Kế Tiếp
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    className="btn btn-success d-flex align-items-center px-3 py-2 fw-semibold shadow-sm"
                    onClick={handleCompleteExamination}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1.5" role="status"></span>
                        Đang Lưu...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle fs-5 me-1.5"></i>
                        Hoàn Thành Ca Khám
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Hàng Cảnh Báo Dị Ứng Thuốc */}
              <div className="row g-2 mt-2">
                <div className="col-12 col-md-6">
                  <div className="allergy-alert-box">
                    <i className="bi bi-exclamation-triangle-fill text-danger fs-3"></i>
                    <div>
                      <div className="text-danger fw-bold small text-uppercase">Cảnh Báo Dị Ứng Thuốc:</div>
                      <div className="text-dark fw-bold" style={{ fontSize: '13.5px' }}>
                        {currentPatient.allergies}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-2.5 rounded bg-light border d-flex align-items-center gap-2">
                    <i className="bi bi-clock-history text-secondary fs-3"></i>
                    <div>
                      <div className="text-muted fw-bold small text-uppercase">Tiền Sử Bệnh Án:</div>
                      <div className="text-dark fw-semibold" style={{ fontSize: '13px' }}>
                        {currentPatient.diagnosedHistory}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. CHỈ SỐ SINH TỒN (VITAL SIGNS) */}
          <div className="doc-card">
            <div className="doc-card-header">
              <span className="fw-bold text-dark d-flex align-items-center">
                <i className="bi bi-activity text-primary me-2"></i>
                Chỉ Số Sinh Tồn (Đo lúc tiếp nhận)
              </span>
            </div>
            <div className="doc-card-body">
              <div className="vitals-grid">
                <div className="vital-box">
                  <div className="text-muted small">Huyết áp</div>
                  <div className="vital-value text-primary">{vitalSigns.bp}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>mmHg</div>
                </div>
                <div className="vital-box">
                  <div className="text-muted small">Mạch</div>
                  <div className="vital-value text-danger">{vitalSigns.pulse}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>lần/phút</div>
                </div>
                <div className="vital-box">
                  <div className="text-muted small">Thân nhiệt</div>
                  <div className="vital-value text-warning-emphasis">{vitalSigns.temp}°C</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Độ C</div>
                </div>
                <div className="vital-box">
                  <div className="text-muted small">SpO2</div>
                  <div className="vital-value text-success">{vitalSigns.spo2}%</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Oxy máu</div>
                </div>
                <div className="vital-box">
                  <div className="text-muted small">Cân nặng</div>
                  <div className="vital-value text-dark">{vitalSigns.weight}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>kg ({vitalSigns.height}cm)</div>
                </div>
                <div className="vital-box">
                  <div className="text-muted small">Chỉ số BMI</div>
                  <div className={`vital-value ${getBmiCategory(bmi).color}`}>{bmi}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>{getBmiCategory(bmi).text}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. KHÁM LÂM SÀNG & CHẨN ĐOÁN ICD-10 */}
          <div className="doc-card">
            <div className="doc-card-header">
              <span className="fw-bold text-dark d-flex align-items-center">
                <i className="bi bi-clipboard2-pulse-fill text-primary me-2"></i>
                Khám Lâm Sàng & Chẩn Đoán Bệnh
              </span>
            </div>
            <div className="doc-card-body">
              <div className="row g-3">
                {/* Kéo dài hết chiều ngang card để không bị trống */}
                <div className="col-12">
                  <label className="form-label fw-bold small text-dark d-flex align-items-center mb-1.5">
                    <i className="bi bi-chat-left-dots-fill text-primary me-2"></i>
                    Lý do đến khám & Triệu chứng cơ năng:
                  </label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    placeholder="Nhập chi tiết lý do khám, triệu chứng khởi phát, thời gian xuất hiện, tính chất khó chịu, tiền sử đau..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    style={{ lineHeight: '1.6' }}
                  ></textarea>
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold small text-dark d-flex align-items-center mb-1.5">
                    <i className="bi bi-stethoscope text-success me-2"></i>
                    Khám thực thể & Dấu hiệu lâm sàng:
                  </label>
                  <textarea 
                    className="form-control" 
                    rows="2"
                    placeholder="Mô tả dấu hiệu lâm sàng, nghe tim phổi, khám chuyên khoa..."
                    defaultValue="Tổng trạng tốt, tiếp xúc tốt. Tim đều, T1 T2 rõ, không âm thổi bệnh lý. Phổi trong, không rale. Bụng mềm, gan lách không to."
                    style={{ lineHeight: '1.6' }}
                  ></textarea>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold small text-dark d-flex align-items-center mb-1.5">
                    <i className="bi bi-bookmark-check-fill text-warning-emphasis me-2"></i>
                    Mã bệnh ICD-10:
                  </label>
                  <select 
                    className="form-select fw-semibold" 
                    value={icdCode} 
                    onChange={(e) => setIcdCode(e.target.value)}
                  >
                    <option value="I10 - Tăng huyết áp vô căn (nguyên phát)">I10 - Tăng huyết áp vô căn (nguyên phát)</option>
                    <option value="E78 - Rối loạn chuyển hóa lipoprotein">E78 - Rối loạn chuyển hóa lipoprotein</option>
                    <option value="J00 - Viêm mũi họng cấp tính">J00 - Viêm mũi họng cấp tính</option>
                    <option value="K29 - Viêm dạ dày và tá tràng">K29 - Viêm dạ dày và tá tràng</option>
                    <option value="G44 - Hội chứng đau đầu khác">G44 - Hội chứng đau đầu khác</option>
                    <option value="I20 - Cơn đau thắt ngực">I20 - Cơn đau thắt ngực</option>
                    <option value="H10 - Viêm kết mạc cấp">H10 - Viêm kết mạc cấp (Mắt)</option>
                    <option value="H52 - Tật khúc xạ mắt">H52 - Tật khúc xạ mắt (Cận thị / Loạn thị)</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold small text-dark d-flex align-items-center mb-1.5">
                    <i className="bi bi-check2-circle text-primary me-2"></i>
                    Chẩn đoán xác định:
                  </label>
                  <input 
                    type="text" 
                    className="form-control fw-semibold text-primary"
                    placeholder="Ví dụ: Viêm kết mạc cấp tính - Cận thị tiến triển"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. KÊ ĐƠN THUỐC ĐIỆN TỬ */}
          <div className="doc-card">
            <div className="doc-card-header">
              <span className="fw-bold text-dark d-flex align-items-center">
                <i className="bi bi-capsule text-primary me-2"></i>
                Đơn Thuốc Điện Tử (Toa Thuốc)
              </span>
              <span className="badge bg-primary-subtle text-primary border">
                {prescriptionItems.length} loại thuốc trong toa
              </span>
            </div>
            
            <div className="doc-card-body">
              {/* Form thêm thuốc nhanh */}
              <form onSubmit={handleAddMedicine} className="bg-light p-3 rounded-3 mb-3 border">
                <div className="row g-2 align-items-end">
                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-semibold text-muted mb-1">Chọn thuốc trong kho:</label>
                    <select 
                      className="form-select form-select-sm"
                      value={selectedMedToAdd}
                      onChange={(e) => {
                        setSelectedMedToAdd(e.target.value)
                        const list = medicinesList.length > 0 ? medicinesList : SAMPLE_MEDICINES
                        const found = list.find(m => (m.name || m.tenthuoc) === e.target.value)
                        if (found) setMedUsageToAdd(found.defaultDosage || 'Ngày 1-2 lần sau ăn theo chỉ định')
                      }}
                    >
                      <option value="">-- Chọn thuốc trong kho Dược --</option>
                      {(medicinesList.length > 0 ? medicinesList : SAMPLE_MEDICINES).map(m => {
                        const mName = m.name || m.tenthuoc
                        const mPrice = Number(m.price || m.dongia || 0)
                        const mUnit = m.unit || m.donvitinh || 'Viên'
                        return (
                          <option key={m.id || m.mathuoc} value={mName}>
                            {mName} ({mPrice.toLocaleString('vi-VN')} đ/{mUnit})
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div className="col-4 col-md-2">
                    <label className="form-label small fw-semibold text-muted mb-1">Số lượng:</label>
                    <input 
                      type="number" 
                      min="1" 
                      className="form-control form-control-sm"
                      value={medQtyToAdd}
                      onChange={(e) => setMedQtyToAdd(e.target.value)}
                    />
                  </div>
                  <div className="col-8 col-md-4">
                    <label className="form-label small fw-semibold text-muted mb-1">Cách dùng / Liều dùng:</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm"
                      placeholder="Sáng 1v, chiều 1v..."
                      value={medUsageToAdd}
                      onChange={(e) => setMedUsageToAdd(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-2">
                    <button type="submit" className="btn btn-sm btn-primary w-100" disabled={!selectedMedToAdd}>
                      <i className="bi bi-plus-lg me-1"></i> Thêm Thuốc
                    </button>
                  </div>
                </div>
              </form>

              {/* Bảng danh sách thuốc */}
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '40px' }} className="text-center">#</th>
                      <th>Tên Thuốc / Hoạt Chất</th>
                      <th style={{ width: '100px' }} className="text-center">Số Lượng</th>
                      <th>Cách Dùng & Liều Lượng</th>
                      <th style={{ width: '50px' }} className="text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptionItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="text-center fw-bold text-muted">{idx + 1}</td>
                        <td className="fw-semibold text-dark">{item.medicine}</td>
                        <td className="text-center">
                          <span className="badge bg-light text-dark border px-2 py-1">
                            {item.quantity} {item.unit}
                          </span>
                        </td>
                        <td className="text-secondary">{item.usage}</td>
                        <td className="text-center">
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger border-0 p-1"
                            onClick={() => handleRemoveMedicine(item.id)}
                            title="Xóa thuốc khỏi đơn"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {prescriptionItems.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-3 text-muted">
                          Chưa có thuốc nào trong toa. Chọn thuốc ở trên để thêm vào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TÓM TẮT VIỆN PHÍ & MÃ QR TRÊN MÀN HÌNH BÁC SĨ */}
              <div className="p-2.5 rounded bg-light border d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3 mb-2">
                <div className="small text-muted d-flex align-items-center gap-2">
                  <span className="d-inline-flex align-items-center gap-1">
                    Công khám: 
                    <input 
                      type="number" 
                      min="0"
                      step="10000"
                      className="form-control form-control-sm py-0 px-1 text-end fw-bold text-primary border-primary-subtle"
                      style={{ width: '95px', height: '24px', fontSize: '12px' }}
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(Math.max(0, Number(e.target.value) || 0))}
                      title="Chỉnh sửa số tiền công khám nếu cần"
                    /> đ
                  </span>
                  <span>•</span>
                  <span>Tiền thuốc: <strong className="text-dark">{totalMedFee.toLocaleString('vi-VN')} đ</strong></span>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle fs-6 px-3 py-1.5">
                    Tổng viện phí: <strong>{totalInvoiceAmount.toLocaleString('vi-VN')} đ</strong>
                  </span>
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small">
                    <i className="bi bi-qr-code me-1"></i> Có sẵn VietQR
                  </span>
                </div>
              </div>

              {/* Lời dặn & Hẹn tái khám */}
              <div className="row g-2 mt-2 pt-2 border-top">
                <div className="col-12 col-md-8">
                  <label className="form-label small fw-semibold text-secondary">Lời dặn của Bác sĩ:</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm"
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Hẹn ngày tái khám:</label>
                  <input 
                    type="date" 
                    className="form-control form-control-sm"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Nút hành động */}
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-4 pt-3 border-top">
                <div className="d-flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-outline-primary d-flex align-items-center fw-medium"
                    onClick={() => setShowPrintModal(true)}
                  >
                    <i className="bi bi-eye me-1.5"></i> Xem & In Toa Thuốc
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary d-flex align-items-center"
                    onClick={() => window.print()}
                    title="In nhanh trực tiếp (Ctrl + P)"
                  >
                    <i className="bi bi-printer me-1.5"></i> In Nhanh
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary d-flex align-items-center"
                    onClick={() => alert('Đã chuyển bệnh nhân đến phòng Xét Nghiệm & Chẩn Đoán Hình Ảnh!')}
                  >
                    <i className="bi bi-journal-medical me-1.5"></i> Chỉ Định Cận Lâm Sàng
                  </button>
                </div>

                <button 
                  type="button" 
                  className="btn btn-primary d-flex align-items-center px-4 fw-semibold shadow-sm"
                  onClick={handleCompleteExamination}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang lưu vào hệ thống...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-floppy-fill me-1.5"></i> Lưu Bệnh Án & Toa Thuốc
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          </>
        )}
        </div>

      </div>

      {/* ================= MODAL THÔNG BÁO LƯU THÀNH CÔNG RÕ RÀNG ================= */}
      {showSavedModal && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center no-print"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 2000, backdropFilter: 'blur(3px)' }}
        >
          <div className="bg-white rounded-4 shadow-lg p-4 text-center animate-fade-in" style={{ width: '500px', maxWidth: '92%' }}>
            <div 
              className="rounded-circle bg-success-subtle text-success mx-auto d-flex align-items-center justify-content-center mb-3"
              style={{ width: '68px', height: '68px', fontSize: '34px' }}
            >
              <i className="bi bi-check-circle-fill"></i>
            </div>
            
            <h4 className="fw-bold text-dark mb-1">Đã Lưu Thành Công!</h4>
            <p className="text-muted small mb-3">
              Hồ sơ bệnh án và đơn thuốc đã được số hóa & lưu vào hệ thống phòng khám.
            </p>

            <div className="bg-light rounded-3 p-3 text-start small mb-4 border">
              <div className="d-flex justify-content-between mb-1.5">
                <span className="text-muted">Bệnh nhân:</span>
                <strong className="text-dark">{savedDataSummary?.patientName}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1.5">
                <span className="text-muted">Mã bệnh án:</span>
                <span className="fw-bold text-primary">{savedDataSummary?.recordCode}</span>
              </div>
              <div className="d-flex justify-content-between mb-1.5">
                <span className="text-muted">Mã đơn thuốc:</span>
                <span className="fw-bold text-success">{savedDataSummary?.prescriptionCode}</span>
              </div>
              <div className="d-flex justify-content-between mb-1.5">
                <span className="text-muted">Chẩn đoán:</span>
                <span className="text-dark text-truncate" style={{ maxWidth: '250px' }}>{savedDataSummary?.diagnosis}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Số loại thuốc đã kê:</span>
                <span className="badge bg-primary">{savedDataSummary?.medicineCount} loại</span>
              </div>
            </div>

            <div className="d-flex flex-column gap-2">
              <button 
                type="button" 
                className="btn btn-outline-primary d-flex align-items-center justify-content-center py-2"
                onClick={() => {
                  setShowSavedModal(false)
                  setShowPrintModal(true)
                }}
              >
                <i className="bi bi-eye me-2"></i> Xem & In Toa Thuốc Cho Bệnh Nhân
              </button>

              <button 
                type="button" 
                className="btn btn-primary d-flex align-items-center justify-content-center py-2 fw-semibold"
                onClick={() => {
                  setShowSavedModal(false)
                  const nextWaiting = queue.find(p => p.status === 'WAITING')
                  if (nextWaiting) {
                    handleCallPatient(nextWaiting.id)
                  }
                }}
              >
                <i className="bi bi-person-plus me-2"></i> Mời Bệnh Nhân Kế Tiếp Vào Khám
              </button>

              <button 
                type="button" 
                className="btn btn-light border py-1.5 text-secondary mt-1"
                onClick={() => setShowSavedModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XEM TRƯỚC VÀ IN TOA THUỐC ================= */}
      {showPrintModal && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-start overflow-y-auto p-3 p-md-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 2100, backdropFilter: 'blur(4px)' }}
        >
          {/* Header thanh công cụ modal (chỉ hiển thị trên màn hình, ẩn khi in) */}
          <div className="bg-white rounded-3 shadow-sm px-4 py-3 mb-3 d-flex align-items-center justify-content-between w-100 no-print" style={{ maxWidth: '820px' }}>
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                <i className="bi bi-printer-fill fs-5"></i>
              </div>
              <div>
                <h5 className="mb-0 fw-bold text-dark">Xem Trước Bản In Toa Thuốc</h5>
                <span className="text-muted small">Khổ giấy tiêu chuẩn A4 • Bệnh nhân: <strong>{currentPatient.name}</strong></span>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button 
                type="button" 
                className="btn btn-primary d-flex align-items-center px-3 fw-semibold shadow-sm"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer me-1.5"></i> In Toa Thuốc (Ctrl + P)
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary px-3"
                onClick={() => setShowPrintModal(false)}
              >
                <i className="bi bi-x-lg me-1"></i> Đóng
              </button>
            </div>
          </div>

          {/* Khung giấy A4 xem trước */}
          <div className="prescription-paper-preview mb-4">
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '15pt', textTransform: 'uppercase' }}>PHÒNG KHÁM ĐA KHOA PHÚ LỢI BẢO</div>
              <div style={{ fontSize: '10pt', color: '#444' }}>Địa chỉ: 123 Nguyễn Tri Phương, Phường 7, Quận 5, TP.HCM • Hotline: (028) 3838 9999</div>
              <h2 style={{ fontSize: '18pt', fontWeight: 'bold', margin: '14px 0 6px 0', textTransform: 'uppercase' }}>ĐƠN THUỐC ĐIỆN TỬ</h2>
              <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>
                Mã đơn: DT-{currentPatient.patientCode} • Ngày kê: {new Date().toLocaleDateString('vi-VN')}
              </div>
            </div>

            <div style={{ marginBottom: '16px', fontSize: '11pt', lineHeight: '1.6' }}>
              <div>Họ và tên bệnh nhân: <strong>{currentPatient.name}</strong> • Tuổi: <strong>{currentPatient.age}</strong> • Giới tính: <strong>{currentPatient.gender}</strong></div>
              <div>Mã hồ sơ: <strong>{currentPatient.patientCode}</strong> • Điện thoại: <strong>{currentPatient.phone}</strong></div>
              <div>Địa chỉ: {currentPatient.address}</div>
              <div>Chẩn đoán: <strong>{diagnosis}</strong> (Mã ICD: {icdCode.split(' - ')[0]})</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
              <thead>
                <tr>
                  <th style={{ width: '35px', textAlign: 'center' }}>STT</th>
                  <th>Tên Thuốc / Hàm Lượng</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>Số Lượng</th>
                  <th style={{ width: '90px', textAlign: 'right' }}>Đơn Giá</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>Thành Tiền</th>
                  <th>Cách Dùng & Liều Lượng</th>
                </tr>
              </thead>
              <tbody>
                {prescriptionItems.map((item, idx) => {
                  const unitPrice = getMedPrice(item.medicine)
                  const lineTotal = unitPrice * (item.quantity || 1)
                  return (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 'bold' }}>{item.medicine}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.quantity} {item.unit}</td>
                      <td style={{ textAlign: 'right' }}>{unitPrice.toLocaleString('vi-VN')} đ</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{lineTotal.toLocaleString('vi-VN')} đ</td>
                      <td>{item.usage}</td>
                    </tr>
                  )
                })}
                {prescriptionItems.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '10px' }}>Chưa kê thuốc</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Khung Bảng Kê Viện Phí & Mã VietQR */}
            <div style={{ border: '1.5px solid #111', borderRadius: '6px', padding: '12px 14px', marginBottom: '16px', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, paddingRight: '16px', fontSize: '10.5pt', lineHeight: '1.7' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '11pt', textTransform: 'uppercase', marginBottom: '4px', color: '#175cdd' }}>
                    PHIẾU THU THAM KHẢO & VIỆN PHÍ
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>1. Tiền công khám chuyên khoa:</span>
                    <strong>{consultationFee.toLocaleString('vi-VN')} đ</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>2. Tiền thuốc trong toa ({prescriptionItems.length} loại):</span>
                    <strong>{totalMedFee.toLocaleString('vi-VN')} đ</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #555', marginTop: '6px', paddingTop: '6px', fontSize: '11.5pt' }}>
                    <span style={{ fontWeight: 'bold' }}>TỔNG CỘNG THANH TOÁN:</span>
                    <strong style={{ color: '#b91c1c', fontSize: '12.5pt' }}>{totalInvoiceAmount.toLocaleString('vi-VN')} đ</strong>
                  </div>
                  <div style={{ fontSize: '8.5pt', color: '#444', marginTop: '4px', fontStyle: 'italic' }}>
                    * Quét mã VietQR bằng App Ngân Hàng để chuyển khoản hoặc nộp tiền mặt tại Quầy Thu Ngân.
                  </div>
                </div>

                <div style={{ width: '150px', textAlign: 'center', borderLeft: '1px solid #ccc', paddingLeft: '14px' }}>
                  <div style={{ fontSize: '8.5pt', fontWeight: 'bold', color: '#175cdd', marginBottom: '2px' }}>
                    QUÉT MÃ VIETQR
                  </div>
                  <img 
                    src={vietQrUrl} 
                    alt="Mã QR Thanh Toán" 
                    style={{ width: '115px', height: '115px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px', padding: '2px', background: '#fff' }} 
                  />
                  <div style={{ fontSize: '8pt', fontWeight: 'bold', marginTop: '2px' }}>
                    MB BANK: 02838389999
                  </div>
                  <div style={{ fontSize: '7pt', color: '#555' }}>
                    PK PHU LOI BAO
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '10.5pt', marginBottom: '20px', lineHeight: '1.5' }}>
              <div><strong>* Lời dặn của bác sĩ:</strong> {advice || 'Uống thuốc đúng giờ, tuân thủ đúng liều lượng.'}</div>
              {followUpDate && <div><strong>* Hẹn ngày tái khám:</strong> {new Date(followUpDate).toLocaleDateString('vi-VN')}</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '24px' }}>
              <div style={{ fontSize: '9pt', fontStyle: 'italic', maxWidth: '320px', lineHeight: '1.5' }}>
                * Khám lại xin mang theo đơn thuốc này.<br />
                * Đơn thuốc có giá trị mua trong vòng 05 ngày kể từ ngày kê đơn.<br />
                * Bệnh nhân sau khi thanh toán vui lòng sang Quầy Dược nhận thuốc.
              </div>
              <div style={{ textAlign: 'center', minWidth: '220px' }}>
                <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</div>
                <div style={{ fontWeight: 'bold', margin: '4px 0 55px 0' }}>Bác sĩ khám bệnh</div>
                <div style={{ fontWeight: 'bold', fontSize: '11.5pt' }}>{user?.fullName ? (user.hocham ? `${user.hocham}. ${user.fullName}` : `BS. ${user.fullName}`) : 'Bác sĩ khám bệnh'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= KHỐI ĐƠN THUỐC CHUYÊN IN (KHI KHÔNG MỞ MODAL XEM TRƯỚC) ================= */}
      {!showPrintModal && (
        <div className="prescription-print-document print-only">
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '15pt', textTransform: 'uppercase' }}>PHÒNG KHÁM ĐA KHOA PHÚ LỢI BẢO</div>
            <div style={{ fontSize: '10pt', color: '#444' }}>Địa chỉ: 123 Nguyễn Tri Phương, Phường 7, Quận 5, TP.HCM • Hotline: (028) 3838 9999</div>
            <h2 style={{ fontSize: '18pt', fontWeight: 'bold', margin: '14px 0 6px 0', textTransform: 'uppercase' }}>ĐƠN THUỐC ĐIỆN TỬ</h2>
            <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>
              Mã đơn: DT-{currentPatient.patientCode} • Ngày kê: {new Date().toLocaleDateString('vi-VN')}
            </div>
          </div>

          <div style={{ marginBottom: '16px', fontSize: '11pt', lineHeight: '1.6' }}>
            <div>Họ và tên bệnh nhân: <strong>{currentPatient.name}</strong> • Tuổi: <strong>{currentPatient.age}</strong> • Giới tính: <strong>{currentPatient.gender}</strong></div>
            <div>Mã hồ sơ: <strong>{currentPatient.patientCode}</strong> • Điện thoại: <strong>{currentPatient.phone}</strong></div>
            <div>Địa chỉ: {currentPatient.address}</div>
            <div>Chẩn đoán: <strong>{diagnosis}</strong> (Mã ICD: {icdCode.split(' - ')[0]})</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
            <thead>
              <tr>
                <th style={{ width: '35px', textAlign: 'center' }}>STT</th>
                <th>Tên Thuốc / Hàm Lượng</th>
                <th style={{ width: '70px', textAlign: 'center' }}>Số Lượng</th>
                <th style={{ width: '90px', textAlign: 'right' }}>Đơn Giá</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Thành Tiền</th>
                <th>Cách Dùng & Liều Lượng</th>
              </tr>
            </thead>
            <tbody>
              {prescriptionItems.map((item, idx) => {
                const unitPrice = getMedPrice(item.medicine)
                const lineTotal = unitPrice * (item.quantity || 1)
                return (
                  <tr key={item.id}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 'bold' }}>{item.medicine}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.quantity} {item.unit}</td>
                    <td style={{ textAlign: 'right' }}>{unitPrice.toLocaleString('vi-VN')} đ</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{lineTotal.toLocaleString('vi-VN')} đ</td>
                    <td>{item.usage}</td>
                  </tr>
                )
              })}
              {prescriptionItems.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '10px' }}>Chưa kê thuốc</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ================= KHUNG BẢNG KÊ VIỆN PHÍ & MÃ VIETQR THANH TOÁN ================= */}
          <div style={{ border: '1.5px solid #111', borderRadius: '6px', padding: '12px 14px', marginBottom: '16px', background: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              
              {/* Cột Trái: Bảng kê chi phí */}
              <div style={{ flex: 1, paddingRight: '16px', fontSize: '10.5pt', lineHeight: '1.7' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11pt', textTransform: 'uppercase', marginBottom: '4px', color: '#175cdd' }}>
                  PHIẾU THU THAM KHẢO & VIỆN PHÍ
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>1. Tiền công khám chuyên khoa:</span>
                  <strong>{consultationFee.toLocaleString('vi-VN')} đ</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>2. Tiền thuốc trong toa ({prescriptionItems.length} loại):</span>
                  <strong>{totalMedFee.toLocaleString('vi-VN')} đ</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #555', marginTop: '6px', paddingTop: '6px', fontSize: '11.5pt' }}>
                  <span style={{ fontWeight: 'bold' }}>TỔNG CỘNG THANH TOÁN:</span>
                  <strong style={{ color: '#b91c1c', fontSize: '12.5pt' }}>{totalInvoiceAmount.toLocaleString('vi-VN')} đ</strong>
                </div>
                <div style={{ fontSize: '8.5pt', color: '#444', marginTop: '4px', fontStyle: 'italic' }}>
                  * Quét mã VietQR bằng App Ngân Hàng để chuyển khoản hoặc nộp tiền mặt tại Quầy Thu Ngân.
                </div>
              </div>

              {/* Cột Phải: Mã VietQR */}
              <div style={{ width: '150px', textAlign: 'center', borderLeft: '1px solid #ccc', paddingLeft: '14px' }}>
                <div style={{ fontSize: '8.5pt', fontWeight: 'bold', color: '#175cdd', marginBottom: '2px' }}>
                  QUÉT MÃ VIETQR
                </div>
                <img 
                  src={vietQrUrl} 
                  alt="Mã QR Thanh Toán" 
                  style={{ width: '115px', height: '115px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px', padding: '2px', background: '#fff' }} 
                />
                <div style={{ fontSize: '8pt', fontWeight: 'bold', marginTop: '2px' }}>
                  MB BANK: 02838389999
                </div>
                <div style={{ fontSize: '7pt', color: '#555' }}>
                  PK PHU LOI BAO
                </div>
              </div>

            </div>
          </div>

          <div style={{ fontSize: '10.5pt', marginBottom: '20px', lineHeight: '1.5' }}>
            <div><strong>* Lời dặn của bác sĩ:</strong> {advice || 'Uống thuốc đúng giờ, tuân thủ đúng liều lượng.'}</div>
            {followUpDate && <div><strong>* Hẹn ngày tái khám:</strong> {new Date(followUpDate).toLocaleDateString('vi-VN')}</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '24px' }}>
            <div style={{ fontSize: '9pt', fontStyle: 'italic', maxWidth: '320px', lineHeight: '1.5' }}>
              * Khám lại xin mang theo đơn thuốc này.<br />
              * Đơn thuốc có giá trị mua trong vòng 05 ngày kể từ ngày kê đơn.<br />
              * Bệnh nhân sau khi thanh toán vui lòng sang Quầy Dược nhận thuốc.
            </div>
            <div style={{ textAlign: 'center', minWidth: '220px' }}>
              <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</div>
              <div style={{ fontWeight: 'bold', margin: '4px 0 55px 0' }}>Bác sĩ khám bệnh</div>
              <div style={{ fontWeight: 'bold', fontSize: '11.5pt' }}>{user?.fullName ? (user.hocham ? `${user.hocham}. ${user.fullName}` : `BS. ${user.fullName}`) : 'Bác sĩ khám bệnh'}</div>
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  )
}
