import { users, communities, snsUrl } from './model'
import { sqliteTable, text, integer , unique } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm';


//snsリンクの1対多リレーション
export const usersRelations = relations(users, ({ many }) => ({
  snsUrls: many(snsUrl),
}));

export const snsUrlsRelations = relations(snsUrl, ({ one }) => ({
  user: one(users, {
    fields: [snsUrl.userId],
    references: [users.id], 
  }),
}));

