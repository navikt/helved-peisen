'use server'

import { cookies } from 'next/headers'

export async function deleteApiToken() {
    ;(await cookies()).delete('api-token')
}
