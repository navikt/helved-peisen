'use client'

import React, { useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Link } from '@navikt/ds-react'

type Props = Omit<React.HTMLAttributes<HTMLAnchorElement>, 'href'> & {
    searchParamName: string
    searchParamValue: string
    children: React.ReactNode
}

export const UrlSearchParamLink: React.FC<Props> = ({
    searchParamName,
    searchParamValue,
    children,
    className,
    ...rest
}) => {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)

            return params.toString()
        },
        [searchParams]
    )

    return (
        <Link
            href={pathname + '?' + createQueryString(searchParamName, searchParamValue)}
            className={className}
            {...rest}
        >
            {children}
        </Link>
    )
}
