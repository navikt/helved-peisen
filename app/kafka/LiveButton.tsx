'use client'

import React, { useContext, useEffect } from 'react'
import { Button } from '@navikt/ds-react'
import { PlayIcon, StopIcon } from '@navikt/aksel-icons'

import { MessagesContext } from './context/MessagesContext.tsx'

export const LiveButton = () => {
    const { fetchAdditionalMessages } = useContext(MessagesContext)
    const [isLive, setIsLive] = React.useState(false)

    const onClick = () => {
        setIsLive((isLive) => !isLive)
    }

    useEffect(() => {
        if (isLive) {
            const onFetch = () => {
                fetchAdditionalMessages()
            }
            const id = setInterval(onFetch, 2500)
            return () => {
                clearInterval(id)
            }
        }
    }, [isLive, fetchAdditionalMessages])

    return (
        <Button
            size="small"
            variant={isLive ? 'secondary' : 'secondary-neutral'}
            icon={isLive ? <StopIcon /> : <PlayIcon />}
            onClick={onClick}
        >
            Live
        </Button>
    )
}
