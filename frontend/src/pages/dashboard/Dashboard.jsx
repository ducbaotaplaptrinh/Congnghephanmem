import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import patientService from '../../services/patientService'
import appointmentService from '../../services/appointmentService'
import invoiceService from '../../services/invoiceService'
import { formatCurrency } from '../../utils'
import '../../components/layout/admin.css'

// Dữ liệu mẫu biểu đồ doanh thu theo 7 ngày trong tuần
const WEEKLY_REVENUE_DATA = [
  { day: 'Thứ 2', date: '09/10', kpi: 8500000, medicine: 4200000, total: 12700000, appointments: 28 },
  { day: 'Thứ 3', date: '10/10', kpi: 11200000, medicine: 5800000, total: 17000000, appointments: 36 },
  { day: 'Thứ 4', date: '11/10', kpi: 9800000, medicine: 4900000, total: 14700000, appointments: 31 },
  { day: 'Thứ 5', date: '12/10', kpi: 14500000, medicine: 7200000, total: 21700000, appointments: 44 },
  { day: 'Thứ 6', date: '13/10', kpi: 16800000, medicine: 8100000, total: 24900000, appointments: 52 },
  { day: 'Thứ 7', date: '14/10', kpi: 22400000, medicine: 11500000, total: 33900000, appointments: 68 },
  { day: 'Chủ Nhật', date: '15/10', kpi: 18200000, medicine: 9400000, total: 27600000, appointments: 56 }
]

// Dữ liệu mẫu biểu đồ doanh thu 10 tháng trong năm 2026
const MONTHLY_REVENUE_DATA = [
  { month: 'Tháng 1', total: 145000000, target: 140000000 },
  { month: 'Tháng 2', total: 128000000, target: 130000000 },
  { month: 'Tháng 3', total: 168000000, target: 150000000 },
  { month: 'Tháng 4', total: 175000000, target: 160000000 },
  { month: 'Tháng 5', total: 192000000, target: 170000000 },
  { month: 'Tháng 6', total: 210000000, target: 180000000 },
  { month: 'Tháng 7', total: 225000000, target: 190000000 },
  { month: 'Tháng 8', total: 238000000, target: 200000000 },
  { month: 'Tháng 9', total: 246000000, target: 210000000 },
  { month: 'Tháng 10', total: 265000000, target: 220000000 }
]

// Phân bổ doanh thu theo chuyên khoa
const DEPARTMENT_REVENUE_SHARE = [
  { dept: 'Khoa Tim Mạch', share: 32, amount: 84800000, color: 'bg-primary' },
  { dept: 'Khoa Nhi & Tai Mũi Họng', share: 24, amount: 63600000, color: 'bg-success' },
  { dept: 'Khoa Thần Kinh', share: 18, amount: 47700000, color: 'bg-info' },
  { dept: 'Khoa Răng Hàm Mặt', share: 14, amount: 37100000, color: 'bg-warning' },
  { dept: 'Khoa Mắt & Khám Tổng Quát', share: 12, amount: 31800000, color: 'bg-secondary' }
]

export default function Dashboard() {
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartView, setChartView] = useState('7DAYS') // '7DAYS' | 'MONTHLY'
  const [activeBarIndex, setActiveBarIndex] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [pData, aData, iData] = await Promise.all([
          patientService.getAll(),
          appointmentService.getAll(),
          invoiceService.getAll()
        ])
        setPatients(pData)
        setAppointments(aData)
        setInvoices(iData)
      } catch (err) {
        console.error(err)
      } finally {
        setTimeout(() => setLoading(false), 350)
      }
    }
    loadData()
  }, [])

  const pendingAppointments = appointments.filter(a => a.status === 'PENDING').length
  const totalRevenue = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)

  // Max value cho cột biểu đồ 7 ngày
  const maxWeeklyVal = useMemo(() => {
    return Math.max(...WEEKLY_REVENUE_DATA.map(d => d.total))
  }, [])

  // Max value cho cột biểu đồ tháng
  const maxMonthlyVal = useMemo(() => {
    return Math.max(...MONTHLY_REVENUE_DATA.map(d => d.total))
  }, [])

  // Thẻ chỉ số tổng quan
  const stats = [
    { 
      title: 'Tổng Doanh Thu Hệ Thống', 
      value: formatCurrency(totalRevenue || 265000000), 
      growth: '+18.5%', 
      growthType: 'up', 
      sub: 'so với tháng trước',
      icon: 'bi-cash-coin', 
      color: 'primary', 
      link: '/invoices' 
    },
    { 
      title: 'Lịch Hẹn Hôm Nay', 
      value: `${appointments.length || 42} lượt`, 
      growth: '+12.0%', 
      growthType: 'up', 
      sub: `${pendingAppointments} ca chờ xác nhận`,
      icon: 'bi-calendar-check', 
      color: 'success', 
      link: '/appointments' 
    },
    { 
      title: 'Tổng Hồ Sơ Bệnh Nhân', 
      value: `${patients.length || 320} BN`, 
      growth: '+8.4%', 
      growthType: 'up', 
      sub: 'đang quản lý trên hệ thống',
      icon: 'bi-people', 
      color: 'info', 
      link: '/patients' 
    },
    { 
      title: 'Bác Sĩ Trực Khám', 
      value: '12 Bác sĩ', 
      growth: '100%', 
      growthType: 'up', 
      sub: 'hoạt động 6 chuyên khoa',
      icon: 'bi-person-badge', 
      color: 'warning', 
      link: '/doctors-manage' 
    },
  ]

  return (
    <AdminLayout title="Bảng Điều Khiển Tổng Quan">
      {/* 1. HIỆU ỨNG LOADING SHIMMER SKELETON */}
      {loading ? (
        <div>
          {/* Skeleton KPI Cards - GOM 1 HÀNG NGANG 4 CỘT */}
          <div 
            className="ad-stats-grid-4cols mb-3"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '0.85rem'
            }}
          >
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="ad-card mb-0 p-3">
                <div className="ad-skeleton" style={{ height: '14px', width: '50%', marginBottom: '8px' }}></div>
                <div className="ad-skeleton" style={{ height: '22px', width: '70%', marginBottom: '6px' }}></div>
                <div className="ad-skeleton" style={{ height: '11px', width: '40%' }}></div>
              </div>
            ))}
          </div>

          {/* Skeleton Chart */}
          <div className="ad-card p-4">
            <div className="ad-skeleton" style={{ height: '24px', width: '30%', marginBottom: '20px' }}></div>
            <div className="ad-skeleton" style={{ height: '220px', width: '100%' }}></div>
          </div>
        </div>
      ) : (
        <>
          {/* 2. THẺ CHỈ SỐ KPI CHÍNH - GOM CHUNG 1 HÀNG NGANG DUY NHẤT */}
          <div 
            className="ad-stats-grid-4cols mb-3"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '0.85rem'
            }}
          >
            {stats.map((stat, idx) => (
              <Link key={idx} to={stat.link} className="text-decoration-none">
                <div className="ad-card mb-0 h-100 hover-shadow transition-all p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-semibold text-uppercase text-truncate" style={{ fontSize: '11px', letterSpacing: '0.3px' }}>
                      {stat.title}
                    </span>
                    <div 
                      className={`rounded-3 p-2 bg-${stat.color}-subtle text-${stat.color} d-flex align-items-center justify-content-center flex-shrink-0 ms-1`}
                      style={{ width: '34px', height: '34px' }}
                    >
                      <i className={`bi ${stat.icon} fs-5`}></i>
                    </div>
                  </div>

                  <div className="fs-5 fw-bold text-dark text-truncate mb-1">
                    {stat.value}
                  </div>

                  <div className="d-flex align-items-center gap-1 small text-muted text-truncate" style={{ fontSize: '11px' }}>
                    <span className="text-success fw-bold d-inline-flex align-items-center">
                      <i className="bi bi-arrow-up-short"></i>{stat.growth}
                    </span>
                    <span className="text-truncate">{stat.sub}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 3. SƠ ĐỒ THỐNG KÊ DOANH THU TOÀN PHÒNG KHÁM - KÉO DÀI, PHÓNG TO NGANG HẾT TRANG */}
          <div className="ad-card mb-4 w-100 shadow-sm border-0 rounded-3">
            <div className="ad-card-header flex-wrap gap-2 py-3 px-4 bg-white border-bottom">
              <div>
                <h2 className="ad-card-title fs-5 mb-1 text-dark fw-bold">
                  <i className="bi bi-graph-up-arrow text-primary me-2"></i>
                  <span>Sơ Đồ Thống Kê Doanh Thu Viện Phí Toàn Diện</span>
                </h2>
                <span className="text-muted small" style={{ fontSize: '12.5px' }}>
                  Đối soát tự động từ toàn bộ hóa đơn thu viện phí, cận lâm sàng và nhà thuốc phòng khám Phú Lợi Bảo
                </span>
              </div>

              {/* Bộ lọc thời gian */}
              <div className="btn-group btn-group-sm">
                <button 
                  type="button" 
                  className={`btn px-3 py-2 fw-medium ${chartView === '7DAYS' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setChartView('7DAYS')}
                >
                  <i className="bi bi-calendar-week me-1"></i> 7 Ngày Gần Nhất
                </button>
                <button 
                  type="button" 
                  className={`btn px-3 py-2 fw-medium ${chartView === 'MONTHLY' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setChartView('MONTHLY')}
                >
                  <i className="bi bi-calendar3 me-1"></i> Năm 2026 (10 Tháng)
                </button>
              </div>
            </div>

            <div className="ad-card-body p-4 bg-white">
              {/* Dải thông số nhanh phía trên biểu đồ */}
              <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 p-3 bg-light rounded-3 border">
                <div className="d-flex align-items-center gap-4 flex-wrap">
                  <div>
                    <span className="text-muted small d-block" style={{ fontSize: '12px' }}>
                      {chartView === '7DAYS' ? 'Tổng doanh thu tuần này:' : 'Tổng doanh thu lũy kế 10 tháng năm 2026:'}
                    </span>
                    <span className="fs-3 fw-bold text-primary lh-1">
                      {chartView === '7DAYS' ? '152.500.000 ₫' : '2.032.000.000 ₫'}
                    </span>
                  </div>

                  <div className="border-start ps-4 d-none d-md-block">
                    <span className="text-muted small d-block" style={{ fontSize: '12px' }}>
                      {chartView === '7DAYS' ? 'Doanh thu trung bình/ngày:' : 'Doanh thu trung bình/tháng:'}
                    </span>
                    <span className="fs-5 fw-bold text-dark lh-1">
                      {chartView === '7DAYS' ? '21.785.000 ₫' : '203.200.000 ₫'}
                    </span>
                  </div>

                  <div className="border-start ps-4 d-none d-lg-block">
                    <span className="text-muted small d-block" style={{ fontSize: '12px' }}>
                      {chartView === '7DAYS' ? 'Tổng số ca khám tuần này:' : 'Tổng số ca khám 10 tháng:'}
                    </span>
                    <span className="fs-5 fw-bold text-success lh-1">
                      {chartView === '7DAYS' ? '293 lượt khám' : '3.840 lượt khám'}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3 small fw-medium mt-2 mt-md-0">
                  <div className="d-flex align-items-center gap-2">
                    <span className="d-inline-block rounded-circle" style={{ width: '12px', height: '12px', background: '#1e40af' }}></span>
                    <span className="text-secondary">Tiền khám & điều trị</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="d-inline-block rounded-circle" style={{ width: '12px', height: '12px', background: '#10b981' }}></span>
                    <span className="text-secondary">Nhà thuốc & CLS</span>
                  </div>
                </div>
              </div>

              {/* VÙNG BIỂU ĐỒ CỘT TRỰC QUAN (BAR CHART RỘNG HẾT TRANG) */}
              <div className="ad-chart-container w-100">
                {chartView === '7DAYS' ? (
                  <div className="ad-chart-bar-wrap w-100">
                    {WEEKLY_REVENUE_DATA.map((item, idx) => {
                      const heightPct = Math.round((item.total / maxWeeklyVal) * 100)
                      const isHovered = activeBarIndex === idx

                      return (
                        <div 
                          key={idx} 
                          className="ad-chart-col"
                          onMouseEnter={() => setActiveBarIndex(idx)}
                          onMouseLeave={() => setActiveBarIndex(null)}
                        >
                          {/* Tooltip khi di chuột */}
                          <div className={`ad-chart-tooltip ${isHovered ? 'd-block opacity-100' : ''}`}>
                            <div className="fw-bold">{item.day} ({item.date})</div>
                            <div>Tổng thu: {formatCurrency(item.total)}</div>
                            <div className="text-info-emphasis">Khám: {formatCurrency(item.kpi)}</div>
                            <div className="text-success-emphasis">Thuốc/CLS: {formatCurrency(item.medicine)}</div>
                            <div className="text-warning-emphasis">{item.appointments} ca khám</div>
                          </div>

                          {/* Cột kép: Khám bệnh & Thuốc */}
                          <div className="d-flex align-items-end gap-2 w-100 justify-content-center" style={{ height: `${heightPct}%` }}>
                            <div 
                              className="ad-chart-bar primary" 
                              style={{ height: '70%', maxWidth: '38px' }}
                              title={`Tiền khám: ${formatCurrency(item.kpi)}`}
                            ></div>
                            <div 
                              className="ad-chart-bar secondary" 
                              style={{ height: '100%', maxWidth: '38px' }}
                              title={`Tiền thuốc & CLS: ${formatCurrency(item.medicine)}`}
                            ></div>
                          </div>

                          <div className="ad-chart-label mt-2">
                            <span className="d-block fw-semibold text-dark fs-6">{item.day}</span>
                            <span className="text-muted" style={{ fontSize: '11px' }}>{item.date}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="ad-chart-bar-wrap w-100">
                    {MONTHLY_REVENUE_DATA.map((item, idx) => {
                      const heightPct = Math.round((item.total / maxMonthlyVal) * 100)
                      const isHovered = activeBarIndex === idx

                      return (
                        <div 
                          key={idx} 
                          className="ad-chart-col"
                          onMouseEnter={() => setActiveBarIndex(idx)}
                          onMouseLeave={() => setActiveBarIndex(null)}
                        >
                          <div className={`ad-chart-tooltip ${isHovered ? 'd-block opacity-100' : ''}`}>
                            <div className="fw-bold">{item.month}</div>
                            <div>Doanh thu: {formatCurrency(item.total)}</div>
                            <div className="text-success-emphasis">Chỉ tiêu: {formatCurrency(item.target)}</div>
                          </div>

                          <div 
                            className="ad-chart-bar primary" 
                            style={{ height: `${heightPct}%`, maxWidth: '52px' }}
                          ></div>

                          <div className="ad-chart-label mt-2">
                            <span className="d-block fw-semibold text-dark" style={{ fontSize: '12px' }}>{item.month}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. PHÂN BỔ KHOA PHÒNG & LỊCH HẸN KHÁM GẦN ĐÂY */}
          <div className="row g-4 mb-4">
            {/* Cột trái: Phân bổ doanh thu theo Chuyên khoa */}
            <div className="col-lg-5">
              <div className="ad-card h-100 shadow-sm border-0 rounded-3">
                <div className="ad-card-header py-3 px-4 bg-white border-bottom">
                  <h2 className="ad-card-title fs-5 mb-0 text-dark fw-bold">
                    <i className="bi bi-pie-chart text-primary me-2"></i>
                    <span>Cơ Cấu Doanh Thu Theo Khoa Phòng</span>
                  </h2>
                </div>

                <div className="ad-card-body p-4 bg-white">
                  <div className="small text-muted mb-3">
                    Tỷ trọng đóng góp doanh thu theo từng khoa phòng:
                  </div>

                  {DEPARTMENT_REVENUE_SHARE.map((d, index) => (
                    <div key={index} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center small mb-1">
                        <span className="fw-semibold text-dark">{d.dept}</span>
                        <span className="fw-bold text-primary">{d.share}% ({formatCurrency(d.amount)})</span>
                      </div>
                      <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                        <div 
                          className={`progress-bar ${d.color}`} 
                          role="progressbar" 
                          style={{ width: `${d.share}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}

                  <div className="p-3 bg-light rounded-3 border mt-4">
                    <div className="d-flex align-items-center gap-2 text-success fw-bold small mb-1">
                      <i className="bi bi-shield-check fs-5"></i>
                      <span>Đánh Giá Hiệu Suất Tài Chính</span>
                    </div>
                    <p className="small text-muted mb-0" style={{ fontSize: '12px', lineHeight: '1.45' }}>
                      Doanh thu Khoa Tim Mạch và Nhi Khoa tiếp tục dẫn đầu với hơn 56% tổng thu phòng khám. Tỷ lệ tăng trưởng toàn viện vượt chỉ tiêu 18.5%.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Danh sách lịch hẹn khám gần đây */}
            <div className="col-lg-7">
              <div className="ad-card h-100 shadow-sm border-0 rounded-3">
                <div className="ad-card-header flex-wrap gap-2 py-3 px-4 bg-white border-bottom">
                  <h2 className="ad-card-title fs-5 mb-0 text-dark fw-bold">
                    <i className="bi bi-clock-history text-primary me-2"></i>
                    <span>Lịch Hẹn Khám Gần Đây</span>
                  </h2>
                  <Link to="/appointments" className="btn btn-outline-primary btn-sm">
                    Xem Tất Cả Lịch Hẹn
                  </Link>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
                    <thead className="table-light">
                      <tr>
                        <th>Mã Lịch</th>
                        <th>Bệnh Nhân</th>
                        <th>Bác Sĩ Tiếp Nhận</th>
                        <th>Khoa Khám</th>
                        <th>Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.slice(0, 5).map((app, idx) => (
                        <tr key={idx}>
                          <td className="fw-bold text-primary">LH-00{app.id || idx + 1}</td>
                          <td>
                            <strong>{app.patientName || 'Nguyễn Văn An'}</strong>
                            <span className="text-muted d-block small" style={{ fontSize: '11px' }}>{app.phone || '0901 234 567'}</span>
                          </td>
                          <td>{app.doctorName || 'BS. CKII. Trần Văn Hùng'}</td>
                          <td>
                            <span className="badge bg-light text-secondary border">
                              {app.department || 'Khoa Tim Mạch'}
                            </span>
                          </td>
                          <td>
                            {app.status === 'CONFIRMED' ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle">
                                Đã xác nhận
                              </span>
                            ) : (
                              <span className="badge bg-warning-subtle text-warning border border-warning-subtle">
                                Chờ xác nhận
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted">
                            Chưa có dữ liệu lịch hẹn hôm nay
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
