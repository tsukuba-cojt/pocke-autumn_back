import { pockeDB } from '@cloudflare/workers-types'

export type Bindings = {
  DB: pockeDB;

  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;

  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
}