export default function DoctorFilter({ departments = [], selectedDept, onSelectDept, search, onSearchChange }) {
  return (
    <div className="card border-0 shadow-sm rounded-3 mb-4">
      <div className="card-body p-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0 ps-0" 
                placeholder="Tìm kiếm bác sĩ theo tên, chuyên khoa..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <select 
              className="form-select" 
              value={selectedDept} 
              onChange={(e) => onSelectDept(e.target.value)}
            >
              <option value="">Tất cả chuyên khoa</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
