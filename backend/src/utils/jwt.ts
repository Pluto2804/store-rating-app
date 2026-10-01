import jwt from 'jsonwebtoken'
import { config } from '../config/env.ts'

export type AuthPayload = {
    userId: string
    role: string
}

export function createToken(payload: AuthPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    })
}
