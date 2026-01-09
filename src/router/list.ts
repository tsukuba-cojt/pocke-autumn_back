import { Hono } from 'hono'
import { AppEnv } from '../middleware/db'
import { createList } from '../features/list/createList'
import { showList } from '../features/list/showList'

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

listRouter.get('/:listId', async (c) => {
  const { listId } = c.req.param()

  if (!listId) {
    return c.json({ message: 'listId is required' }, 400)
  }

  const result = await showList(c.var.db, { listId })

  if (!result) {
    return c.json({ message: 'list not found' }, 404)
  }

  return c.json(result, 200)
})
