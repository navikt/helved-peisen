'use client'

import React, { type Dispatch, type SetStateAction, useState } from 'react'
import { type SortState } from '@navikt/ds-react/Table'
import { useSearchParams } from 'next/navigation'

export const SortStateContext = React.createContext<{ setSortState: Dispatch<SetStateAction<SortState>> } & SortState>({
    orderBy: 'timestamp_ms',
    direction: 'descending',
    setSortState: () => null,
})

const useDefaultSortState = (): SortState => {
    return useSearchParams().get('topics')
        ? { orderBy: 'offset', direction: 'descending' }
        : { orderBy: 'timestamp_ms', direction: 'descending' }
}

export const SortStateProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [sortState, setSortState] = useState<SortState>(useDefaultSortState())

    return <SortStateContext.Provider value={{ ...sortState, setSortState }}>{children}</SortStateContext.Provider>
}
