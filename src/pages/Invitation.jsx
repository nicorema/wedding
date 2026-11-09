import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import styles from "./Invitation.module.scss";
import couplePhoto from "../assets/couple-photo.png";
import kissPhoto from "../assets/kiss-photo.png";
import canalPhoto from "../assets/canal-photo.png";

const getGreetingName = (guest) => {
  if (guest.group_name) return guest.group_name;
  const ownName = guest.nickname || guest.first_name;
  const namedCompanions = (guest.companion_names || []).filter(Boolean);
  if (namedCompanions.length) {
    return `${ownName} y ${namedCompanions.join(", ")}`;
  }
  return ownName;
};

const allergyChoiceFromText = (text) => {
  if (!text) return { choice: "none", text: "" };
  if (text === "Vegetariano") return { choice: "vegetarian", text: "" };
  if (text === "Vegano") return { choice: "vegan", text: "" };
  return { choice: "other", text };
};

const allergyLabel = (entry) => {
  if (!entry || !entry.choice) return null;
  if (entry.choice === "none") return null;
  if (entry.choice === "vegetarian") return "Vegetariano";
  if (entry.choice === "vegan") return "Vegano";
  return entry.text.trim() || null;
};

// Parses the "Nombre: Detalle | Otro Nombre: Detalle" format used when a
// party has more than one person, to pre-fill each person's answer on
// reload. Returns null if the text doesn't match that format (e.g. it was
// hand-edited in the Manager), so the caller can leave it unanswered
// instead of guessing wrong.
const parseAllergiesByName = (text) => {
  if (!text) return {};
  const parts = text.split(" | ").map((p) => p.trim());
  const byName = {};
  const matched = parts.every((part) => {
    const idx = part.indexOf(": ");
    if (idx === -1) return false;
    byName[part.slice(0, idx)] = part.slice(idx + 2);
    return true;
  });
  return matched ? byName : null;
};

function Invitation() {
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid");
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);

  const [attending, setAttending] = useState(null);
  const [companionNames, setCompanionNames] = useState([]);
  const [pendingIndexes, setPendingIndexes] = useState([]);
  const [personAllergies, setPersonAllergies] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isRolling, setIsRolling] = useState(false);
  const [diceFace, setDiceFace] = useState(20);

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const fallbackGuest = {
    first_name: "Invitado",
    nickname: null,
    companion_names: [],
    group_name: null,
    attending: null,
    allergies: null,
  };

  useEffect(() => {
    // TODO: temporarily using fallbackGuest for missing/invalid uuid so we
    // have something to demo. Bring back the redirect-to-"/" guard
    // (Navigate to="/" replace on notFound) before this goes live.
    if (!uuid) {
      setGuest(fallbackGuest);
      setAttending(null);
      setLoading(false);
      return;
    }

    fetch(`/api/guests?uuid=${encodeURIComponent(uuid)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Guest not found");
        }
        return response.json();
      })
      .then((data) => {
        setGuest(data);
        setAttending(data.attending);
        const names = data.companion_names || [];
        setCompanionNames(names);
        setPendingIndexes(
          names.map((name, i) => (name ? null : i)).filter((i) => i !== null)
        );

        const namedCompanions = names.filter(Boolean);
        const totalPeople = 1 + namedCompanions.length;

        if (data.attending !== null) {
          if (totalPeople <= 1) {
            // Solo party: stored as one plain label, no name prefix.
            setPersonAllergies({
              self: allergyChoiceFromText(data.allergies),
            });
          } else {
            const byName = parseAllergiesByName(data.allergies);
            if (byName) {
              const selfName = data.nickname || data.first_name;
              const prefilled = {
                self: allergyChoiceFromText(byName[selfName]),
              };
              names.forEach((name, i) => {
                if (name) {
                  prefilled[`companion-${i}`] = allergyChoiceFromText(
                    byName[name]
                  );
                }
              });
              setPersonAllergies(prefilled);
            }
            // If it doesn't match the expected format (e.g. hand-edited in
            // the Manager), leave it unanswered rather than guessing wrong.
          }
        }
      })
      .catch(() => setGuest(fallbackGuest))
      .finally(() => setLoading(false));
  }, [uuid]);

  if (loading) {
    return null;
  }

  const isPlural =
    Boolean(guest.group_name) || (guest.companion_names || []).some(Boolean);

  const people = [
    { key: "self", name: guest.nickname || guest.first_name },
    ...companionNames
      .map((name, i) => ({ key: `companion-${i}`, name }))
      .filter((p) => p.name),
  ];

  const setPersonChoice = (key, choice) => {
    setPersonAllergies((prev) => ({
      ...prev,
      [key]: { choice, text: choice === "other" ? prev[key]?.text || "" : "" },
    }));
  };

  const setPersonText = (key, text) => {
    setPersonAllergies((prev) => ({
      ...prev,
      [key]: { ...prev[key], text },
    }));
  };

  const allAllergiesAnswered = people.every((person) => {
    const entry = personAllergies[person.key];
    if (!entry || !entry.choice) return false;
    if (entry.choice === "other" && !entry.text.trim()) return false;
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (attending === null) return;
    if (attending && !allAllergiesAnswered) return;

    setSubmitting(true);
    setSubmitError("");
    setIsRolling(true);

    // Roll a d20 for flavor while the actual save happens in parallel.
    const rollInterval = setInterval(() => {
      setDiceFace(1 + Math.floor(Math.random() * 20));
    }, 80);

    let allergiesToSave = null;
    if (attending) {
      if (people.length === 1) {
        allergiesToSave = allergyLabel(personAllergies.self);
      } else {
        const parts = people
          .map((person) => {
            const label = allergyLabel(personAllergies[person.key]);
            return label ? `${person.name}: ${label}` : null;
          })
          .filter(Boolean);
        allergiesToSave = parts.length ? parts.join(" | ") : null;
      }
    }

    try {
      const [response] = await Promise.all([
        fetch("/api/guests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uuid,
            attending,
            allergies: allergiesToSave,
            companion_names: attending ? companionNames : undefined,
          }),
        }),
        new Promise((resolve) => setTimeout(resolve, 900)),
      ]);

      clearInterval(rollInterval);
      setDiceFace(20);
      setIsRolling(false);

      if (!response.ok) {
        throw new Error("No se pudo guardar tu respuesta");
      }

      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 6000);
    } catch (err) {
      clearInterval(rollInterval);
      setIsRolling(false);
      setSubmitError(
        "No pudimos guardar tu respuesta. Por favor intenta de nuevo."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    attending !== null && (!attending || allAllergiesAnswered) && !submitting;

  return (
    <div className={styles.invitation}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.icon}>💌</div>
          <h1 className={styles.title}>Hola {getGreetingName(guest)}</h1>
          <p className={styles.message}>
            {isPlural ? (
              <>
                Estamos muy felices de invitarlos a celebrar con nosotros uno
                de los días más importantes de nuestras vidas. Su presencia
                significaría muchísimo para nosotros, así que queremos saber
                si contamos con ustedes.
              </>
            ) : (
              <>
                Estamos muy felices de invitarte a celebrar con nosotros uno
                de los días más importantes de nuestras vidas. Tu presencia
                significaría muchísimo para nosotros, así que queremos saber
                si contamos contigo.
              </>
            )}
          </p>
        </div>

        <div className={styles.gallery}>
          <img
            src={couplePhoto}
            alt="Caro y Nico"
            className={`${styles.galleryPhoto} ${styles.tiltLeft}`}
          />
          <img
            src={kissPhoto}
            alt="Caro y Nico"
            className={`${styles.galleryPhoto} ${styles.tiltNone}`}
          />
          <img
            src={canalPhoto}
            alt="Caro y Nico"
            className={`${styles.galleryPhoto} ${styles.tiltRight}`}
          />
        </div>

        <div className={styles.quickDetails}>
          <div className={styles.quickDetailItem}>
            <div className={styles.quickDetailIcon}>📅</div>
            <p className={styles.quickDetailText}>
              <strong>16 de enero, 2027</strong>
              <br />
              3:00 p.m.
            </p>
          </div>
          <div className={styles.quickDetailItem}>
            <div className={styles.quickDetailIcon}>📍</div>
            <p className={styles.quickDetailText}>
              <strong>Retiro San Juan</strong>
              <br />
              Autopista Norte No. 212, Km 13 Vía Arrayanes, Bogotá
            </p>
          </div>
          <div className={styles.quickDetailItem}>
            <div className={styles.quickDetailIcon}>👔</div>
            <p className={styles.quickDetailText}>
              <strong>Formal:</strong> traje con corbata para ellos, vestido
              largo para ellas
              <br />
              Combinado con tenis 👟 — nada de zapatos
              <br />
              El blanco queda reservado para la novia
            </p>
          </div>
        </div>

        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Confirma tu asistencia</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.question}>
              <p className={styles.questionLabel}>¿Nos acompañas?</p>
              <div className={styles.optionRow}>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    attending === true ? styles.optionSelected : ""
                  }`}
                  onClick={() => setAttending(true)}
                >
                  ¡Sí, ahí estaré! 🎉
                </button>
                <button
                  type="button"
                  className={`${styles.optionButton} ${
                    attending === false ? styles.optionSelected : ""
                  }`}
                  onClick={() => setAttending(false)}
                >
                  No podré ir 😢
                </button>
              </div>
              <p className={styles.softNote}>
                Cualquiera de las dos respuestas nos sirve muchísimo para
                organizar todo — ¡lo importante es que nos cuentes!
              </p>
            </div>

            {attending === false && (
              <p className={styles.understandText}>
                Entendemos que no puedas acompañarnos. ¡Te vamos a extrañar
                ese día! Gracias por avisarnos.
              </p>
            )}

            {attending === true && pendingIndexes.length > 0 && (
              <div className={styles.question}>
                <p className={styles.questionLabel}>
                  {pendingIndexes.length > 1
                    ? "Puedes traer acompañantes. Si ya sabes quiénes son, cuéntanos sus nombres:"
                    : "Puedes traer acompañante. Si ya sabes quién es, cuéntanos su nombre:"}
                </p>
                {pendingIndexes.map((index) => (
                  <input
                    key={index}
                    type="text"
                    className={styles.allergiesInput}
                    placeholder="Nombre de tu acompañante"
                    value={companionNames[index] || ""}
                    onChange={(e) => {
                      const updated = [...companionNames];
                      updated[index] = e.target.value;
                      setCompanionNames(updated);
                    }}
                  />
                ))}
              </div>
            )}

            {attending === true &&
              people.map((person) => {
                const entry = personAllergies[person.key] || {};
                return (
                  <div className={styles.question} key={person.key}>
                    <p className={styles.questionLabel}>
                      {people.length > 1
                        ? `¿${person.name} tiene alguna alergia o restricción alimenticia?`
                        : "¿Tienes alguna alergia o restricción alimenticia?"}
                    </p>
                    <div className={styles.optionRow}>
                      <button
                        type="button"
                        className={`${styles.optionButton} ${
                          entry.choice === "none" ? styles.optionSelected : ""
                        }`}
                        onClick={() => setPersonChoice(person.key, "none")}
                      >
                        Ninguna
                      </button>
                      <button
                        type="button"
                        className={`${styles.optionButton} ${
                          entry.choice === "vegetarian"
                            ? styles.optionSelected
                            : ""
                        }`}
                        onClick={() =>
                          setPersonChoice(person.key, "vegetarian")
                        }
                      >
                        Vegetariano
                      </button>
                      <button
                        type="button"
                        className={`${styles.optionButton} ${
                          entry.choice === "vegan" ? styles.optionSelected : ""
                        }`}
                        onClick={() => setPersonChoice(person.key, "vegan")}
                      >
                        Vegano
                      </button>
                      <button
                        type="button"
                        className={`${styles.optionButton} ${
                          entry.choice === "other" ? styles.optionSelected : ""
                        }`}
                        onClick={() => setPersonChoice(person.key, "other")}
                      >
                        Otra
                      </button>
                    </div>

                    {entry.choice === "other" && (
                      <textarea
                        className={styles.allergiesInput}
                        placeholder="Cuéntanos cuál..."
                        value={entry.text || ""}
                        onChange={(e) =>
                          setPersonText(person.key, e.target.value)
                        }
                        rows={3}
                      />
                    )}
                  </div>
                );
              })}

            {submitError && (
              <p className={styles.errorText}>{submitError}</p>
            )}

            {isRolling && (
              <div className={styles.diceOverlay}>
                <div className={styles.die}>
                  <span className={styles.dieFace}>{diceFace}</span>
                </div>
                <p className={styles.diceCaption}>Tirando un d20...</p>
              </div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={!canSubmit}
            >
              {isRolling
                ? "Tirando..."
                : justSaved
                ? "¡Guardado! ✅"
                : "Confirmar respuesta"}
            </button>

            {guest.attending !== null && !justSaved && (
              <p className={styles.savedNote}>
                Ya tenemos tu respuesta guardada. Puedes actualizarla cuando
                quieras.
              </p>
            )}

            {justSaved && (
              <div className={styles.acceptanceLetter}>
                <div className={styles.waxSeal}>N&amp;C</div>
                <p className={styles.letterKicker}>
                  Oficina de Eventos Mágicos
                </p>
                <p className={styles.letterGreeting}>
                  Querido/a {getGreetingName(guest)}:
                </p>
                <p className={styles.letterBody}>
                  {attending
                    ? "Nos complace informarte que tu respuesta ha sido recibida y registrada en el gran libro de invitados. Guarda bien esta confirmación: te esperamos el 16 de enero de 2027 en Retiro San Juan."
                    : "Hemos registrado tu respuesta en el gran libro de invitados. Lamentamos que no puedas acompañarnos, pero quedará constancia de tu cariño."}
                </p>
                <p className={styles.letterSignature}>Con cariño, N&amp;C</p>
              </div>
            )}
          </form>
        </div>

        <Link
          to="/detalles"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.detailsLink}
        >
          Ver más detalles de la boda →
        </Link>

        <p className={styles.deadlineNote}>
          Si algo cambia, tienes hasta el 1 de diciembre para avisarnos
          entrando de nuevo a este mismo link.
        </p>
      </div>
    </div>
  );
}

export default Invitation;
