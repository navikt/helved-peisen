import { checkToken } from '@/lib/server/auth.ts'
import { DashboardProvider } from '@/app/dashboard/DashboardContext.tsx'
import { DashboardFiltere } from '@/app/dashboard/DashboardFiltere.tsx'
import { DashboardContent } from '@/app/dashboard/DashboardContent.tsx'
import { VStack } from '@navikt/ds-react'

export default async function DashboardPage() {
    await checkToken()

    return (
        <DashboardProvider>
            <VStack gap="space-32" className="w-full mx-auto p-4 ax-md:p-8">
                <VStack gap="space-24">
                    <DashboardFiltere />
                </VStack>

                <DashboardContent />
            </VStack>
        </DashboardProvider>
    )
}
