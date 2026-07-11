import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import styles from "./Invitation.module.scss";

const getGreetingName = (guest) => {
  if (guest.group_name) return guest.group_name;
  const ownName = guest.nickname || guest.first_name;
  const namedCompanions = (guest.companion_names || []).filter(Boolean);
  if (namedCompanions.length) {
    return `${ownName} y ${namedCompanions.join(", ")}`;
  }
  return ownName;
};

function Invitation() {
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid");
  const [guest, setGuest] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    if (!uuid) {
      setNotFound(true);
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
      .then((data) => setGuest(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [uuid]);

  if (notFound) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return null;
  }

  return (
    <div className={styles.invitation}>
      <div className={styles.card}>
        <h1 className={styles.title}>Hola {getGreetingName(guest)}</h1>
        <p className={styles.placeholder}>TBD</p>
      </div>
    </div>
  );
}

export default Invitation;
