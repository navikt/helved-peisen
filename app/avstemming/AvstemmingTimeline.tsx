'use client'

import { Alert, Skeleton, Timeline, VStack } from '@navikt/ds-react'
import { DataMelding, getFom, getTom, isDataMelding } from '@/app/avstemming/types.ts'
import { format } from 'date-fns'
import { useAvstemminger } from './AvstemingContext'
import { isSuccessResponse } from '@/lib/api/types'
import React from 'react'

function deriveStatus(avstemming: DataMelding): 'success' | 'warning' | 'danger' | 'neutral' {
    const { avvistAntall, varselAntall, manglerAntall, godkjentAntall } = avstemming.grunnlag

    if (avstemming.total.totalAntall === 0) return 'neutral'
    if (avvistAntall > 0) return 'danger'
    if (varselAntall > 0 || manglerAntall > 0) return 'warning'
    if (godkjentAntall > 0) return 'success'
    return 'neutral'
}

function deriveStatusLabel(avstemming: DataMelding): string {
    if (avstemming.total.totalAntall === 0) return 'Ingen utbetalinger'

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
        return <AvstemmingTimelineSkeleton />
    }

    if (!avstemminger) {
        return null
    }

    if (!isSuccessResponse(avstemminger)) {
        return <Alert variant="error">{avstemminger.error}</Alert>
    }

    const datameldinger = avstemminger.data.map(({ avstemming }) => avstemming).filter(isDataMelding)

    if (datameldinger.length === 0) {
        return <Alert variant="warning">Fant ingen avstemminger</Alert>
    }

    const grouped = Map.groupBy(datameldinger, (avstemming) => avstemming.aksjon.avleverendeKomponentKode)

    return (
        <Timeline>
            {[...grouped.entries()].map(([fagsystem, items]) => (
                <Timeline.Row key={fagsystem} label={fagsystem}>
                    {items.map((avstemming, i) => {
                        const fom = getFom(avstemming)
                        const tom = getTom(avstemming)
                        return (
                            <Timeline.Period
                                key={`ok-${i}`}
                                start={fom}
                                end={tom}
                                status={deriveStatus(avstemming)}
                                statusLabel={deriveStatusLabel(avstemming)}
                            >
                                <div>
                                    {avstemming.total.totalAntall === 0 ? (
                                        <div>Ingen utbetalinger å avstemme</div>
                                    ) : (
                                        <>
                                            <div>
                                                Periode: {format(fom, 'yyyy-MM-dd')} - {format(tom, 'yyyy-MM-dd')}
                                            </div>
                                            <div>
                                                Totalt: {avstemming.total.totalAntall} ({avstemming.total.totalBelop}{' '}
                                                kr)
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
                        )
                    })}
                </Timeline.Row>
            ))}
        </Timeline>
    )
}

const AvstemmingTimelineSkeleton = () => {
    return (
        <VStack className="grid grid-cols-[auto_minmax(0,1fr)] items-center w-full min-w-fit relative mt-4">
            {Array(9)
                .fill(0)
                .map((_, i) => (
                    <React.Fragment key={i}>
                        <div className="min-w-50 mr-4">
                            <Skeleton height="24px" variant="rectangle" />
                        </div>
                        <div className="my-4">
                            <Skeleton height="24px" variant="rectangle" />
                        </div>
                    </React.Fragment>
                ))}
        </VStack>
    )
}
