import { Hono } from 'hono'
import { Bindings } from  './bindings'
import { logger } from 'hono/logger'
import { bindRoutes } from './router'
import { errorHandler } from './middleware/error'
import 'dotenv/config'

const app = new Hono<{ Bindings: Bindings }>()

// 共通ミドルウェア
app.use('*', logger())
app.use('*', errorHandler)

// ルーターをまとめてバインド
bindRoutes(app)

export default app
