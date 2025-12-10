import type { Hono } from 'hono'
import { testRouter } from './test'

export const bindRoutes = (app: Hono) => {
    app.route('/test', testRouter)
}
