import { Hono } from 'hono'
import { AppEnv } from '../middleware/db'
import { jwt } from 'hono/jwt'
import { createItem } from '../features/item/createItem'
import { showItem } from '../features/item/showItem'
import { addMeToo } from '../features/item/meToo'
import { removeMeToo } from '../features/item/removeMeToo'
import { listMeTooUsers } from '../features/item/listMeTooUsers'
import { deleteItem } from '../features/item/deleteItem'

export const itemRouter = new Hono<AppEnv>()

itemRouter.use('/*', (c, next) => {
  const jwtMiddleware = jwt({ secret: c.env.JWT_SECRET })
  return jwtMiddleware(c, next)
})

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

itemRouter.post('/:listItemId/me-too', async (c) => {
  const { listItemId } = c.req.param()

  if (!listItemId) {
    return c.json({ message: 'listItemId is required' }, 400)
  }
  const payload = c.get('jwtPayload')
  const userId = payload.sub as string

  const result = await addMeToo(c.var.db, {
    listItemId,
    userId,
  })

  if (!result) {
    return c.json({ message: 'already me too' }, 409)
  }

  return c.json(result, 201)
})

itemRouter.delete('/:listItemId/me-too', async (c) => {
  const { listItemId } = c.req.param()

  if (!listItemId) {
    return c.json({ message: 'listItemId is required' }, 400)
  }
  const payload = c.get('jwtPayload')
  const userId = payload.sub as string

  const result = await removeMeToo(c.var.db, {
    listItemId,
    userId,
  })

  if (!result.removed) {
    return c.json({ message: 'me too not found' }, 404)
  }

  return c.json(result, 200)
})

itemRouter.get('/:listItemId/me-too', async (c) => {
  const { listItemId } = c.req.param()

  if (!listItemId) {
    return c.json({ message: 'listItemId is required' }, 400)
  }

  const result = await listMeTooUsers(c.var.db, { listItemId })
  return c.json(result, 200)
})

itemRouter.delete('/:listItemId', async (c) => {
  const { listItemId } = c.req.param()

  if (!listItemId) {
    return c.json({ message: 'listItemId is required' }, 400)
  }

  const result = await deleteItem(c.var.db, { listItemId })

  if (!result.deleted) {
    return c.json({ message: 'item not found' }, 404)
  }

  return c.json(result, 200)
})
