import { Link } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import styles from "./Home.module.scss";

function Home() {
  return (
    <PageContainer>
      <div className={styles.home}>
        <div className={styles.header}>
          <div className={styles.decorativeTop}>
            <span className={styles.decorativeLine}></span>
            <span className={styles.heart}>💚</span>
            <span className={styles.decorativeLine}></span>
          </div>

          <h1 className={styles.title}>
            <span className={styles.titleWord}>Nos</span>
            <span className={styles.titleWord}>Casamos</span>
          </h1>

          <p className={styles.names}>Caro y Nico</p>

          <p className={styles.welcome}>Bienvenidos a nuestra página de boda</p>

          <div className={styles.decorativeBottom}>
            <span className={styles.decorativeLine}></span>
            <span className={styles.leaf}>🌿</span>
            <span className={styles.decorativeLine}></span>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <Link to="/cuando" className={styles.contentCard}>
            <div className={styles.cardIcon}>⏰</div>
            <h2 className={styles.cardTitle}>¿Cuándo?</h2>
            <p className={styles.cardDescription}>
              Guarda la fecha de nuestra celebración. Aquí encontrarás todos los
              detalles sobre el día en que dos almas se unen para siempre.
            </p>
            <span className={styles.cardLink}>Ver detalles →</span>
          </Link>

          <Link to="/detalles" className={styles.contentCard}>
            <div className={styles.cardIcon}>💚</div>
            <h2 className={styles.cardTitle}>Detalles</h2>
            <p className={styles.cardDescription}>
              Información sobre el lugar, horarios, código de vestimenta y todos
              los detalles importantes de nuestra celebración.
            </p>
            <span className={styles.cardLink}>Ver detalles →</span>
          </Link>

          <Link to="/nuestra-historia" className={styles.contentCard}>
            <div className={styles.cardIcon}>📖</div>
            <h2 className={styles.cardTitle}>Nuestra Historia</h2>
            <p className={styles.cardDescription}>
              Descubre cómo comenzó nuestro amor, desde el primer encuentro
              hasta el día de hoy. Un viaje lleno de momentos especiales y
              recuerdos que queremos compartir contigo.
            </p>
            <span className={styles.cardLink}>Explorar historia →</span>
          </Link>

          <Link to="/juegos" className={styles.contentCard}>
            <div className={styles.cardIcon}>🎮</div>
            <h2 className={styles.cardTitle}>Juegos</h2>
            <p className={styles.cardDescription}>
              Diviértete con juegos interactivos mientras esperas el gran día.
              ¡Pasa un buen rato, disfruta y recibe un premio!
            </p>
            <span className={styles.cardLink}>Explorar juegos →</span>
          </Link>

          <Link to="/mensajes" className={styles.contentCard}>
            <div className={styles.cardIcon}>💌</div>
            <h2 className={styles.cardTitle}>Rincón de Mensajes</h2>
            <p className={styles.cardDescription}>
              Déjanos un mensaje lleno de amor y buenos deseos. Comparte tus
              pensamientos y palabras especiales con nosotros.
            </p>
            <span className={styles.cardLink}>Dejar mensaje →</span>
          </Link>

          <Link to="/fotos" className={styles.contentCard}>
            <div className={styles.cardIcon}>📸</div>
            <h2 className={styles.cardTitle}>Fotos</h2>
            <p className={styles.cardDescription}>
              Aquí podrás ver y subir las fotos de nuestra celebración. Mantén
              un ojo en esta sección después del gran día.
            </p>
            <span className={styles.cardLink}>Ver fotos →</span>
          </Link>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            En este rincón del mundo, donde la naturaleza abraza nuestros
            sueños,
            <br />
            queremos compartir con ustedes el día más hermoso de nuestras vidas.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}

export default Home;
