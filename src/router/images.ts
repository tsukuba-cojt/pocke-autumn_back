import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { AppEnv } from '../middleware/db'
import { uploadImage } from '../features/images/uploadImage'

export const imagesRouter = new Hono<AppEnv>()

imagesRouter.use('/*', (c, next) => {
  const jwtMiddleware = jwt({ secret: c.env.JWT_SECRET })
  return jwtMiddleware(c, next)
})

imagesRouter.post('/upload', async (c) => {
  const form = await c.req.formData()
  const file = form.get('file')

  if (!file || !(file instanceof File)) {
    return c.json({ message: 'file is required' }, 400)
  }

  const result = await uploadImage(c.env, file)

  return c.json(
    {
      image: result,
    },
    201
  )
})
