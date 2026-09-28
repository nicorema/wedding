import PageContainer from "../components/PageContainer";
import styles from "./Details2.module.scss";

const MAPS_URL =
  "https://www.google.com/maps?sca_esv=88421a3c304670df&rlz=1C5CHFA_enUS1077US1078&sxsrf=APpeQns-nQ-R6oR4G4_K73UenpOWcAw83g:1783789774458&biw=1512&bih=692&uact=5&gs_lp=Egxnd3Mtd2l6LXNlcnAiFHJldGlybyBzYW4ganVhbiBtYXBzMgUQIRigATIFECEYoAEyBRAhGKABMgUQIRigAUjNFFDMA1jzE3ACeAGQAQCYAc0BoAHpDKoBBjAuMTIuMbgBA8gBAPgBAZgCDqAC5wvCAgoQABhHGNYEGLADwgIXEC4Y3AYYuAYY2gYY2AIYyAMYsAPYAQHCAgQQIxgnwgIGEAAYFhgewgIIEAAYgAQYogTCAgUQABiABMICCxAuGIAEGMcBGK8BmAMAiAYBkAYQugYGCAEQARgZkgcEMi4xMqAH1UKyBwQwLjEyuAfbC8IHBTAuNS45yAcugAgB&um=1&ie=UTF-8&fb=1&gl=co&sa=X&geocode=KdGrgi5xhj-OMX2aJ_wftVa2&daddr=Autopista+norte,+Av+Arrayanes+%23calle+212+kil%C3%B3metro+13,+Suba,+Bogot%C3%A1,+Cundinamarca";

const manifestItems = [
  {
    label: "Celebración",
    text: "Cena y baile — la fiesta sigue con música hasta que el cuerpo aguante.",
  },
  {
    label: "Transporte",
    text: "Puedes llegar en Uber. El lugar también cuenta con servicio de conductor elegido para tu regreso.",
  },
  {
    label: "Vestimenta",
    text: "Formal: traje con corbata para ellos, vestido largo para ellas — combinado con tenis 👟 para bailar cómodos toda la noche. El blanco queda reservado únicamente para la novia.",
  },
  {
    label: "Solo adultos",
    text: "Será un evento solo para adultos. Gracias por tu comprensión y cariño.",
  },
  {
    label: "Regalos",
    text: "Lo único que necesitamos es tenerte cerca. Si aun así quieres tener un detalle, organizamos una lluvia de sobres.",
  },
];

function Details2() {
  return (
    <PageContainer>
      <div className={styles.details}>
        <div className={styles.header}>
          <p className={styles.kicker}>Guarda este pase</p>
          <h1 className={styles.title}>Nico &amp; Caro</h1>
        </div>

        <div className={styles.ticket}>
          <div className={styles.ticketMain}>
            <div className={styles.ticketRow}>
              <div className={styles.ticketField}>
                <span className={styles.ticketLabel}>Fecha</span>
                <span className={styles.ticketValue}>16.01.2027</span>
              </div>
              <div className={styles.ticketField}>
                <span className={styles.ticketLabel}>Hora</span>
                <span className={styles.ticketValue}>3:00 PM</span>
              </div>
            </div>

            <div className={styles.ticketField}>
              <span className={styles.ticketLabel}>Lugar</span>
              <span className={styles.ticketValue}>Retiro San Juan</span>
              <span className={styles.ticketSub}>
                Autopista Norte No. 212, Km 13 Vía Arrayanes · Bogotá
              </span>
            </div>

            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ticketLink}
            >
              Cómo llegar →
            </a>
          </div>

          <div className={styles.ticketPerforation}>
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} className={styles.perfDot} />
            ))}
          </div>

          <div className={styles.ticketStub}>
            <div className={styles.barcode} />
            <p className={styles.stubBig}>ADMIT</p>
            <p className={styles.stubNote}>Llega con anticipación</p>
          </div>
        </div>

        <div className={styles.manifest}>
          <h2 className={styles.manifestTitle}>Instrucciones de vuelo</h2>
          {manifestItems.map((item) => (
            <div className={styles.manifestItem} key={item.label}>
              <span className={styles.manifestLabel}>{item.label}</span>
              <span className={styles.manifestLeader} />
              <p className={styles.manifestText}>{item.text}</p>
            </div>
          ))}
        </div>

        <p className={styles.signature}>
          Con cariño,
          <br />
          Nico y Caro
        </p>
      </div>
    </PageContainer>
  );
}

export default Details2;
