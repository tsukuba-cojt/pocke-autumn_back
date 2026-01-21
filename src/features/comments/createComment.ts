import { DrizzleD1Database } from 'drizzle-orm/d1'
import { and, eq } from 'drizzle-orm'
import { listItems, threads } from '../../db/model'

type CreateCommentInput = {
  listId: string
  listItemId: string
  userId: string
  text: string
  replyId?: string | null
}

type CreateCommentResult = {
  comment: {
    id: string
    listItemId: string
    userId: string
    replyId: string | null
    text: string
    createdAt: number
  }
}

export const createComment = async (
  db: DrizzleD1Database,
  input: CreateCommentInput
): Promise<CreateCommentResult | null> => {
  const listItem = await db
    .select()
    .from(listItems)
    .where(and(eq(listItems.id, input.listItemId), eq(listItems.listId, input.listId)))
    .get()

  if (!listItem) {
    return null
  }

  const created = await db
    .insert(threads)
    .values({
      id: crypto.randomUUID(),
      listItemId: input.listItemId,
      userId: input.userId,
      replyId: input.replyId ?? null,
      text: input.text,
    })
    .returning()
    .get()

  if (!created) {
    throw new Error('Failed to create comment')
  }

  return {
    comment: {
      id: created.id,
      listItemId: created.listItemId,
      userId: created.userId,
      replyId: created.replyId ?? null,
      text: created.text,
      createdAt: created.createdAt,
    },
  }
}
