import { useActionState, useEffect, useRef } from 'react'
import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'
import { Button, Modal, Textarea } from '@navikt/ds-react'
import { tombstoneUtbetaling } from '@/app/kafka/table/actionMenu/actions.ts'
import { showToast } from '@/components/Toast'

type Props = {
    messageKey: string
}

export const TombstoneUtbetalingButton = ({ messageKey }: Props) => {
    const ref = useRef<HTMLDialogElement>(null)
    const tombstoneUtbetalingWithKey = tombstoneUtbetaling.bind(null, messageKey)
    const [state, formAction, pending] = useActionState(tombstoneUtbetalingWithKey, { status: 'initial' })

    const openModal = (e: Event) => {
        e.preventDefault()
        ref.current?.showModal()
    }

    const closeModal = () => {
        ref.current?.close()
    }

    useEffect(() => {
        if (state.status === 'success') {
            showToast(`Tombstonet melding ${messageKey}`)
        }
        if (state.status === 'error') {
            showToast(state.message ?? 'Klarte ikke tombstone melding', { variant: 'error' })
        }
    }, [state, messageKey])

    return (
        <>
            <ActionMenuItem onSelect={openModal}>Tombstone utbetaling</ActionMenuItem>
            <Modal
                ref={ref}
                header={{
                    heading: 'Tombstone utbetaling',
                    size: 'small',
                }}
            >
                <form action={formAction}>
                    <Modal.Body>
                        <Textarea
                            name="reason"
                            label="Oppgi grunn"
                            description="Grunnen du oppgir vil være synlig i audit-loggen"
                            error={state?.validation?.reason}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="submit" loading={pending} disabled={pending}>
                            Tombstone utbetaling
                        </Button>
                        <Button type="button" variant="secondary" onClick={closeModal} disabled={pending}>
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    )
}
