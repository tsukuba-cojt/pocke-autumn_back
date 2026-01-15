import { Hono } from 'hono'
import { AppEnv } from '../middleware/db'
import { jwt } from 'hono/jwt'
import { createCommunity } from '../features/community/createCommunity'

export const comApp = new Hono<AppEnv>()
//認証
comApp.use('/', (c, next) => {
  const jwtMiddleware = jwt({ secret: c.env.JWT_SECRET })
  return jwtMiddleware(c, next)
})

comApp.post('/create', async (c) => {
  const body = await c.req.json<{
    name: string
    description?: string | null
    iconUrl?: string | null
  }>()

  if (!body?.name) {
    return c.json({ message: 'name is required' }, 400)
  }

  const result = await createCommunity(c.var.db, {
    name: body.name,
    description: body.description,
    iconUrl: body.iconUrl,
  })

  return c.json(result, 201)
})
