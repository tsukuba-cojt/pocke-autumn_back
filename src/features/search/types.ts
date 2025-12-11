// src/features/search/types.ts

export type UnifiedSearchItem = {
  title: string
  author: string          // 「著者名・アーティスト名・監督名」などをここに寄せる
  imageURL: string | null // ジャケットやサムネがない場合もあるので null OK に
  url: string | null      // 元サイトへのリンク
}
