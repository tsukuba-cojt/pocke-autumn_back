import { and, eq } from "drizzle-orm"
import { snsUrl } from "../../db/model"
import { drizzle } from 'drizzle-orm/d1'

export type UpdateSnsInput = {//入力データの型定義
  snsUrl?: string
}


export async function addSnsLink(db: D1Database, userId: string, url: string) {
  const orm = drizzle(db)
  const id = crypto.randomUUID()

  const [newLink] = await orm.insert(snsUrl)
    .values({
      id,
      userId,
      url,
      createdAt: Math.floor(Date.now() / 1000) 
    })
    .returning()

  return newLink
}


export async function deleteSnsLink(db: D1Database, userId: string, snsId: string) {
  const orm = drizzle(db)

  const [deletedLink] = await orm.delete(snsUrl)
    .where(
      and(
        eq(snsUrl.id, snsId),
        eq(snsUrl.userId, userId)
      )
    )
    .returning()

  return deletedLink
}