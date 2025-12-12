import type { Hono } from 'hono'
import { testRouter } from './test'
import { authApp } from './auth'
import { searchRouter } from './search'

export const bindRoutes = (app: Hono) => {
    app.route('/test', testRouter)
    app.route('/auth', authApp)
    app.route('/search', searchRouter)
}
