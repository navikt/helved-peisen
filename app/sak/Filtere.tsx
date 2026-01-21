'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button, Select, TextField } from '@navikt/ds-react'

import { showToast } from '@/components/Toast'
import { useSak } from '@/app/sak/SakProvider.tsx'
import { useSetSearchParams } from '@/hooks/useSetSearchParams'
import { fetchHendelserForSak } from '@/lib/io.ts'

type Props = React.HTMLAttributes<HTMLDivElement>

export const Filtere: React.FC<Props> = ({ className, ...rest }) => {
    const { setSak, isLoading, setIsLoading } = useSak()
    const setSearchParams = useSetSearchParams()
    const searchParams = useSearchParams()
    const [sakId, setSakId] = useState(searchParams.get('sakId') ?? undefined)
    const [fagsystem, setFagsystem] = useState(searchParams.get('fagsystem') ?? undefined)

    const fetchSak = async (sakId: string, fagsystem: string) => {
        setIsLoading(true)
        return fetchHendelserForSak(sakId, fagsystem)
            .then((hendelser) => {
                if (hendelser.length === 0) {
                    showToast('Fant ingen hendelser for sak')
                } else {
                    setSak({ id: sakId, fagsystem, hendelser })
                }
            })
            .catch((e) => showToast(`Klarte ikke hente hendelser for sak: ${e}`, { variant: 'error' }))
            .finally(() => setIsLoading(false))
    }

    useEffect(function initialSearch() {
        const params = new URL(window.location.href).searchParams
        const sakId = params.get('sakId')
        const fagsystem = params.get('fagsystem')

        if (sakId && fagsystem) {
            fetchSak(sakId, fagsystem)
        }
    }, [])

    const search = () => {
        if (!sakId || !fagsystem) {
            return
        }
        fetchSak(sakId, fagsystem).then(() => setSearchParams({ sakId, fagsystem }))
    }

    return (
        <div {...rest} className="flex gap-8 mb-8">
            <TextField
                className="h-max"
                label="Sak-ID"
                name="sakId"
                size="small"
                defaultValue={sakId}
                onChange={(e) => setSakId(e.target.value)}
            />
            <Select
                className="h-max"
                label="Fagsystem"
                name="fagsystem"
                size="small"
                defaultValue={fagsystem}
                onChange={(e) => setFagsystem(e.target.value)}
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
            <Button className="h-max mt-7" size="small" loading={isLoading} onClick={search}>
                Søk
            </Button>
        </div>
    )
}
