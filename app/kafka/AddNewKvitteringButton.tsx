import { Button, Modal, Select, TextField, VStack } from '@navikt/ds-react'
import React, { useRef, useState } from 'react'
import { Message } from '@/app/kafka/types.ts'
import { addManuellKvittering } from '@/lib/api/manuell-kvittering.ts'

interface AddNewKvitteringButtonProps {
    message: Message
}

export default function AddNewKvitteringButton({
    message,
}: AddNewKvitteringButtonProps) {
    const modalRef = useRef<HTMLDialogElement>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [alvorlighetsgrad, setAlvorlighetsgrad] = useState<string>('00')
    const [beskrMelding, setBeskrMelding] = useState<string>('')
    const [kodeMelding, setKodeMelding] = useState<string>('')
    const [kvitteringAdded, setKvitteringAdded] = useState(false)

    const handleOpen = () => {
        setAlvorlighetsgrad('00')
        setBeskrMelding('')
        setKodeMelding('')
        modalRef.current?.showModal()
    }

    const handleClose = () => {
        modalRef.current?.close()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        if (!message.value) {
            console.error('Error: Oppdrag XML mangler')
            setIsSubmitting(false)
            return
        }

        try {
            const result = await addManuellKvittering(
                message.value,
                message.key,
                alvorlighetsgrad,
                beskrMelding,
                kodeMelding
            )
            if (result.success) {
                alert(`Kvittering for ${message.key} oppdatert!`)
                modalRef.current?.close()
                setKvitteringAdded(true)
            } else {
                alert(`Feil ved lagring av kvittering: ${result.message}`)
            }
        } catch (error) {
            console.error('Error updating kvittering:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const alvorlighetsgradOptions = [
        { value: '00', label: '00 - OK' },
        { value: '04', label: '04 - Akseptert men noe er feil' },
    ]

    const buttonText = kvitteringAdded
        ? 'Endre kvittering'
        : 'Legg til kvittering'
    const buttonVariant = kvitteringAdded ? 'secondary' : 'primary'

    return (
        <>
            <Button variant={buttonVariant} size="small" onClick={handleOpen}>
                {buttonText}
            </Button>

            <Modal
                ref={modalRef}
                header={{
                    heading: kvitteringAdded
                        ? 'Endre kvittering'
                        : 'Legg til kvittering',
                }}
                width={600}
            >
                <Modal.Body>
                    <form id="kvitteringForm" onSubmit={handleSubmit}>
                        <VStack gap="4">
                            <Select
                                label="Alvorlighetsgrad"
                                value={alvorlighetsgrad}
                                onChange={(e) =>
                                    setAlvorlighetsgrad(e.target.value)
                                }
                            >
                                {alvorlighetsgradOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                            {alvorlighetsgrad === '04' && (
                                <VStack gap="4">
                                    <TextField
                                        label="Beskrivelse"
                                        value={beskrMelding}
                                        onChange={(e) =>
                                            setBeskrMelding(e.target.value)
                                        }
                                        description="Angi beskrivelse for kvitteringen"
                                    />
                                    <TextField
                                        label="Kode"
                                        value={kodeMelding}
                                        onChange={(e) =>
                                            setKodeMelding(e.target.value)
                                        }
                                        description="Angi kode for kvitteringen"
                                    />
                                </VStack>
                            )}
                        </VStack>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button loading={isSubmitting} onClick={handleSubmit}>
                        Lagre
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                    >
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
