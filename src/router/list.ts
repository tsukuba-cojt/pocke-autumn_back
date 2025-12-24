import { Hono } from 'hono'
import { AppEnv } from '../middleware/db'
import { createList } from '../features/list/createList' // あなたの置き場所に合わせて相対パス調整
import { showList } from '../features/list/showList' // あなたの置き場所に合わせて相対パス調整
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
  }>()

  if (!body?.name || !body?.userId) {
    return c.json({ message: 'name and userId are required' }, 400)
  }

  const result = await createList(c.env.DB, {
    name: body.name,
    description: body.description,
    thumbnailUrl: body.thumbnailUrl,
    userId: body.userId,
  })

  return c.json(result, 201)
})

listRouter.get('/show/:id', async (c) => {
  const listId = c.req.param('id')
  const result = await showList(c.env.DB, listId)
  if (!result) {
    return c.json({ message: 'List not found' }, 404)
  }
  return c.json(result)
})