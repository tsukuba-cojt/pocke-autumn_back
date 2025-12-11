import type { Context, Next } from 'hono'


export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return c.json({ message: 'Internal Server Error' }, 500)
  }
}
