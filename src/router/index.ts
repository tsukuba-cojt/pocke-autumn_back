import type { Hono } from 'hono'
import { testRouter } from './test'
import { authApp } from './auth'

export const bindRoutes = (app: Hono) => {
    app.route('/test', testRouter)
    app.route('/auth', authApp)
}
