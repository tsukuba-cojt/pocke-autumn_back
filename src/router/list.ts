import { Hono } from 'hono'
import { AppEnv } from '../middleware/db'
import { createList } from '../features/list/createList'

export const listRouter = new Hono<AppEnv>()

listRouter.post('/create', async (c) => {
  const body = await c.req.json<{
    name: string
    description?: string
    thumbnailUrl?: string
    userId: string
    communityId: string
  }>()

  if (!body?.name || !body?.userId || !body?.communityId) {
    return c.json({ message: 'name, userId, and communityId are required' }, 400)
  }

  const result = await createList(c.var.db, {
    name: body.name,
    description: body.description,
    thumbnailUrl: body.thumbnailUrl,
    userId: body.userId,
    communityId: body.communityId,
  })

  return c.json(result, 201)
})
