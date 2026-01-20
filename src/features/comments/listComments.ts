import { DrizzleD1Database } from 'drizzle-orm/d1'
import { and, eq } from 'drizzle-orm'
import { listItems, threads } from '../../db/model'

type ListCommentsInput = {
  listId: string
  listItemId: string
}

type ListCommentsResult = {
  comments: Array<{
    id: string
    listItemId: string
    userId: string
    replyId: string | null
    text: string
    createdAt: number
  }>
}

export const listComments = async (
  db: DrizzleD1Database,
  input: ListCommentsInput
): Promise<ListCommentsResult | null> => {
  const listItem = await db
    .select()
    .from(listItems)
    .where(and(eq(listItems.id, input.listItemId), eq(listItems.listId, input.listId)))
    .get()

  if (!listItem) {
    return null
  }

  const rows = await db
    .select()
    .from(threads)
    .where(eq(threads.listItemId, input.listItemId))

  return {
    comments: rows.map((row) => ({
      id: row.id,
      listItemId: row.listItemId,
      userId: row.userId,
      replyId: row.replyId ?? null,
      text: row.text,
      createdAt: row.createdAt,
    })),
  }
}
