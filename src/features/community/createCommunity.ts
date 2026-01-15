import { DrizzleD1Database } from 'drizzle-orm/d1'
import { communities } from '../../db/model'

type CreateCommunityInput = {
    name: string
    description?: string | null
    iconUrl?: string | null
}

type CreateCommunityResult = {
    community: {
    id: string
    name: string
    description: string | null
    iconUrl: string | null
    createdAt: number
    updatedAt: number
    }
}

export const createCommunity = async (
    db: DrizzleD1Database,
    input: CreateCommunityInput
): Promise<CreateCommunityResult> => {
    const created = await db
    .insert(communities)
    .values({
        id: crypto.randomUUID(),
        name: input.name,
        description: input.description ?? null,
        iconUrl: input.iconUrl ?? null,
    })
    .returning()
    .get()

    if (!created) {
    throw new Error('Failed to create community')
    }

    return {
    community: {
        id: created.id,
        name: created.name,
        description: created.description,
        iconUrl: created.iconUrl,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        },
    }
}
