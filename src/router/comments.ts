import { Hono } from 'hono'
import { AppEnv } from '../middleware/db'
import { createComment } from '../features/comments/createComment'
import { listComments } from '../features/comments/listComments'

export const commentsRouter = new Hono<AppEnv>()

commentsRouter.post('/:listId/items/:itemId/comments', async (c) => {
  const { listId, itemId } = c.req.param()

  if (!listId || !itemId) {
    return c.json({ message: 'listId and itemId are required' }, 400)
  }

  const body = await c.req.json<{
    userId: string
    text: string
    replyId?: string | null
  }>()

  if (!body?.userId || !body?.text) {
    return c.json({ message: 'userId and text are required' }, 400)
  }

  const result = await createComment(c.var.db, {
    listId,
    listItemId: itemId,
    userId: body.userId,
    text: body.text,
    replyId: body.replyId,
  })

  if (!result) {
    return c.json({ message: 'list item not found' }, 404)
  }

  return c.json(result, 201)
})

commentsRouter.get('/:listId/items/:itemId/comments', async (c) => {
  const { listId, itemId } = c.req.param()

  if (!listId || !itemId) {
    return c.json({ message: 'listId and itemId are required' }, 400)
  }

  const result = await listComments(c.var.db, {
    listId,
    listItemId: itemId,
  })

  if (!result) {
    return c.json({ message: 'list item not found' }, 404)
  }

  return c.json(result, 200)
})
