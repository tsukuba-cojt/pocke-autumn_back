import { DrizzleD1Database } from 'drizzle-orm/d1'
import { and, eq } from 'drizzle-orm'
import { favList } from '../../db/model'

type RemoveBookmarkInput = {
  listItemId: string
  userId: string
}

type RemoveBookmarkResult = {
  removed: boolean
}

export const removeBookmark = async (
  db: DrizzleD1Database,
  input: RemoveBookmarkInput
): Promise<RemoveBookmarkResult> => {
  const existing = await db
    .select()
    .from(favList)
    .where(and(eq(favList.listItemId, input.listItemId), eq(favList.userId, input.userId)))
    .get()

  if (!existing) {
    return { removed: false }
  }

  await db
    .delete(favList)
    .where(and(eq(favList.listItemId, input.listItemId), eq(favList.userId, input.userId)))
    .run()

  return { removed: true }
}
