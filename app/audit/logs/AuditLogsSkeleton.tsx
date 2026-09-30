import { Skeleton } from '@navikt/ds-react'

export const AuditLogsSkeleton = () => (
    <div data-testid="audit-logs-skeleton">
        {Array(20)
            .fill(null)
            .map((_, i) => (
                <Skeleton key={i} height={33} />
            ))}
    </div>
)
