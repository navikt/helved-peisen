'use client'

import { DateRangeSelect } from '@/components/DateRangeSelect'
import clsx from 'clsx'
import { useAvstemminger } from './AvstemingContext'

type Props = {
    className?: string
}

export const AvstemmingFiltere: React.FC<Props> = ({ className }) => {
    const { setFiltere, ...filtere } = useAvstemminger()
    return (
        <div className={clsx('flex flex-col gap-6 justify-between max-w-max', className)}>
            <DateRangeSelect
                from={filtere.fom}
                to={filtere.tom}
                updateFrom={(fom) => setFiltere({ fom })}
                updateTo={(tom) => setFiltere({ tom })}
            />
        </div>
    )
}
