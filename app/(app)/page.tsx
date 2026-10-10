import Link from "next/link";
import EntryRow from "@/components/EntryRow";
import NoDatabase from "@/components/NoDatabase";
import { hasDatabase } from "@/lib/db";
import { listEntriesSince, startOfTodayTashkent, sumExpenses, formatSum, TZ } from "@/lib/finance";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const date = new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TZ,
  }).format(new Date());

  let entries: Awaited<ReturnType<typeof listEntriesSince>> = [];
  let failed = false;
  const dbReady = hasDatabase();
  const start = startOfTodayTashkent();

  if (dbReady) {
    try {
      entries = await listEntriesSince(start);
    } catch {
      failed = true;
    }
  }
  const spent = sumExpenses(entries, start);

  return (
    <>
      <header className="header-center">
        <div className="avatar" aria-hidden="true">С</div>
        <h1 className="page-title">Сегодня</h1>
        <div className="page-sub">{date}</div>
      </header>

      {!dbReady ? <NoDatabase /> : null}
      {failed ? (
        <section className="card empty" role="alert">
          Не удалось прочитать записи. Проверьте строку подключения к базе.
        </section>
      ) : null}

      {dbReady && !failed ? (
        <>
          {spent.count > 0 ? (
            <section className="card">
              <div className="page-sub">Расходы за сегодня</div>
              <div className="big">{formatSum(spent.total)}</div>
              <div className="page-sub">записей: {spent.count}</div>
            </section>
          ) : (
            <section className="card empty">
              За сегодня записей нет. Это не значит, что вы ничего не потратили:
              расход считается только после того, как вы его внесли.
            </section>
          )}

          {entries.length > 0 ? (
            <section className="list" aria-label="Записи за сегодня">
              {entries.map((e) => (
                <EntryRow key={e.id} entry={e} />
              ))}
            </section>
          ) : null}

          <Link href="/new-expense" className="btn" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            Добавить расход
          </Link>
        </>
      ) : null}
    </>
  );
}
