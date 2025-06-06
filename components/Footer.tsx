import clsx from 'clsx'
import { ClientPagination } from '@/components/ClientPagination'
import { BodyShort } from '@navikt/ds-react'

import styles from './Footer.module.css'

type Props = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & {
    numberOfTasks: number
    page: number
    pageSize: number
    totalTasks: number
}

export const Footer: React.FC<Props> = ({
    numberOfTasks,
    page,
    pageSize,
    totalTasks,
    className,
    ...rest
}) => {
    return (
        <footer className={clsx(className, styles.footer)} {...rest}>
            <ClientPagination
                currentPage={page}
                pages={Math.ceil(totalTasks / pageSize)}
            />
            <BodyShort>
                Viser {Math.min(pageSize, numberOfTasks)} av {totalTasks} tasks
            </BodyShort>
        </footer>
    )
}

type SkeletonProps = Omit<React.HTMLAttributes<HTMLElement>, 'children'>

export const FooterSkeleton: React.FC<SkeletonProps> = ({
    className,
    ...rest
}) => {
    return (
        <Footer
            className={className}
            numberOfTasks={0}
            page={1}
            pageSize={0}
            totalTasks={0}
            {...rest}
        />
    )
}
