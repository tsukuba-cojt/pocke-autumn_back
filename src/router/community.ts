import { Hono } from 'hono'
import { AppEnv } from '../middleware/db'
import { jwt } from 'hono/jwt'
import { users } from '../db/model'
import { eq, or, and } from 'drizzle-orm'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

export const comApp = new Hono<AppEnv>()
//hui
//認証
comApp.use('/', (c,next)=>{
  const jwtMiddleware = jwt({secret: c.env.JWT_SECRET,})
  return jwtMiddleware(c,next)
})

comApp.get('/',  async (c) => {
    
  }
)
