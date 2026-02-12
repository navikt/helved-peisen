import { useContext } from 'react'
import { Button, Loader } from '@navikt/ds-react'
import { ArrowsCirclepathIcon } from '@navikt/aksel-icons'
import { MessagesContext } from './context/MessagesContext.tsx'

export const RefreshButton = () => {
    const { loading, fetchMessages } = useContext(MessagesContext)
    return (
        <Button size="small" variant={loading ? 'secondary' : 'secondary-neutral'} onClick={fetchMessages}>
            {loading ? <Loader size="xsmall" /> : <ArrowsCirclepathIcon />}
        </Button>
    )
}
