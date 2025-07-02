'use client'

import React, { useActionState } from 'react'
import { Select, TextField } from '@navikt/ds-react'

import { showToast } from '@/components/Toast'
import { FormButton } from '@/components/FormButton'
import { useSak } from '@/app/sak/SakProvider.tsx'
import { fetchSak } from './actions'

import styles from './Filtere.module.css'

type FormState = {
    sakId?: { value?: string; error?: string }
    fagsystem?: { value?: string; error?: string }
}

const defaultState: FormState = {
    sakId: undefined,
    fagsystem: undefined,
}

type Props = React.HTMLAttributes<HTMLDivElement>

export const Filtere: React.FC<Props> = ({ className, ...rest }) => {
    const { setSak } = useSak()

    const getSak = async (_: FormState, formData: FormData) => {
        const { sakId, fagsystem } = Object.fromEntries(formData)

        if (
            typeof sakId !== 'string' ||
            sakId.length === 0 ||
            typeof fagsystem !== 'string' ||
            fagsystem.length === 0
        ) {
            return {
                sakId: {
                    value: sakId as string | undefined,
                    error: !sakId ? 'Sak-ID må fylles ut' : undefined,
                },
                fagsystem: {
                    value: fagsystem as string | undefined,
                    error: !fagsystem ? 'Fagsystem må fylles ut' : undefined,
                },
            }
        }

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

        return defaultState
    }

    const [state, action] = useActionState(getSak, defaultState)

    return (
        <div {...rest}>
            <form className={styles.form} action={action}>
                <TextField
                    className={styles.input}
                    label="Sak-ID"
                    name="sakId"
                    size="small"
                    defaultValue={state.sakId?.value}
                    error={state.sakId?.error}
                />
                <Select
                    className={styles.input}
                    label="Fagsystem"
                    name="fagsystem"
                    size="small"
                    defaultValue={state.fagsystem?.value}
                    error={state.fagsystem?.error}
                >
                    <option value="">- Velg fagsystem -</option>
                    <option value="DP">Dagpenger</option>
                    <option value="AAP">AAP</option>
                    <option value="TILTPENG">Tiltakspenger</option>
                    <option value="TILLST">Tilleggsstønader</option>
                </Select>
                <FormButton className={styles.button} size="small">
                    Søk
                </FormButton>
            </form>
        </div>
    )
}
