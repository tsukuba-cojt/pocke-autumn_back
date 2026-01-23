import { DrizzleD1Database } from 'drizzle-orm/d1'
import { and, eq } from 'drizzle-orm'
import { favList } from '../../db/model'

type AddBookmarkInput = {
  listItemId: string
  userId: string
}

type AddBookmarkResult = {
  bookmark: {
    listItemId: string
    userId: string
    createdAt: number | null
  }
}

export const addBookmark = async (
  db: DrizzleD1Database,
  input: AddBookmarkInput
): Promise<AddBookmarkResult | null> => {
  const existing = await db
    .select()
    .from(favList)
    .where(and(eq(favList.listItemId, input.listItemId), eq(favList.userId, input.userId)))
    .get()

  if (existing) {
    return null
  }

  const created = await db
    .insert(favList)
    .values({
      listItemId: input.listItemId,
      userId: input.userId,
    })
    .returning()
    .get()

  if (!created) {
    throw new Error('Failed to add bookmark')
  }

  return {
    bookmark: {
      listItemId: created.listItemId,
      userId: created.userId,
      createdAt: created.createdAt ?? null,
    },
  }
}
