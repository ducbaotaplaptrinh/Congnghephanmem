import { Link } from 'react-router-dom'

export default function PageTitle({ title, description, breadcrumb }) {
  // Normalize breadcrumb into an array of items
  let breadcrumbItems = []

  if (Array.isArray(breadcrumb)) {
    breadcrumbItems = breadcrumb.map(item =>
      typeof item === 'string' ? { label: item } : item
    )
  } else if (typeof breadcrumb === 'string') {
    breadcrumbItems = [{ label: breadcrumb }]
  } else if (title) {
    breadcrumbItems = [{ label: title }]
  }

  return (
    <div className="page-title">
      <div className="heading">
        <div className="container">
          <div className="row d-flex justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="heading-title">{title}</h1>
              {description && <p className="mb-0">{description}</p>}
            </div>
          </div>
        </div>
      </div>
      <nav className="breadcrumbs">
        <div className="container">
          <ol>
            <li>
              <Link to="/">Trang Chủ</Link>
            </li>
            {breadcrumbItems.map((item, idx) => {
              const isLast = idx === breadcrumbItems.length - 1
              if (isLast || !item.path) {
                return (
                  <li key={idx} className="current">
                    {item.label}
                  </li>
                )
              }
              return (
                <li key={idx}>
                  <Link to={item.path}>{item.label}</Link>
                </li>
              )
            })}
          </ol>
        </div>
      </nav>
    </div>
  )
}
