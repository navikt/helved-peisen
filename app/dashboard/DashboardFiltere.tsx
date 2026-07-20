'use client'

import { DateRangeSelect } from '@/components/DateRangeSelect'
import { useDashboard } from '@/app/dashboard/DashboardContext.tsx'

export const DashboardFiltere: React.FC = () => {
    const { setFiltere, ...filtere } = useDashboard()

    return (
        <div className="flex flex-col gap-6 justify-between w-max">
            <DateRangeSelect
                disabled={true}
                from={filtere.fom}
                to={filtere.tom}
                updateFrom={(fom) => setFiltere({ fom })}
                updateTo={(tom) => setFiltere({ tom })}
            />
        </div>
    )
}
