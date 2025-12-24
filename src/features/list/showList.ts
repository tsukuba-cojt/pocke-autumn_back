import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { lists } from '../../db/model'

export async function showList(db: D1Database, listId: string) {
  const orm = drizzle(db)

  const rows = await orm
    .select()
    .from(lists)
    .where(eq(lists.id, listId))
    .limit(1)

  return rows[0] ?? null
}
