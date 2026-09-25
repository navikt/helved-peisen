'use client'

import { useEffect, useState } from 'react'

import { fetchTopics } from '@/app/actions.ts'
import { showToast } from '@/lib/browser/toast.tsx'
import { isSuccessResponse } from '@/lib/api/types.ts'

export function useTopics() {
    const [topics, setTopics] = useState<string[]>([])

    useEffect(() => {
        let cancelled = false

        void fetchTopics()
            .then((response) => {
                if (cancelled) return

                if (isSuccessResponse(response)) {
                    setTopics(response.data)
                } else {
                    showToast(response.error, { variant: 'error' })
                }
            })
            .catch(() => {
                if (!cancelled) {
                    showToast('Klarte ikke hente topics', { variant: 'error' })
                }
            })

        return () => {
            cancelled = true
        }
    }, [])

    return topics
}
