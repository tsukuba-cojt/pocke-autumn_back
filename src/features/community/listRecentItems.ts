import { DrizzleD1Database } from 'drizzle-orm/d1'
import { desc, eq } from 'drizzle-orm'
import { communityMembers, commLists, items, listItems } from '../../db/model'

type ListRecentItemsInput = {
  userId: string
  limit: number
}

type ListRecentItemsResult = {
  items: Array<{
    communityId: string
    listId: string
    listItemId: string
    addedAt: number | null
    item: {
      id: string
      title: string
      author: string | null
      url: string | null
      imageUrl: string | null
      genreId: string | null
      createdAt: number | null
    }
  }>
}

export const listRecentItems = async (
  db: DrizzleD1Database,
  input: ListRecentItemsInput
): Promise<ListRecentItemsResult> => {
  const rows = await db
    .select()
    .from(communityMembers)
    .innerJoin(commLists, eq(commLists.commId, communityMembers.comId))
    .innerJoin(listItems, eq(listItems.listId, commLists.listId))
    .innerJoin(items, eq(items.id, listItems.itemId))
    .where(eq(communityMembers.userId, input.userId))
    .orderBy(desc(listItems.createdAt))
    .limit(input.limit)

  return {
    items: rows.map((row) => ({
      communityId: row.community_members.comId,
      listId: row.community_lists.listId,
      listItemId: row.list_items.id,
      addedAt: row.list_items.createdAt ?? null,
      item: {
        id: row.items.id,
        title: row.items.title,
        author: row.items.author,
        url: row.items.url,
        imageUrl: row.items.imageUrl,
        genreId: row.items.genreId,
        createdAt: row.items.createdAt ?? null,
      },
    })),
  }
}
