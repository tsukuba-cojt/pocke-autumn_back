import { DrizzleD1Database } from 'drizzle-orm/d1'
import { and, eq } from 'drizzle-orm'
import { communityMembers } from '../../db/model'

type RemoveMemberInput = {
  communityId: string
  userId: string
}

type RemoveMemberResult = {
  removed: boolean
}

export const removeMember = async (
  db: DrizzleD1Database,
  input: RemoveMemberInput
): Promise<RemoveMemberResult> => {
  const existing = await db
    .select()
    .from(communityMembers)
    .where(
      and(
        eq(communityMembers.comId, input.communityId),
        eq(communityMembers.userId, input.userId)
      )
    )
    .get()

  if (!existing) {
    return { removed: false }
  }

  await db
    .delete(communityMembers)
    .where(
      and(
        eq(communityMembers.comId, input.communityId),
        eq(communityMembers.userId, input.userId)
      )
    )
    .run()

  return { removed: true }
}
