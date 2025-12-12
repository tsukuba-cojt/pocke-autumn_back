import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/features/**/model.ts', // features内のmodel.tsを監視
  out: './drizzle',
  dialect: 'sqlite',
})