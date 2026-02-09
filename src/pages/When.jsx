import PageContainer from '../components/PageContainer'
import styles from './When.module.scss'

function When() {
  return (
    <PageContainer>
      <div className={styles.cuando}>
        <h1 className={styles.title}>¿Cuándo?</h1>
        <p className={styles.subtitle}>El día en que dos almas se unen para siempre</p>
        
        <div className={styles.imageContainer}>
          <div className={styles.placeholderImage}>
            <div className={styles.imageContent}>
              <h2 className={styles.saveTheDate}>Guarda la Fecha</h2>
              <p className={styles.dateText}>Fecha por confirmar</p>
              <p className={styles.placeholderNote}>
                Pronto compartiremos contigo todos los detalles de nuestra celebración
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default When

