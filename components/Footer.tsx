import clsx from 'clsx'
import { ClientPagination } from '@/components/ClientPagination'
import { BodyShort } from '@navikt/ds-react'

type Props = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & {
    numberOfTasks: number
    page: number
    pageSize: number
    totalTasks: number
}

export const Footer: React.FC<Props> = ({ numberOfTasks, page, pageSize, totalTasks, className, ...rest }) => {
    return (
        <footer className={clsx(className, 'px-0 py-6 flex justify-between items-center')} {...rest}>
            <ClientPagination currentPage={page} pages={Math.ceil(totalTasks / pageSize)} />
            <BodyShort>
                Viser {Math.min(pageSize, numberOfTasks)} av {totalTasks} tasks
            </BodyShort>
        </footer>
    )
}
