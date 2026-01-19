import { Hono } from 'hono'
import { AppEnv } from '../middleware/db'
import { jwt } from 'hono/jwt'
import { createCommunity } from '../features/community/createCommunity'
import { showCommunity } from '../features/community/showCommunity'
import { updateCommunity } from '../features/community/updateCommunity'
import { listMembers } from '../features/community/listMembers'
import { addMember } from '../features/community/addMember'
import { removeMember } from '../features/community/removeMember'

export const comApp = new Hono<AppEnv>()
//認証
comApp.use('/', (c, next) => {
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

comApp.get('/:communityId/members', async (c) => {
  const { communityId } = c.req.param()

  if (!communityId) {
    return c.json({ message: 'communityId is required' }, 400)
  }

  const result = await listMembers(c.var.db, { communityId })
  return c.json(result, 200)
})

comApp.post('/:communityId/members', async (c) => {
  const { communityId } = c.req.param()

  if (!communityId) {
    return c.json({ message: 'communityId is required' }, 400)
  }

  const body = await c.req.json<{
    userId: string
    authority?: string | null
  }>()

  if (!body?.userId) {
    return c.json({ message: 'userId is required' }, 400)
  }

  const result = await addMember(c.var.db, {
    communityId,
    userId: body.userId,
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
