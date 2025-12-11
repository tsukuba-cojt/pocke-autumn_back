import type { Hono } from 'hono'
import { testRouter } from './test'
import { authApp } from './auth'
import { searchRouter } from './search'
import { meApp } from './me'

export const bindRoutes = (app: Hono) => {
    app.route('/test', testRouter)
    app.route('/auth', authApp)
    app.route('/search', searchRouter)
    app.route('/me', meApp)
}
