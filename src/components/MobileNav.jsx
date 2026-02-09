import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './MobileNav.module.scss'

function MobileNav() {
  const [showNavModal, setShowNavModal] = useState(false)
  const location = useLocation()

  return (
    <>
      {/* Mobile menu button */}
      <button
        className={styles.menuButton}
        onClick={() => setShowNavModal(true)}
        aria-label="Menú de navegación"
      >
        ☰ Menú
      </button>

      {/* Navigation modal for mobile */}
      {showNavModal && (
        <div
          className={styles.navModal}
          onClick={() => setShowNavModal(false)}
        >
          <div
            className={styles.navModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.navModalHeader}>
              <h3 className={styles.navModalTitle}>🌿 Navegación</h3>
              <button
                className={styles.navModalCloseButton}
                onClick={() => setShowNavModal(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <nav className={styles.navModalBody}>
              <Link
                to="/"
                className={`${styles.navModalLink} ${
                  location.pathname === '/' ? styles.navModalLinkActive : ''
                }`}
                onClick={() => setShowNavModal(false)}
              >
                Inicio
              </Link>
              <Link
                to="/cuando"
                className={`${styles.navModalLink} ${
                  location.pathname.startsWith('/cuando')
                    ? styles.navModalLinkActive
                    : ''
                }`}
                onClick={() => setShowNavModal(false)}
              >
                ¿Cuándo?
              </Link>
              <Link
                to="/detalles"
                className={`${styles.navModalLink} ${
                  location.pathname.startsWith('/detalles')
                    ? styles.navModalLinkActive
                    : ''
                }`}
                onClick={() => setShowNavModal(false)}
              >
                Detalles
              </Link>
              <Link
                to="/nuestra-historia"
                className={`${styles.navModalLink} ${
                  location.pathname.startsWith('/nuestra-historia')
                    ? styles.navModalLinkActive
                    : ''
                }`}
                onClick={() => setShowNavModal(false)}
              >
                Nuestra Historia
              </Link>
              <Link
                to="/juegos"
                className={`${styles.navModalLink} ${
                  location.pathname.startsWith('/juegos')
                    ? styles.navModalLinkActive
                    : ''
                }`}
                onClick={() => setShowNavModal(false)}
              >
                Juegos
              </Link>
              <Link
                to="/mensajes"
                className={`${styles.navModalLink} ${
                  location.pathname.startsWith('/mensajes')
                    ? styles.navModalLinkActive
                    : ''
                }`}
                onClick={() => setShowNavModal(false)}
              >
                Rincón de Mensajes
              </Link>
              <Link
                to="/fotos"
                className={`${styles.navModalLink} ${
                  location.pathname.startsWith('/fotos')
                    ? styles.navModalLinkActive
                    : ''
                }`}
                onClick={() => setShowNavModal(false)}
              >
                Fotos de la Boda
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

export default MobileNav
