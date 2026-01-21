import { DrizzleD1Database } from 'drizzle-orm/d1'
import { and, eq, inArray } from 'drizzle-orm'
import { commLists, favList, listItems, lists, meToo, threads } from '../../db/model'

type DeleteListInput = {
  listId: string
}

type DeleteListResult = {
  deleted: boolean
}

export const deleteList = async (
  db: DrizzleD1Database,
  input: DeleteListInput
): Promise<DeleteListResult> => {
  const list = await db
    .select()
    .from(lists)
    .where(eq(lists.id, input.listId))
    .get()

  if (!list) {
    return { deleted: false }
  }

  const listItemRows = await db
    .select({ id: listItems.id })
    .from(listItems)
    .where(eq(listItems.listId, input.listId))

  const listItemIds = listItemRows.map((row) => row.id)

  if (listItemIds.length > 0) {
    await db.delete(meToo).where(inArray(meToo.listItemId, listItemIds)).run()
    await db.delete(favList).where(inArray(favList.listItemId, listItemIds)).run()
    await db.delete(threads).where(inArray(threads.listItemId, listItemIds)).run()
    await db.delete(listItems).where(inArray(listItems.id, listItemIds)).run()
  }

  await db.delete(commLists).where(eq(commLists.listId, input.listId)).run()
  await db.delete(lists).where(eq(lists.id, input.listId)).run()

  return { deleted: true }
}
