import toast from 'react-hot-toast'
import { Alert } from '@navikt/ds-react'

export const showSuccessToast = (message: string) => {
    return toast.custom((t) => (
        <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md`}
        >
            <Alert size="small" variant="success">
                {message}
            </Alert>
        </div>
    ))
}

export const showErrorToast = (message: string) => {
    return toast.custom((t) => (
        <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md`}
        >
            <Alert size="small" variant="error">
                {message}
            </Alert>
        </div>
    ))
}
