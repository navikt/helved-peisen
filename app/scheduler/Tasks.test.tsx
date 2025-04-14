import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { server } from '@/fakes/msw/server.ts'
import { emptyTaskResponse, taskErrorResponse } from '@/fakes/msw/handlers.ts'

import { Tasks } from '@/app/scheduler/Tasks.tsx'

describe('Tasks', async () => {
    test('shows a message when there are no tasks', async () => {
        server.use(emptyTaskResponse())

        render(<Tasks searchParams={{}} />)

        const alert = await screen.findByRole('alert')
        expect(alert).toHaveTextContent('Fant ingen tasks')
    })

    test('shows an error message when fetching tasks fails', async () => {
        server.use(taskErrorResponse())

        render(<Tasks searchParams={{}} />)

        const alert = await screen.findByRole('alert')
        expect(alert).toHaveTextContent('Klarte ikke hente tasks')
    })
})
