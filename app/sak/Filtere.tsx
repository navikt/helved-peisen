'use client'

import React, { useActionState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Select, TextField } from '@navikt/ds-react'

import { showToast } from '@/components/Toast'
import { FormButton } from '@/components/FormButton'
import { useSak } from '@/app/sak/SakProvider.tsx'
import { useSetSearchParams } from '@/hooks/useSetSearchParams'
import { fetchHendelserForSak } from '@/lib/io.ts'

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
    const { setSak, setIsLoading } = useSak()
    const setSearchParams = useSetSearchParams()
    const searchParams = useSearchParams()

    const getSak = useCallback(
        async (_: FormState, formData: FormData) => {
            setIsLoading(true)
            const state = toFormState(formData)

            if (!hasValue(state.sakId) || !hasValue(state.fagsystem)) {
                return state
            }

            try {
                const hendelser = await fetchHendelserForSak(state.sakId.value, state.fagsystem.value)
                setSak({
                    id: state.sakId.value,
                    fagsystem: state.fagsystem.value,
                    hendelser: hendelser,
                })
                setSearchParams({
                    sakId: state.sakId.value,
                    fagsystem: state.fagsystem.value,
                })

                if (hendelser.length === 0) {
                    showToast('Fant ingen hendelser for sak')
                    setSearchParams({ sakId: '', fagsystem: '' })
                }
            } catch (e) {
                showToast(`Klarte ikke hente hendelser for sak: ${e}`, { variant: 'error' })
            }

            setIsLoading(false)
            return defaultState
        },
        [setIsLoading, setSak, setSearchParams]
    )

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search)
        let sakId = searchParams.get('sakId')
        const fagsystem = searchParams.get('fagsystem')

        if (sakId && fagsystem) {
            // Unencoded '+' signs in the URL are parsed as spaces by the browser.
            // TODO: encodeURIComponent for sakLink?
            if (sakId.includes(' ')) {
                sakId = sakId.replace(/ /g, '+')
            }
            const data = new FormData()
            data.set('sakId', sakId)
            data.set('fagsystem', fagsystem)
            getSak({} as unknown as FormState, data)
        }
    }, [getSak])

    const [state, action] = useActionState(getSak, defaultState)

    return (
        <div {...rest}>
            <form className="flex gap-8 mb-8" action={action}>
                <TextField
                    className="h-max"
                    label="Sak-ID"
                    name="sakId"
                    size="small"
                    defaultValue={
                        state.sakId?.error
                            ? undefined
                            : (state.sakId?.value || searchParams.get('sakId')?.replace(/ /g, '+')) ?? undefined
                    }
                    error={state.sakId?.error}
                />
                <Select
                    className="h-max"
                    label="Fagsystem"
                    name="fagsystem"
                    size="small"
                    defaultValue={
                        state.fagsystem?.error
                            ? undefined
                            : (state.fagsystem?.value || searchParams.get('fagsystem')) ?? undefined
                    }
                    error={state.fagsystem?.error}
                >
                    <option value="">- Velg fagsystem -</option>
                    <option value="DP">Dagpenger</option>
                    <option value="AAP">AAP</option>
                    <option value="HELSREF">Historisk</option>
                    <option value="TILTPENG">Tiltakspenger</option>
                    <option value="TILLST,TILLSTPB,TILLSTLM,TILLSTBO,TILLSTDR,TILLSTRS,TILLSTRO,TILLSTRA,TILLSTFL">
                        Tilleggsstønader
                    </option>
                </Select>
                <FormButton className="h-max mt-7" size="small">
                    Søk
                </FormButton>
            </form>
        </div>
    )
}
