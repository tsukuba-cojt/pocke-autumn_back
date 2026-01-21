import { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq, inArray } from 'drizzle-orm'
import { items, listItems, meToo, users } from '../../db/model'

type ItemRow = {
  id: string
  title: string
  author: string | null
  url: string | null
  imageUrl: string | null
  genreId: string | null
  createdAt: number | null
}

type ListItemRow = {
  id: string
  itemId: string
  listId: string
  userId: string
  createdAt: number | null
}

type ShowItemInput = {
  listId: string
}

type ShowItemResult = {
  items: Array<{
    item: ItemRow
    listItem: ListItemRow
    meTooUsers: Array<{
      id: string
      username: string
      displayName: string
      iconUrl: string | null
    }>
  }>
}

export const showItem = async (
  db: DrizzleD1Database,
  input: ShowItemInput
): Promise<ShowItemResult> => {
  const rows = await db
    .select()
    .from(listItems)
    .innerJoin(items, eq(items.id, listItems.itemId))
    .where(eq(listItems.listId, input.listId))

  const listItemIds = rows.map((row) => row.list_items.id)
  const meTooByListItem = new Map<
    string,
    Array<{ id: string; username: string; displayName: string; iconUrl: string | null }>
  >()

  if (listItemIds.length > 0) {
    const meTooRows = await db
      .select()
      .from(meToo)
      .innerJoin(users, eq(users.id, meToo.userId))
      .where(inArray(meToo.listItemId, listItemIds))

    for (const row of meTooRows) {
      const listItemId = row.me_too.listItemId
      const list = meTooByListItem.get(listItemId) ?? []
      list.push({
        id: row.users.id,
        username: row.users.username,
        displayName: row.users.displayName,
        iconUrl: row.users.iconUrl,
      })
      meTooByListItem.set(listItemId, list)
    }
  }

  return {
    items: rows.map((row) => ({
      item: {
        id: row.items.id,
        title: row.items.title,
        author: row.items.author,
        url: row.items.url,
        imageUrl: row.items.imageUrl,
        genreId: row.items.genreId,
        createdAt: row.items.createdAt ?? null,
      },
      listItem: {
        id: row.list_items.id,
        itemId: row.list_items.itemId,
        listId: row.list_items.listId,
        userId: row.list_items.userId,
        createdAt: row.list_items.createdAt ?? null,
      },
      meTooUsers: meTooByListItem.get(row.list_items.id) ?? [],
    })),
  }
}
