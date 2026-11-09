export default function PatientTable({ patients = [], onEdit, onDelete, onView }) {
  if (!patients.length) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-inbox fs-1 d-block mb-2"></i>
        Không có dữ liệu bệnh nhân nào
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Mã BN</th>
            <th>Họ và Tên</th>
            <th>Số Điện Thoại</th>
            <th>Email</th>
            <th>Giới Tính</th>
            <th>Năm Sinh</th>
            <th className="text-end">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id}>
              <td className="fw-semibold text-primary">#{p.code || p.id}</td>
              <td className="fw-bold">{p.fullName}</td>
              <td>{p.phone}</td>
              <td>{p.email}</td>
              <td>
                <span className={`badge ${p.gender === 'Nữ' ? 'bg-danger-subtle text-danger' : 'bg-info-subtle text-info'}`}>
                  {p.gender || 'Nam'}
                </span>
              </td>
              <td>{p.birthYear}</td>
              <td className="text-end">
                <button 
                  className="btn btn-sm btn-outline-info me-1" 
                  onClick={() => onView && onView(p)}
                  title="Xem chi tiết"
                >
                  <i className="bi bi-eye"></i>
                </button>
                <button 
                  className="btn btn-sm btn-outline-warning me-1" 
                  onClick={() => onEdit && onEdit(p)}
                  title="Chỉnh sửa"
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger" 
                  onClick={() => onDelete && onDelete(p.id)}
                  title="Xóa"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
