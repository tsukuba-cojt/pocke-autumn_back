import { DrizzleD1Database } from 'drizzle-orm/d1'
import { and, eq } from 'drizzle-orm'
import { meToo } from '../../db/model'

type MeTooInput = {
  listItemId: string
  userId: string
}

type MeTooResult = {
  meToo: {
    listItemId: string
    userId: string
    createdAt: number | null
  }
}

export const addMeToo = async (
  db: DrizzleD1Database,
  input: MeTooInput
): Promise<MeTooResult | null> => {
  const existing = await db
    .select()
    .from(meToo)
    .where(and(eq(meToo.listItemId, input.listItemId), eq(meToo.userId, input.userId)))
    .get()

  if (existing) {
    return null
  }

  const created = await db
    .insert(meToo)
    .values({
      listItemId: input.listItemId,
      userId: input.userId,
    })
    .returning()
    .get()

  if (!created) {
    throw new Error('Failed to add me too')
  }

  return {
    meToo: {
      listItemId: created.listItemId,
      userId: created.userId,
      createdAt: created.createdAt ?? null,
    },
  }
}
