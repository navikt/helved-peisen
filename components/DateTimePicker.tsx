import { DatePickerStandalone } from '@navikt/ds-react/DatePicker'
import styles from './DateTimePicker.module.css'
import { HStack, VStack, List, Popover, Button } from '@navikt/ds-react'
import { useRef, useState } from 'react'

export const DateTimePicker = () => {
    const [openState, setOpenState] = useState(false)

    const times = []
    for (let hour = 0; hour <= 23; hour++) {
        const formattedHour = hour < 10 ? `0${hour}` : hour
        times.push(`${formattedHour}:00`)
        times.push(`${formattedHour}:30`)
    }
    const buttonRef = useRef<HTMLButtonElement>(null)


    return (
        <>

            <Button
                ref={buttonRef}
                onClick={() => setOpenState(!openState)}
                aria-expanded={openState}
            >
                Åpne popover
            </Button>
            <Popover
                open={openState}
                onClose={() => setOpenState(false)}
                anchorEl={buttonRef.current}
                arrow={false}
            >
                <Popover.Content>
                    <HStack gap="2" align="end">
                        <DatePickerStandalone className={styles.datePickerContainer} onSelect={console.info} />
                        <VStack className={styles.timeListContainer}>
                            {times.map((time, index) => (
                                <List as="ul" size="small" key={index} className={styles.timeList}>
                                    <List.Item>
                                        {time}
                                    </List.Item>
                                </List>
                            ))}
                        </VStack>
                    </HStack>
                </Popover.Content>
            </Popover>
        </>
    )
}
