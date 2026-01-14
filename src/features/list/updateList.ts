import { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq, sql } from 'drizzle-orm'
import { lists } from '../../db/model'
import { ListType } from './type'

type UpdateListInput = {
  listId: string
  name?: string
  description?: string | null
  thumbnailUrl?: string | null
}

type UpdateListResult = {
  list: ListType
}

export const updateList = async (
  db: DrizzleD1Database,
  input: UpdateListInput
): Promise<UpdateListResult | null> => {
  const updates: Record<string, unknown> = {
    updatedAt: sql`(strftime('%s', 'now'))`,
  }

  if (input.name !== undefined) updates.name = input.name
  if (input.description !== undefined) updates.description = input.description
  if (input.thumbnailUrl !== undefined) updates.thumbnail_url = input.thumbnailUrl

  const updated = await db
    .update(lists)
    .set(updates)
    .where(eq(lists.id, input.listId))
    .returning()
    .get()

  if (!updated) {
    return null
  }

  return {
    list: {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      thumbnailUrl: updated.thumbnail_url,
      userId: updated.userId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    },
  }
}
