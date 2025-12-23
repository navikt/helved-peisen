import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LiveButton } from './LiveButton'
import { MessagesContext } from './context/MessagesContext.tsx'
import { type PropsWithChildren } from 'react'

const FakeMessagesContextProvider: React.FC<PropsWithChildren & { onFetchMessages: () => void }> = ({
    children,
    onFetchMessages,
}) => {
    return (
        <MessagesContext.Provider
            value={{
                loading: false,
                messages: null,
                fetchAdditionalMessages: onFetchMessages,
            }}
        >
            {children}
        </MessagesContext.Provider>
    )
}

describe('LiveButton', () => {
    it('fetches additional messages on an interval', () => {
        vi.useFakeTimers()

        let fetches = 0

        render(
            <FakeMessagesContextProvider onFetchMessages={() => (fetches = fetches + 1)}>
                <LiveButton />
            </FakeMessagesContextProvider>
        )

        const button = screen.getByRole('button')

        fireEvent.click(button)
        vi.advanceTimersByTime(2500)
        expect(fetches).toBe(1)
        vi.advanceTimersByTime(2500)
        expect(fetches).toBe(2)

        fireEvent.click(button)
        vi.advanceTimersByTime(2500)
        expect(fetches).toBe(2)

        vi.useRealTimers()
    })
})
