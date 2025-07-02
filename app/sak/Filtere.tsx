'use client'

import React from 'react'
import { TextField } from '@navikt/ds-react'

import { showToast } from '@/components/Toast'
import { FormButton } from '@/components/FormButton'
import { useSak } from '@/app/sak/SakProvider.tsx'
import { fetchSak } from './actions'

import styles from './Filtere.module.css'

type Props = React.HTMLAttributes<HTMLDivElement>

export const Filtere: React.FC<Props> = ({ className, ...rest }) => {
    const { setSak } = useSak()

    const getSak = async (formData: FormData) => {
        const sakId = formData.get('sakId') as string
        const fagsystem = formData.get('fagsystem') as string
        const response = await fetchSak(sakId, fagsystem)

        if (response.data) {
            setSak({
                id: sakId,
                fagsystem: fagsystem,
                hendelser: response.data,
            })

            if (response.data.length === 0) {
                showToast('Fant ingen hendelser for sak')
            }
        }

        if (response.error) {
            showToast(response.error.message, { variant: 'error' })
        }
    }

    return (
        <div {...rest}>
            <form className={styles.form} action={getSak}>
                <TextField
                    className={styles.input}
                    label="Sak-ID"
                    name="sakId"
                    size="small"
                    required
                />
                <TextField
                    className={styles.input}
                    label="Fagsystem"
                    name="fagsystem"
                    size="small"
                    required
                />
                <FormButton className={styles.button} size="small">
                    Søk
                </FormButton>
            </form>
        </div>
    )
}
