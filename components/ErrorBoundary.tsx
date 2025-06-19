'use client'

import React, { ReactNode } from 'react'
import { Alert } from '@navikt/ds-react'

type Props = {
    children: ReactNode
    fallback?: ReactNode
}

type State = {
    error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {}
    }

    static getDerivedStateFromError(error: Error) {
        return { error }
    }

    // Kan brukes for å f.eks. logge feil
    // componentDidCatch(error: Error, errorInfo: any) {}

    render() {
        if (this.state.error) {
            // You can render any custom fallback UI
            return this.props.fallback ? (
                this.props.fallback
            ) : (
                <Alert variant="error">{this.state.error.message}</Alert>
            )
        }

        return this.props.children
    }
}
