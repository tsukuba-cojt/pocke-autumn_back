import { Hono } from 'hono'
import { AppEnv } from '../middleware/db'
import { jwt } from 'hono/jwt'
import { users } from '../db/model'
import { eq, or, and } from 'drizzle-orm'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

export const meApp = new Hono<AppEnv>()

//認証
meApp.use('/', (c,next)=>{
  const jwtMiddleware = jwt({secret: c.env.JWT_SECRET,})
  return jwtMiddleware(c,next)
})

//プロフィールの表示
meApp.get('/',  async (c) => {
    const payload = c.get('jwtPayload')
    const myId = payload.sub
    
    const result = await c.var.db
      .select()
      .from(users)
      .where(eq(users.id,myId)).limit(1)
    
      const me = result[0]

      if(!me) {
        return c.json({ error: 'User not found' }, 404)
      }
    
    return c.json({
    user: {
      id: me.id,
      email: me.email,
      name: me.username,
      description: me.description,
      icon: me.iconUrl
    }
  })
  }
)

const updateProfileSchema = z.object({
  username: z.string().max(50).optional(),
  description: z.string().max(200).optional(),
  iconUrl: z.string().optional(),
})

//プロフィールの編集
meApp.patch('/',zValidator('json', updateProfileSchema), async (c)=> {
  const payload = c.get('jwtPayload')
  const myId = payload.sub as string
  const data = c.req.valid('json')

  try{
    const result = await c.var.db
      .update(users)
      .set(data)
      .where(eq(users.id,myId))
      .returning()
    
    const me = result[0]
    
    return c.json({
      user: {
        id: me.id,
        email: me.email,
        name: me.username,
        description: me.description,
        icon: me.iconUrl
      }
  })
  }catch(e){
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

export default meApp