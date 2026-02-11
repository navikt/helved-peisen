declare type SuccessResponse<T> = {
    data: T
    error: null
}

declare type FailureResponse = {
    data: null
    error: string
}

export type ApiResponse<T> = SuccessResponse<T> | FailureResponse

export function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
    return response.error === null
}

export function isFailureResponse<T>(response: ApiResponse<T>): response is FailureResponse {
    return !isSuccessResponse(response)
}

export type PaginatedResponse<T> = { items: T[]; total: number }
