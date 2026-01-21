import { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { meToo, users } from '../../db/model'

type ListMeTooUsersInput = {
  listItemId: string
}

type ListMeTooUsersResult = {
  users: Array<{
    id: string
    username: string
    displayName: string
    iconUrl: string | null
    createdAt: number
  }>
}

export const listMeTooUsers = async (
  db: DrizzleD1Database,
  input: ListMeTooUsersInput
): Promise<ListMeTooUsersResult> => {
  const rows = await db
    .select()
    .from(meToo)
    .innerJoin(users, eq(users.id, meToo.userId))
    .where(eq(meToo.listItemId, input.listItemId))

  return {
    users: rows.map((row) => ({
      id: row.users.id,
      username: row.users.username,
      displayName: row.users.displayName,
      iconUrl: row.users.iconUrl,
      createdAt: row.users.createdAt,
    })),
  }
}
