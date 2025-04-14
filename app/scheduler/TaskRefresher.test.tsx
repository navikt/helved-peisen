import {
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
    vi,
} from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { TaskRefresher } from '@/app/scheduler/TaskRefresher.tsx'

describe('TaskRefresher', async () => {
    const user = userEvent.setup({
        advanceTimers: vi.advanceTimersByTime,
    })

    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.runOnlyPendingTimers()
        vi.useRealTimers()
    })

    test('calls callback with given interval', async () => {
        let counter = 0
        const increment = async () => {
            counter += 1
        }

        render(<TaskRefresher onRefresh={increment} initialRefreshRate={100} />)

        expect(counter).toEqual(0)

        await user.click(screen.getByRole('checkbox'))

        vi.advanceTimersToNextTimer()
        expect(counter).toEqual(1)

        vi.advanceTimersToNextTimer()
        expect(counter).toEqual(2)
    })

    // Hack for å få user-event til å spille på lag med fake timers i vitest
    // https://github.com/vitest-dev/vitest/issues/3184#issuecomment-1506219115
    beforeAll(() => {
        // @ts-ignore
        const _jest = globalThis.jest

        // @ts-ignore
        globalThis.jest = {
            // @ts-ignore
            ...globalThis.jest,
            advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
        }

        // @ts-ignore
        return () => void (globalThis.jest = _jest)
    })
})
