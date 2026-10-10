import Link from "next/link";
import EntryRow from "@/components/EntryRow";
import NoDatabase from "@/components/NoDatabase";
import { hasDatabase } from "@/lib/db";
import { listEntriesSince, startOfTodayTashkent, sumType, formatSum, TZ } from "@/lib/finance";

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
  const spent = sumType(entries, start, "expense");
  const earned = sumType(entries, start, "income");

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
          {spent.count + earned.count > 0 ? (
            <section className="card">
              {spent.count > 0 ? (
                <div className="kv">
                  <span className="k">Расходы за сегодня</span>
                  <span className="v">−{formatSum(spent.total)}</span>
                </div>
              ) : null}
              {earned.count > 0 ? (
                <div className="kv">
                  <span className="k">Доходы за сегодня</span>
                  <span className="v plus">+{formatSum(earned.total)}</span>
                </div>
              ) : null}
            </section>
          ) : entries.length === 0 ? (
            <section className="card empty">
              За сегодня записей нет. Это не значит, что вы ничего не потратили:
              расход считается только после того, как вы его внесли.
            </section>
          ) : null}

          {entries.length > 0 ? (
            <section className="list" aria-label="Записи за сегодня">
              {entries.map((e) => (
                <EntryRow key={e.id} entry={e} />
              ))}
            </section>
          ) : null}

          <Link href="/new-expense" className="btn" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            Добавить запись
          </Link>
        </>
      ) : null}
    </>
  );
}
