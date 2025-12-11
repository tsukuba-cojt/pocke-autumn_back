import { pockeDB } from '@cloudflare/workers-types'

export type Bindings = {
  DB: pockeDB;

  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}