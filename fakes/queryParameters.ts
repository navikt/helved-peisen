import type QueryString from 'qs'
import type { Request } from 'express-serve-static-core'

export const parseStringQueryParam = (
    value?:
        | string
        | QueryString.ParsedQs
        | (string | QueryString.ParsedQs)[]
        | undefined
): string[] | undefined => {
    if (typeof value === 'string') {
        return value.split(',')
    } else if (
        Array.isArray(value) &&
        value.every((it) => typeof it === 'string')
    ) {
        return value
    }

    return undefined
}

const getStatus = (req: Request): string[] => {
    return parseStringQueryParam(req.query.status) ?? []
}

const getPage = (req: Request, defaultPage: number = 1): number => {
    return req.query.page ? +req.query.page : defaultPage
}

const getPageSize = (req: Request, defaultPageSize: number = 20): number => {
    return req.query.pageSize ? +req.query.pageSize : defaultPageSize
}

const getKind = (req: Request): string | undefined => {
    return typeof req.query.kind === 'string' ? req.query.kind : undefined
}

export const getTaskQueryParameters = (
    req: Request
): { page: number; pageSize: number; status: string[]; kind?: string } => {
    return {
        page: getPage(req),
        pageSize: getPageSize(req),
        status: getStatus(req),
        kind: getKind(req),
    }
}
