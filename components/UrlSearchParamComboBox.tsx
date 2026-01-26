import clsx from 'clsx'
import { ComboboxProps, UNSAFE_Combobox } from '@navikt/ds-react'
import { useSearchParams } from 'next/navigation'

type Props<T extends string> = Omit<ComboboxProps, 'options' | 'onSelect'> & {
    searchParamName: string
    initialOptions: T[]
    onSelect: (value: string | null) => void
    renderForSearchParam?: (value: string) => string
    renderForCombobox?: (value: string) => string
    size?: 'small' | 'medium'
    hideDropdown?: boolean
}

export const UrlSearchParamComboBox = <T extends string>({
    searchParamName,
    initialOptions,
    onSelect,
    renderForSearchParam = (value) => value,
    renderForCombobox = (value) => value,
    className,
    isMultiSelect,
    size = 'medium',
    hideDropdown = false,
    ...rest
}: Props<T>) => {
    const searchParams = useSearchParams()
    const selectedOptions = searchParams.get(searchParamName)?.split(',') ?? []

    const onToggleSelected = (option: string, isSelected: boolean) => {
        if (isMultiSelect) {
            if (isSelected) {
                const query = [...selectedOptions, option as T].map(renderForSearchParam).join(',')
                onSelect(query)
            } else {
                const query = selectedOptions
                    .map(renderForSearchParam)
                    .filter((o) => o !== renderForSearchParam(option))
                    .join(',')
                onSelect(query)
            }
        } else {
            if (isSelected) {
                onSelect(renderForSearchParam(option))
            } else {
                onSelect(null)
            }
        }
    }

    return (
        <UNSAFE_Combobox
            className={clsx(className, hideDropdown && '[&_*]:aria-hidden:hidden')}
            isMultiSelect={isMultiSelect}
            options={initialOptions.map(renderForCombobox)}
            onToggleSelected={onToggleSelected}
            selectedOptions={selectedOptions.map(renderForCombobox)}
            size={size}
            {...rest}
        />
    )
}
