import { ActionMenu, Button } from '@navikt/ds-react'
import { ChevronDownIcon } from '@navikt/aksel-icons'
import { MessageFilters } from '@/app/kafka/table/MessagesTable.tsx'

type Props = {
    filters: MessageFilters
    onFiltersChange: (filters: MessageFilters) => void
}

export default function MessageFilter({ filters, onFiltersChange }: Props) {
    const handleRadioChange = (value: string) => {
        onFiltersChange({ ...filters, visning: value as 'alle' | 'siste' })
    }

    const handleCheckboxToggle = () => {
        onFiltersChange({
            ...filters,
            utbetalingManglerKvittering: !filters.utbetalingManglerKvittering,
        })
    }

    return (
        <ActionMenu>
            <ActionMenu.Trigger>
                <Button
                    size="small"
                    variant="secondary-neutral"
                    icon={<ChevronDownIcon aria-hidden />}
                    iconPosition="right"
                    style={{ marginBottom: '1rem' }}
                >
                    Filter
                </Button>
            </ActionMenu.Trigger>
            <ActionMenu.Content>
                <ActionMenu.RadioGroup onValueChange={handleRadioChange} value={filters.visning} label="Visning">
                    <ActionMenu.RadioItem value="alle">Vis alle</ActionMenu.RadioItem>
                    <ActionMenu.RadioItem value="siste">Vis siste</ActionMenu.RadioItem>
                </ActionMenu.RadioGroup>
                <ActionMenu.Divider />
                <ActionMenu.CheckboxItem checked={filters.utbetalingManglerKvittering} onSelect={handleCheckboxToggle}>
                    Oppdrag uten kvittering
                </ActionMenu.CheckboxItem>
            </ActionMenu.Content>
        </ActionMenu>
    )
}
