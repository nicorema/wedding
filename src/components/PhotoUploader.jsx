import { useState } from "react";
import styles from "./PhotoUploader.module.scss";

const FULL_MAX_SIDE = 2000;
const THUMB_MAX_SIDE = 480;
const CONCURRENCY = 3;

// Resize in the browser so a 6MB phone photo lands as ~400KB (and ~40KB thumb).
const compressImage = async (file, maxSide, quality) => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
};

const putFile = async (url, blob) => {
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: blob,
  });
  if (!response.ok) {
    throw new Error("Failed to upload file");
  }
};

const uploadPhoto = async (file) => {
  const [full, thumb] = await Promise.all([
    compressImage(file, FULL_MAX_SIDE, 0.82),
    compressImage(file, THUMB_MAX_SIDE, 0.75),
  ]);

  const urlResponse = await fetch("/api/photos?action=upload-url", {
    method: "POST",
  });
  if (!urlResponse.ok) {
    throw new Error("Failed to get upload URL");
  }
  const { path, thumb_path, upload_url, thumb_upload_url } =
    await urlResponse.json();

  await Promise.all([putFile(upload_url, full), putFile(thumb_upload_url, thumb)]);

  const registerResponse = await fetch("/api/photos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, thumb_path }),
  });
  if (!registerResponse.ok) {
    throw new Error("Failed to register photo");
  }
};

function PhotoUploader() {
  const [total, setTotal] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    setTotal(files.length);
    setDoneCount(0);
    setFailedCount(0);
    setIsUploading(true);

    const queue = [...files];
    const worker = async () => {
      while (queue.length > 0) {
        const file = queue.shift();
        try {
          await uploadPhoto(file);
        } catch {
          // One retry covers flaky mobile connections.
          try {
            await uploadPhoto(file);
          } catch {
            setFailedCount((count) => count + 1);
            continue;
          }
        }
        setDoneCount((count) => count + 1);
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    setIsUploading(false);
  };

  const processedCount = doneCount + failedCount;

  return (
    <div className={styles.uploader}>
      <label
        className={`${styles.button} ${isUploading ? styles.isDisabled : ""}`}
      >
        📷 Subir fotos
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          disabled={isUploading}
          className={styles.input}
        />
      </label>

      {total > 0 && (
        <div className={styles.status}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(processedCount / total) * 100}%` }}
            />
          </div>
          <p className={styles.statusText}>
            {isUploading
              ? `Subiendo ${processedCount} / ${total}`
              : `¡Listo! ${doneCount} ${doneCount === 1 ? "foto subida" : "fotos subidas"}`}
            {failedCount > 0 && ` · ${failedCount} no se pudieron subir`}
          </p>
        </div>
      )}
    </div>
  );
}

export default PhotoUploader;
