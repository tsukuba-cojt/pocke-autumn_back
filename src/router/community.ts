import { Hono } from 'hono'
import { AppEnv } from '../middleware/db'
import { jwt } from 'hono/jwt'
import { createCommunity } from '../features/community/createCommunity'
import { showCommunity } from '../features/community/showCommunity'

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

comApp.get('/:communityId', async (c) => {
  const { communityId } = c.req.param()

  if (!communityId) {
    return c.json({ message: 'communityId is required' }, 400)
  }

  const result = await showCommunity(c.var.db, { communityId })

  if (!result) {
    return c.json({ message: 'community not found' }, 404)
  }

  return c.json(result, 200)
})
