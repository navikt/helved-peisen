'use client'

import { Alert, Loader, Timeline } from '@navikt/ds-react'
import { Avstemming } from '@/app/avstemming/types.ts'
import { parseAvstemmingXml } from '@/app/avstemming/parseAvstemmingXml.ts'
import { format } from 'date-fns'
import { useAvstemminger } from './AvstemingContext'
import { isSuccessResponse } from '@/lib/api/types'

function deriveStatus(avstemming: Avstemming): 'success' | 'warning' | 'danger' | 'neutral' {
    const { avvistAntall, varselAntall, manglerAntall, godkjentAntall } = avstemming.grunnlag

    if (avstemming.totalAntall === 0) return 'neutral'
    if (avvistAntall > 0) return 'danger'
    if (varselAntall > 0 || manglerAntall > 0) return 'warning'
    if (godkjentAntall > 0) return 'success'
    return 'neutral'
}

function deriveStatusLabel(avstemming: Avstemming): string {
    if (avstemming.totalAntall === 0) return 'Ingen utbetalinger'

    const status = deriveStatus(avstemming)
    switch (status) {
        case 'danger':
            return `${avstemming.grunnlag.avvistAntall} avvist`
        case 'warning':
            return `${avstemming.grunnlag.varselAntall} varsel, ${avstemming.grunnlag.manglerAntall} mangler`
        case 'success':
            return `${avstemming.grunnlag.godkjentAntall} godkjent`
        default:
            return 'Ingen data'
    }
}

export const AvstemmingTimeline = () => {
    const { loading, avstemminger } = useAvstemminger()

    if (loading) {
        return <Loader />
    }

    if (!avstemminger) {
        return null
    }

    if (!isSuccessResponse(avstemminger)) {
        return <Alert variant="error">{avstemminger.error}</Alert>
    }

    const parsed = avstemminger.data.flatMap((xml) => {
        const a = parseAvstemmingXml(xml)
        return a ? [a] : []
    })

    if (parsed.length === 0) {
        return <Alert variant="warning">Fant ingen avstemminger</Alert>
    }

    const grouped = Map.groupBy(parsed, (avstemming) => avstemming.fagsystem)

    return (
        <Timeline>
            {[...grouped.entries()].map(([fagsystem, items]) => (
                <Timeline.Row key={fagsystem} label={fagsystem}>
                    {items.map((avstemming, i) => (
                        <Timeline.Period
                            key={`ok-${i}`}
                            start={avstemming.fom}
                            end={avstemming.tom}
                            status={deriveStatus(avstemming)}
                            statusLabel={deriveStatusLabel(avstemming)}
                        >
                            <div>
                                {avstemming.totalAntall === 0 ? (
                                    <div>Ingen utbetalinger å avstemme</div>
                                ) : (
                                    <>
                                        <div>
                                            Periode: {format(avstemming.fom, 'yyyy-MM-dd')} -{' '}
                                            {format(avstemming.tom, 'yyyy-MM-dd')}
                                        </div>
                                        <div>
                                            Totalt: {avstemming.totalAntall} ({avstemming.totalBelop} kr)
                                        </div>
                                        <div>
                                            Godkjent: {avstemming.grunnlag.godkjentAntall} (
                                            {avstemming.grunnlag.godkjentBelop} kr)
                                        </div>
                                        {avstemming.grunnlag.varselAntall > 0 && (
                                            <div>
                                                Varsel: {avstemming.grunnlag.varselAntall} (
                                                {avstemming.grunnlag.varselBelop} kr)
                                            </div>
                                        )}
                                        {avstemming.grunnlag.avvistAntall > 0 && (
                                            <div>
                                                Avvist: {avstemming.grunnlag.avvistAntall} (
                                                {avstemming.grunnlag.avvistBelop} kr)
                                            </div>
                                        )}
                                        {avstemming.grunnlag.manglerAntall > 0 && (
                                            <div>
                                                Mangler: {avstemming.grunnlag.manglerAntall} (
                                                {avstemming.grunnlag.manglerBelop} kr)
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </Timeline.Period>
                    ))}
                </Timeline.Row>
            ))}
        </Timeline>
    )
}
