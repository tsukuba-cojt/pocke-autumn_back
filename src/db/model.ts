import { sqliteTable, AnySQLiteColumn, text, integer ,unique } from 'drizzle-orm/sqlite-core'
import { sql, } from 'drizzle-orm';

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

//snsリンク
export const snsUrl = sqliteTable('sns_url', {
  id: text('id').primaryKey().$defaultFn(()=>crypto.randomUUID()),
  url: text('url').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
},(t)=>[
  unique().on(t.userId, t.url),
]);

//コミュニティ
export const communities = sqliteTable('communities', {
  id: text('id').primaryKey(),
  name: text('name'),
  iconUrl:text('icon_url'),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIMESTAMP)`),

})

export const lists = sqliteTable('lists', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  userId: text('user_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});


export const items = sqliteTable('items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  author: text('author'),
  url: text('url'),
  imageUrl: text('image_url'),
  genreId: text('genre_id').references(() => genre.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const genre = sqliteTable('genre', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
});


export const threads = sqliteTable('threads', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  itemId: text('item_id').notNull().references(() => items.id),
  // 自己参照（親コメントID）
  replyId: text('reply_id').references((): AnySQLiteColumn => threads.id),
  text: text('text').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});