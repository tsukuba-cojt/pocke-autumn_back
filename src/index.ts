import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { bindRoutes } from './router'
import { errorHandler } from './middleware/error'

const app = new Hono()

// 共通ミドルウェア
app.use('*', logger())
app.use('*', errorHandler)

// ルーターをまとめてバインド
bindRoutes(app)

export default app
