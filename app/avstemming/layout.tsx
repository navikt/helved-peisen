'use client'

import { PropsWithChildren } from 'react'
import { Button } from '@navikt/ds-react'
import { AvstemmingProvider } from '@/app/avstemming/AvstemingContext.tsx'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'

export default function AvstemmingLayout({ children }: PropsWithChildren) {
    const pathname = usePathname()
    return (
        <div className="flex flex-col gap-16 p-4">
            <div className="flex gap-12">
                <nav className="flex flex-col gap-2 w-max">
                    <Button
                        href="/avstemming"
                        className={clsx(
                            'justify-start whitespace-nowrap',
                            pathname.endsWith('/avstemming') && 'not-[&:hover]:bg-(--ax-bg-neutral-moderateA)'
                        )}
                        variant="tertiary-neutral"
                        size="small"
                        as="a"
                    >
                        <span className="font-normal text-start">Tidslinje</span>
                    </Button>
                    <Button
                        href="/avstemming/siste-avstemminger"
                        className={clsx(
                            'justify-start whitespace-nowrap',
                            pathname.endsWith('/avstemming/siste-avstemminger') &&
                                'not-[&:hover]:bg-(--ax-bg-neutral-moderateA)'
                        )}
                        variant="tertiary-neutral"
                        size="small"
                        as="a"
                    >
                        <span className="font-normal">Siste avstemminger</span>
                    </Button>
                    <Button
                        href="/avstemming/dryrun"
                        className={clsx(
                            'justify-start whitespace-nowrap',
                            pathname.endsWith('/avstemming/dryrun') && 'not-[&:hover]:bg-(--ax-bg-neutral-moderateA)'
                        )}
                        variant="tertiary-neutral"
                        size="small"
                        as="a"
                    >
                        <span className="font-normal">Dryrun</span>
                    </Button>
                </nav>
                <AvstemmingProvider>{children}</AvstemmingProvider>
            </div>
        </div>
    )
}
