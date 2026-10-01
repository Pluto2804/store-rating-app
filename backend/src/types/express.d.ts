import type { AuthPayload } from '../utils/jwt.ts'

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload
        }
    }
}

export {}
