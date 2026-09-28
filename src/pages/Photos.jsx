import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import PageContainer from '../components/PageContainer'
import PhotoUploader from '../components/PhotoUploader'
import styles from './Photos.module.scss'

const getApprovedPhotos = async () => {
  const response = await fetch('/api/photos')
  if (!response.ok) {
    throw new Error('Failed to fetch photos')
  }
  return response.json()
}

function Photos() {
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [touchStartX, setTouchStartX] = useState(null)
  const { data: photos = [] } = useQuery({
    queryKey: ['photos'],
    queryFn: getApprovedPhotos,
  })

  const isLightboxOpen = selectedIndex !== null
  const closeLightbox = () => setSelectedIndex(null)
  const showPrevious = () =>
    setSelectedIndex((index) => (index - 1 + photos.length) % photos.length)
  const showNext = () => setSelectedIndex((index) => (index + 1) % photos.length)

  useEffect(() => {
    if (!isLightboxOpen) return
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') showPrevious()
      if (event.key === 'ArrowRight') showNext()
      if (event.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  const handleTouchEnd = (event) => {
    if (touchStartX === null) return
    const deltaX = event.changedTouches[0].clientX - touchStartX
    setTouchStartX(null)
    if (deltaX > 50) showPrevious()
    if (deltaX < -50) showNext()
  }

  return (
    <PageContainer>
      <div className={styles.photos}>
        <div className={styles.content}>
          <div className={styles.icon}>📸</div>
          <h1 className={styles.title}>Fotos de la Boda</h1>
          <p className={styles.message}>
            Aquí podrás <strong>ver y subir</strong> las fotos de nuestra celebración.
          </p>
          <PhotoUploader />
          <p className={styles.reviewNote}>
            Las fotos que subas aparecerán aquí cuando las aprobemos.
          </p>
        </div>

        {photos.length > 0 && (
          <div className={styles.grid}>
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                className={styles.gridItem}
                onClick={() => setSelectedIndex(index)}
              >
                <img src={photo.thumb_url} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        {isLightboxOpen && (
          <div
            className={styles.lightbox}
            onClick={closeLightbox}
            onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={photos[selectedIndex].url}
              alt=""
              onClick={(event) => event.stopPropagation()}
            />
            <button
              className={styles.closeButton}
              onClick={closeLightbox}
              aria-label="Cerrar"
            >
              ✕
            </button>
            <button
              className={`${styles.navButton} ${styles.previousButton}`}
              onClick={(event) => {
                event.stopPropagation()
                showPrevious()
              }}
              aria-label="Foto anterior"
            >
              ‹
            </button>
            <button
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={(event) => {
                event.stopPropagation()
                showNext()
              }}
              aria-label="Foto siguiente"
            >
              ›
            </button>
            <span className={styles.lightboxCounter}>
              {selectedIndex + 1} / {photos.length}
            </span>
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default Photos
