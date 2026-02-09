import { useState, useEffect } from "react";
import { useAudio } from "../contexts/AudioContext";
import PageContainer from "../components/PageContainer";
import styles from "./When.module.scss";
import saveTheDateImage from "../assets/save-the-date.png";

function When() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { pauseAudio, playAudio } = useAudio();

  // Convertir URL de YouTube a formato embed
  const videoId = "bbt_i4xl9Hs";
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  // Pausar música cuando se entra a esta página
  useEffect(() => {
    pauseAudio();
    // Reanudar música cuando se sale de la página
    return () => {
      playAudio();
    };
  }, [pauseAudio, playAudio]);

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "unset";
  };

  return (
    <PageContainer>
      <div className={styles.cuando}>
        <h1 className={styles.title}>¿Cuándo?</h1>

        <div className={styles.videoContainer}>
          <iframe
            className={styles.youtubeVideo}
            src={embedUrl}
            title="Video de la boda"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div className={styles.contentContainer}>
          <div className={styles.imageContainer}>
            <img
              src={saveTheDateImage}
              alt="Guarda la fecha - Enero 16, Bogotá 2027"
              className={styles.saveTheDateImage}
              onClick={openModal}
              style={{ cursor: "pointer" }}
            />
          </div>

          {isModalOpen && (
            <div className={styles.modal} onClick={closeModal}>
              <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <button className={styles.closeButton} onClick={closeModal}>
                  ×
                </button>
                <img
                  src={saveTheDateImage}
                  alt="Guarda la fecha - Enero 16, Bogotá 2027"
                  className={styles.modalImage}
                />
              </div>
            </div>
          )}

          <div className={styles.textContainer}>
            <div className={styles.textContent}>
              <h2 className={styles.textTitle}>Guarda la fecha</h2>
              <p className={styles.textParagraph}>
                Queremos que seas parte de esta historia, que compartas con
                nosotros cada sonrisa, cada abrazo y cada instante de felicidad.
                Tu presencia hará que este día sea aún más especial.
              </p>
              <p className={styles.textParagraph}>
                Por eso te pedimos que apartes el 16 de enero de 2027 para que
                nos acompañes a nuestro matrimonio. Más adelante, con la
                invitación oficial, recibirás los detalles específicos.
              </p>
              <p className={styles.textSignature}>
                Con cariño,
                <br />
                Nico y Caro
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default When;
