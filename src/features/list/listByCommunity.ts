import { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { commLists, lists } from '../../db/model'
import { ListType } from './type'

type ListByCommunityInput = {
  communityId: string
}

type ListByCommunityResult = {
  lists: ListType[]
}

export const listByCommunity = async (
  db: DrizzleD1Database,
  input: ListByCommunityInput
): Promise<ListByCommunityResult> => {
  const rows = await db
    .select()
    .from(lists)
    .innerJoin(commLists, eq(commLists.listId, lists.id))
    .where(eq(commLists.commId, input.communityId))

  return {
    lists: rows.map((row) => ({
      id: row.lists.id,
      name: row.lists.name,
      description: row.lists.description,
      thumbnailUrl: row.lists.thumbnail_url,
      userId: row.lists.userId,
      createdAt: row.lists.createdAt,
      updatedAt: row.lists.updatedAt,
    })),
  }
}
