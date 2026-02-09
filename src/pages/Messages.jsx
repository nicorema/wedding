import { useState, useMemo } from 'react'
import PageContainer from '../components/PageContainer'
import styles from './Messages.module.scss'
import { useMessages, useSubmitMessage } from '../hooks/useMessages'

function Messages() {
  const [newMessage, setNewMessage] = useState('')
  const [author, setAuthor] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Use React Query hooks for data fetching
  const { data: messagesData = [], isLoading, error } = useMessages()
  const submitMessageMutation = useSubmitMessage()

  // Transform backend format to frontend format
  const messages = useMemo(() => {
    return messagesData.map(msg => ({
      id: msg.id,
      author: msg.name,
      message: msg.message,
      date: new Date(msg.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }))
  }, [messagesData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !author.trim()) {
      alert('Por favor completa tu nombre y mensaje')
      return
    }

    try {
      // Submit message using React Query mutation
      await submitMessageMutation.mutateAsync({
        name: author.trim(),
        message: newMessage.trim(),
      })
      
      // Show confirmation message
      setShowConfirmation(true)
      
      // Reset form
      setNewMessage('')
      setAuthor('')
      
      // Hide confirmation after 5 seconds
      setTimeout(() => {
        setShowConfirmation(false)
      }, 5000)
    } catch (error) {
      console.error('Error submitting message:', error)
      alert('Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.')
    }
  }

  return (
    <PageContainer>
      <div className={styles.messages}>
        <div className={styles.header}>
          <div className={styles.icon}>💌</div>
          <h1 className={styles.title}>Rincón de Mensajes</h1>
          <p className={styles.subtitle}>
            Déjanos un mensaje lleno de amor y buenos deseos
          </p>
        </div>

        <div className={styles.container}>
          <form className={styles.messageForm} onSubmit={handleSubmit}>
            <h2 className={styles.formTitle}>Escribe tu mensaje</h2>
            <div className={styles.formGroup}>
              <label htmlFor="author" className={styles.label}>
                Tu nombre
              </label>
              <input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className={styles.input}
                placeholder="Escribe tu nombre"
                maxLength={50}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="message" className={styles.label}>
                Tu mensaje
              </label>
              <textarea
                id="message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className={styles.textarea}
                placeholder="Escribe tu mensaje de amor y buenos deseos aquí..."
                rows={6}
                maxLength={500}
              />
              <span className={styles.charCount}>
                {newMessage.length} / 500 caracteres
              </span>
            </div>
            <button type="submit" className={styles.submitButton}>
              Enviar Mensaje 💚
            </button>
            {showConfirmation && (
              <div className={styles.confirmationMessage}>
                ✅ Tu mensaje ha sido enviado. Aparecerá después de ser aprobado.
              </div>
            )}
          </form>

          <div className={styles.messagesList}>
            <h2 className={styles.listTitle}>
              Mensajes de nuestros seres queridos ({messages.length})
            </h2>
            {isLoading ? (
              <div className={styles.emptyState}>
                <p>Cargando mensajes...</p>
              </div>
            ) : error ? (
              <div className={styles.emptyState}>
                <p>Error al cargar mensajes. Por favor intenta de nuevo más tarde.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className={styles.emptyState}>
                <p>🎉 Sé el primero en dejar un mensaje!</p>
              </div>
            ) : (
              <div className={styles.messagesGrid}>
                {messages.map((msg) => (
                  <div key={msg.id} className={styles.messageCard}>
                    <div className={styles.messageHeader}>
                      <span className={styles.messageAuthor}>{msg.author}</span>
                      <span className={styles.messageDate}>{msg.date}</span>
                    </div>
                    <p className={styles.messageText}>{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default Messages

