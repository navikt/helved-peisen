import { checkToken } from '@/lib/server/auth'
import { LatestAvstemminger } from '../LatestAvstemminger'

export default async function SisteAvstemmingerPage() {
    await checkToken()

    return <LatestAvstemminger />
}
