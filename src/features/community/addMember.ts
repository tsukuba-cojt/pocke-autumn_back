import { DrizzleD1Database } from 'drizzle-orm/d1'
import { and, eq } from 'drizzle-orm'
import { communityMembers, users } from '../../db/model'

type AddMemberInput = {
  communityId: string
  userId: string
  authority?: string | null
}

type AddMemberResult = {
  member: {
    user: {
      id: string
      username: string
      displayName: string
      iconUrl: string | null
    }
    authority: string | null
    joinedAt: number | null
  }
}

export const addMember = async (
  db: DrizzleD1Database,
  input: AddMemberInput
): Promise<AddMemberResult | null> => {
  const existing = await db
    .select()
    .from(communityMembers)
    .where(
      and(
        eq(communityMembers.userId, input.userId),
        eq(communityMembers.comId, input.communityId)
      )
    )
    .get()

  if (existing) {
    return null
  }

  const inserted = await db
    .insert(communityMembers)
    .values({
      userId: input.userId,
      comId: input.communityId,
      authority: input.authority ?? null,
    })
    .returning()
    .get()

  if (!inserted) {
    throw new Error('Failed to add member')
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, input.userId))
    .get()

  if (!user) {
    throw new Error('User not found')
  }

  return {
    member: {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        iconUrl: user.iconUrl,
      },
      authority: inserted.authority,
      joinedAt: inserted.joinedAt ?? null,
    },
  }
}
