import { Link } from 'react-router-dom'

export default function DoctorCard({ doctor, onBook }) {
  if (!doctor) return null

  return (
    <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
      <div className="position-relative bg-light text-center p-3">
        {doctor.image ? (
          <img 
            src={doctor.image} 
            alt={doctor.name} 
            className="rounded-circle object-fit-cover shadow-sm"
            style={{ width: '130px', height: '130px' }}
          />
        ) : (
          <div 
            className="rounded-circle bg-primary-subtle text-primary mx-auto d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '130px', height: '130px', fontSize: '36px' }}
          >
            {doctor.name ? doctor.name.replace(/^(Bác sĩ|BS|ThS|TS)\.?\s*/i, '').charAt(0) : 'BS'}
          </div>
        )}
        <span className="badge bg-primary position-absolute top-0 end-0 m-3 px-2 py-1">
          {doctor.department || 'Đa Khoa'}
        </span>
      </div>

      <div className="card-body text-center d-flex flex-column">
        <h5 className="card-title fw-bold mb-1">{doctor.name}</h5>
        <div className="text-primary fw-medium small mb-2">{doctor.title || 'Bác sĩ chuyên khoa'}</div>
        <p className="card-text text-muted small flex-grow-1">
          {doctor.bio || doctor.description || 'Nhiều năm kinh nghiệm thăm khám và điều trị chuyên sâu.'}
        </p>

        <div className="border-top pt-3 mt-2 d-flex justify-content-between align-items-center small text-secondary">
          <span><i className="bi bi-star-fill text-warning me-1"></i>{doctor.rating || '5.0'} ({doctor.reviewsCount || '120+'})</span>
          <span><i className="bi bi-clock me-1"></i>{doctor.experience || '8+ năm'} KN</span>
        </div>

        <div className="mt-3">
          {onBook ? (
            <button className="btn btn-primary btn-sm w-100 rounded-pill" onClick={() => onBook(doctor)}>
              Đặt Lịch Khám
            </button>
          ) : (
            <Link to="/dat-lich-kham" className="btn btn-primary btn-sm w-100 rounded-pill">
              Đặt Lịch Khám
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
