import { useState } from 'react'
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
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const { data: photos = [] } = useQuery({
    queryKey: ['photos'],
    queryFn: getApprovedPhotos,
  })

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
            {photos.map((photo) => (
              <button
                key={photo.id}
                className={styles.gridItem}
                onClick={() => setSelectedPhoto(photo)}
              >
                <img src={photo.thumb_url} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        {selectedPhoto && (
          <div
            className={styles.lightbox}
            onClick={() => setSelectedPhoto(null)}
          >
            <img src={selectedPhoto.url} alt="" />
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default Photos
