import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./ManagerGallery.module.scss";

const saveOrder = async (ids) => {
  const response = await fetch("/api/photos?action=reorder", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    throw new Error("Failed to save gallery order");
  }
};

const deletePhoto = async (photoId) => {
  const response = await fetch(`/api/photos?id=${photoId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete photo");
  }
};

function SortablePhoto({ photo, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`${styles.tile} ${isDragging ? styles.isDragging : ""}`}
      {...attributes}
      {...listeners}
    >
      <img src={photo.thumb_url} alt="" draggable={false} />
      <button
        className={styles.deleteButton}
        // Keep the tap on the button from starting a drag.
        onPointerDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
        onClick={() => onDelete(photo)}
        aria-label="Borrar foto"
      >
        🗑
      </button>
    </div>
  );
}

function ManagerGallery({ approvedPhotos, isLoading, onChange }) {
  const [orderedPhotos, setOrderedPhotos] = useState(approvedPhotos);
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!hasUnsavedOrder) setOrderedPhotos(approvedPhotos);
  }, [approvedPhotos, hasUnsavedOrder]);

  // Touch needs a short press so the page can still scroll with a swipe.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setOrderedPhotos((photos) => {
      const from = photos.findIndex((photo) => photo.id === active.id);
      const to = photos.findIndex((photo) => photo.id === over.id);
      return arrayMove(photos, from, to);
    });
    setHasUnsavedOrder(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveOrder(orderedPhotos.map((photo) => photo.id));
      setHasUnsavedOrder(false);
      onChange();
    } catch {
      alert("No se pudo guardar el orden. Intenta de nuevo.");
    }
    setIsSaving(false);
  };

  const handleDelete = async (photo) => {
    if (!window.confirm("¿Borrar esta foto de la galería?")) return;
    setOrderedPhotos((photos) => photos.filter((p) => p.id !== photo.id));
    try {
      await deletePhoto(photo.id);
    } catch {
      alert("No se pudo borrar la foto.");
    }
    onChange();
  };

  if (isLoading) {
    return <div className={styles.emptyState}>Loading gallery...</div>;
  }

  if (orderedPhotos.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No approved photos yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.toolbar}>
        <span className={styles.count}>{orderedPhotos.length} photos</span>
        <button
          className={styles.saveButton}
          onClick={handleSave}
          disabled={!hasUnsavedOrder || isSaving}
        >
          {isSaving ? "Guardando..." : "Guardar orden"}
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedPhotos.map((photo) => photo.id)}
          strategy={rectSortingStrategy}
        >
          <div className={styles.grid}>
            {orderedPhotos.map((photo) => (
              <SortablePhoto
                key={photo.id}
                photo={photo}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default ManagerGallery;
