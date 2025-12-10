// src/feature/test.feature.ts

// 返したいデータの型（なくても動くけど、型があると後で楽）
export type TestData = {
  message: string
  now: string
}

// テスト用のロジック
export async function getTestData(): Promise<TestData> {
  return {
    message: 'Hello from feature!',
    now: new Date().toISOString(),
  }
}
