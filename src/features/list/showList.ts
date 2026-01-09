import { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { commLists, lists } from '../../db/model'
import { ListType } from './type'

type ShowListInput = {
  listId: string
}

type ShowListResult = {
  list: ListType & { communityId: string | null }
}

export const showList = async (
  db: DrizzleD1Database,
  input: ShowListInput
): Promise<ShowListResult | null> => {
  const row = await db
    .select()
    .from(lists)
    .leftJoin(commLists, eq(commLists.listId, lists.id))
    .where(eq(lists.id, input.listId))
    .get()

  if (!row) {
    return null
  }

  const list = row.lists

  return {
    list: {
      id: list.id,
      name: list.name,
      description: list.description,
      thumbnailUrl: list.thumbnail_url,
      userId: list.userId,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      communityId: row.community_lists?.commId ?? null,
    },
  }
}
