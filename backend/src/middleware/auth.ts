import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/env.ts'
import type { AuthPayload } from '../utils/jwt.ts'

export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const authorization = req.headers.authorization

    if (!authorization) {
        return res.status(401).json({
            error: 'Authentication required',
        })
    }

    const [scheme, token] = authorization.split(' ')

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({
            error: 'Invalid authorization header',
        })
    }

    try {
        const payload = jwt.verify(token, config.jwt.secret) as AuthPayload

        req.user = payload

        next()
    } catch {
        return res.status(401).json({
            error: 'Invalid or expired token',
        })
    }
}
