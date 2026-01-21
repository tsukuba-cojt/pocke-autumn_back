import { DrizzleD1Database } from 'drizzle-orm/d1'
import { and, eq } from 'drizzle-orm'
import { meToo } from '../../db/model'

type RemoveMeTooInput = {
  listItemId: string
  userId: string
}

type RemoveMeTooResult = {
  removed: boolean
}

export const removeMeToo = async (
  db: DrizzleD1Database,
  input: RemoveMeTooInput
): Promise<RemoveMeTooResult> => {
  const existing = await db
    .select()
    .from(meToo)
    .where(and(eq(meToo.listItemId, input.listItemId), eq(meToo.userId, input.userId)))
    .get()

  if (!existing) {
    return { removed: false }
  }

  await db
    .delete(meToo)
    .where(and(eq(meToo.listItemId, input.listItemId), eq(meToo.userId, input.userId)))
    .run()

  return { removed: true }
}
