import { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { communities } from '../../db/model'

type ShowCommunityInput = {
  communityId: string
}

type ShowCommunityResult = {
  community: {
    id: string
    name: string
    description: string | null
    iconUrl: string | null
    createdAt: number
    updatedAt: number
  }
}

export const showCommunity = async (
  db: DrizzleD1Database,
  input: ShowCommunityInput
): Promise<ShowCommunityResult | null> => {
  const community = await db
    .select()
    .from(communities)
    .where(eq(communities.id, input.communityId))
    .get()

  if (!community) {
    return null
  }

  return {
    community: {
      id: community.id,
      name: community.name,
      description: community.description,
      iconUrl: community.iconUrl,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
    },
  }
}
