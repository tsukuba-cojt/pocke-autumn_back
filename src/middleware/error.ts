import type { Context, Next } from 'hono'

export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next()
  } catch (err) {
    console.error(err)
    return c.json({ message: 'Internal Server Error' }, 500)
  }
}
