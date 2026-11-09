export default function LoadingSpinner({ text = 'Đang tải dữ liệu...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-5">
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <p className="mt-3 text-muted">{text}</p>}
    </div>
  )
}
