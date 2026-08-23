declare module "cloudflare:workers" {
  export const env: { DB: D1Database };
}

interface Fetcher {
  fetch(request: Request): Promise<Response>;
}

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
};

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}
