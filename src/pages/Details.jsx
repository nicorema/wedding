import PageContainer from "../components/PageContainer";
import styles from "./Details.module.scss";

function Details() {
  return (
    <PageContainer>
      <div className={styles.details}>
        <div className={styles.content}>
          <div className={styles.icon}>💚</div>
          <h1 className={styles.title}>Detalles</h1>
          <p className={styles.message}>
            Aquí encontrarás <strong>todos los detalles</strong> de nuestra
            celebración.
            <br />
            <strong>Próximamente tendrás todos estos detalles</strong> sobre el
            lugar, horarios, código de vestimenta y toda la información
            importante de nuestra boda.
          </p>
          <div className={styles.comingSoon}>
            <p className={styles.comingSoonText}>
              Los detalles estarán disponibles próximamente.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default Details;
