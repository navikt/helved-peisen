'use client'

import React, { useActionState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Select, TextField } from '@navikt/ds-react'

import { showToast } from '@/components/Toast'
import { FormButton } from '@/components/FormButton'
import { useSak } from '@/app/sak/SakProvider.tsx'
import { useSetSearchParams } from '@/hooks/useSetSearchParams'
import { fetchSak } from './actions'

import styles from './Filtere.module.css'

type FormStateValue = { value: string; error: undefined }
type FormStateError = { value: undefined; error: string }
type FormStateInput = FormStateValue | FormStateError

type FormState = {
    sakId?: FormStateInput
    fagsystem?: FormStateInput
}

const defaultState: FormState = {
    sakId: undefined,
    fagsystem: undefined,
}

const toFormState = (formData: FormData): FormState => {
    const { sakId, fagsystem } = Object.fromEntries(formData)

    return {
        sakId:
            typeof sakId !== 'string' || sakId.length === 0
                ? { value: undefined, error: 'Sak-ID må fylles ut' }
                : { value: sakId, error: undefined },
        fagsystem:
            typeof fagsystem !== 'string' || fagsystem.length === 0
                ? { value: undefined, error: 'Fagsystem må fylles ut' }
                : { value: fagsystem, error: undefined },
    }
}

const hasValue = (input?: FormStateInput): input is FormStateValue => {
    return typeof (input as any)?.value === 'string'
}

type Props = React.HTMLAttributes<HTMLDivElement>

export const Filtere: React.FC<Props> = ({ className, ...rest }) => {
    const { setSak } = useSak()
    const setSearchParams = useSetSearchParams()
    const searchParams = useSearchParams()

    const getSak = useCallback(
        async (_: FormState, formData: FormData) => {
            const state = toFormState(formData)

            if (!hasValue(state.sakId) || !hasValue(state.fagsystem)) {
                return state
            }

            const response = await fetchSak(
                state.sakId.value,
                state.fagsystem.value
            )

            if (response.data) {
                setSak({
                    id: state.sakId.value,
                    fagsystem: state.fagsystem.value,
                    hendelser: response.data,
                })
                setSearchParams({
                    sakId: state.sakId.value,
                    fagsystem: state.fagsystem.value,
                })

                if (response.data.length === 0) {
                    showToast('Fant ingen hendelser for sak')
                    setSearchParams({ sakId: '', fagsystem: '' })
                }
            }

            if (response.error) {
                showToast(response.error.message, { variant: 'error' })
            }

            return defaultState
        },
        [setSak, setSearchParams]
    )

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search)
        const sakId = searchParams.get('sakId')
        const fagsystem = searchParams.get('fagsystem')

        if (sakId && fagsystem) {
            const data = new FormData()
            data.set('sakId', sakId)
            data.set('fagsystem', fagsystem)
            getSak({} as unknown as FormState, data)
        }
    }, [getSak])

    const [state, action] = useActionState(getSak, defaultState)

    return (
        <div {...rest}>
            <form className={styles.form} action={action}>
                <TextField
                    className={styles.input}
                    label="Sak-ID"
                    name="sakId"
                    size="small"
                    defaultValue={
                        state.sakId?.error
                            ? undefined
                            : (state.sakId?.value ||
                                  searchParams.get('sakId')) ??
                              undefined
                    }
                    error={state.sakId?.error}
                />
                <Select
                    className={styles.input}
                    label="Fagsystem"
                    name="fagsystem"
                    size="small"
                    defaultValue={
                        state.fagsystem?.error
                            ? undefined
                            : (state.fagsystem?.value ||
                                  searchParams.get('fagsystem')) ??
                              undefined
                    }
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
