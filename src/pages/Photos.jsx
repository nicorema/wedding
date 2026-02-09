import PageContainer from '../components/PageContainer'
import styles from './Photos.module.scss'

function Photos() {
  return (
    <PageContainer>
      <div className={styles.photos}>
        <div className={styles.content}>
          <div className={styles.icon}>📸</div>
          <h1 className={styles.title}>Fotos de la Boda</h1>
          <p className={styles.message}>
            Aquí podrás <strong>ver y subir</strong> las fotos de nuestra celebración.
            <br />
            <strong>Mantén un ojo en esta sección después del gran día</strong> para ver y compartir todos los momentos especiales.
          </p>
          <div className={styles.comingSoon}>
            <p className={styles.comingSoonText}>
              Las fotos estarán disponibles después de nuestra boda.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default Photos

