import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { commLists, lists } from '../../db/model'

export async function showLists(
  db: D1Database,
  communityId: string
) {
  const orm = drizzle(db)

  const rows = await orm
    .select()
    .from(commLists)
    .innerJoin(lists, eq(commLists.listId, lists.id))
    .where(eq(commLists.commId, communityId))

  return rows.map((row) => row.lists)
}
