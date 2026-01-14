import { DrizzleD1Database } from 'drizzle-orm/d1'
import { and, eq } from 'drizzle-orm'
import { items, listItems } from '../../db/model'

type ItemType = {
    id: string
    title: string
    author: string | null
    url: string | null
    imageUrl: string | null
    genreId: string | null
    createdAt: number | null
}

type ListItemType = {
    id: string
    itemId: string
    listId: string
    userId: string
    createdAt: number | null
}

type CreateItemInput = {
    title: string
    listId: string
    userId: string
    author?: string | null
    url?: string | null
    imageUrl?: string | null
    genreId?: string | null
}

type CreateItemResult = {
    success: true
    item: ItemType
    listItem: ListItemType
}

export const createItem = async (
  db: DrizzleD1Database,
  input: CreateItemInput
): Promise<CreateItemResult> => {
  let item = null as ItemType | null

  if (input.url) {
    const existing = await db
      .select()
      .from(items)
      .where(and(eq(items.url, input.url), eq(items.title, input.title)))
      .get()

    if (existing) {
      item = {
        id: existing.id,
        title: existing.title,
        author: existing.author,
        url: existing.url,
        imageUrl: existing.imageUrl,
        genreId: existing.genreId,
        createdAt: existing.createdAt ?? null,
      }
    }
  }

  if (!item) {
    const created = await db
      .insert(items)
      .values({
        id: crypto.randomUUID(),
        title: input.title,
        author: input.author ?? null,
        url: input.url ?? null,
        imageUrl: input.imageUrl ?? null,
        genreId: input.genreId ?? null,
      })
      .returning()
      .get()

    if (!created) {
      throw new Error('Failed to create item')
    }

    item = {
      id: created.id,
      title: created.title,
      author: created.author,
      url: created.url,
      imageUrl: created.imageUrl,
      genreId: created.genreId,
      createdAt: created.createdAt ?? null,
    }
  }

  let listItem = await db
    .select()
    .from(listItems)
    .where(and(eq(listItems.itemId, item.id), eq(listItems.listId, input.listId)))
    .get()

  if (!listItem) {
    listItem = await db
      .insert(listItems)
      .values({
        id: crypto.randomUUID(),
        itemId: item.id,
        listId: input.listId,
        userId: input.userId,
      })
      .returning()
      .get()
  }

  if (!listItem) {
    throw new Error('Failed to create list item')
  }

  return {
    success: true,
    item,
    listItem: {
      id: listItem.id,
      itemId: listItem.itemId,
      listId: listItem.listId,
      userId: listItem.userId,
      createdAt: listItem.createdAt ?? null,
    },
  }
}
