import React from 'react'
import { logger } from '@navikt/next-logger'

import { addOppdrag } from '@/app/actions'
import { showToast } from '@/components/Toast.tsx'

import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'

const stripMmel = (value: string): string => {
    const mmel = value.match(/<mmel>([\s\S]*?)<\/mmel>/)
    if (mmel) {
        return value.replace(mmel[0], '')
    }
    return value
}

type Props = {
    messageValue: string
    messageKey: string
}

export const AddDatoKlassifikFomButton = ({ messageValue, messageKey }: Props) => {
    const handleMenuItemClick = async (e: Event) => {
        e.preventDefault()

        const formData = new FormData()

        const key = '<datoVedtakFom>'
        const startIndex = messageValue.indexOf(key)
        const beginning = stripMmel(messageValue.slice(0, startIndex))
        const datoKlassifikFom = `<datoKlassifikFom>${messageValue.slice(startIndex + key.length, messageValue.indexOf('</datoVedtakFom>'))}</datoKlassifikFom>\n`
        const end = messageValue.slice(startIndex)
        const message = beginning + datoKlassifikFom + end

        formData.set('oppdragXml', message)
        formData.set('messageKey', messageKey)

        const response = await addOppdrag(formData)
        if (response.error) {
            const message = `Feil ved manuell innsending av oppdrag: ${response.error.message}`
            logger.error(message)
            showToast(message, { variant: 'error' })
        } else {
            showToast(`Sendt inn oppdrag for "${messageKey}"`, {
                variant: 'success',
            })
        }
    }

    return (
        <>
            <ActionMenuItem onSelect={handleMenuItemClick}>Legg til datoKlassifikFom</ActionMenuItem>
        </>
    )
}
