import { drizzle } from 'drizzle-orm/d1'
import { commLists, lists } from '../../db/model'

type CreateListInput = {
  name: string
  description?: string
  thumbnailUrl?: string
  userId: string
  communityId: string
}

export async function createList(
  db: D1Database,
  input: CreateListInput
) {
  const orm = drizzle(db)

  const now = Math.floor(Date.now() / 1000)
  const id = crypto.randomUUID()
  const commListId = crypto.randomUUID()

  await orm.insert(lists).values({
    id,
    name: input.name,
    description: input.description ?? null,
    thumbnailUrl: input.thumbnailUrl ?? null,
    userId: input.userId,
    createdAt: now,
    updatedAt: now,
  })

  await orm.insert(commLists).values({
    id: commListId,
    commId: input.communityId,
    listId: id,
    createdAt: now,
  })

  return {
    id,
    name: input.name,
    description: input.description ?? null,
    thumbnailUrl: input.thumbnailUrl ?? null,
    userId: input.userId,
    communityId: input.communityId,
    createdAt: now,
    updatedAt: now,
  }
}
