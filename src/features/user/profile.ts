import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { users, snsUrl } from '../../db/model'

export type UpdateProfileInput = {//入力データの型定義
  username?: string
  displayName?: string
  description?: string
  iconUrl?: string
}

//機能：プロフィール取得
export async function getUserProfile(db: D1Database, userId: string) {
  const orm = drizzle(db)

  const user = await orm.select()
    .from(users)
    .where(eq(users.id,userId))
    .get()
  
  if(!user) {
    return null
  }

  const snsLinks = await orm.select()
    .from(snsUrl)
    .where(eq(snsUrl.userId,userId))
    .all()

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    description: user.description,
    iconUrl: user.iconUrl,
    snsUrl: snsLinks.map(link => link.url)
  }
}


//プロフィール編集・登録
export async function updateUserProfile(db: D1Database, userId:string, input: UpdateProfileInput){
  const orm = drizzle(db)
  const now = Math.floor(Date.now() / 1000)
  
  const [updatedUser] = await orm.update(users)
    .set({
      ...input,//inputの中身を展開
      updatedAt: now,
    })
    .where(eq(users.id, userId))
    .returning()

  return {
    id: updatedUser.id,
    username: updatedUser.username,
    displayName: updatedUser.displayName,
    description: updatedUser.description,
    iconUrl: updatedUser.iconUrl,
  }
}