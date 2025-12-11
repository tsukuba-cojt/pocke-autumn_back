export type Bindings = {
  KV: KVNamespace;
  R2: R2Bucket;
  DB: D1Database;

  FRONTEND_URL: string;
  FRONTEND_DEV_URL: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_ADMIN_ID: string;

  // secret
  GITHUB_CLIENT_SECRET: string;
  GITHUB_ISSUES_PAT: string;
  MICROCMS_LOCATION_API_KEY: string;
  FOURSQUARE_API_KEY: string;
};

declare global {
  function getMiniflareBindings(): Bindings;
}