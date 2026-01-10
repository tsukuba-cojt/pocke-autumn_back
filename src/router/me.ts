import { Hono } from 'hono'
import { AppEnv } from '../middleware/db'
import { jwt } from 'hono/jwt'
import { users,snsUrl } from '../db/model'
import { eq, or, and } from 'drizzle-orm'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { verify } from 'hono/jwt'

export const meApp = new Hono<AppEnv>()
//hui
//認証
meApp.use('/', (c,next)=>{
  const jwtMiddleware = jwt({secret: c.env.JWT_SECRET,})
  return jwtMiddleware(c,next)
})

//プロフィールの表示
meApp.get('/',  async (c) => {
    const payload = c.get('jwtPayload')
    const myId = payload.sub //ユーザID
    const db = c.var.db
    
    const user = await db.select()
    .from(users)
    .where(eq(users.id,myId))
    .get() //1件だけ取得

    if(!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    const snsLinks = await db.select()
    .from(snsUrl)
    .where(eq(snsUrl.userId,myId))
    .all()
    
    return c.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        description: user.description,
        iconUrl: user.iconUrl,
        snsUrl: snsLinks.map(link => link.url)
    }
  })
  }
)

const updateProfileSchema = z.object({
  username: z.string().max(50).optional(),
  displayName: z.string().max(50).optional(),
  description: z.string().max(200).optional(),
  iconUrl: z.string().optional(),
})

//プロフィールの登録・編集
meApp.patch('/',zValidator('json', updateProfileSchema), async (c)=> {
  const payload = c.get('jwtPayload')
  const myId = payload.sub 
  const data = c.req.valid('json')

  try{
    const [updatedUser] = await c.var.db
      .update(users)
      .set({
        ...data,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(users.id,myId))
      .returning()

    return c.json({
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        description: updatedUser.description,
        iconUrl: updatedUser.iconUrl,
      }
    })
  }catch(e){
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})


// const snsSchema = 
// //snsの追加/削除
// meApp.patch('/',zValidator('json',snsSchema), async (c) => {

// })

export default meApp