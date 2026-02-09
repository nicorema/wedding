// API Base URL - uses proxy in development, environment variable in production
const API_BASE = import.meta.env.VITE_API_URL || '/api'

/**
 * Gets the best time from the backend
 * @returns {Promise<number|null>} The best time in seconds, or null if none exists
 */
export const getBestTime = async () => {
  try {
    const response = await fetch(`${API_BASE}/scores/best`)
    if (!response.ok) {
      throw new Error('Failed to fetch best time')
    }
    const data = await response.json()
    return data.bestTime
  } catch (error) {
    console.error('Error fetching best time:', error)
    return null
  }
}

/**
 * Submits a new score to the backend
 * @param {string} name - Player name
 * @param {number} time - Time in seconds
 * @returns {Promise<Object>} The created score
 */
export const submitScore = async (name, time) => {
  try {
    const response = await fetch(`${API_BASE}/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, time }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to submit score')
    }

    return await response.json()
  } catch (error) {
    console.error('Error submitting score:', error)
    throw error
  }
}

/**
 * Gets all approved messages from the backend
 * @returns {Promise<Array>} Array of approved messages
 */
export const getMessages = async () => {
  try {
    const response = await fetch(`${API_BASE}/messages`)
    if (!response.ok) {
      throw new Error('Failed to fetch messages')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching messages:', error)
    return []
  }
}

/**
 * Submits a new message to the backend (creates with Pending status)
 * @param {string} name - Author name
 * @param {string} message - Message content
 * @returns {Promise<Object>} The created message
 */
export const submitMessage = async (name, message) => {
  try {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, message }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to submit message')
    }

    return await response.json()
  } catch (error) {
    console.error('Error submitting message:', error)
    throw error
  }
}
