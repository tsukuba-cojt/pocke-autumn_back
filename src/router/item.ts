import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import type { AppEnv } from '../middleware/db'
import { addItem } from '../features/item/addItem'

export const itemRouter = new Hono<AppEnv>()

itemRouter.use('/', (c, next) => {
  const jwtMiddleware = jwt({ secret: c.env.JWT_SECRET })
  return jwtMiddleware(c, next)
})

itemRouter.post('/add', async (c) => {
  const body = await c.req.json<{
    listId: string
    userId: string
    title: string
    author?: string
    url?: string
    imageUrl?: string
    genreId?: string
  }>()

  if (!body?.listId || !body?.userId || !body?.title) {
    return c.json({ message: 'listId, userId, title are required' }, 400)
  }

  const result = await addItem(c.env.DB, {
    listId: body.listId,
    userId: body.userId,
    title: body.title,
    author: body.author,
    url: body.url,
    imageUrl: body.imageUrl,
    genreId: body.genreId,
  })

  return c.json(result, 201)
})
