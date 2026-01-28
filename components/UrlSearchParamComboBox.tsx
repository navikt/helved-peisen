import clsx from 'clsx'
import { ComboboxProps, UNSAFE_Combobox } from '@navikt/ds-react'
import { type FiltereValue, useFiltere } from '@/app/kafka/Filtere'

type Props<T extends string> = Omit<ComboboxProps, 'options' | 'onSelect'> & {
    filter: keyof FiltereValue
    initialOptions: T[]
    hideDropdown?: boolean
}

export const UrlSearchParamComboBox = <T extends string>({
    filter,
    initialOptions,
    className,
    isMultiSelect,
    hideDropdown = false,
    ...rest
}: Props<T>) => {
    const { setFiltere, ...filtere } = useFiltere()
    const value = filtere[filter] as string | null
    const selectedOptions = value?.split(',') ?? []

    const onToggleSelected = (option: string, isSelected: boolean) => {
        if (isMultiSelect) {
            if (isSelected) {
                const query = [...selectedOptions, option].join(',')
                setFiltere({ [filter]: query })
            } else {
                const query = selectedOptions.filter((o) => o !== option).join(',')
                setFiltere({ [filter]: query.length > 0 ? query : null })
            }
        } else {
            if (isSelected) {
                setFiltere({ [filter]: option })
            } else {
                setFiltere({ [filter]: null })
            }
        }
    }

    return (
        <UNSAFE_Combobox
            className={clsx(className, hideDropdown && '[&_*]:aria-hidden:hidden')}
            isMultiSelect={isMultiSelect}
            options={initialOptions}
            onToggleSelected={onToggleSelected}
            selectedOptions={selectedOptions}
            size="small"
            {...rest}
        />
    )
}
