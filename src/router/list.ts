import { Hono } from 'hono'
import { AppEnv } from '../middleware/db'
import { createList } from '../features/list/createList' // あなたの置き場所に合わせて相対パス調整

export const listRouter = new Hono<{ Bindings: AppEnv }>()

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
