import { AvstemmingRequest } from '@/app/avstemming/types.ts'

export async function fetchAvstemmingNextRange(today: string): Promise<AvstemmingRequest> {
    const res = await fetch('/api/avstemming/next-range', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ today }),
    })

    if (res.redirected) {
        window.location.reload()
        return { today: '', fom: '', tom: '' }
    }

    if (!res.ok) {
        throw Error(`Klarte ikke hente neste range: ${res.statusText}`)
    }

    const json = await res.json()
    return json.data
}

export async function fetchAvstemmingDryrun(range: AvstemmingRequest): Promise<string> {
    const res = await fetch('/api/avstemming/dryrun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(range),
    })

    if (res.redirected) {
        window.location.reload()
        return ''
    }

    if (!res.ok) {
        throw Error(`Klarte ikke kjøre dryrun: ${res.statusText}`)
    }

    const json = await res.json()
    return json.data
}

export async function fetchAvstemmingDryrunV2(range: AvstemmingRequest): Promise<string> {
    const res = await fetch('/api/avstemming/dryrun/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(range),
    })

    if (res.redirected) {
        window.location.reload()
        return ''
    }

    if (!res.ok) {
        throw Error(`Klarte ikke kjøre dryrun: ${res.statusText}`)
    }

    const json = await res.json()
    return json.data
}
