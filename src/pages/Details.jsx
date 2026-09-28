import PageContainer from "../components/PageContainer";
import styles from "./Details.module.scss";

const MAPS_URL =
  "https://www.google.com/maps?sca_esv=88421a3c304670df&rlz=1C5CHFA_enUS1077US1078&sxsrf=APpeQns-nQ-R6oR4G4_K73UenpOWcAw83g:1783789774458&biw=1512&bih=692&uact=5&gs_lp=Egxnd3Mtd2l6LXNlcnAiFHJldGlybyBzYW4ganVhbiBtYXBzMgUQIRigATIFECEYoAEyBRAhGKABMgUQIRigAUjNFFDMA1jzE3ACeAGQAQCYAc0BoAHpDKoBBjAuMTIuMbgBA8gBAPgBAZgCDqAC5wvCAgoQABhHGNYEGLADwgIXEC4Y3AYYuAYY2gYY2AIYyAMYsAPYAQHCAgQQIxgnwgIGEAAYFhgewgIIEAAYgAQYogTCAgUQABiABMICCxAuGIAEGMcBGK8BmAMAiAYBkAYQugYGCAEQARgZkgcEMi4xMqAH1UKyBwQwLjEyuAfbC8IHBTAuNS45yAcugAgB&um=1&ie=UTF-8&fb=1&gl=co&sa=X&geocode=KdGrgi5xhj-OMX2aJ_wftVa2&daddr=Autopista+norte,+Av+Arrayanes+%23calle+212+kil%C3%B3metro+13,+Suba,+Bogot%C3%A1,+Cundinamarca";

function Details() {
  return (
    <PageContainer>
      <div className={styles.details}>
        <div className={styles.header}>
          <div className={styles.icon}>💚</div>
          <h1 className={styles.title}>Detalles</h1>
          <p className={styles.subtitle}>
            Después de tantos años caminando juntos, por fin llegó el momento
            de decirnos que sí para siempre, y no imaginamos ese día sin ti.
            Aquí te contamos todo lo que necesitas saber para que vivas cada
            minuto de esta celebración junto a nosotros.
          </p>
        </div>

        <div className={styles.hero}>
          <div className={styles.heroIcon}>📅</div>
          <p className={styles.heroDate}>16 de enero, 2027</p>
          <div className={styles.heroDivider} />
          <p className={styles.heroTime}>3:00 p.m.</p>
          <p className={styles.heroNote}>
            Te pedimos llegar con anticipación para que puedas acomodarte
            antes de que todo comience.
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📍</div>
            <h2 className={styles.cardTitle}>Lugar</h2>
            <p className={styles.cardText}>
              Retiro San Juan, rodeado de naturaleza y montañas.
              <br />
              Autopista Norte No. 212, Km 13 Vía Arrayanes, Bogotá.
            </p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cardButton}
            >
              Cómo llegar →
            </a>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>🚗</div>
            <h2 className={styles.cardTitle}>Transporte</h2>
            <p className={styles.cardText}>
              Puedes llegar en Uber. También contamos con servicio de
              conductor elegido para tu regreso.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>👔</div>
            <h2 className={styles.cardTitle}>Código de vestimenta</h2>
            <p className={styles.cardText}>
              Formal: traje con corbata para ellos, vestido largo para ellas
              — eso sí, combinado con tenis 👟, para que estés cómodo toda la
              noche. El blanco es solo para la novia.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>🎉</div>
            <h2 className={styles.cardTitle}>Celebración</h2>
            <p className={styles.cardText}>
              <strong>Cena y baile</strong> hasta que el cuerpo aguante.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>🥂</div>
            <h2 className={styles.cardTitle}>Solo adultos</h2>
            <p className={styles.cardText}>
              Será una noche solo para adultos. Gracias por tu comprensión.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>💌</div>
            <h2 className={styles.cardTitle}>Regalos</h2>
            <p className={styles.cardText}>
              Tu presencia es el mejor regalo. Si aun así quieres tener un
              detalle, organizamos una lluvia de sobres.
            </p>
          </div>
        </div>

        <div className={styles.faqSection}>
          <h2 className={styles.faqTitle}>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>
                ¿Es obligatorio usar tenis?
              </p>
              <p className={styles.faqAnswer}>
                ¡Sí, sin excepciones! Es el deseo expreso de los novios: así
                como no llegarías de blanco (ese color es solo de la novia) o
                en sudadera, tampoco llegues con zapatos formales — la pista
                de baile pide tenis 👟.
              </p>
            </div>

            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>
                ¿Hay algún color que deba evitar?
              </p>
              <p className={styles.faqAnswer}>
                Sí, el blanco está reservado exclusivamente para la novia —
                cualquier otro color es bienvenido.
              </p>
            </div>

            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>
                ¿Hasta cuándo puedo confirmar mi asistencia?
              </p>
              <p className={styles.faqAnswer}>
                Puedes confirmar o actualizar tu respuesta hasta el 1 de
                diciembre de 2026, entrando de nuevo al link de tu invitación.
              </p>
            </div>

            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>
                ¿Habrá opciones para alergias o restricciones alimenticias?
              </p>
              <p className={styles.faqAnswer}>
                Sí, cuéntanos en el formulario de confirmación y nos
                encargamos de que tengas algo delicioso para comer.
              </p>
            </div>

            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Puedo llevar niños?</p>
              <p className={styles.faqAnswer}>
                Será una noche solo para adultos, así que te pedimos no
                traerlos. ¡Gracias por tu comprensión!
              </p>
            </div>

            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>
                ¿Cómo regreso si no tengo carro?
              </p>
              <p className={styles.faqAnswer}>
                Contamos con servicio de conductor elegido para tu regreso, o
                puedes pedir un Uber directamente desde el lugar.
              </p>
            </div>
          </div>
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

export default Details;
