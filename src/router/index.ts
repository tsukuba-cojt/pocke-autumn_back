import type { Hono } from 'hono'
import { testRouter } from './test'
import { authApp } from './auth'
import { searchRouter } from './search'
import { meApp } from './me'
import { comApp } from './community'
import { listRouter } from './list'
import { itemRouter } from './item'

export const bindRoutes = (app: Hono) => {
    app.route('/test', testRouter)
    app.route('/auth', authApp)
    app.route('/search', searchRouter)
    app.route('/me', meApp)
    app.route('/community', comApp)
    app.route('/list', listRouter)
    app.route('/item', itemRouter)
}
