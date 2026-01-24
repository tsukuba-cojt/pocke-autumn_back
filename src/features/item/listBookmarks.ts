import { DrizzleD1Database } from 'drizzle-orm/d1'
import { desc, eq } from 'drizzle-orm'
import { favList, items, listItems } from '../../db/model'

type ListBookmarksInput = {
  userId: string
}

type ListBookmarksResult = {
  bookmarks: Array<{
    listItemId: string
    createdAt: number | null
    item: {
      id: string
      title: string
      author: string | null
      url: string | null
      imageUrl: string | null
      genreId: string | null
      createdAt: number | null
    }
    listId: string
  }>
}

export const listBookmarks = async (
  db: DrizzleD1Database,
  input: ListBookmarksInput
): Promise<ListBookmarksResult> => {
  const rows = await db
    .select()
    .from(favList)
    .innerJoin(listItems, eq(listItems.id, favList.listItemId))
    .innerJoin(items, eq(items.id, listItems.itemId))
    .where(eq(favList.userId, input.userId))
    .orderBy(desc(favList.createdAt))

  return {
    bookmarks: rows.map((row) => ({
      listItemId: row.fav_list.listItemId,
      createdAt: row.fav_list.createdAt ?? null,
      listId: row.list_items.listId,
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
