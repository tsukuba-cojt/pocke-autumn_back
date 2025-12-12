import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { bindRoutes } from './router'
import { errorHandler } from './middleware/error'
import { dbMiddleware, AppEnv } from './middleware/db'
import authRouter from './router/auth'

const app = new Hono()
app.get('/favicon.ico', (c) => c.text('No icon', 404))
// 共通ミドルウェア
app.use('*', logger())
app.use('*', errorHandler)
app.use('*', dbMiddleware)

// ルーターをまとめてバインド
bindRoutes(app)
app.route('/auth', authRouter)


export default app
