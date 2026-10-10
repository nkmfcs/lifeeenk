import EntryRow from "@/components/EntryRow";
import NoDatabase from "@/components/NoDatabase";
import { hasDatabase } from "@/lib/db";
import { dayLabel, groupByDay, listEntries } from "@/lib/finance";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const dbReady = hasDatabase();
  let entries: Awaited<ReturnType<typeof listEntries>> = [];
  let failed = false;

  if (dbReady) {
    try {
      entries = await listEntries(200);
    } catch {
      failed = true;
    }
  }
  const groups = groupByDay(entries);

  return (
    <>
      <header className="header-center">
        <h1 className="page-title">Журнал</h1>
        <div className="page-sub">Все записи по дням</div>
      </header>

      {!dbReady ? <NoDatabase /> : null}
      {failed ? (
        <section className="card empty" role="alert">
          Не удалось прочитать записи. Проверьте строку подключения к базе.
        </section>
      ) : null}
      {dbReady && !failed && groups.length === 0 ? (
        <section className="card empty">Записей пока нет. Нажмите «+», чтобы добавить первый расход.</section>
      ) : null}

      {groups.map((g) => (
        <section key={g.key} className="list" aria-label={dayLabel(g.key)}>
          <h2 className="day">{dayLabel(g.key)}</h2>
          {g.items.map((e) => (
            <EntryRow key={e.id} entry={e} />
          ))}
        </section>
      ))}
    </>
  );
}
