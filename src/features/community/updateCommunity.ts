import { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq, sql } from 'drizzle-orm'
import { communities } from '../../db/model'

type UpdateCommunityInput = {
  communityId: string
  name?: string
  description?: string | null
  iconUrl?: string | null
}

type UpdateCommunityResult = {
  community: {
    id: string
    name: string
    description: string | null
    iconUrl: string | null
    createdAt: number
    updatedAt: number
  }
}

export const updateCommunity = async (
  db: DrizzleD1Database,
  input: UpdateCommunityInput
): Promise<UpdateCommunityResult | null> => {
  const updates: Record<string, unknown> = {
    updatedAt: sql`(strftime('%s', 'now'))`,
  }

  if (input.name !== undefined) updates.name = input.name
  if (input.description !== undefined) updates.description = input.description
  if (input.iconUrl !== undefined) updates.iconUrl = input.iconUrl

  const updated = await db
    .update(communities)
    .set(updates)
    .where(eq(communities.id, input.communityId))
    .returning()
    .get()

  if (!updated) {
    return null
  }

  return {
    community: {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      iconUrl: updated.iconUrl,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    },
  }
}
