import { hackerPhrase } from '@/lib/hacker-phrase'

export function GET() {
    return new Response(hackerPhrase(), { status: 200 })
}
