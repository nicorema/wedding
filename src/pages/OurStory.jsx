import { useState, useEffect, useRef, useMemo } from "react";
import PageContainer from "../components/PageContainer";
import styles from "./OurStory.module.scss";
import couplePhoto from "../assets/couple-photo.png";
import friendsPhoto from "../assets/friends-photo.png";
import keysPhoto from "../assets/keys-photo.png";
import canalPhoto from "../assets/canal-photo.png";
import dragonIllustration from "../assets/dragon-illustration.png";
import closingPhoto from "../assets/closing-photo.png";
import kissPhoto from "../assets/kiss-photo.png";

// Contenido original sin dividir
const originalContent = [
  {
    date: "Halloween 2011",
    content: [
      "No lo sabía, pero ese día mi vida iba a cambiar para siempre. Ya nos habíamos visto antes; desde su punto de vista una niña medio rarita con el pelo de colores y cara de pocos amigos; desde el mío, el nuevo vecino de mis amigas de la casa 17. Nada más. Hasta ese día.",
      "Como solía ser el caso, yo estaba cuidando de unas 7 niñas cinco años menores que yo, revisando y organizando sus disfraces y su maquillaje en la calle alistándonos a todas para ir a pedir dulces en Camino de Arrayanes. Un conjunto enorme lleno de gente dispuesta a dar dulces, y hacer de sus casas experiencias de terror y diversión para todos los niños que teníamos la fortuna de pasar allá la tan esperada fecha. Ya ese era mi día favorito del año, pero poco sabía que el haberlo conocido a él haría de esa fecha algo aún más especial en mi vida.",
      'QUÉ OSO que sentí cuando una de las niñas ve a un tipo despreocupado, unos dos años mayor que yo, con una cara seria y una pinta algo intimidante, y me grita a todo pulmón "¡MIRA! AHÍ VA TU NOVIO". Trágame tierra. Pero con una sonrisa, y supongo que, movido por la ternura del jardín infantil bajo mi cuidado, él solo dijo "Hola, novia".',
    ],
  },
  {
    date: null,
    content: [
      "Me acuerdo perfectamente de ese día. Pidiéndole permiso a mi papá cada media hora, me quedé con él hablando hasta la 1 de la mañana. Y ya desde ahí, nació la amistad más bonita que he tenido el privilegio de tener en mi vida: mensajes por Messenger todos los días, visitas a Arrayanes quincenales de mi parte, gustos musicales parecidos, recomendaciones de libros, canciones, películas, riéndonos sin parar cada vez que nos veíamos. Aún hoy en día muchos de esos aspectos de nuestra amistad siguen intactos. Pero qué difícil es mantener solamente una amistad cuando el corazón se ve involucrado.",
    ],
  },
  {
    date: null,
    image: couplePhoto,
    content: [],
  },
  {
    date: null,
    content: [
      "Llegaron varias adversidades que no faltan en ninguna historia. Esas adversidades nos sacudieron, pero nosotros jamás dejamos de ser amigos. ¿Y qué más necesita uno que un gran amigo cuando llegan los tiempos difíciles? Por fortuna para mí, él estuvo ahí, y como lo sigue siendo hoy tantos años después, fue el hombro en el que pude llorar y desahogar el dolor que sentía. Pero de nuevo, qué difícil lidiar con una amistad cuando el corazón desesperadamente anhela algo más.",
      "Sin embargo, la vida tiene la forma de acomodarse como uno lo necesita, y después de un ligero traspié (literal) jugando Twister en la casa de alguno de nuestros amigos, de nuevo su hombro fue el lugar donde me pude apoyar para llegar a salvo a mi destino. Y de ahí, ya no hubo vuelta atrás. Esa noche, mientras me llevaba a mi casa, lo pude ver en sus ojos, esa dificultad no era más que un grito de auxilio porque no podíamos mantenernos alejados el uno del otro. Esa dificultad estaba ahí porque llevábamos mucho tiempo negando la existencia de la cosa más real que habíamos sentido en nuestras vidas, y era demasiado grande para comprender siendo tan pequeños. Y después de ese día, mi vida como la conozco hoy se empezó a construir.",
    ],
  },
  {
    date: "14 de Febrero del 2013",
    content: [
      'Después de varias salidas, conversaciones y la búsqueda casi interminable de un dragón de peluche (que aún conservo) que simbolizaba lo que estaría él siempre dispuesto a hacer por mí, no pude más y le dije la típica frase que espanta a cualquiera que va caminando con cuidado por un camino desconocido: "Bueno, ¿tú y yo qué somos?" y con todo el miedo y la inseguridad que le producía todo lo bueno y lo malo que yo le hacía sentir en su corazón me pidió que fuéramos novios.',
    ],
  },
  {
    date: null,
    content: [
      '¿Quién creería que una relación que inicia en el colegio fuera a soportar tantos cambios? Este amor sobrevivió el grado del colegio, la distancia, nuestras carreras universitarias, nuestros grados de la universidad, nuestro inicio en el mundo laboral, nuestro paso al mundo adulto y más. En el camino, los amigos que hacía uno, se volvían indispensables en la vida de ambos. Construimos un equipo, una pareja que la gente ve y dice "Creo en el amor por ustedes dos."',
    ],
  },
  {
    date: null,
    content: [
      "No fue por una fórmula mágica. Fue resiliencia en nombre del amor y la amistad, fue el creer en los sueños y decisiones del otro, aunque no las entendiéramos, fue acierto y fue error, fue el poner la amistad primero, fue el luchar todos los días por mantener el gran tesoro que teníamos.",
      "Fue el aprender a comunicarnos en el idioma del otro y conocer todos sus recovecos, aspiraciones, heridas, errores, traumas, y ayudar a sacar la mejor versión que vive en cada uno.",
    ],
  },
  {
    date: null,
    image: kissPhoto,
    content: [],
  },
  {
    date: null,
    content: [
      "Los eventos trágicos tienen una forma peculiar de parar el tiempo, darle la vuelta a la vida, y resetearla. La muerte de uno de esos grandes amigos que se había vuelto indispensable en la vida de ambos nos sacudió la existencia. Nos destruyó y reconstruyó en otras personas.",
      "Nos dio una nueva perspectiva de la vida, y una nueva serie de problemas con los cuales debíamos lidiar. Menos mal nos teníamos el uno al otro. Nos tomamos de la mano para salir del otro lado como nuevos individuos, aún más unidos de lo que estábamos antes.",
    ],
  },
  {
    date: null,
    image: friendsPhoto,
    content: [],
  },
  {
    date: "Marzo 2024",
    content: [
      "Movidos por un nuevo entendimiento de la vida como algo que hay que disfrutar, y habiendo aprendido que los riesgos que se toman y las palabras que se dicen valen más que los arrepentimientos que se pueden llegar a tener cuando ya es muy tarde, decidimos volar de nuestros nidos, y formar juntos un nuevo hogar. No fue fácil. La muerte, la enfermedad, la mente y la convivencia son obstáculos grandes para cualquiera. Pero él y yo somos un equipo. Nos encargamos de cuidar y empujar al otro cuando lo necesita. Él y yo somos mejores amigos, entonces el mundo se puede caer alrededor, pero ahí estaremos siempre para apoyarnos. Y así fue, y así ha sido. Poco a poco, el estar presentes y dispuestos, cuidando a Penny, empujándonos a mejorar y salir adelante, hizo que recobráramos por partes esas personas que solíamos ser, y con la ayuda de las piezas faltantes que nos entregábamos mutuamente, nos reconstruimos, y aquí estamos hoy. En pie, con la frente en alto, y sonriendo a la vida.",
    ],
  },
  {
    date: null,
    image: keysPhoto,
    content: [],
  },
  {
    date: "8 de Diciembre 2025",
    content: [
      "En medio del caos, la reconstrucción, y la cotidianidad, Nico me llevó a una casita en las montañas. Una casita que se ajusta a nuestra personalidad nerd y es la réplica de la casita de los Hobbits en El Señor de los Anillos. En medio de ese lugar tan mágico, con unas montañas que rodeaban todo como grandes paredes que nos alejaban de todo lo malo que puede pasar en el mundo, se encontraba un pequeñito lugar pensado a la medida para que yo me sintiera como parte de una de las historias de fantasía que tanto me encantan. Es imposible no creer en la magia cuando la vida se ve así.",
    ],
  },
  {
    date: null,
    content: [
      "Ahí, solo con la compañía del otro, y un anillo perfecto para quienes somos, él se arrodilló y me pidió pasar el resto de mi vida junto a él. Por supuesto le dije que sí, porque después de tanto tiempo es imposible imaginarme una vida sin él. Después de todo, mi futuro siempre tuvo una sola constante: él.",
    ],
  },
  {
    date: null,
    image: canalPhoto,
    content: [],
  },
  {
    date: null,
    content: [
      "Mi mejor amigo, mi hombro para llorar y caminar, mi camino a nuevas y profundas amistades, mi polo a tierra, mi cómplice, mi príncipe azul, mi familia y el caballero en armadura brillante que no viene a derrotar todos los dragones que se atraviesen en mi camino, sino a aprender a buscarlos, domarlos y volar sobre ellos siempre abrazada de su espalda. Siempre habrá más dragones, pero yo me voy a sentir feliz, completa y a salvo si él está ahí.",
    ],
  },
];

// Función simple: dividir contenido en páginas con máximo 2 párrafos por página
// Las fechas son páginas individuales dedicadas
// Las imágenes son páginas individuales dedicadas
const divideContentIntoPages = (content) => {
  const pages = [];
  let currentPage = {
    date: null,
    content: [],
    isDatePage: false,
    image: null,
    isImagePage: false,
  };

  content.forEach((section) => {
    // Si tiene imagen, crear página dedicada solo para la imagen
    if (section.image) {
      // Guardar página anterior si tiene contenido
      if (currentPage.content.length > 0) {
        pages.push({
          date: currentPage.date,
          content: [...currentPage.content],
          isDatePage: false,
          image: null,
          isImagePage: false,
        });
      }

      // Crear página dedicada solo para la imagen
      pages.push({
        date: section.date,
        content: [],
        isDatePage: false,
        image: section.image,
        isImagePage: true,
      });

      // Empezar nueva página para el contenido
      currentPage = {
        date: null,
        content: [],
        isDatePage: false,
        image: null,
        isImagePage: false,
      };
    }

    // Si tiene fecha, crear página dedicada solo para la fecha
    if (section.date) {
      // Guardar página anterior si tiene contenido
      if (currentPage.content.length > 0) {
        pages.push({
          date: currentPage.date,
          content: [...currentPage.content],
          isDatePage: false,
          image: null,
          isImagePage: false,
        });
      }

      // Crear página dedicada solo para la fecha
      pages.push({
        date: section.date,
        content: [],
        isDatePage: true,
        image: null,
        isImagePage: false,
      });

      // Empezar nueva página para el contenido
      currentPage = {
        date: null,
        content: [],
        isDatePage: false,
        image: null,
        isImagePage: false,
      };
    }

    // Agregar párrafos (máximo 2 por página)
    section.content.forEach((paragraph) => {
      if (currentPage.content.length >= 2) {
        pages.push({
          date: currentPage.date,
          content: [...currentPage.content],
          isDatePage: false,
          image: null,
          isImagePage: false,
        });
        currentPage = {
          date: null,
          content: [],
          isDatePage: false,
          image: null,
          isImagePage: false,
        };
      }
      currentPage.content.push(paragraph);
    });
  });

  // Agregar última página
  if (currentPage.content.length > 0) {
    pages.push({
      date: currentPage.date,
      content: currentPage.content,
      isDatePage: false,
      image: null,
      isImagePage: false,
    });
  }

  return pages;
};

function OurStory() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState("next");

  // Dividir contenido en páginas (máximo 2 párrafos por página)
  const contentPages = divideContentIntoPages(originalContent);

  // Agregar portada al inicio y cierre al final
  const pages = [
    {
      date: null,
      content: [],
      isDatePage: false,
      image: dragonIllustration,
      isImagePage: false,
      isCoverPage: true,
      coverTitle: "Nuestra Historia",
      coverAuthor: "Por: Carolina García Trujillo",
    },
    ...contentPages,
    {
      date: null,
      content: [],
      isDatePage: false,
      image: closingPhoto,
      isImagePage: false,
      isCoverPage: false,
      isClosingPage: true,
    },
  ];

  // Resetear a la primera página cuando se abre el modal
  useEffect(() => {
    if (isModalOpen) {
      setCurrentPage(0);
    }
  }, [isModalOpen]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const nextPage = () => {
    if (currentPage < pages.length - 1 && !isFlipping) {
      setFlipDirection("next");
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsFlipping(false);
      }, 400);
    }
  };

  const prevPage = () => {
    if (currentPage > 0 && !isFlipping) {
      setFlipDirection("prev");
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsFlipping(false);
      }, 400);
    }
  };

  const handlePageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x > width / 2) {
      nextPage();
    } else {
      prevPage();
    }
  };

  const handleCloseModal = (e) => {
    if (
      e.target === e.currentTarget ||
      e.target.closest(`.${styles.closeButton}`)
    ) {
      setIsModalOpen(false);
    }
  };

  return (
    <PageContainer>
      <div className={styles.container}>
        <h1 className={styles.title}>Nuestra Historia</h1>
        <p className={styles.subtitle}>
          Descubre nuestra historia de amor a través de las páginas de nuestro
          libro
        </p>
        <button
          className={styles.openBookButton}
          onClick={() => setIsModalOpen(true)}
        >
          <span className={styles.bookIcon}>📖</span>
          <span>Leer Nuestra Historia</span>
        </button>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent}>
            <div className={styles.bookContainer}>
              <button className={styles.closeButton} onClick={handleCloseModal}>
                ✕
              </button>
              <div className={styles.bookWrapper}>
                <div
                  className={`${styles.book} ${
                    isFlipping ? styles.flipping : ""
                  } ${
                    isFlipping && flipDirection === "next"
                      ? styles.flipNext
                      : ""
                  } ${
                    isFlipping && flipDirection === "prev"
                      ? styles.flipPrev
                      : ""
                  }`}
                >
                  <div className={styles.page}>
                    <div
                      className={`${styles.pageContent} ${
                        pages[currentPage]?.isDatePage ? styles.datePage : ""
                      } ${
                        pages[currentPage]?.isImagePage ? styles.imagePage : ""
                      } ${
                        pages[currentPage]?.isCoverPage ? styles.coverPage : ""
                      } ${
                        pages[currentPage]?.isClosingPage
                          ? styles.closingPage
                          : ""
                      }`}
                    >
                      {pages[currentPage]?.isCoverPage ? (
                        <div className={styles.coverPageContent}>
                          <div className={styles.coverTitle}>
                            {pages[currentPage].coverTitle}
                          </div>
                          {pages[currentPage].image && (
                            <img
                              src={pages[currentPage].image}
                              alt="Ilustración"
                              className={styles.coverImage}
                            />
                          )}
                          <div className={styles.coverAuthor}>
                            {pages[currentPage].coverAuthor}
                          </div>
                        </div>
                      ) : pages[currentPage]?.isClosingPage ? (
                        <div className={styles.closingPageContent}>
                          <img
                            src={pages[currentPage].image}
                            alt="Nuestra historia"
                            className={styles.closingImage}
                          />
                          <div className={styles.closingText}>
                            <span className={styles.theEnd}>Fin</span>
                            <span className={styles.theBeginning}>Inicio</span>
                          </div>
                        </div>
                      ) : pages[currentPage]?.isDatePage ? (
                        <div className={styles.datePageContent}>
                          <div className={styles.dateTitle}>
                            {pages[currentPage].date}
                          </div>
                        </div>
                      ) : pages[currentPage]?.isImagePage ? (
                        <div className={styles.imagePageContent}>
                          <img
                            src={pages[currentPage].image}
                            alt="Nuestra historia"
                            className={styles.storyImage}
                          />
                        </div>
                      ) : (
                        <>
                          {pages[currentPage]?.date && (
                            <div className={styles.date}>
                              {pages[currentPage].date}
                            </div>
                          )}
                          <div className={styles.textContent}>
                            {pages[currentPage]?.content.map(
                              (paragraph, index) => (
                                <p key={index} className={styles.text}>
                                  {paragraph.trim()}
                                </p>
                              )
                            )}
                          </div>
                        </>
                      )}
                      {!pages[currentPage]?.isCoverPage && (
                        <div className={styles.pageNumber}>
                          {currentPage + 1} / {pages.length}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.controls}>
                  <button
                    className={styles.navButton}
                    onClick={prevPage}
                    disabled={currentPage === 0 || isFlipping}
                  >
                    ← Anterior
                  </button>
                  <button
                    className={styles.navButton}
                    onClick={nextPage}
                    disabled={currentPage === pages.length - 1 || isFlipping}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default OurStory;
