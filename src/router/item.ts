import { Hono } from 'hono'
import { AppEnv } from '../middleware/db'
import { createItem } from '../features/item/createItem'
import { showItem } from '../features/item/showItem'

export const itemRouter = new Hono<AppEnv>()

// TODO: 認証が直るまで一時的に無効化
// itemRouter.use('/*', (c, next) => {
//   const jwtMiddleware = jwt({ secret: c.env.JWT_SECRET })
//   return jwtMiddleware(c, next)
// })

itemRouter.post('/create', async (c) => {
  const body = await c.req.json<{
    title: string
    listId: string
    userId: string
    author?: string | null
    url?: string | null
    imageUrl?: string | null
    genreId?: string | null
  }>()

  if (!body?.title || !body?.listId || !body?.userId) {
    return c.json({ message: 'title, listId, and userId are required' }, 400)
  }

  const result = await createItem(c.var.db, {
    title: body.title,
    listId: body.listId,
    userId: body.userId,
    author: body.author,
    url: body.url,
    imageUrl: body.imageUrl,
    genreId: body.genreId,
  })

  return c.json(result, 201)
})

itemRouter.get('/list/:listId', async (c) => {
  const { listId } = c.req.param()

  if (!listId) {
    return c.json({ message: 'listId is required' }, 400)
  }

  const result = await showItem(c.var.db, { listId })
  return c.json(result, 200)
})
