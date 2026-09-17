'use client'

import React, { useState } from 'react'
import { UNSAFE_Combobox } from '@navikt/ds-react'

import { AuditFilterCombobox } from '@/app/audit/AuditFilterCombobox.tsx'
import { DateRangeSelect } from '@/components/DateRangeSelect.tsx'
import { Topics } from '@/app/kafka/types.ts'
import { useAuditFiltere } from '@/app/audit/AuditFiltereContext.tsx'
import clsx from 'clsx'

// Fritekstsøk på sakId/endretAv/årsak er kun klientside
type AuditSearchContextValue = {
    terms: string[]
    setTerms: (terms: string[]) => void
}

export const AuditSearchContext = React.createContext<AuditSearchContextValue>({
    terms: [],
    setTerms: () => null,
})

export const AuditSearchProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [terms, setTerms] = useState<string[]>([])
    return <AuditSearchContext.Provider value={{ terms, setTerms }}>{children}</AuditSearchContext.Provider>
}

export function useAuditSearch() {
    return React.useContext(AuditSearchContext)
}

const SearchCombobox: React.FC = () => {
    const { terms, setTerms } = useAuditSearch()

    const onToggleSelected = (option: string, isSelected: boolean) => {
        if (isSelected) {
            setTerms([...terms, option])
        } else {
            setTerms(terms.filter((term) => term !== option))
        }
    }

    return (
        <UNSAFE_Combobox
            className="ax-xl:min-w-80 [&_div[aria-hidden]]:hidden"
            label="Søk på sakId, endret av eller årsak"
            options={[]}
            allowNewValues
            isMultiSelect
            onToggleSelected={onToggleSelected}
            selectedOptions={terms}
            size="small"
        />
    )
}

export const AuditFiltere: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => {
    const filtere = useAuditFiltere()

    return (
        <div className={clsx('flex flex-col gap-6 justify-between', className)} {...rest}>
            <div className="grid grid-cols-2 ax-md:grid-cols-3 ax-lg:grid-cols-4 ax-xl:flex ax-xl:flex-wrap gap-x-8 gap-y-5 items-end">
                <SearchCombobox />
                <AuditFilterCombobox
                    className="ax-xl:min-w-60"
                    label="Topics"
                    filter="topics"
                    initialOptions={Object.values(Topics)}
                    isMultiSelect
                />
                <AuditFilterCombobox
                    label="Fagsystem"
                    filter="fagsystem"
                    initialOptions={['AAP', 'DAGPENGER', 'TILLEGGSSTØNADER', 'TILTAKSPENGER', 'HISTORISK', 'VALP']}
                    isMultiSelect
                />
                <DateRangeSelect
                    from={filtere.fom}
                    to={filtere.tom}
                    updateFrom={(fom: string) => filtere.setFiltere({ fom })}
                    updateTo={(tom: string) => filtere.setFiltere({ tom })}
                />
            </div>
        </div>
    )
}
