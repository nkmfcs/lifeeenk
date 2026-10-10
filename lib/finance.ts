import { db } from "@/lib/db";

export const TZ = "Asia/Tashkent";
const TZ_OFFSET_MS = 5 * 60 * 60 * 1000; // Ташкент: UTC+5, без перехода на летнее время

export const CATEGORIES = [
  "Транспорт",
  "Еда",
  "Прокат костюмов",
  "Материалы",
  "Пошив",
  "Реклама",
  "Другое",
] as const;

export const ACCOUNTS = ["Наличные", "Карта"] as const;
export type Scope = "personal" | "business";

export type Entry = {
  id: string;
  type: string;
  occurredAt: Date;
  data: Record<string, unknown>;
};

export type ExpenseInput = {
  amount: number;
  scope: Scope;
  category: string;
  account: string;
  description: string;
  occurredAt: Date;
};

export type ParseResult =
  | { ok: true; value: ExpenseInput }
  | { ok: false; error: "amount" | "category" | "date" };

/* ---------- Разбор формы ---------- */

export function parseExpense(form: FormData): ParseResult {
  const rawAmount = String(form.get("amount") ?? "").replace(/[\s ,]/g, "");
  if (!/^\d{1,12}$/.test(rawAmount)) return { ok: false, error: "amount" };
  const amount = Number(rawAmount);
  if (!Number.isSafeInteger(amount) || amount <= 0) return { ok: false, error: "amount" };

  const scope: Scope = form.get("scope") === "business" ? "business" : "personal";

  const custom = String(form.get("customCategory") ?? "").trim();
  const chosen = String(form.get("category") ?? "").trim();
  const category = (custom || chosen).slice(0, 40);
  if (!category) return { ok: false, error: "category" };

  const rawAccount = String(form.get("account") ?? "");
  const account = (ACCOUNTS as readonly string[]).includes(rawAccount) ? rawAccount : ACCOUNTS[0];

  const when = String(form.get("when") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(when)) return { ok: false, error: "date" };
  const occurredAt = new Date(`${when}:00+05:00`);
  if (Number.isNaN(occurredAt.getTime())) return { ok: false, error: "date" };

  const description = String(form.get("description") ?? "").trim().slice(0, 200);

  return { ok: true, value: { amount, scope, category, account, description, occurredAt } };
}

/* ---------- Запросы ---------- */

export async function addExpense(input: ExpenseInput): Promise<void> {
  const sql = await db();
  const data = {
    amount: input.amount,
    currency: "UZS",
    scope: input.scope,
    category: input.category,
    account: input.account,
    description: input.description,
  };
  await sql`
    insert into entries (type, occurred_at, data, source)
    values ('expense', ${input.occurredAt.toISOString()}, ${sql.json(data)}, 'manual')
  `;
}

export async function deleteEntry(id: string): Promise<void> {
  if (!/^\d{1,18}$/.test(id)) return;
  const sql = await db();
  await sql`delete from entries where id = ${id}`;
}

type Row = { id: string; type: string; occurred_at: Date; data: Record<string, unknown> };

function toEntry(r: Row): Entry {
  return { id: String(r.id), type: r.type, occurredAt: new Date(r.occurred_at), data: r.data ?? {} };
}

export async function listEntries(limit = 100): Promise<Entry[]> {
  const sql = await db();
  const rows = await sql<Row[]>`
    select id::text as id, type, occurred_at, data
    from entries
    order by occurred_at desc, id desc
    limit ${limit}
  `;
  return rows.map(toEntry);
}

export async function listEntriesSince(since: Date): Promise<Entry[]> {
  const sql = await db();
  const rows = await sql<Row[]>`
    select id::text as id, type, occurred_at, data
    from entries
    where occurred_at >= ${since.toISOString()}
    order by occurred_at desc, id desc
  `;
  return rows.map(toEntry);
}

/* ---------- Даты по Ташкенту ---------- */

function tashkentParts(d: Date) {
  const t = new Date(d.getTime() + TZ_OFFSET_MS);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth(), day: t.getUTCDate(), dow: t.getUTCDay() };
}

export function dayKey(d: Date): string {
  return new Date(d.getTime() + TZ_OFFSET_MS).toISOString().slice(0, 10);
}

export function startOfTodayTashkent(now = new Date()): Date {
  const p = tashkentParts(now);
  return new Date(Date.UTC(p.y, p.m, p.day) - TZ_OFFSET_MS);
}

export function startOfWeekTashkent(now = new Date()): Date {
  const p = tashkentParts(now);
  const sinceMonday = (p.dow + 6) % 7;
  return new Date(Date.UTC(p.y, p.m, p.day - sinceMonday) - TZ_OFFSET_MS);
}

export function startOfMonthTashkent(now = new Date()): Date {
  const p = tashkentParts(now);
  return new Date(Date.UTC(p.y, p.m, 1) - TZ_OFFSET_MS);
}

/** Значение по умолчанию для поля datetime-local: сейчас по Ташкенту */
export function nowLocalInput(now = new Date()): string {
  return new Date(now.getTime() + TZ_OFFSET_MS).toISOString().slice(0, 16);
}

/* ---------- Итоги ---------- */

export type Totals = { count: number; total: number; personal: number; business: number };

function emptyTotals(): Totals {
  return { count: 0, total: 0, personal: 0, business: 0 };
}

export function sumExpenses(entries: Entry[], from: Date): Totals {
  const t = emptyTotals();
  for (const e of entries) {
    if (e.type !== "expense" || e.occurredAt < from) continue;
    const amount = Number(e.data.amount);
    if (!Number.isFinite(amount)) continue;
    t.count += 1;
    t.total += amount;
    if (e.data.scope === "business") t.business += amount;
    else t.personal += amount;
  }
  return t;
}

export async function expenseTotals(now = new Date()) {
  const weekStart = startOfWeekTashkent(now);
  const monthStart = startOfMonthTashkent(now);
  const earliest = weekStart < monthStart ? weekStart : monthStart;
  const entries = await listEntriesSince(earliest);
  return {
    week: sumExpenses(entries, weekStart),
    month: sumExpenses(entries, monthStart),
  };
}

/* ---------- Форматирование ---------- */

export function formatSum(n: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(n)} сум`;
}

export function formatTime(d: Date): string {
  return new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(d);
}

export function dayLabel(key: string, now = new Date()): string {
  const today = dayKey(now);
  const yesterday = dayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  if (key === today) return "Сегодня";
  if (key === yesterday) return "Вчера";
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(`${key}T12:00:00Z`),
  );
}

export function groupByDay(entries: Entry[]): { key: string; items: Entry[] }[] {
  const groups: { key: string; items: Entry[] }[] = [];
  for (const e of entries) {
    const key = dayKey(e.occurredAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(e);
    else groups.push({ key, items: [e] });
  }
  return groups;
}
