import { Box, Label, VStack } from '@navikt/ds-react'
import clsx from 'clsx'

type Props = {
    children: React.ReactNode
    label?: string
    className?: string
}

export const Card: React.FC<Props> = ({ label, children, className }) => {
    return (
        <Box borderRadius="8" background="neutral-soft" padding="space-16" className={clsx('max-w-max', className)}>
            <VStack gap="space-12">
                {label && <Label size="small">{label}</Label>}
                {children}
            </VStack>
        </Box>
    )
}
