'use client'

import { useState } from 'react'
import { Button, Modal } from '@navikt/ds-react'
import { håndterDobbeltutbetaling } from '@/app/dashboard/actions.ts'
import { showToast } from '@/lib/browser/toast.tsx'
import type { DobbeltUtbetaling } from '@/app/dashboard/types.ts'

type Props = {
    kandidat: DobbeltUtbetaling
    onHåndtert: () => void
}

export const HåndterDobbeltutbetalingButton: React.FC<Props> = ({ kandidat, onHåndtert }) => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleHåndter = async () => {
        setLoading(true)
        const result = await håndterDobbeltutbetaling(
            kandidat.behandlingId,
            kandidat.klassekode,
            kandidat.fom,
            kandidat.tom
        )
        setLoading(false)

        if (result.status === 'success') {
            showToast(`Dobbeltutbetaling for ${kandidat.behandlingId} håndtert`)
            setOpen(false)
            onHåndtert()
        } else if (result.status === 'error') {
            showToast(result.message ?? 'Klarte ikke håndtere dobbeltutbetaling', { variant: 'error' })
        }
    }

    return (
        <>
            <Button variant="secondary-neutral" size="small" onClick={() => setOpen(true)}>
                Håndter
            </Button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                header={{ heading: 'Fjerne dobbeltutbetaling fra listen?', size: 'small' }}
            >
                <Modal.Body>
                    Er du sikker på at du vil fjerne dobbeltutbetalingen for behandling{' '}
                    <strong>{kandidat.behandlingId}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button type="button" loading={loading} disabled={loading} onClick={handleHåndter}>
                        Fjern
                    </Button>
                    <Button type="button" variant="secondary" disabled={loading} onClick={() => setOpen(false)}>
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
