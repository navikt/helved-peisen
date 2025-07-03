import { createContext, ReactNode, useContext } from 'react'

type TimelineContextValue = {
    start: Date
    end: Date
}

const TimelineContext = createContext<TimelineContextValue>({
    start: new Date(0),
    end: new Date(),
})

type Props = {
    start: Date
    end: Date
    children: ReactNode
}

export const TimelineProvider: React.FC<Props> = ({ start, end, children }) => {
    return (
        <TimelineContext.Provider value={{ start, end }}>
            {children}
        </TimelineContext.Provider>
    )
}

export const useTimeline = () => {
    return useContext(TimelineContext)
}
