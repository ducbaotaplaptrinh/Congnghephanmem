import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="not-found">
      <div>
        <h1>404</h1>
        <h2>Trang Không Tìm Thấy</h2>
        <p>Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.</p>
        <Link to="/" className="btn-home">
          <i className="bi bi-house"></i>
          Về Trang Chủ
        </Link>
      </div>
    </div>
  )
}
