type SuccessServerActionResponse<T> = {
    status: 'success'
    message?: void
    data?: T
    validation?: void
}

type ErrorServerActionResponse = {
    status: 'error'
    message: string
    data?: void
    validation?: void
}

type InvalidServerActionResponse = {
    status: 'invalid'
    message?: void
    data?: void
    validation: { [name: string]: string }
}

type InitialServerActionResponse = {
    status: 'initial'
    message?: void
    data?: void
    validation?: void
}

export type ServerActionResponse<T> =
    | SuccessServerActionResponse<T>
    | ErrorServerActionResponse
    | InvalidServerActionResponse
    | InitialServerActionResponse
