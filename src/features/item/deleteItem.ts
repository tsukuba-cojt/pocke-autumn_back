import { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq, inArray } from 'drizzle-orm'
import { listItems, meToo, threads } from '../../db/model'

type DeleteItemInput = {
  listItemId: string
}

type DeleteItemResult = {
  deleted: boolean
}

export const deleteItem = async (
  db: DrizzleD1Database,
  input: DeleteItemInput
): Promise<DeleteItemResult> => {
  const listItem = await db
    .select()
    .from(listItems)
    .where(eq(listItems.id, input.listItemId))
    .get()

  if (!listItem) {
    return { deleted: false }
  }

  await db.delete(meToo).where(eq(meToo.listItemId, input.listItemId)).run()
  await db.delete(threads).where(eq(threads.listItemId, input.listItemId)).run()
  await db.delete(listItems).where(eq(listItems.id, input.listItemId)).run()

  return { deleted: true }
}
