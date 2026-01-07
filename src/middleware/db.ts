// src/middleware/db.ts
import { createMiddleware } from 'hono/factory'
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1'
import { Bindings } from '../global'

// アプリ全体で使うContextの型
export type AppEnv = {
  Bindings: Bindings
  Variables: { db: DrizzleD1Database }
  DB: D1Database
}

export const dbMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const db = drizzle(c.env.DB)
  c.set('db', db) // Contextに注入
  await next()
})