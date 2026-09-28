import PageContainer from "../components/PageContainer";
import styles from "./Details3.module.scss";

const MAPS_URL =
  "https://www.google.com/maps?sca_esv=88421a3c304670df&rlz=1C5CHFA_enUS1077US1078&sxsrf=APpeQns-nQ-R6oR4G4_K73UenpOWcAw83g:1783789774458&biw=1512&bih=692&uact=5&gs_lp=Egxnd3Mtd2l6LXNlcnAiFHJldGlybyBzYW4ganVhbiBtYXBzMgUQIRigATIFECEYoAEyBRAhGKABMgUQIRigAUjNFFDMA1jzE3ACeAGQAQCYAc0BoAHpDKoBBjAuMTIuMbgBA8gBAPgBAZgCDqAC5wvCAgoQABhHGNYEGLADwgIXEC4Y3AYYuAYY2gYY2AIYyAMYsAPYAQHCAgQQIxgnwgIGEAAYFhgewgIIEAAYgAQYogTCAgUQABiABMICCxAuGIAEGMcBGK8BmAMAiAYBkAYQugYGCAEQARgZkgcEMi4xMqAH1UKyBwQwLjEyuAfbC8IHBTAuNS45yAcugAgB&um=1&ie=UTF-8&fb=1&gl=co&sa=X&geocode=KdGrgi5xhj-OMX2aJ_wftVa2&daddr=Autopista+norte,+Av+Arrayanes+%23calle+212+kil%C3%B3metro+13,+Suba,+Bogot%C3%A1,+Cundinamarca";

const rows = [
  {
    title: "Fecha y hora",
    text: "16 de enero, 2027 · 3:00 p.m. Te pedimos llegar con anticipación para que puedas acomodarte antes de que todo comience.",
  },
  {
    title: "Lugar",
    text: "Retiro San Juan — Autopista Norte No. 212, Km 13 Vía Arrayanes, Bogotá. Elegimos este lugar porque queremos celebrar rodeados de naturaleza y montañas.",
    button: { label: "Cómo llegar", href: MAPS_URL },
  },
  {
    title: "Celebración",
    text: "Cena y baile. Al terminar la ceremonia, la fiesta sigue con música y baile hasta que el cuerpo aguante.",
  },
  {
    title: "Vestimenta",
    text: "Formal: traje con corbata para ellos, vestido largo para ellas — combinado con tenis 👟 para bailar cómodos toda la noche. El blanco queda reservado únicamente para la novia.",
  },
  {
    title: "Transporte",
    text: "Puedes llegar en Uber. El lugar también cuenta con servicio de conductor elegido para tu regreso.",
  },
  {
    title: "Solo adultos",
    text: "Será un evento solo para adultos. Gracias por tu comprensión y cariño.",
  },
  {
    title: "Regalos",
    text: "Lo único que necesitamos ese día es tenerte cerca. Si aun así quieres tener un detalle, organizamos una lluvia de sobres.",
  },
];

function Details3() {
  return (
    <PageContainer>
      <div className={styles.bleed}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>16 · 01 · 2027</p>
          <h1 className={styles.title}>Detalles</h1>

          <div className={styles.rows}>
            {rows.map((row, index) => (
              <div
                className={`${styles.row} ${
                  index % 2 === 1 ? styles.rowReverse : ""
                }`}
                key={row.title}
              >
                <span className={styles.rowNumber}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className={styles.rowContent}>
                  <h2 className={styles.rowTitle}>{row.title}</h2>
                  <p className={styles.rowText}>{row.text}</p>
                  {row.button && (
                    <a
                      href={row.button.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.rowButton}
                    >
                      {row.button.label} →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className={styles.signature}>Nico &amp; Caro</p>
        </div>
      </div>
    </PageContainer>
  );
}

export default Details3;
