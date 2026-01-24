import { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { items, listItems } from '../../db/model'

type GetListItemDetailInput = {
  listItemId: string
}

type GetListItemDetailResult = {
  listItem: {
    id: string
    itemId: string
    listId: string
    userId: string
    createdAt: number | null
  }
  item: {
    id: string
    title: string
    author: string | null
    url: string | null
    imageUrl: string | null
    genreId: string | null
    createdAt: number | null
  }
}

export const getListItemDetail = async (
  db: DrizzleD1Database,
  input: GetListItemDetailInput
): Promise<GetListItemDetailResult | null> => {
  const row = await db
    .select()
    .from(listItems)
    .innerJoin(items, eq(items.id, listItems.itemId))
    .where(eq(listItems.id, input.listItemId))
    .get()

  if (!row) {
    return null
  }

  return {
    listItem: {
      id: row.list_items.id,
      itemId: row.list_items.itemId,
      listId: row.list_items.listId,
      userId: row.list_items.userId,
      createdAt: row.list_items.createdAt ?? null,
    },
    item: {
      id: row.items.id,
      title: row.items.title,
      author: row.items.author,
      url: row.items.url,
      imageUrl: row.items.imageUrl,
      genreId: row.items.genreId,
      createdAt: row.items.createdAt ?? null,
    },
  }
}
