// src/features/auth/service.ts
import { DrizzleD1Database } from 'drizzle-orm/d1'
import { eq, or, and } from 'drizzle-orm'
import { hash, compare } from 'bcryptjs'
import { users } from '../../db/model'

export const authService = {
  // A. メアドで新規登録
  async registerEmail(db: DrizzleD1Database, email: string, pass: string) {
    const passwordHash = await hash(pass, 10)

    const newUser = {
      id: crypto.randomUUID(),
      email:email,
      passwordHash,
      username:email.split('@')[0],
    }
    
    return await db.insert(users).values(newUser).returning().get()
  },

  // B. メアドログイン時の検証
  async verifyEmailUser(db: DrizzleD1Database, email: string, pass: string) {
    const user = await db.select().from(users).where(eq(users.email, email)).get()
    if (!user || !user.passwordHash) return null // Googleのみのユーザ、ユーザがいないなら弾く
    
    const isValid = await compare(pass, user.passwordHash)
    return isValid ? user : null //パスワードがあってたらuser情報を返す
  },

  // C. Googleログイン (なければ登録、あれば返す)
  async loginWithGoogle(db: DrizzleD1Database, googleUser: { id: string, email: string, picture: string }) {
    // GoogleID または Email で既存ユーザを探す
    const existing = await db.select().from(users).where(
      or(
        and(
          eq(users.authProvider, 'google'),
          eq(users.authId, googleUser.id)
        ),
        eq(users.email, googleUser.email)
      )
    ).get()

    if (existing) {
      // GoogleIDが紐付いてなければ紐付ける（既存メアドユーザ救済）
      if (existing.authProvider !== 'google') {
        await db.update(users).set({
          authProvider: 'google',
          authId: googleUser.id,
          iconUrl: googleUser.picture
        })
        .where(eq(users.id,existing.id)).run()
      }
      return existing
    }

    // 新規登録
    const newUser = {
      id: crypto.randomUUID(),
      email: googleUser.email,
      username: googleUser.email.split('@')[0], //必須なので仮で作成
      
      authProvider: 'google',
      authId: googleUser.id,
      iconUrl: googleUser.picture,
    }
    return await db.insert(users).values(newUser).returning().get()
  }
}