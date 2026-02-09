import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.scss'

function Navbar() {
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMain}>Nos Casamos</span>
          <span className={styles.logoSub}>Nico y Caro</span>
        </Link>
        <ul className={styles.navList}>
          <li>
            <Link 
              to="/" 
              className={`${styles.navLink} ${isActive('/') && location.pathname === '/' ? styles.active : ''}`}
            >
              Inicio
            </Link>
          </li>
          <li>
            <Link 
              to="/cuando" 
              className={`${styles.navLink} ${isActive('/cuando') ? styles.active : ''}`}
            >
              ¿Cuándo?
            </Link>
          </li>
          <li>
            <Link 
              to="/detalles" 
              className={`${styles.navLink} ${isActive('/detalles') ? styles.active : ''}`}
            >
              Detalles
            </Link>
          </li>
          <li>
            <Link 
              to="/nuestra-historia" 
              className={`${styles.navLink} ${isActive('/nuestra-historia') ? styles.active : ''}`}
            >
              Nuestra Historia
            </Link>
          </li>
          <li>
            <Link 
              to="/juegos" 
              className={`${styles.navLink} ${isActive('/juegos') ? styles.active : ''}`}
            >
              Juegos
            </Link>
          </li>
          <li>
            <Link 
              to="/mensajes" 
              className={`${styles.navLink} ${isActive('/mensajes') ? styles.active : ''}`}
            >
              <span className={styles.fullText}>Rincón de Mensajes</span>
              <span className={styles.shortText}>Mensajes</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/fotos" 
              className={`${styles.navLink} ${isActive('/fotos') ? styles.active : ''}`}
            >
              <span className={styles.fullText}>Fotos de la Boda</span>
              <span className={styles.shortText}>Fotos</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar

