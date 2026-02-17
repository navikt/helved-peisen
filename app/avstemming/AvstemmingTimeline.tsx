'use client'

import { Box, Label, Timeline } from '@navikt/ds-react'
import { Avstemming } from '@/app/avstemming/types.ts'
import { parseAvstemmingXml } from '@/app/avstemming/parseAvstemmingXml.ts'
import { format } from 'date-fns'

interface TestTimelineProps {
    xmlMessages: string[];
}

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

function periodEnd(dato: Date): Date {
    const end = new Date(dato)
    end.setDate(end.getDate() + 1)
    end.setHours(23, 59, 59, 999)
    return end
}

export const AvstemmingTimeline = ({ xmlMessages }: TestTimelineProps) => {
    const parsed = xmlMessages.flatMap((xml) => {
        const a = parseAvstemmingXml(xml)
        return a ? [a] : []
    })

    if (parsed.length === 0) {
        return (
            <Box>
                <div className="flex flex-col gap-3">
                    Fant ingen avstemminger
                </div>
            </Box>
        )
    }
    const grouped = Map.groupBy(parsed, (avstemming) => avstemming.fagsystem);

    return (
        <Box>
            <Label>Tidslinje</Label>
            <Timeline>
                {[...grouped.entries()].map(([fagsystem, items]) => {
                    return (
                        <Timeline.Row key={fagsystem} label={fagsystem}>
                            {items.map((avstemming, i) => (
                                <Timeline.Period
                                    key={`ok-${i}`}
                                    start={avstemming.dato}
                                    end={periodEnd(avstemming.dato)}
                                    status={deriveStatus(avstemming)}
                                    statusLabel={deriveStatusLabel(avstemming)}
                                >
                                    <div>
                                        {avstemming.totalAntall === 0 ? (
                                            <div>Ingen utbetalinger å avstemme</div>
                                        ) : (
                                            <>
                                                <div>Periode: {format(avstemming.fom, 'yyyy-MM-dd')} - {format(avstemming.tom, 'yyyy-MM-dd')}</div>
                                                <div>Totalt: {avstemming.totalAntall} ({avstemming.totalBelop} kr)</div>
                                                <div>Godkjent: {avstemming.grunnlag.godkjentAntall} ({avstemming.grunnlag.godkjentBelop} kr)</div>
                                                {avstemming.grunnlag.varselAntall > 0 && (
                                                    <div>Varsel: {avstemming.grunnlag.varselAntall} ({avstemming.grunnlag.varselBelop} kr)</div>
                                                )}
                                                {avstemming.grunnlag.avvistAntall > 0 && (
                                                    <div>Avvist: {avstemming.grunnlag.avvistAntall} ({avstemming.grunnlag.avvistBelop} kr)</div>
                                                )}
                                                {avstemming.grunnlag.manglerAntall > 0 && (
                                                    <div>Mangler: {avstemming.grunnlag.manglerAntall} ({avstemming.grunnlag.manglerBelop} kr)</div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </Timeline.Period>
                            ))}
                        </Timeline.Row>
                    )
                })}
            </Timeline>
        </Box>
    )
}