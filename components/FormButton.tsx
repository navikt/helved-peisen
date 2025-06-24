import { Button, ButtonProps } from '@navikt/ds-react'
import { useFormStatus } from 'react-dom'

export const FormButton: React.FC<ButtonProps> = (props) => {
    const { pending } = useFormStatus()

    return <Button loading={pending} {...props} />
}
