import toast from 'react-hot-toast'
import { Alert } from '@navikt/ds-react'
import { clsx } from 'clsx'

import styles from './Toast.module.css'
import fadeIn from '@/styles/fadeIn.module.css'

export const showToast = (
    message: string,
    options: { variant: 'info' | 'success' | 'error' | 'warning' } = {
        variant: 'info',
    }
) => {
    return toast.custom((t) => (
        <div
            className={clsx(
                fadeIn.animation,
                styles.toast,
                t.visible && styles.visible
            )}
        >
            <Alert size="small" variant={options.variant}>
                {message}
            </Alert>
        </div>
    ))
}
