import { Hono } from 'hono'
import { AppEnv } from '../middleware/db'
import { jwt } from 'hono/jwt'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { getUserProfile, updateUserProfile } from '../features/user/profile'


export const meApp = new Hono<AppEnv>()

//認証
meApp.use('/', (c,next)=>{
  const jwtMiddleware = jwt({secret: c.env.JWT_SECRET,})
  return jwtMiddleware(c,next)
})

//プロフィールの表示
meApp.get('/',  async (c) => {
    const payload = c.get('jwtPayload')
    const userId = payload.sub as string
    
    const result = await getUserProfile(c.env.DB, userId)

    if(!result) {
      return c.json({ error: 'User not found'}, 404)
    }

    return c.json({ user: result })
  }
)

//バリデーション用スキーマ
const updateProfileSchema = z.object({
  username: z.string().max(50).optional(),
  displayName: z.string().max(50).optional(),
  description: z.string().max(200).optional(),
  iconUrl: z.string().optional(),
})

//プロフィールの登録・編集
meApp.patch('/',zValidator('json', updateProfileSchema), async (c)=> {
  const payload = c.get('jwtPayload')
  const userId = payload.sub 
  const data = c.req.valid('json')

  try{
    const result = await updateUserProfile(c.env.DB, userId, data)
    return c.json({ user: result })

  }catch(e){
    console.error(e)
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})


// const snsSchema = 
// //snsの追加/削除
// meApp.patch('/',zValidator('json',snsSchema), async (c) => {

// })

export default meApp