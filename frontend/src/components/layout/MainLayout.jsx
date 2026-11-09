import Header from './Header'
import Footer from './Footer'
import ScrollTop from '../common/ScrollTop'

export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main className="main">
        {children}
      </main>
      <Footer />
      <ScrollTop />
    </>
  )
}
