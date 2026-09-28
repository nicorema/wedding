import { useState, useEffect } from "react";
import PhotoUploader from "../components/PhotoUploader";
import styles from "./ManagerPhotos.module.scss";

const SWIPE_THRESHOLD = 120;
const EXIT_DURATION_MS = 250;

const approvePhoto = async (photoId) => {
  const response = await fetch(`/api/photos?id=${photoId}`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error("Failed to approve photo");
  }
};

const rejectPhoto = async (photoId) => {
  const response = await fetch(`/api/photos?id=${photoId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete photo");
  }
};

function ManagerPhotos({ pendingPhotos, isLoading, onReviewError }) {
  // Hide reviewed photos right away instead of waiting for a refetch.
  const [reviewedIds, setReviewedIds] = useState([]);
  const [dragStartX, setDragStartX] = useState(null);
  const [dragX, setDragX] = useState(0);
  const [exitDirection, setExitDirection] = useState(null); // null | 'left' | 'right'

  const queue = pendingPhotos.filter((photo) => !reviewedIds.includes(photo.id));
  const current = queue[0];
  const next = queue[1];

  const review = (isApproved) => {
    if (!current || exitDirection) return;
    const photo = current;
    setExitDirection(isApproved ? "right" : "left");

    setTimeout(() => {
      setReviewedIds((ids) => [...ids, photo.id]);
      setExitDirection(null);
      setDragX(0);
    }, EXIT_DURATION_MS);

    (isApproved ? approvePhoto : rejectPhoto)(photo.id).catch(() => {
      setReviewedIds((ids) => ids.filter((id) => id !== photo.id));
      onReviewError();
    });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") review(true);
      if (event.key === "ArrowLeft") review(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStartX(event.clientX);
  };

  const handlePointerMove = (event) => {
    if (dragStartX === null) return;
    setDragX(event.clientX - dragStartX);
  };

  const handlePointerUp = () => {
    setDragStartX(null);
    if (dragX > SWIPE_THRESHOLD) review(true);
    else if (dragX < -SWIPE_THRESHOLD) review(false);
    else setDragX(0);
  };

  const offsetX =
    exitDirection === "right"
      ? window.innerWidth
      : exitDirection === "left"
      ? -window.innerWidth
      : dragX;

  return (
    <div className={styles.managerPhotos}>
      <PhotoUploader isApproved />

      {isLoading ? (
        <div className={styles.emptyState}>Loading pending photos...</div>
      ) : !current ? (
        <div className={styles.emptyState}>
          <p>🎉 No pending photos! All caught up!</p>
        </div>
      ) : (
        <>
          <p className={styles.counter}>{queue.length} pending</p>
          <div className={styles.deck}>
            {next && (
              <img src={next.url} alt="" className={styles.nextCard} />
            )}
            <div
              className={styles.card}
              style={{
                transform: `translateX(${offsetX}px) rotate(${offsetX / 20}deg)`,
                transition:
                  dragStartX === null
                    ? `transform ${EXIT_DURATION_MS}ms ease`
                    : "none",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <img src={current.url} alt="" draggable={false} />
              {offsetX > 40 && (
                <span className={`${styles.stamp} ${styles.approveStamp}`}>
                  ✅
                </span>
              )}
              {offsetX < -40 && (
                <span className={`${styles.stamp} ${styles.rejectStamp}`}>
                  ❌
                </span>
              )}
            </div>
          </div>
          <div className={styles.actions}>
            <button
              onClick={() => review(false)}
              className={styles.rejectButton}
            >
              ❌ Deny & Delete
            </button>
            <button
              onClick={() => review(true)}
              className={styles.approveButton}
            >
              ✅ Approve
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ManagerPhotos;
