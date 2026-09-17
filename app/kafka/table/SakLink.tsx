import type { Message } from '@/app/kafka/types.ts'
import { Link } from '@navikt/ds-react'
import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'
import { sakUrl } from '@/lib/sak-url.ts'

type Props = {
    message: Message
}

export const SakLink: React.FC<Props> = ({ message }) => {
    const url = sakUrl(message)

    if (!url) {
        return null
    }

    return (
        <ActionMenuItem>
            <Link className="no-underline text-inherit w-full" href={url} target="_blank" rel="noopener noreferrer">
                Gå til sak
            </Link>
        </ActionMenuItem>
    )
}
