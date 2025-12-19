import { drizzle } from 'drizzle-orm/d1'
import { lists } from '../../db/model'

type CreateListInput = {
  name: string
  description?: string
  thumbnailUrl?: string
  userId: string
}

export async function createList(
  db: D1Database,
  input: CreateListInput
) {
  const orm = drizzle(db)

  const now = Math.floor(Date.now() / 1000)
  const id = crypto.randomUUID()

  await orm.insert(lists).values({
    id,
    name: input.name,
    description: input.description ?? null,
    thumbnailUrl: input.thumbnailUrl ?? null,
    userId: input.userId,
    createdAt: now,
    updatedAt: now,
  })

  return {
    id,
    name: input.name,
    description: input.description ?? null,
    thumbnailUrl: input.thumbnailUrl ?? null,
    userId: input.userId,
    createdAt: now,
    updatedAt: now,
  }
}
