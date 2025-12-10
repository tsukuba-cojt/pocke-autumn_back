import type { Hono } from 'hono'
import { testRouter } from './test'
import { Bindings } from '../bindings'

export const bindRoutes = (app: Hono<{ Bindings: Bindings }>) => {
    app.route('/test', testRouter)
}
