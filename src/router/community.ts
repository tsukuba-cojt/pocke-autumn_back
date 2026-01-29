import { Hono } from 'hono'
import { AppEnv } from '../middleware/db'
import { jwt } from 'hono/jwt'
import { and, eq } from 'drizzle-orm'
import { commLists } from '../db/model'
import { createCommunity } from '../features/community/createCommunity'
import { showCommunity } from '../features/community/showCommunity'
import { updateCommunity } from '../features/community/updateCommunity'
import { listMembers } from '../features/community/listMembers'
import { addMember } from '../features/community/addMember'
import { removeMember } from '../features/community/removeMember'
import { createList } from '../features/list/createList'
import { deleteList } from '../features/list/deleteList'
import { listUserCommunities } from '../features/community/listUserCommunities'
import { listRecentItems } from '../features/community/listRecentItems'

export const comApp = new Hono<AppEnv>()
//認証
comApp.use('/*', (c, next) => {
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

comApp.get('/user/:userId/recent-items', async (c) => {
  const { userId } = c.req.param()

  if (!userId) {
    return c.json({ message: 'userId is required' }, 400)
  }

  const rawLimit = c.req.query('limit')
  const parsed = rawLimit ? Number.parseInt(rawLimit, 10) : 5
  const limit = Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 50) : 5

  const result = await listRecentItems(c.var.db, { userId, limit })
  return c.json(result, 200)
})

comApp.get('/user/:userId', async (c) => {
  const { userId } = c.req.param()

  if (!userId) {
    return c.json({ message: 'userId is required' }, 400)
  }

  const result = await listUserCommunities(c.var.db, { userId })
  return c.json(result, 200)
})

comApp.get('/:communityId/invite', async (c) => {
  const { communityId } = c.req.param()

  if (!communityId) {
    return c.json({ message: 'communityId is required' }, 400)
  }

  const deeplink = `pocke://community/${communityId}/join`
  return c.json({ deeplink }, 200)
})

comApp.get('/:communityId/members', async (c) => {
  const { communityId } = c.req.param()

  if (!communityId) {
    return c.json({ message: 'communityId is required' }, 400)
  }

  const result = await listMembers(c.var.db, { communityId })
  return c.json(result, 200)
})

comApp.post('/:communityId/lists', async (c) => {
  const { communityId } = c.req.param()

  if (!communityId) {
    return c.json({ message: 'communityId is required' }, 400)
  }

  const body = await c.req.json<{
    name: string
    description?: string | null
    thumbnailUrl?: string | null
    genreName?: string | null
  }>()

  if (!body?.name) {
    return c.json({ message: 'name is required' }, 400)
  }

  const payload = c.get('jwtPayload')
  const userId = payload.sub as string

  const result = await createList(c.var.db, {
    name: body.name,
    description: body.description,
    thumbnailUrl: body.thumbnailUrl,
    genreName: body.genreName,
    userId,
    communityId,
  })

  return c.json(result, 201)
})

comApp.delete('/:communityId/lists/:listId', async (c) => {
  const { communityId, listId } = c.req.param()

  if (!communityId || !listId) {
    return c.json({ message: 'communityId and listId are required' }, 400)
  }

  const belongs = await c.var.db
    .select()
    .from(commLists)
    .where(and(eq(commLists.commId, communityId), eq(commLists.listId, listId)))
    .get()

  if (!belongs) {
    return c.json({ message: 'list not found in community' }, 404)
  }

  const result = await deleteList(c.var.db, { listId })

  if (!result.deleted) {
    return c.json({ message: 'list not found' }, 404)
  }

  return c.json(result, 200)
})

comApp.post('/:communityId/members', async (c) => {
  const { communityId } = c.req.param()

  if (!communityId) {
    return c.json({ message: 'communityId is required' }, 400)
  }

  const body = await c.req.json<{
    authority?: string | null
  }>()
  const payload = c.get('jwtPayload')
  const userId = payload.sub as string

  const result = await addMember(c.var.db, {
    communityId,
    userId,
    authority: body.authority,
  })

  if (!result) {
    return c.json({ message: 'member already exists' }, 409)
  }

  return c.json(result, 201)
})

comApp.delete('/:communityId/members/:userId', async (c) => {
  const { communityId, userId } = c.req.param()

  if (!communityId || !userId) {
    return c.json({ message: 'communityId and userId are required' }, 400)
  }
  const payload = c.get('jwtPayload')
  const myId = payload.sub as string
  if (userId !== myId) {
    return c.json({ message: 'forbidden' }, 403)
  }

  const result = await removeMember(c.var.db, { communityId, userId })

  if (!result.removed) {
    return c.json({ message: 'member not found' }, 404)
  }

  return c.json(result, 200)
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

comApp.patch('/:communityId', async (c) => {
  const { communityId } = c.req.param()

  if (!communityId) {
    return c.json({ message: 'communityId is required' }, 400)
  }

  const body = await c.req.json<{
    name?: string
    description?: string | null
    iconUrl?: string | null
  }>()

  if (
    body?.name === undefined &&
    body?.description === undefined &&
    body?.iconUrl === undefined
  ) {
    return c.json({ message: 'at least one field is required' }, 400)
  }

  const result = await updateCommunity(c.var.db, {
    communityId,
    name: body.name,
    description: body.description,
    iconUrl: body.iconUrl,
  })

  if (!result) {
    return c.json({ message: 'community not found' }, 404)
  }

  return c.json(result, 200)
})
