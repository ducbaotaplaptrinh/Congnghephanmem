export default function PatientCard({ patient, onSelect }) {
  if (!patient) return null

  return (
    <div className="card h-100 shadow-sm border-0 rounded-3">
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <div 
            className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3 fw-bold"
            style={{ width: '48px', height: '48px', fontSize: '18px' }}
          >
            {patient.fullName ? patient.fullName.charAt(0).toUpperCase() : 'BN'}
          </div>
          <div>
            <h6 className="card-title mb-0 fw-bold">{patient.fullName}</h6>
            <small className="text-muted">Mã BN: #{patient.code || patient.id}</small>
          </div>
        </div>

        <ul className="list-unstyled mb-3 small text-secondary">
          <li className="mb-1"><i className="bi bi-telephone me-2 text-primary"></i>{patient.phone || 'Chưa cập nhật'}</li>
          <li className="mb-1"><i className="bi bi-envelope me-2 text-primary"></i>{patient.email || 'Chưa cập nhật'}</li>
          <li className="mb-1"><i className="bi bi-geo-alt me-2 text-primary"></i>{patient.address || 'Chưa cập nhật'}</li>
          <li><i className="bi bi-gender-ambiguous me-2 text-primary"></i>{patient.gender || 'Nam'} - {patient.birthYear || '1990'}</li>
        </ul>

        {onSelect && (
          <button className="btn btn-outline-primary btn-sm w-100" onClick={() => onSelect(patient)}>
            Xem chi tiết
          </button>
        )}
      </div>
    </div>
  )
}
