import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  
  // メアド認証
  passwordHash: text('password_hash'),
  
  // OAuth認証
  authProvider: text('auth_provider'),
  authId: text('auth_id').unique(),//?
  
  username: text('username').notNull(),
  iconUrl: text('icon_url'),

  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
})