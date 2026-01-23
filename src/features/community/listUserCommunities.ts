import { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { communityMembers, communities } from '../../db/model'

type ListUserCommunitiesInput = {
  userId: string
}

type ListUserCommunitiesResult = {
  communities: Array<{
    id: string
    name: string
    description: string | null
    iconUrl: string | null
    createdAt: number
    updatedAt: number
    authority: string | null
    joinedAt: number | null
  }>
}

export const listUserCommunities = async (
  db: DrizzleD1Database,
  input: ListUserCommunitiesInput
): Promise<ListUserCommunitiesResult> => {
  const rows = await db
    .select()
    .from(communityMembers)
    .innerJoin(communities, eq(communities.id, communityMembers.comId))
    .where(eq(communityMembers.userId, input.userId))

  return {
    communities: rows.map((row) => ({
      id: row.communities.id,
      name: row.communities.name,
      description: row.communities.description,
      iconUrl: row.communities.iconUrl,
      createdAt: row.communities.createdAt,
      updatedAt: row.communities.updatedAt,
      authority: row.community_members.authority,
      joinedAt: row.community_members.joinedAt ?? null,
    })),
  }
}
