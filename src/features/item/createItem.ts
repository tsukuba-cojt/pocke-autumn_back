import { drizzle } from 'drizzle-orm/d1'
import { items, listItems } from '../../db/model'

type AddItemInput = {
    listId: string
    userId: string
    title: string
    author?: string
    url?: string
    imageUrl?: string
    genreId?: string
}

export async function addItem(
    db: D1Database,
    input: AddItemInput,
){
    const orm = drizzle(db)

    const now = Math.floor(Date.now() / 1000)
    const itemId = crypto.randomUUID()
    const listItemId = crypto.randomUUID()

    await orm.insert(items).values({
        id: itemId,
        title: input.title,
        author: input.author ?? null,
        url: input.url ?? null,
        imageUrl: input.imageUrl ?? null,
        genreId: input.genreId ?? null,
        createdAt: now,
    })

    await orm.insert(listItems).values({
        id: listItemId,
        itemId,
        listId: input.listId,
        userId: input.userId,
        createdAt: now,
    })

    return {
        item: {
            id: itemId,
            title: input.title,
            author: input.author ?? null,
            url: input.url ?? null,
            imageUrl: input.imageUrl ?? null,
            genreId: input.genreId ?? null,
            createdAt: now,
        },
        listItem: {
            id: listItemId,
            itemId,
            listId: input.listId,
            userId: input.userId,
            createdAt: now,
        },
    }
}
