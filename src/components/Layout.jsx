import Navbar from './Navbar'
import MobileNav from './MobileNav'
import AudioPlayer from './AudioPlayer'
import styles from './Layout.module.scss'

function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <Navbar />
      <MobileNav />
      <main className={styles.main}>
        {children}
      </main>
      <AudioPlayer src="/nothing-else-matters.mp3" autoPlay={true} />
    </div>
  )
}

export default Layout

