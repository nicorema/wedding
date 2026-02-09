import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBestTime, submitScore } from '../services/api'

// Query key constants
export const SCORE_KEYS = {
  bestTime: ['scores', 'best'],
}

/**
 * Hook to get the best time
 * Uses React Query to cache and prevent duplicate requests
 */
export const useBestTime = () => {
  return useQuery({
    queryKey: SCORE_KEYS.bestTime,
    queryFn: async () => {
      const bestTime = await getBestTime()
      return bestTime
    },
    staleTime: Infinity, // Never consider stale - only refetch manually
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false, // Don't refetch when navigating between pages
  })
}

/**
 * Hook to submit a new score
 * Automatically invalidates and refetches best time after successful submission
 */
export const useSubmitScore = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name, time }) => submitScore(name, time),
    onSuccess: () => {
      // Refetch best time after submission
      queryClient.refetchQueries({ queryKey: SCORE_KEYS.bestTime })
    },
  })
}
