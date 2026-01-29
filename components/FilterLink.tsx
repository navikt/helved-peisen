import { type FiltereValue, useFiltere } from '@/app/kafka/Filtere'
import { Link, type LinkProps } from '@navikt/ds-react'

type Props = Omit<LinkProps, 'href' | 'onClick'> & {
    filter: keyof FiltereValue
    value: FiltereValue[keyof FiltereValue]
    children: React.ReactNode
}

export const FilterLink: React.FC<Props> = ({ filter, value, ...rest }) => {
    const { setFiltere } = useFiltere()

    const onClick = () => setFiltere({ [filter]: value })

    return <Link {...rest} onClick={onClick} />
}
