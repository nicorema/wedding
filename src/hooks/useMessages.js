import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMessages, submitMessage } from '../services/api'

// Query key constants
export const MESSAGE_KEYS = {
  all: ['messages'],
  approved: () => [...MESSAGE_KEYS.all, 'approved'],
}

/**
 * Hook to get approved messages
 * Uses React Query to cache and prevent duplicate requests
 */
export const useMessages = () => {
  return useQuery({
    queryKey: MESSAGE_KEYS.approved(),
    queryFn: async () => {
      const messages = await getMessages()
      return messages
    },
    staleTime: Infinity, // Never consider stale - only refetch manually
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false, // Don't refetch when navigating between pages
  })
}

/**
 * Hook to submit a new message
 * Note: Submitted messages won't appear immediately since they start as 'Pending'
 * They'll appear after being approved and the cache is refreshed
 */
export const useSubmitMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name, message }) => submitMessage(name, message),
    onSuccess: () => {
      // Refetch messages after submission
      queryClient.refetchQueries({ queryKey: MESSAGE_KEYS.approved() })
    },
  })
}
