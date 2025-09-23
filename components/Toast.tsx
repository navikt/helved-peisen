import toast from 'react-hot-toast'
import { Alert } from '@navikt/ds-react'
import { clsx } from 'clsx'

export const showToast = (
    message: string,
    options: { variant: 'info' | 'success' | 'error' | 'warning' } = {
        variant: 'info',
    }
) => {
    return toast.custom((t) => (
        <div className={clsx('animate-fade-in opacity-0 transition-opacity', t.visible && 'opacity-100')}>
            <Alert size="small" variant={options.variant}>
                {message}
            </Alert>
        </div>
    ))
}
