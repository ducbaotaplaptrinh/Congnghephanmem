import { useState, useEffect } from 'react'

export default function ScrollTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      id="scroll-top"
      className={`scroll-top d-flex align-items-center justify-content-center ${isVisible ? 'active' : ''}`}
      onClick={scrollToTop}
      aria-label="Cuộn lên đầu trang"
      title="Lên đầu trang"
    >
      <i className="bi bi-arrow-up-short"></i>
    </button>
  )
}
