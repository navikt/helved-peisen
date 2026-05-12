'use client'

import { useState } from 'react'
import { logger } from '@navikt/next-logger'
import { Button, Modal, Textarea } from '@navikt/ds-react'

import { auditTest } from '@/app/avstemming/actions.ts'
import { showToast } from '@/lib/browser/toast.tsx'
import { isSuccessResponse } from '@/lib/api/types'

export const AuditTestButton = () => {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [reason, setReason] = useState('')
    const [validationError, setValidationError] = useState(false)

    const submit = async () => {
        if (!reason || reason.length === 0) {
            setValidationError(true)
            return
        }
        setValidationError(false)
        setIsLoading(true)

        const res = await auditTest(reason)

        if (!isSuccessResponse(res)) {
            logger.error(res.error)
            showToast(res.error, { variant: 'error' })
        } else {
            showToast('Audit-test ble logget', { variant: 'success' })
        }

        setIsLoading(false)
        setOpen(false)
        setReason('')
    }

    const closeModal = () => {
        setOpen(false)
        setValidationError(false)
        setReason('')
        setIsLoading(false)
    }

    return (
        <div className="mt-12">
            <Button variant="secondary" size="small" onClick={() => setOpen(true)}>
                Test audit-logg
            </Button>
            <Modal
                open={open}
                onClose={closeModal}
                header={{
                    heading: 'Test audit-logg',
                    size: 'small',
                }}
            >
                <Modal.Body>
                    <Textarea
                        label="Oppgi grunn"
                        description="Grunnen du oppgir vil være synlig i audit-loggen"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        error={validationError && (!reason || reason.length === 0) ? 'Grunn må oppgis' : null}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button type="button" onClick={submit} loading={isLoading}>
                        Send
                    </Button>
                    <Button type="button" variant="secondary" onClick={closeModal} disabled={isLoading}>
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}