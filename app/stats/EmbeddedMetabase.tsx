'use client'

import { useTheme } from '@/hooks/useTheme.tsx'

export const EmbeddedMetabase: React.FC = () => {
    const theme = useTheme() ?? 'light'
    return (
        <iframe
            src={`https://metabase.ansatt.nav.no/public/dashboard/be77dd93-0740-45e1-870e-c9b602505408#theme=${theme}&bordered=false&titled=false`}
            className="w-full h-full bg-(--ax-bg-default)"
            style={{ border: 'none' }}
        />
    )
}
