import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

const globalForDb = globalThis as unknown as {
  __lifeosSql?: Sql;
  __lifeosSchema?: Promise<void>;
};

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function getSql(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL не задан");

  if (!globalForDb.__lifeosSql) {
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
    globalForDb.__lifeosSql = postgres(url, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 15,
      // Neon pooler работает в transaction-режиме: подготовленные запросы не поддерживаются
      prepare: false,
      ssl: local ? false : "require",
    });
  }
  return globalForDb.__lifeosSql;
}

// Таблицы создаются при первом обращении, отдельные миграции пока не нужны.
async function ensureSchema(sql: Sql): Promise<void> {
  if (!globalForDb.__lifeosSchema) {
    globalForDb.__lifeosSchema = (async () => {
      await sql`
        create table if not exists entries (
          id          bigserial primary key,
          type        text        not null,
          occurred_at timestamptz not null,
          data        jsonb       not null default '{}'::jsonb,
          source      text        not null default 'manual',
          created_at  timestamptz not null default now()
        )
      `;
      await sql`create index if not exists entries_occurred_idx on entries (occurred_at desc)`;
      await sql`create index if not exists entries_type_idx on entries (type, occurred_at desc)`;
    })().catch((err) => {
      globalForDb.__lifeosSchema = undefined;
      throw err;
    });
  }
  await globalForDb.__lifeosSchema;
}

export async function db(): Promise<Sql> {
  const sql = getSql();
  await ensureSchema(sql);
  return sql;
}
