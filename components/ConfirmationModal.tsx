import { BodyLong, Button, Modal } from '@navikt/ds-react'

type ConfirmationModalProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    heading: string;
    body: string;
    confirmText?: string;
    confirmVariant?: 'danger' | 'primary' | 'secondary';
    cancelText?: string;
    isLoading?: boolean;
};

export const ConfirmationModal =
    ({
         open,
         onClose,
         onConfirm,
         heading,
         body,
         confirmText = 'Ja, jeg er sikker',
         confirmVariant = 'danger',
         cancelText = 'Avbryt',
         isLoading = false,
     }: ConfirmationModalProps) => {
        const handleConfirm = () => {
            onConfirm()
            onClose()
        }

        return (
            <Modal
                open={open}
                onClose={onClose}
                header={{
                    heading,
                    size: 'small',
                    closeButton: false,
                }}
                width="small"
            >
                <Modal.Body>
                    <BodyLong>{body}</BodyLong>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        type="button"
                        variant={confirmVariant}
                        onClick={handleConfirm}
                        loading={isLoading}
                    >
                        {confirmText}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }