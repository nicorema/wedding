import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import AudioPlayer from "../components/AudioPlayer";
import styles from "./InvitationRPG.module.scss";
import invitationPhoto1 from "../assets/invitation-1.jpg";
import invitationPhoto2 from "../assets/invitation-2.jpg";
import invitationPhoto3 from "../assets/invitation-3.jpg";
import invitationPhoto4 from "../assets/invitation-4.jpg";

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

function InvitationRPG() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uuid = searchParams.get("uuid");
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);

  const [attending, setAttending] = useState(null);
  const [companionNames, setCompanionNames] = useState([]);
  const [companionsAttending, setCompanionsAttending] = useState([]);
  const [pendingIndexes, setPendingIndexes] = useState([]);
  const [personAllergies, setPersonAllergies] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isStamping, setIsStamping] = useState(false);
  const [sealReplayKey, setSealReplayKey] = useState(0);

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  // Only invited guests get in: no uuid or an unknown one goes to the home page.
  useEffect(() => {
    if (!uuid) {
      navigate("/", { replace: true });
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
        setCompanionsAttending(
          data.companions_attending || names.map(() => null)
        );
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
      .then(() => setLoading(false))
      .catch(() => navigate("/", { replace: true }));
  }, [uuid, navigate]);

  if (loading) {
    return null;
  }

  const isPlural =
    Boolean(guest.group_name) || (guest.companion_names || []).some(Boolean);

  const selfName = guest.nickname || guest.first_name;
  // Parties answer person by person: someone in a group (or the +1) may not come.
  const hasCompanions = companionNames.length > 0;
  const isAnyoneGoing =
    attending === true || companionsAttending.some((value) => value === true);
  const isEveryoneAnswered =
    attending !== null && companionsAttending.every((value) => value !== null);

  // Only people who are coming get the food question.
  const people = [
    ...(attending === true ? [{ key: "self", name: selfName }] : []),
    ...companionNames
      .map((name, i) => ({
        key: `companion-${i}`,
        name: name.trim() || "Tu acompañante",
        isGoing: companionsAttending[i] === true,
      }))
      .filter((person) => person.isGoing),
  ];
  const areGoingCompanionsNamed = companionNames.every(
    (name, i) => companionsAttending[i] !== true || name.trim()
  );

  const resetSaved = () => {
    setJustSaved(false);
    setIsStamping(false);
  };

  const setSelfAttending = (value) => {
    resetSaved();
    setAttending(value);
    // A +1 only comes along with the guest who invited them.
    if (value === false) {
      setCompanionsAttending((prev) =>
        prev.map((answer, i) => (pendingIndexes.includes(i) ? false : answer))
      );
    }
  };

  const setCompanionAttending = (index, value) => {
    resetSaved();
    setCompanionsAttending((prev) =>
      prev.map((answer, i) => (i === index ? value : answer))
    );
  };

  const setPersonChoice = (key, choice) => {
    setJustSaved(false);
    setIsStamping(false);
    setPersonAllergies((prev) => ({
      ...prev,
      [key]: { choice, text: choice === "other" ? prev[key]?.text || "" : "" },
    }));
  };

  const setPersonText = (key, text) => {
    setJustSaved(false);
    setIsStamping(false);
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
    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError("");
    setIsStamping(true);

    // An unnamed +1 who isn't coming frees their seat again.
    const namesToSave = companionNames.map((name, i) =>
      pendingIndexes.includes(i) && companionsAttending[i] !== true
        ? ""
        : name.trim()
    );

    let allergiesToSave = null;
    if (isAnyoneGoing) {
      // Solo parties store a plain label; anyone with named companions uses
      // "Name: label" so each answer maps back to its person.
      if (!namesToSave.some(Boolean)) {
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
            companions_attending: companionsAttending,
            allergies: allergiesToSave,
            companion_names: namesToSave,
          }),
        }),
        new Promise((resolve) => setTimeout(resolve, 750)),
      ]);

      if (!response.ok) {
        throw new Error("No se pudo guardar tu respuesta");
      }

      setIsStamping(false);
      setJustSaved(true);
    } catch (err) {
      setSubmitError(
        "El mensajero no pudo llegar al castillo. Por favor intenta de nuevo."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    isEveryoneAnswered &&
    areGoingCompanionsNamed &&
    allAllergiesAnswered &&
    !submitting;

  return (
    <div className={styles.page}>
      <AudioPlayer src="/invitacion.mp3" autoPlay={true} />
      <div className={styles.scroll}>
        <div className={styles.questHeader}>
          <img
            src={invitationPhoto4}
            alt="Nico y Caro"
            className={styles.headerPhoto}
          />
          <h1 className={styles.questTitle}>La Alianza de Nico &amp; Caro</h1>
          <p className={styles.questGiver}>
            Misión ofrecida por los futuros esposos
          </p>
          <p className={styles.flavorText}>
            {isPlural ? (
              <>
                Se busca a valientes aliados para presenciar la unión de dos
                almas. Su presencia significaría muchísimo para
                nosotros — solo necesitamos saber si emprenderán el viaje con nosotros.
              </>
            ) : (
              <>
                Se busca a un valiente aliado para presenciar la unión de dos
                almas. Tu presencia significaría muchísimo para nosotros —
                solo necesitamos saber si emprenderás el viaje con nosotros.
              </>
            )}
          </p>
        </div>

        <div className={styles.gallery}>
          <p className={styles.galleryLabel}>Retratos de la travesía</p>
          <div className={styles.galleryRow}>
            <img
              src={invitationPhoto2}
              alt="Nico y Caro"
              className={`${styles.galleryPhoto} ${styles.tiltLeft}`}
            />
            <img
              src={invitationPhoto3}
              alt="Nico y Caro"
              className={`${styles.galleryPhoto} ${styles.tiltNone}`}
            />
            <img
              src={invitationPhoto1}
              alt="Nico y Caro"
              className={`${styles.galleryPhoto} ${styles.tiltRight}`}
            />
          </div>
        </div>

        <div className={styles.characterCard}>
          <span className={styles.characterCardLabel}>
            {isPlural ? "Aventureros convocados" : "Aventurero convocado"}
          </span>
          <span className={styles.characterCardName}>{getGreetingName(guest)}</span>
        </div>

        <div className={styles.objectives}>
          <p className={styles.objectivesTitle}>Detalles de la misión</p>
          <div className={styles.objectiveList}>
            <div className={styles.objectiveItem}>
              <span className={styles.objectiveIcon}>🗓️</span>
              <p className={styles.objectiveText}>
                <strong>16 de enero, 2027</strong>
                <br />
                3:00 p.m.
              </p>
            </div>
            <div className={styles.objectiveItem}>
              <span className={styles.objectiveIcon}>🏰</span>
              <p className={styles.objectiveText}>
                <strong>Retiro San Juan</strong>
                <br />
                Autopista Norte No. 212, Km 13 Vía Arrayanes, Bogotá
              </p>
            </div>
            <div className={styles.objectiveItem}>
              <span className={styles.objectiveIcon}>⚔️</span>
              <div className={styles.objectiveText}>
                <strong>Armadura requerida</strong>
                <ul className={styles.armorList}>
                  <li>
                    <span className={styles.armorEmoji}>👔👗</span>
                    <span>
                      Traje con corbata para ellos, vestido largo para ellas
                    </span>
                  </li>
                  <li>
                    <span className={styles.armorEmoji}>👟</span>
                    <span>
                      Combinado con <strong>TENIS</strong> para bailar — los
                      zapatos de batalla se quedan para los goblins y los
                      orcos
                    </span>
                  </li>
                  <li>
                    <span className={styles.armorEmoji}>🤍</span>
                    <span>El blanco queda reservado para la novia</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className={styles.objectiveItem}>
              <span className={styles.objectiveIcon}>🛡️</span>
              <p className={styles.objectiveText}>
                <strong>Misión solo para adultos</strong>
                <br />
                Los pequeños escuderos se quedan custodiando el castillo — no
                se admiten niños en esta aventura
              </p>
            </div>
          </div>
        </div>

        <div className={styles.sheet}>
          <h2 className={styles.sheetTitle}>Hoja de misión</h2>
          <p className={styles.sheetSubtitle}>
            Confirma aquí tu asistencia a la boda
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {!hasCompanions ? (
              <div className={styles.block}>
                <p className={styles.blockLabel}>¿Aceptas esta misión?</p>
                <div className={styles.choiceRow}>
                  <button
                    type="button"
                    className={`${styles.questButton} ${styles.acceptButton} ${
                      attending === true ? styles.choiceSelected : ""
                    }`}
                    onClick={() => setSelfAttending(true)}
                  >
                    Aceptar la misión ⚔️
                  </button>
                  <button
                    type="button"
                    className={`${styles.questButton} ${styles.declineButton} ${
                      attending === false ? styles.choiceSelected : ""
                    }`}
                    onClick={() => setSelfAttending(false)}
                  >
                    No podré unirme a la aventura
                  </button>
                </div>
                <p className={styles.softNote}>
                  Cualquiera de las dos respuestas nos sirve para planear la
                  aventura — lo importante es que el mensajero regrese con
                  noticias tuyas.
                </p>
              </div>
            ) : (
              <div className={styles.block}>
                <p className={styles.blockLabel}>
                  ¿Quiénes aceptan esta misión?
                </p>
                <div className={styles.personRow}>
                  <span className={styles.personName}>{selfName}</span>
                  <div className={styles.choiceRow}>
                    <button
                      type="button"
                      className={`${styles.traitButton} ${
                        attending === true ? styles.choiceSelected : ""
                      }`}
                      onClick={() => setSelfAttending(true)}
                    >
                      Va ⚔️
                    </button>
                    <button
                      type="button"
                      className={`${styles.traitButton} ${
                        attending === false ? styles.choiceSelected : ""
                      }`}
                      onClick={() => setSelfAttending(false)}
                    >
                      No va
                    </button>
                  </div>
                </div>

                {companionNames.map((name, index) => {
                  const isPlusOne = pendingIndexes.includes(index);
                  // A +1 is only asked about once the guest is coming.
                  if (isPlusOne && attending !== true) return null;
                  return (
                    <div className={styles.personRow} key={index}>
                      <span className={styles.personName}>
                        {isPlusOne ? "Tu acompañante (+1)" : name}
                      </span>
                      <div className={styles.choiceRow}>
                        <button
                          type="button"
                          className={`${styles.traitButton} ${
                            companionsAttending[index] === true
                              ? styles.choiceSelected
                              : ""
                          }`}
                          onClick={() => setCompanionAttending(index, true)}
                        >
                          {isPlusOne ? "Llevaré acompañante" : "Va ⚔️"}
                        </button>
                        <button
                          type="button"
                          className={`${styles.traitButton} ${
                            companionsAttending[index] === false
                              ? styles.choiceSelected
                              : ""
                          }`}
                          onClick={() => setCompanionAttending(index, false)}
                        >
                          {isPlusOne ? "Iré sin acompañante" : "No va"}
                        </button>
                      </div>
                      {isPlusOne && companionsAttending[index] === true && (
                        <input
                          type="text"
                          className={styles.textInput}
                          placeholder="Nombre de tu acompañante"
                          value={name}
                          onChange={(e) => {
                            resetSaved();
                            const updated = [...companionNames];
                            updated[index] = e.target.value;
                            setCompanionNames(updated);
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {isEveryoneAnswered && !isAnyoneGoing && (
              <p className={styles.declineText}>
                Entendemos que el camino no te permita acompañarnos esta vez.
                ¡Se te extrañará en la taberna del festejo! Gracias por
                avisarnos.
              </p>
            )}

            {people.map((person) => {
                const entry = personAllergies[person.key] || {};
                return (
                  <div className={styles.block} key={person.key}>
                    <p className={styles.blockLabel}>
                      {hasCompanions
                        ? `¿${person.name} carga alguna condición alimenticia?`
                        : "¿Cargas alguna condición alimenticia?"}
                    </p>
                    <div className={styles.choiceRow}>
                      <button
                        type="button"
                        className={`${styles.traitButton} ${
                          entry.choice === "none" ? styles.choiceSelected : ""
                        }`}
                        onClick={() => setPersonChoice(person.key, "none")}
                      >
                        Ninguna
                      </button>
                      <button
                        type="button"
                        className={`${styles.traitButton} ${
                          entry.choice === "vegetarian"
                            ? styles.choiceSelected
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
                        className={`${styles.traitButton} ${
                          entry.choice === "vegan" ? styles.choiceSelected : ""
                        }`}
                        onClick={() => setPersonChoice(person.key, "vegan")}
                      >
                        Vegano
                      </button>
                      <button
                        type="button"
                        className={`${styles.traitButton} ${
                          entry.choice === "other" ? styles.choiceSelected : ""
                        }`}
                        onClick={() => setPersonChoice(person.key, "other")}
                      >
                        Otra
                      </button>
                    </div>

                    {entry.choice === "other" && (
                      <textarea
                        className={styles.textArea}
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

            {submitError && <p className={styles.errorText}>{submitError}</p>}

            {isStamping && (
              <div className={styles.stampOverlay}>
                <img
                  src="/wax.png"
                  alt=""
                  aria-hidden="true"
                  className={styles.stampMark}
                />
              </div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={!canSubmit}
            >
              {submitting
                ? "Sellando..."
                : justSaved
                ? "¡Misión registrada! ✅"
                : "Sellar tu respuesta"}
            </button>

            {guest.attending !== null && !justSaved && (
              <p className={styles.savedNote}>
                Ya tenemos tu respuesta en el gran registro. Puedes
                actualizarla cuando quieras.
              </p>
            )}

            {justSaved && (
              <div className={styles.questComplete}>
                <div className={styles.sealWrapper}>
                  <img
                    key={sealReplayKey}
                    src="/wax.png"
                    alt=""
                    aria-hidden="true"
                    className={styles.seal}
                    onClick={() => setSealReplayKey((k) => k + 1)}
                  />
                </div>
                <p className={styles.questCompleteKicker}>Misión completada</p>
                <p className={styles.questCompleteXp}>
                  +100 XP · Registro actualizado
                </p>
                <p className={styles.questCompleteBody}>
                  {isAnyoneGoing
                    ? isPlural
                      ? "Su respuesta ha quedado grabada en el gran libro de aventureros. Preparen su equipo: los esperamos el 16 de enero de 2027 en Retiro San Juan."
                      : "Tu respuesta ha quedado grabada en el gran libro de aventureros. Prepara tu equipo: te esperamos el 16 de enero de 2027 en Retiro San Juan."
                    : isPlural
                    ? "Hemos anotado su respuesta en el gran libro de aventureros. Lamentamos que no puedan unirse a esta aventura, pero quedará constancia de su aprecio."
                    : "Hemos anotado tu respuesta en el gran libro de aventureros. Lamentamos que no puedas unirte a esta aventura, pero quedará constancia de tu aprecio."}
                </p>
                <p className={styles.questCompleteSign}>
                  Con cariño, los futuros esposos
                </p>
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
          Ver todos los detalles de la boda →
        </Link>

        <p className={styles.deadlineNote}>
          Si tus planes cambian, puedes reforjar tu respuesta hasta el 1 de
          diciembre de 2026 volviendo a este mismo portal.
        </p>
      </div>
    </div>
  );
}

export default InvitationRPG;
