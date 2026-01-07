import { sqliteTable, text, integer, unique, primaryKey, AnySQLiteColumn } from 'drizzle-orm/sqlite-core'
import { sql, relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  
  // メアド認証
  passwordHash: text('password_hash'),
  
  // OAuth認証
  authProvider: text('auth_provider'),
  authId: text('auth_id').unique(),
  
  username: text('username').notNull(), //ユーザ名
  displayName: text('display_name').notNull().default(""), //表示名（タイポ修正済み）
  iconUrl: text('icon_url'),

  description: text('description'),
  createdAt: integer('created_at', { mode: 'number' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'number' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
})

export const lists = sqliteTable('lists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  thumbnail_url: text('thumbnail_url'),
  userId: text('user_id').notNull().references(() => users.id),
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at')
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
})

export const genre = sqliteTable('genre', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
})

export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author'),
  url: text('url'),
  imageUrl: text('image_url'),
  genreId: text('genre_id').references(() => genre.id),
  createdAt: integer('created_at', { mode: 'number' })
    .default(sql`(strftime('%s','now'))`), // カッコ追加
})

export const snsUrl = sqliteTable('sns_url', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
}, (t) => ({
  unq: unique().on(t.userId, t.url)
}));

export const communities = sqliteTable('communities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  iconUrl: text('icon_url'),
  description: text('description'),
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at')
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
})


//middle
// users ⇔ communities
export const communityMembers = sqliteTable('community_members', {
  userId: text('user_id')
    .notNull()
    .references(() => users.id), // users.id への外部キー
  comId: text('community_id')
    .notNull()
    .references(() => communities.id),
  authority: text('authority'), //'admin'| 'member'
  joinedAt: integer('joined_at', { mode: 'number' })
    .default(sql`(strftime('%s','now'))`), // カッコ追加
},
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.comId] })
  }),
);

// communities ⇔ lists
export const commLists = sqliteTable('community_lists', {
  id: text('id').primaryKey(),
  commId: text('community_id')
    .notNull()
    .references(() => communities.id), // users.id への外部キー
  listId: text('lists_id')
    .notNull()
    .references(() => lists.id),
  createdAt: integer('created_at', { mode: 'number' })
    .default(sql`(strftime('%s','now'))`), // カッコ追加
},
  (t) => ({
    unq: unique().on(t.commId, t.listId),
  }),
);


// items ⇔ lists
export const listItems = sqliteTable('list_items', {
  id: text('id').primaryKey(),
  itemId: text('item_id')
    .notNull()
    .references(() => items.id), // users.id への外部キー
  listId: text('lists_id')
    .notNull()
    .references(() => lists.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: integer('created_at', { mode: 'number' })
    .default(sql`(strftime('%s','now'))`), // カッコ追加
},
  (t) => ({
    unq: unique().on(t.itemId, t.listId),
  }),
);

export const threads = sqliteTable('threads', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  listItemId: text('item_id').notNull().references(() => listItems.id),
  replyId: text('reply_id').references((): AnySQLiteColumn => threads.id),
  text: text('text').notNull(),
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});


// meToo listitems ⇔ users
export const meToo = sqliteTable('me_too', {
  listItemId: text('list_item_id')
    .notNull()
    .references(() => listItems.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: integer('created_at', { mode: 'number' })
    .default(sql`(strftime('%s','now'))`), // カッコ追加
},
  (t) => ({
    unq: unique().on(t.listItemId, t.userId),
  }),
);


// favList listitems ⇔ users
export const favList = sqliteTable('fav_list', {
  listItemId: text('list_item_id')
    .notNull()
    .references(() => listItems.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: integer('created_at', { mode: 'number' })
    .default(sql`(strftime('%s','now'))`), // カッコ追加
},
  (t) => ({
    unq: unique().on(t.listItemId, t.userId),
  }),
);


//relation


export const usersRelations = relations(users, ({ many }) => ({
  communityMembers: many(communityMembers),
  snsUrls: many(snsUrl),
  meToos: many(meToo),
  favLists: many(favList),
  lists: many(lists),
}));


export const snsUrlsRelations = relations(snsUrl, ({ one }) => ({
  user: one(users, {
    fields: [snsUrl.userId],
    references: [users.id],
  }),
}));

export const communitiesRelations = relations(communities, ({ many }) => ({
  members: many(communityMembers),
  commLists: many(commLists),
}));

export const listsRelations = relations(lists, ({ one, many }) => ({
  owner: one(users, {
    fields: [lists.userId],
    references: [users.id],
  }),
  commLists: many(commLists),
  listItems: many(listItems),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  listItems: many(listItems),
  genre: one(genre, {
    fields: [items.genreId],
    references: [genre.id],
  }),
}));

export const genreRelations = relations(genre, ({ many }) => ({
  items: many(items),
}));

//threads
export const threadsRelations = relations(threads, ({ one, many }) => ({
  item: one(listItems, {
    fields: [threads.listItemId],
    references: [listItems.id],
  }),

  author: one(users, {
    fields: [threads.userId],
    references: [users.id],
  }),

  parent: one(threads, {
    fields: [threads.replyId],
    references: [threads.id],
    relationName: 'threading',
  }),

  replies: many(threads, {
    relationName: 'threading',
  }),

}));

//listItems
export const listItemsRelations = relations(listItems, ({ one, many }) => ({
  item: one(items, {
    fields: [listItems.itemId],
    references: [items.id],
  }),
  list: one(lists, {
    fields: [listItems.listId],
    references: [lists.id],
  }),
  addedBy: one(users, {
    fields: [listItems.userId],
    references: [users.id],
  }),
  threads: many(threads),
  meToos: many(meToo),
  favLists: many(favList),
}));




//以下中間テーブルのリレーション
//communityMembers
export const communityMembersRelations = relations(communityMembers, ({ one }) => ({
  user: one(users, {
    fields: [communityMembers.userId],
    references: [users.id],
  }),
  community: one(communities, {
    fields: [communityMembers.comId],
    references: [communities.id],
  }),
}));

//commLists
export const comListsRelations = relations(commLists, ({ one }) => ({
  community: one(communities, { // 中間テーブルの各レコードは1つのグループに属する
    fields: [commLists.commId],
    references: [communities.id],
  }),
  list: one(lists, { // 中間テーブルの各レコードは1人のユーザーに属する
    fields: [commLists.listId],
    references: [lists.id],
  }),
}));

//meToo
export const meTooRelations = relations(meToo, ({ one }) => ({
  listItem: one(listItems, {
    fields: [meToo.listItemId],
    references: [listItems.id],
  }),
  user: one(users, {
    fields: [meToo.userId],
    references: [users.id],
  }),
}));

//favList
export const favListRelations = relations(favList, ({ one }) => ({
  listItem: one(listItems, {
    fields: [favList.listItemId],
    references: [listItems.id],
  }),
  user: one(users, {
    fields: [favList.userId],
    references: [users.id],
  }),
}));