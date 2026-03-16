'use client'

import { useTheme } from '@/hooks/useTheme.tsx'
import { Loader } from '@navikt/ds-react'
import clsx from 'clsx'
import { useState } from 'react'

export const EmbeddedMetabase: React.FC = () => {
    const [show, setShow] = useState(false)
    const theme = useTheme() ?? 'light'

    return (
        <>
            <iframe
                src={`https://metabase.ansatt.nav.no/public/dashboard/be77dd93-0740-45e1-870e-c9b602505408#theme=${theme}&bordered=false&titled=false`}
                className={clsx('w-full h-full bg-(--ax-bg-default)', show ? 'visible' : 'hidden')}
                style={{ border: 'none' }}
                onLoad={() => setShow(true)}
            />
            {!show && (
                <div className="w-full flex justify-center">
                    <Loader />
                </div>
            )}
        </>
    )
}
