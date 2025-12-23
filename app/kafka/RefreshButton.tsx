import React, { useContext } from 'react'
import { Button, Loader } from '@navikt/ds-react'
import { ArrowsCirclepathIcon } from '@navikt/aksel-icons'
import { MessagesContext } from './context/MessagesContext.tsx'

export const RefreshButton = () => {
    const { loading, fetchAdditionalMessages } = useContext(MessagesContext)
    return (
        <Button size="small" variant={loading ? 'secondary' : 'secondary-neutral'} onClick={fetchAdditionalMessages}>
            {loading ? <Loader size="xsmall" /> : <ArrowsCirclepathIcon />}
        </Button>
    )
}
