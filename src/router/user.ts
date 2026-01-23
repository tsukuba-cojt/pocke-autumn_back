import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { AppEnv } from '../middleware/db'
import { getUserProfile } from '../features/user/profile'

export const userRouter = new Hono<AppEnv>()

userRouter.use('/*', (c, next) => {
  const jwtMiddleware = jwt({ secret: c.env.JWT_SECRET })
  return jwtMiddleware(c, next)
})

userRouter.get('/:userId', async (c) => {
  const { userId } = c.req.param()

  if (!userId) {
    return c.json({ message: 'userId is required' }, 400)
  }

  const result = await getUserProfile(c.env.DB, userId)

  if (!result) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ user: result })
})
