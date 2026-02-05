import { useState } from 'react'
import { logger } from '@navikt/next-logger'
import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'

import { showToast } from '@/components/Toast.tsx'
import { remigrerUtbetaling, remigrerUtbetalingDryrun } from '@/app/kafka/table/actionMenu/actions.ts'
import { fetchRawMessage } from '@/lib/io.ts'
import { Message } from '../../../types.ts'
import { Button, Modal } from '@navikt/ds-react'
import { JsonView } from '@/components/JsonView.tsx'

type Request = {
    sakId: string
    behandlingId: string
    iverksettingId: string
    uidToStønad: {
        first: string
        second: string
    }
}

type Props = {
    message: Message
}

export const RemigrateButton = ({ message }: Props) => {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [preview, setPreview] = useState<ReturnType<typeof JSON.parse> | null>(null)
    const [request, setRequest] = useState<Request | null>(null)

    const handleMenuItemClick = (e: Event) => {
        e.preventDefault()
        setOpen(true)
    }

    const fetchPreview = async () => {
        setIsLoading(true)

        const raw = await fetchRawMessage(message)

        if (!raw) {
            showToast(`Klarte ikke hente melding med key ${message.key}`, { variant: 'error' })
            setIsLoading(false)
            return
        }

        if (!raw.value) {
            showToast(`Meldingen med key ${message.key} inneholder ikke value`, { variant: 'error' })
            setIsLoading(false)
            return
        }

        try {
            const data = JSON.parse(raw.value)
            const request = {
                sakId: data.sakId,
                behandlingId: data.behandlingId,
                iverksettingId: data.originalKey,
                uidToStønad: {
                    first: data.uid,
                    second: data.stønad,
                },
            }
            setRequest(request)

            const preview = await remigrerUtbetalingDryrun(request).finally(() => setIsLoading(false))
            if (preview.error) {
                showToast(`Klarte ikke re-migrere utbetaling: ${preview.error}`, { variant: 'error' })
                return
            }

            setPreview(preview.data)
        } catch (e) {
            showToast(`Klarte ikke parse JSON: ${raw.value}`, { variant: 'error' })
            setIsLoading(false)
        }
    }

    const remigrer = async () => {
        if (!request) {
            return
        }

        setIsLoading(true)

        const response = await remigrerUtbetaling(request).finally(() => setIsLoading(false))

        if (response.error) {
            const message = `Feil ved re-migrering av utbetaling: ${response.error}`
            logger.error(message)
            showToast(message, { variant: 'error' })
        } else {
            showToast(`Re-migrerte utbetaling for key "${message.key}"`, {
                variant: 'success',
            })
            setOpen(false)
        }
    }

    return (
        <>
            <ActionMenuItem onSelect={handleMenuItemClick}>Re-migrer utbetaling</ActionMenuItem>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                header={{
                    heading: 'Re-migrer utbetaling',
                    size: 'small',
                }}
                width="medium"
                closeOnBackdropClick
            >
                <Modal.Body>{preview && <JsonView json={preview} />}</Modal.Body>
                <Modal.Footer>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={remigrer}
                        loading={isLoading}
                        disabled={isLoading || !request}
                    >
                        Re-migrer
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={fetchPreview}
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        Hent forhåndsvisning
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={isLoading}>
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
