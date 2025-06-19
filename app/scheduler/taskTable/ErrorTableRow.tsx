import { TableDataCell, TableRow } from '@navikt/ds-react/Table'
import { Alert } from '@navikt/ds-react'

import styles from './ErrorTableRow.module.css'

type Props = {
    error: ParseError
}

export const ErrorTableRow: React.FC<Props> = ({ error }) => {
    return (
        <TableRow>
            <TableDataCell colSpan={7}>
                <Alert variant="error">
                    <ul className={styles.list}>
                        Klarte ikke vise task. Fikk følgende feil:
                        {error.error.issues.map((issue, i) => (
                            <li key={i}>
                                {issue.message} - path: {issue.path}
                            </li>
                        ))}
                    </ul>
                </Alert>
            </TableDataCell>
        </TableRow>
    )
}
