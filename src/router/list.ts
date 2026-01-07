import { Hono } from 'hono'
import { AppEnv } from '../middleware/db'
import { createList } from '../features/list/createList'
import { showLists } from '../features/list/showLists'
import { jwt } from 'hono/jwt'

export const listRouter = new Hono<AppEnv>()

listRouter.use('/', (c,next)=>{
  const jwtMiddleware = jwt({secret: c.env.JWT_SECRET,})
  return jwtMiddleware(c,next)
})

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

  const result = await createList(c.env.DB, {
    name: body.name,
    description: body.description,
    thumbnailUrl: body.thumbnailUrl,
    userId: body.userId,
    communityId: body.communityId,
  })

  return c.json(result, 201)
})

listRouter.get('/show', async (c) => {
  const listId = c.req.query('id')
  if (!listId) {
    return c.json({ message: 'id is required' }, 400)
  }

  const result = await showLists(c.env.DB, listId)

  if (!result) {
    return c.json({ message: 'List not found' }, 404)
  }

  return c.json(result)
})