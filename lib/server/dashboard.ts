import type { RawMessage, StatusMessageValue } from '@/app/kafka/types.ts'
import { Topics } from '@/app/kafka/types.ts'
import { annotatePendingMismatch } from '@/lib/server/message.ts'
import type { DataMelding } from '@/app/avstemming/types.ts'
import { getFom, getTom } from '@/app/avstemming/types.ts'
import type {
    AvstemmingStatus,
    DobbeltutbetalingCandidate,
    DobbeltutbetalingKilde,
    ManglendeKvittering,
    PendingMismatchSummary,
} from '@/app/dashboard/types.ts'

/**
 * Teller hvor mange helved.utbetalinger.v1-meldinger som mangler en samsvarende
 * (identisk) forutgående helved.pending-utbetalinger.v1-melding, ved å gjenbruke
 * annotatePendingMismatch som allerede brukes av /api/messages.
 */
export function countPendingMismatch(rawMessages: RawMessage[]): PendingMismatchSummary {
    const annotated = annotatePendingMismatch(rawMessages)
    const mismatched = annotated.filter((m) => m.pendingMismatch && m.topic_name === Topics.utbetalinger)

    return {
        count: mismatched.length,
        sampleKeys: [...new Set(mismatched.map((m) => m.key))].slice(0, 10),
    }
}

/**
 * For hvert forventet fagsystem: sjekk om det finnes en DATA-avstemmingsmelding
 * hvis periode (nokkelFom..nokkelTom) dekker referansedatoen (typisk "i går").
 */
export function computeAvstemmingStatus(
    datameldinger: { fagsystem: string; avstemming: DataMelding }[],
    expectedFagsystemer: string[],
    referenceDate: Date
): AvstemmingStatus[] {
    const toDateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const reference = toDateOnly(referenceDate)

    return expectedFagsystemer.map((fagsystem) => {
        const alle = datameldinger.filter((it) => it.fagsystem === fagsystem)
        const treff = alle.filter((it) => {
            const fom = toDateOnly(getFom(it.avstemming))
            const tom = toDateOnly(getTom(it.avstemming))
            return fom <= reference && reference <= tom
        })

        const sisteAvstemtDato =
            alle.length === 0
                ? null
                : alle.reduce((latest, current) =>
                      current.avstemming.periode.datoAvstemtTom > latest.avstemming.periode.datoAvstemtTom
                          ? current
                          : latest
                  ).avstemming.periode.datoAvstemtTom

        if (treff.length === 0) {
            return { fagsystem, harKjort: false, datoAvstemtFom: null, datoAvstemtTom: null, sisteAvstemtDato }
        }

        const siste = treff.reduce((latest, current) =>
            current.avstemming.periode.datoAvstemtTom > latest.avstemming.periode.datoAvstemtTom ? current : latest
        )

        return {
            fagsystem,
            harKjort: true,
            datoAvstemtFom: siste.avstemming.periode.datoAvstemtFom,
            datoAvstemtTom: siste.avstemming.periode.datoAvstemtTom,
            sisteAvstemtDato,
        }
    })
}

/**
 * Finner oppdrag-meldinger (helved.oppdrag.v1) som ikke har fått en tilhørende
 * statusmelding (helved.status.v1) tilbake, og som er eldre enn terskelen.
 * Korrelasjon gjøres på key, med trace_id som fallback.
 */
export function findManglendeKvittering(
    oppdragMessages: RawMessage[],
    statusMessages: RawMessage[],
    nowMs: number,
    thresholdMs: number
): ManglendeKvittering[] {
    const statusKeys = new Set(statusMessages.map((m) => m.key))
    const statusTraceIds = new Set(statusMessages.map((m) => m.trace_id).filter((id): id is string => !!id))

    const manglende: ManglendeKvittering[] = []

    for (const oppdrag of oppdragMessages) {
        const harKvittering = statusKeys.has(oppdrag.key) || (!!oppdrag.trace_id && statusTraceIds.has(oppdrag.trace_id))
        if (harKvittering) continue

        const ageMs = nowMs - oppdrag.system_time_ms
        if (ageMs < thresholdMs) continue

        manglende.push({
            key: oppdrag.key,
            traceId: oppdrag.trace_id,
            sakId: oppdrag.sakId,
            fagsystem: oppdrag.fagsystem,
            sentAt: oppdrag.system_time_ms,
            ageMs,
        })
    }

    return manglende.sort((a, b) => b.ageMs - a.ageMs)
}

type LinjeGruppe = {
    behandlingId: string
    klassekode: string
    fom: string
    tom: string
    beløp: number
    kilder: Map<string, DobbeltutbetalingKilde>
}

/**
 * Finner potensielle dobbeltutbetalinger: samme periode (fom/tom), behandlingId
 * og klassekode utbetalt (beløp > 0, status OK) via mer enn én kildemelding.
 */
export function findDobbeltutbetalinger(statusMessages: RawMessage[]): DobbeltutbetalingCandidate[] {
    const grupper = new Map<string, LinjeGruppe>()

    for (const message of statusMessages) {
        if (!message.value) continue

        let parsed: StatusMessageValue
        try {
            parsed = JSON.parse(message.value)
        } catch {
            continue
        }

        if (parsed.status !== 'OK') continue

        for (const linje of parsed.detaljer?.linjer ?? []) {
            if (!linje.beløp || linje.beløp <= 0) continue

            const nokkel = `${linje.behandlingId}::${linje.klassekode}::${linje.fom}::${linje.tom}`
            const gruppe: LinjeGruppe = grupper.get(nokkel) ?? {
                behandlingId: linje.behandlingId,
                klassekode: linje.klassekode,
                fom: linje.fom,
                tom: linje.tom,
                beløp: linje.beløp,
                kilder: new Map(),
            }

            gruppe.beløp = linje.beløp
            gruppe.kilder.set(`${message.key}#${message.partition}#${message.offset}`, {
                key: message.key,
                partition: message.partition,
                offset: message.offset,
                timestampMs: message.system_time_ms,
            })

            grupper.set(nokkel, gruppe)
        }
    }

    return [...grupper.values()]
        .filter((gruppe) => gruppe.kilder.size > 1)
        .map((gruppe) => ({
            behandlingId: gruppe.behandlingId,
            klassekode: gruppe.klassekode,
            fom: gruppe.fom,
            tom: gruppe.tom,
            beløp: gruppe.beløp,
            kilder: [...gruppe.kilder.values()].sort((a, b) => a.timestampMs - b.timestampMs),
        }))
}
