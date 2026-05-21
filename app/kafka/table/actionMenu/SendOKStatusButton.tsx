import { useActionState, useEffect, useRef } from 'react'
import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'
import { Button, Modal, Textarea } from '@navikt/ds-react'
import { sendOkStatus } from '@/app/kafka/table/actionMenu/actions.ts'
import { showToast } from '@/lib/browser/toast.tsx'
import type { Message } from '@/app/kafka/types.ts'

type Props = {
    message: Message
}


export const SendOKStatusButton = ({ message }: Props) => {
    const ref = useRef<HTMLDialogElement>(null)
    const fagsystem = message.headers?.find((header) => header.key === 'fagsystem')?.value

    const sendOkStatusWithKey = sendOkStatus.bind(null, message.key, fagsystem)
    const [state, formAction, pending] = useActionState(sendOkStatusWithKey, { status: 'initial' })

    const openModal = (e: Event) => {
        e.preventDefault()
        ref.current?.showModal()
    }

    const closeModal = () => {
        ref.current?.close()
    }

    useEffect(() => {
        if (state.status === 'success') {
            showToast(`Sendte OK status for ${message.key}`, { variant: 'success' })
            ref.current?.close()
        }
        if (state.status === 'error') {
            showToast(state.message ?? 'Klarte ikke sende OK status', { variant: 'error' })
        }
    }, [state, message.key])

    return (
        <>
            <ActionMenuItem onSelect={openModal}>Send OK status</ActionMenuItem>
            <Modal
                ref={ref}
                header={{
                    heading: 'Send OK status',
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
                            Send OK status
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
