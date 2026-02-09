import PageContainer from '../components/PageContainer'
import styles from './OurStory.module.scss'

function OurStory() {
  return (
    <PageContainer>
      <div className={styles.historia}>
        <h1 className={styles.title}>Nuestra Historia</h1>
        
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>El Destino nos Unió</h2>
          <p className={styles.text}>
            En un día donde el sol besaba la tierra y la primavera despertaba, nuestros caminos 
            se encontraron de la manera más hermosa e inesperada. Fue en ese momento mágico cuando 
            una casualidad se transformó en el inicio de nuestra historia de amor. Como si el universo 
            hubiera conspirado para que nuestros ojos se encontraran, supimos desde el primer instante 
            que algo extraordinario había comenzado.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>La Primera Conversación</h2>
          <p className={styles.text}>
            Las palabras fluyeron como un río sereno, encontrando su cauce natural entre nuestras almas. 
            Hablamos de sueños que aún no conocíamos, de risas que resonarían en nuestros corazones 
            para siempre, y de esa conexión inexplicable que solo se siente cuando encuentras a tu 
            persona. En ese instante, el tiempo se detuvo y comprendimos que habíamos encontrado 
            algo que cambiaría nuestras vidas para siempre.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Construyendo Nuestro Mundo</h2>
          <p className={styles.text}>
            Cada día juntos fue una página nueva en el libro de nuestra historia. Desde los pequeños 
            momentos cotidianos hasta las grandes aventuras que emprendimos, cada experiencia nos 
            enseñó a amarnos más profundamente. Aprendimos que el amor verdadero no es solo compartir 
            la felicidad, sino también sostenernos en los momentos difíciles, crecer juntos y construir 
            un futuro lleno de promesas y sueños compartidos.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>El Sí que Cambió Todo</h2>
          <p className={styles.text}>
            Bajo un cielo que parecía pintado especialmente para nosotros, rodeados por la naturaleza 
            que siempre ha sido testigo de nuestros momentos más íntimos, llegó la pregunta que marcaría 
            el inicio de una nueva etapa. Con el corazón latiendo al unísono y las emociones a flor de 
            piel, ese "sí" resonó como la promesa más hermosa que dos almas pueden hacer. En ese instante, 
            supimos que estábamos listos para escribir juntos el capítulo más hermoso de nuestras vidas.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>El Futuro que Esperamos</h2>
          <p className={styles.text}>
            Hoy, mientras nos preparamos para el día en que nuestras almas se unirán para siempre, 
            miramos hacia atrás con el corazón lleno de gratitud por cada momento compartido. Y hacia 
            adelante, con la certeza de que los mejores días están por venir. Queremos que seas parte 
            de esta celebración, porque tu presencia hará que este momento sea aún más especial. 
            Gracias por ser parte de nuestra historia y por acompañarnos en este hermoso viaje llamado amor.
          </p>
        </section>
      </div>
    </PageContainer>
  )
}

export default OurStory

