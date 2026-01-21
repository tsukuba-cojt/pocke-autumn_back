import { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { communityMembers, users } from '../../db/model'

type ListMembersInput = {
  communityId: string
}

type Member = {
  user: {
    id: string
    username: string
    displayName: string
    iconUrl: string | null
  }
  authority: string | null
  joinedAt: number | null
}

type ListMembersResult = {
  members: Member[]
}

export const listMembers = async (
  db: DrizzleD1Database,
  input: ListMembersInput
): Promise<ListMembersResult> => {
  const rows = await db
    .select()
    .from(communityMembers)
    .innerJoin(users, eq(users.id, communityMembers.userId))
    .where(eq(communityMembers.comId, input.communityId))

  return {
    members: rows.map((row) => ({
      user: {
        id: row.users.id,
        username: row.users.username,
        displayName: row.users.displayName,
        iconUrl: row.users.iconUrl,
      },
      authority: row.community_members.authority,
      joinedAt: row.community_members.joinedAt ?? null,
    })),
  }
}
