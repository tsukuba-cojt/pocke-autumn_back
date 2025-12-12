import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import * as schema from '../../db/model'          // ★追加（tablesをまとめてexportしてる前提）
import { lists } from '../../db/model'
import type { ListType } from './type'

type CreateListInput = {
  name: string
  description?: string
  thumbnailUrl?: string
  userId: string
}

export async function createList(
  db: D1Database,
  input: CreateListInput
): Promise<ListType> {
  const orm = drizzle(db, { schema })             // ★ここが重要
  const id = crypto.randomUUID()

  await orm.insert(lists).values({
    id,
    name: input.name,
    description: input.description ?? null,
    thumbnailUrl: input.thumbnailUrl ?? null,
    userId: input.userId,
  })

  const row = await orm.query.lists.findFirst({
    where: eq(lists.id, id),
  })

  if (!row) throw new Error('Failed to create list (row not found)')

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    thumbnailUrl: row.thumbnailUrl,
    userId: row.userId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
