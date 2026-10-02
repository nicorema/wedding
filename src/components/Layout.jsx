import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import MobileNav from './MobileNav'
import AudioPlayer from './AudioPlayer'
import styles from './Layout.module.scss'

function Layout({ children }) {
  // The word search fills the phone screen, so the player moves up next to
  // the game's buttons instead of covering the bottom-right letters.
  const isGamesPage = useLocation().pathname === '/juegos'

  return (
    <div className={styles.layout}>
      <Navbar />
      <MobileNav />
      <main className={styles.main}>
        {children}
      </main>
      <AudioPlayer
        src="/nothing-else-matters.mp3"
        autoPlay={true}
        isPinnedTop={isGamesPage}
      />
    </div>
  )
}

export default Layout

