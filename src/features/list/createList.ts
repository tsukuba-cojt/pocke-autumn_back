import { DrizzleD1Database } from 'drizzle-orm/d1'
import { commLists, lists } from '../../db/model'
import { ListType } from './type'

type CreateListInput = {
  name: string
  description?: string | null
  thumbnailUrl?: string | null
  userId: string
  communityId: string
}

export const createList = async (
  db: DrizzleD1Database,
  input: CreateListInput
): Promise<{ list: ListType }> => {
  const listId = crypto.randomUUID()

  const createdList = await db
    .insert(lists)
    .values({
      id: listId,
      name: input.name,
      description: input.description ?? null,
      thumbnail_url: input.thumbnailUrl ?? null,
      userId: input.userId,
    })
    .returning()
    .get()

  if (!createdList) {
    throw new Error('Failed to create list')
  }

  await db
    .insert(commLists)
    .values({
      id: crypto.randomUUID(),
      commId: input.communityId,
      listId: createdList.id,
    })
    .run()

  return {
    list: {
      id: createdList.id,
      name: createdList.name,
      description: createdList.description,
      thumbnailUrl: createdList.thumbnail_url,
      userId: createdList.userId,
      createdAt: createdList.createdAt,
      updatedAt: createdList.updatedAt,
    },
  }
}
